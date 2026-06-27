using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Services;

public partial class PipelineHistoryService(
    ITableRepository<ChartQuantAudit> chartQuantAuditRepository,
    ITableRepository<LogEntity> chartQuantLogRepository,
    ITableRepository<SparkTradeAudit> sparkTradeAuditRepository,
    ITableRepository<LogEntity> sparkTradeLogRepository,
    IMemoryCache cache) : IPipelineHistoryService
{
    private const string PartitionKeyFormat = "yyyyMMdd";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(20);

    public async Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default)
    {
        var currentKey = current.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
        var partitionKey = await chartQuantLogRepository.FindPreviousPartitionKeyAsync(
            currentKey, IncrementCallback, "CorrelationId ne ''", ct);

        if (partitionKey is null)
            return [];

        var date = DateOnly.ParseExact(partitionKey, PartitionKeyFormat, CultureInfo.InvariantCulture);
        return await GetDayAsync(date, ct);
    }

    public async Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default)
    {
        var partitionKey = date.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
        var topRowKey = await chartQuantLogRepository.GetTopRowKeyAsync(partitionKey, ct);
        if (topRowKey is null)
            return [];

        if (cache.TryGetValue<IReadOnlyList<PipelineRunDto>>(topRowKey, out var cached) && cached is not null)
            return cached;

        var result = await GetPartitionAsync(partitionKey, ct);
        cache.Set(topRowKey, result, CacheExpiration);
        return result;
    }

    private async Task<IReadOnlyList<PipelineRunDto>> GetPartitionAsync(string partitionKey, CancellationToken ct)
    {
        var chartQuantLogsTask = chartQuantLogRepository.GetByPartitionAsync(partitionKey, ct);
        var chartQuantAuditsTask = chartQuantAuditRepository.GetByPartitionAsync(partitionKey, ct);
        var sparkTradeLogsTask = sparkTradeLogRepository.GetByPartitionAsync(partitionKey, ct);
        var sparkTradeAuditsTask = sparkTradeAuditRepository.GetByPartitionAsync(partitionKey, ct);

        await Task.WhenAll(chartQuantAuditsTask, chartQuantLogsTask, sparkTradeAuditsTask, sparkTradeLogsTask);

        var chartQuantLogs = (await chartQuantLogsTask).Where(x => x.CorrelationId is not null).ToLookup(x => x.CorrelationId!);
        var chartQuantAudits = (await chartQuantAuditsTask).Where(x => x.CorrelationId is not null).ToLookup(x => x.CorrelationId!);
        var sparkTradeLogs = (await sparkTradeLogsTask).Where(x => x.CorrelationId is not null).ToLookup(x => x.CorrelationId!);
        var sparkTradeAudits = (await sparkTradeAuditsTask).Where(x => x.CorrelationId is not null).ToLookup(x => x.CorrelationId!);

        var allKeys = new HashSet<string>(chartQuantLogs.Select(x => x.Key));
        allKeys.UnionWith(chartQuantAudits.Select(x => x.Key));
        allKeys.UnionWith(sparkTradeLogs.Select(x => x.Key));
        allKeys.UnionWith(sparkTradeAudits.Select(x => x.Key));

        return [.. allKeys
            .Select(id => BuildPipelineRun(id, chartQuantAudits, chartQuantLogs, sparkTradeAudits, sparkTradeLogs))
            .OrderByDescending(x => x.Start)];
    }

    private static PipelineRunDto BuildPipelineRun(
        string correlationId,
        ILookup<string, ChartQuantAudit> chartQuantAudits,
        ILookup<string, LogEntity> chartQuantLogs,
        ILookup<string, SparkTradeAudit> sparkTradeAudits,
        ILookup<string, LogEntity> sparkTradeLogs)
    {
        var chartQuantAudit = chartQuantAudits[correlationId].FirstOrDefault();
        var sparkTradeAudit = sparkTradeAudits[correlationId].FirstOrDefault();

        var logs = chartQuantLogs[correlationId]
            .Select(x => x.ToLogDto("ChartQuant"))
            .Concat(sparkTradeLogs[correlationId].Select(x => x.ToLogDto("SparkTrade")))
            .OrderBy(x => x.Id)
            .ToList();

        var (symbol, interval) = (chartQuantAudit, sparkTradeAudit) switch
        {
            ({ Symbol: var s, Interval: var i }, _) => (s, i),
            (_, { Symbol: var s, Interval: var i }) => (s, i),
            _ => ParseSymbolIntervalFromLogs(logs)
        };

        return new PipelineRunDto
        {
            Symbol = symbol,
            Interval = interval,
            ChartTimestamp = chartQuantAudit?.ChartTimestamp ?? sparkTradeAudit?.ChartTimestamp,
            BlobName = chartQuantAudit?.BlobName,
            Signal = chartQuantAudit?.Signal,
            Decision = sparkTradeAudit?.DecisionResult,
            Logs = logs
        };
    }

    private static string IncrementCallback(string partitionKey, int increment)
    {
        return DateOnly
            .ParseExact(partitionKey, PartitionKeyFormat, CultureInfo.InvariantCulture)
            .AddDays(increment)
            .ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
    }
}

public partial class PipelineHistoryService
{
    [GeneratedRegex(@"for ""(?<symbol>[A-Z]+)"" ""(?<interval>\d+[mhDWM])""")]
    private static partial Regex SymbolIntervalRegex();

    private static (string? Symbol, string? Interval) ParseSymbolIntervalFromLogs(IReadOnlyList<PipelineLogDto> logs)
    {
        foreach (var log in logs.OrderByDescending(x => x.Id))
        {
            var match = SymbolIntervalRegex().Match(log.Message);
            if (match.Success)
                return (match.Groups["symbol"].Value, match.Groups["interval"].Value);
        }

        return (null, null);
    }
}
