using SparkTrade.Admin.Contracts;

namespace SparkTrade.Admin.Services;

public interface IPipelineStatusService
{
    Task<PipelineStatusDto> GetStatusesAsync(CancellationToken ct = default);
}
