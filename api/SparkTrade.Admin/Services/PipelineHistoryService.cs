using System.Globalization;
using Cyberwyvern.Azure.Logging;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Services;

public class PipelineHistoryService(
    ITableRepository<ChartQuantAudit> chartQuantAuditRepository,
    ITableRepository<LogEntity> chartQuantLogRepository,
    ITableRepository<SparkTradeAudit> sparkTradeAuditRepository,
    ITableRepository<LogEntity> sparkTradeLogRepository) : IPipelineHistoryService
{
    private const string PartitionKeyFormat = "yyyyMMdd";

    public async Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default)
    {
        var currentKey = current.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
        var partitionKey = await chartQuantAuditRepository.FindPreviousPartitionKeyAsync(currentKey, IncrementCallback, ct);

        if (partitionKey is null)
            return [];

        return await GetDayAsync(DateOnly.ParseExact(partitionKey, PartitionKeyFormat, CultureInfo.InvariantCulture), ct);
    }

    public async Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default)
    {
        var partitionKey = date.ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);

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

        return [.. allKeys.Select(correlationId => new PipelineRunDto
        {
            ChartQuantLogs = [.. chartQuantLogs[correlationId]],
            ChartQuantAudit = chartQuantAudits[correlationId].FirstOrDefault(),
            SparkTradeLogs = [.. sparkTradeLogs[correlationId]],
            SparkTradeAudit = sparkTradeAudits[correlationId].FirstOrDefault()
        })];
    }

    private static string IncrementCallback(string partitionKey, int increment)
    {
        return DateOnly
            .ParseExact(partitionKey, PartitionKeyFormat, CultureInfo.InvariantCulture)
            .AddDays(increment)
            .ToString(PartitionKeyFormat, CultureInfo.InvariantCulture);
    }
}
