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
        var client = CreateArmClient();

        var chartScreenTask = GetStatusAsync(client, _config.ChartScreenResourceId, ct);
        var chartQuantTask  = GetStatusAsync(client, _config.ChartQuantResourceId, ct);
        var sparkTradeTask  = GetStatusAsync(client, _config.SparkTradeResourceId, ct);

        await Task.WhenAll(chartScreenTask, chartQuantTask, sparkTradeTask);

        return new PipelineStatusDto
        {
            ChartScreen = await chartScreenTask,
            ChartQuant  = await chartQuantTask,
            SparkTrade  = await sparkTradeTask,
        };
    }

    public async Task StartServiceAsync(PipelineService service, CancellationToken ct = default)
    {
        var site = CreateArmClient().GetWebSiteResource(new ResourceIdentifier(GetResourceId(service)));
        await site.StartAsync(ct);
    }

    public async Task StopServiceAsync(PipelineService service, CancellationToken ct = default)
    {
        var site = CreateArmClient().GetWebSiteResource(new ResourceIdentifier(GetResourceId(service)));
        await site.StopAsync(ct);
    }

    private string GetResourceId(PipelineService service) => service switch
    {
        PipelineService.ChartScreen => _config.ChartScreenResourceId,
        PipelineService.ChartQuant  => _config.ChartQuantResourceId,
        PipelineService.SparkTrade  => _config.SparkTradeResourceId,
        _ => throw new ArgumentOutOfRangeException(nameof(service), service, null),
    };

    private static ArmClient CreateArmClient() =>
        new(new DefaultAzureCredential(new DefaultAzureCredentialOptions
        {
            ExcludeVisualStudioCredential = true,
        }));

    private static async Task<AppStatus> GetStatusAsync(ArmClient client, string resourceId, CancellationToken ct)
    {
        var site = client.GetWebSiteResource(new ResourceIdentifier(resourceId));
        var response = await site.GetAsync(ct);

        return response.Value.Data.State.ToLower() switch
        {
            "running"  => AppStatus.Running,
            "starting" => AppStatus.Starting,
            "stopping" => AppStatus.Stopping,
            "stopped"  => AppStatus.Stopped,
            _          => AppStatus.Unknown,
        };
    }
}
