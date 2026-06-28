using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
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
}
