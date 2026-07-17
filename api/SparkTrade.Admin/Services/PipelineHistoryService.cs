using Cyberwyvern.Azure.Caching;
using Microsoft.Extensions.Caching.Memory;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Data.Entities;
using System.Globalization;
using System.Text.RegularExpressions;

namespace SparkTrade.Admin.Services;

public interface IPipelineHistoryService
{
    Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default);
    Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default);
}

public partial class PipelineHistoryService(
    TableServiceContext context,
    IBlobCache blobCache,
    IMemoryCache memoryCache) : IPipelineHistoryService
{
    private static readonly TimeSpan MemoryCacheExpiration = TimeSpan.FromMinutes(20);

    public async Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default)
    {
        var partitionDate = await context.ChartQuantLogs.GetNextPartitionDateAsync(current, e => e.CorrelationId != "", ct);

        return partitionDate.HasValue ? await GetDayAsync(partitionDate.Value, ct) : [];
    }

    //cached by partitionKey in both memory and blob - immutable data
    public async Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default)
    {
        var isToday = date == DateOnly.FromDateTime(DateTime.UtcNow);
        if (isToday)
            return await GetTodayAsync(ct);

        var cacheKey = date.ToString(CultureInfo.InvariantCulture);
        if (memoryCache.TryGetValue<IReadOnlyList<PipelineRunDto>>(cacheKey, out var cached))
            return cached!;

        cached = await blobCache.GetAsync<IReadOnlyList<PipelineRunDto>>(cacheKey, ct);
        if (cached is not null)
            return cached;

        var result = await GetPartitionAsync(date, ct);

        memoryCache.Set(cacheKey, result, MemoryCacheExpiration);
        await blobCache.SetAsync(cacheKey, result, ct);

        return result;
    }

    //cached by topRowKey only in memory - mutable/fluctuating data
    private async Task<IReadOnlyList<PipelineRunDto>> GetTodayAsync(CancellationToken ct = default)
    {
        var todayDate = DateOnly.FromDateTime(DateTime.UtcNow);

        var lastRowId = await context.ChartQuantLogs.GetLastRecordIdAsync(todayDate, ct);
        if (lastRowId is null)
            return [];

        if (memoryCache.TryGetValue<IReadOnlyList<PipelineRunDto>>(lastRowId, out var cached))
            return cached!;

        var result = await GetPartitionAsync(todayDate, ct);

        var isRunning = result.Count > 0 && result[0].Status is PipelineStatus.Running;
        if (!isRunning)
            memoryCache.Set(lastRowId, result, MemoryCacheExpiration);

        return result;
    }

    private async Task<IReadOnlyList<PipelineRunDto>> GetPartitionAsync(DateOnly partitionDate, CancellationToken ct)
    {
        var chartQuantLogsTask = context.ChartQuantLogs.GetPartitionAsync(partitionDate, ct);
        var chartQuantAuditsTask = context.ChartQuantAudit.GetPartitionAsync(partitionDate, ct);
        var sparkTradeLogsTask = context.SparkTradeLogs.GetPartitionAsync(partitionDate, ct);
        var sparkTradeAuditsTask = context.SparkTradeAudit.GetPartitionAsync(partitionDate, ct);

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
        ILookup<string, ChartQuantLog> chartQuantLogs,
        ILookup<string, SparkTradeAudit> sparkTradeAudits,
        ILookup<string, SparkTradeLog> sparkTradeLogs)
    {
        var chartQuantAudit = chartQuantAudits[correlationId].FirstOrDefault();
        var sparkTradeAudit = sparkTradeAudits[correlationId].FirstOrDefault();

        var logs = chartQuantLogs[correlationId]
            .Select(x => x.ToLogDto())
            .Concat(sparkTradeLogs[correlationId].Select(x => x.ToLogDto()))
            .OrderByDescending(x => x.Timestamp)
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

    private static List<PipelineAttachmentDto> BuildAttachments(ChartQuantAudit? chartQuantAudit)
    {
        var attachments = new List<PipelineAttachmentDto>();
        if (!string.IsNullOrEmpty(chartQuantAudit?.BlobName))
            attachments.Add(new PipelineAttachmentDto { BlobName = chartQuantAudit.BlobName, Type = PipelineAttachmentType.ChartScreenshot });
        if (!string.IsNullOrEmpty(chartQuantAudit?.TxtBlobName))
            attachments.Add(new PipelineAttachmentDto { BlobName = chartQuantAudit.TxtBlobName, Type = PipelineAttachmentType.AnalysisText });
        return attachments;
    }
}

public partial class PipelineHistoryService
{
    [GeneratedRegex(@"for ""(?<symbol>[A-Z]+)"" ""(?<interval>\d+[mhDWM])""")]
    private static partial Regex SymbolIntervalRegex();

    private static (string? Symbol, string? Interval) ParseSymbolIntervalFromLogs(IReadOnlyList<PipelineLogDto> logs)
    {
        foreach (var log in logs.OrderBy(x => x.Timestamp))
        {
            var match = SymbolIntervalRegex().Match(log.Message);
            if (match.Success)
                return (match.Groups["symbol"].Value, match.Groups["interval"].Value);
        }

        return (null, null);
    }
}
