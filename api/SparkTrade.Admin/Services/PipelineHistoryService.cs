using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;
using System.Globalization;
using System.Text.RegularExpressions;

namespace SparkTrade.Admin.Services;

public interface IPipelineHistoryService
{
    Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default);
    Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default);
}

public partial class PipelineHistoryService(
    [FromKeyedServices(StorageNames.ChartQuantAuditTable)] ITableRepository<ChartQuantAudit> chartQuantAuditRepository,
    [FromKeyedServices(StorageNames.ChartQuantLogsTable)] ITableRepository<LogEntity> chartQuantLogRepository,
    [FromKeyedServices(StorageNames.SparkTradeAuditTable)] ITableRepository<SparkTradeAudit> sparkTradeAuditRepository,
    [FromKeyedServices(StorageNames.SparkTradeLogsTable)] ITableRepository<LogEntity> sparkTradeLogRepository,
    IBlobCache blobCache, IMemoryCache memoryCache) : IPipelineHistoryService
{
    private const string PartitionKeyFormat = "yyyyMMdd";
    private static readonly TimeSpan MemoryCacheExpiration = TimeSpan.FromMinutes(20);

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

    //cached by partitionKey in both memory and blob - immutable data
    public async Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default)
    {
        var isToday = date == DateOnly.FromDateTime(DateTime.UtcNow);
        if (isToday)
            return await GetTodayAsync(ct);

        var partitionKey = date.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);

        if (memoryCache.TryGetValue<IReadOnlyList<PipelineRunDto>>(partitionKey, out var cached))
            return cached!;

        cached = await blobCache.GetAsync<IReadOnlyList<PipelineRunDto>>(partitionKey, ct);
        if (cached is not null)
            return cached;

        var result = await GetPartitionAsync(partitionKey, ct);

        memoryCache.Set(partitionKey, result, MemoryCacheExpiration);
        await blobCache.SetAsync(partitionKey, result, ct);

        return result;
    }

    //cached by topRowKey only in memory - mutable/fluctuating data
    private async Task<IReadOnlyList<PipelineRunDto>> GetTodayAsync(CancellationToken ct = default)
    {
        var todayDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var partitionKey = todayDate.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);

        var topRowKey = await chartQuantLogRepository.GetTopRowKeyAsync(partitionKey, ct);
        if (topRowKey is null)
            return [];

        if (memoryCache.TryGetValue<IReadOnlyList<PipelineRunDto>>(topRowKey, out var cached))
            return cached!;

        var result = await GetPartitionAsync(partitionKey, ct);

        var isRunning = result.Count > 0 && result[0].Status is PipelineStatus.Running;
        if (!isRunning)
            memoryCache.Set(topRowKey, result, MemoryCacheExpiration);

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
            ModelName = chartQuantAudit?.ModelName,
            Signal = chartQuantAudit?.Signal,
            Decision = sparkTradeAudit?.DecisionResult,
            Attachments = BuildAttachments(chartQuantAudit),
            Logs = logs
        };
    }

    private static IReadOnlyList<PipelineAttachmentDto> BuildAttachments(ChartQuantAudit? chartQuantAudit)
    {
        var attachments = new List<PipelineAttachmentDto>();
        if (!string.IsNullOrEmpty(chartQuantAudit?.BlobName))
            attachments.Add(new PipelineAttachmentDto { BlobName = chartQuantAudit.BlobName, Type = PipelineAttachmentType.ChartScreenshot });
        if (!string.IsNullOrEmpty(chartQuantAudit?.TxtBlobName))
            attachments.Add(new PipelineAttachmentDto { BlobName = chartQuantAudit.TxtBlobName, Type = PipelineAttachmentType.AnalysisText });
        return attachments;
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
