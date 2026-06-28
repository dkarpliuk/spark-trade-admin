using SparkTrade.Admin.Contracts;

namespace SparkTrade.Admin.Services;

public interface IPipelineStatusService
{
    Task<PipelineStatusDto> GetStatusesAsync(CancellationToken ct = default);
    Task StartServiceAsync(PipelineService service, CancellationToken ct = default);
    Task StopServiceAsync(PipelineService service, CancellationToken ct = default);
}
