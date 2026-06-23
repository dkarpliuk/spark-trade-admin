using SparkTrade.Admin.Contracts;

namespace SparkTrade.Admin.Services;

public interface IPipelineHistoryService
{
    Task<IReadOnlyList<PipelineRunDto>> GetPreviousDayAsync(DateOnly current, CancellationToken ct = default);

    Task<IReadOnlyList<PipelineRunDto>> GetDayAsync(DateOnly date, CancellationToken ct = default);
}
