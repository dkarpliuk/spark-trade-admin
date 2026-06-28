using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SparkTrade.Admin.Contracts;
using SparkTrade.Admin.Services;

namespace SparkTrade.Admin.Functions;

public class PipelineStatusFunction(IPipelineStatusService pipelineStatusService)
{
    [Function("GetPipelineStatuses")]
    public async Task<IActionResult> GetStatuses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pipeline-status")] HttpRequest req,
        CancellationToken ct)
    {
        var statuses = await pipelineStatusService.GetStatusesAsync(ct);

        return new OkObjectResult(statuses);
    }

    [Function("StartPipelineService")]
    public async Task<IActionResult> StartService(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pipeline-status/{service}/start")] HttpRequest req,
        string service,
        CancellationToken ct)
    {
        if (!Enum.TryParse<PipelineService>(service, ignoreCase: true, out var pipelineService))
            return new BadRequestObjectResult($"Unknown service: {service}");

        await pipelineStatusService.StartServiceAsync(pipelineService, ct);

        return new OkResult();
    }

    [Function("StopPipelineService")]
    public async Task<IActionResult> StopService(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pipeline-status/{service}/stop")] HttpRequest req,
        string service,
        CancellationToken ct)
    {
        if (!Enum.TryParse<PipelineService>(service, ignoreCase: true, out var pipelineService))
            return new BadRequestObjectResult($"Unknown service: {service}");

        await pipelineStatusService.StopServiceAsync(pipelineService, ct);

        return new OkResult();
    }

    [Function("ManualTriggerChartScreen")]
    public async Task<IActionResult> ManualTriggerChartScreen(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pipeline-status/chartscreen/manual-trigger")] HttpRequest req,
        CancellationToken ct)
    {
        await pipelineStatusService.ManualTriggerChartScreenAsync(ct);

        return new OkResult();
    }
}
