using System.Globalization;
using Microsoft.Extensions.Caching.Memory;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Services;

public class PipelineHistoryService(
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

        return [.. allKeys.Select(correlationId =>
        {
            var chartQuantAudit = chartQuantAudits[correlationId].FirstOrDefault();
            var sparkTradeAudit = sparkTradeAudits[correlationId].FirstOrDefault();

            return new PipelineRunDto
            {
                Symbol = chartQuantAudit?.Symbol ?? sparkTradeAudit?.Symbol,
                Interval = chartQuantAudit?.Interval ?? sparkTradeAudit?.Interval,
                ChartTimestamp = chartQuantAudit?.ChartTimestamp ?? sparkTradeAudit?.ChartTimestamp,
                BlobName = chartQuantAudit?.BlobName,
                Signal = chartQuantAudit?.Signal,
                Decision = sparkTradeAudit?.DecisionResult,
                Logs = [.. chartQuantLogs[correlationId]
                    .Select(x => x.ToLogDto("ChartQuant"))
                    .Concat(sparkTradeLogs[correlationId].Select(x => x.ToLogDto("SparkTrade")))
                    .OrderBy(x => x.Id)]
            };
        }).OrderByDescending(x => x.Start)];
    }

    private static string IncrementCallback(string partitionKey, int increment)
    {
        return DateOnly
            .ParseExact(partitionKey, PartitionKeyFormat, CultureInfo.InvariantCulture)
            .AddDays(increment)
            .ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
    }
}
