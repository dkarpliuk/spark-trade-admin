using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.AppService;
using Microsoft.Extensions.Options;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Contracts;

namespace SparkTrade.Admin.Services;

public class PipelineStatusService(IOptions<PipelineConfig> config) : IPipelineStatusService
{
    private readonly PipelineConfig _config = config.Value;

    public async Task<PipelineStatusDto> GetStatusesAsync(CancellationToken ct = default)
    {
        var client = new ArmClient(new DefaultAzureCredential(new DefaultAzureCredentialOptions
        {
            ExcludeVisualStudioCredential = true,
        }));

        var chartScreenTask = GetStatusAsync(client, _config.ChartScreenResourceId, ct);
        var chartQuantTask  = GetStatusAsync(client, _config.ChartQuantResourceId, ct);
        var sparkTradeTask  = GetStatusAsync(client, _config.SparkTradeResourceId, ct);

        await Task.WhenAll(chartScreenTask, chartQuantTask, sparkTradeTask);

        return new PipelineStatusDto
        {
            ChartScreenStatus = await chartScreenTask,
            ChartQuantStatus  = await chartQuantTask,
            SparkTradeStatus  = await sparkTradeTask,
        };
    }

    private static async Task<AppStatus> GetStatusAsync(ArmClient client, string resourceId, CancellationToken ct)
    {
        var site = client.GetWebSiteResource(new ResourceIdentifier(resourceId));
        var response = await site.GetAsync(ct);
        
        return response.Value.Data.State.ToLower() switch
        {
            "running" => AppStatus.Running,
            "stopped" => AppStatus.Stopped,
            _         => AppStatus.Unknown,
        };
    }
}
