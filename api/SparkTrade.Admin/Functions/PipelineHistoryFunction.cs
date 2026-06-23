using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SparkTrade.Admin.Services;

namespace SparkTrade.Admin.Functions;

public class PipelineHistoryFunction(IPipelineHistoryService pipelineHistoryService)
{
    [Function("GetPipelineDay")]
    public async Task<IActionResult> GetDay(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pipeline-history/{date}")] HttpRequest req,
        string date,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return new BadRequestResult();

        var runs = await pipelineHistoryService.GetDayAsync(parsedDate, ct);
        return new OkObjectResult(runs);
    }

    [Function("GetPreviousPipelineDay")]
    public async Task<IActionResult> GetPreviousDay(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pipeline-history/{date}/previous")] HttpRequest req,
        string date,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return new BadRequestResult();

        var runs = await pipelineHistoryService.GetPreviousDayAsync(parsedDate, ct);
        return new OkObjectResult(runs);
    }
}
