using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.AppService;
using Microsoft.Extensions.Options;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Contracts;

namespace SparkTrade.Admin.Services;

public interface IPipelineStatusService
{
    Task<PipelineStatusDto> GetStatusesAsync(CancellationToken ct = default);
    Task StartServiceAsync(PipelineService service, CancellationToken ct = default);
    Task StopServiceAsync(PipelineService service, CancellationToken ct = default);
    Task ManualTriggerChartScreenAsync(CancellationToken ct = default);
}

public class PipelineStatusService(IOptions<PipelineStateOptions> options, IHttpClientFactory httpClientFactory) : IPipelineStatusService
{
    private readonly PipelineStateOptions _options = options.Value;

    public async Task<PipelineStatusDto> GetStatusesAsync(CancellationToken ct = default)
    {
        var client = CreateArmClient();

        var chartScreenTask = GetStatusAsync(client, _options.ChartScreenResourceId, ct);
        var chartQuantTask  = GetStatusAsync(client, _options.ChartQuantResourceId, ct);
        var sparkTradeTask  = GetStatusAsync(client, _options.SparkTradeResourceId, ct);

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

    public async Task ManualTriggerChartScreenAsync(CancellationToken ct = default)
    {
        var site = CreateArmClient().GetWebSiteResource(new ResourceIdentifier(_options.ChartScreenResourceId));
        var siteData = (await site.GetAsync(ct)).Value;
        var hostname = siteData.Data.DefaultHostName;

        var hostKeys = await site.GetHostKeysAsync(ct);
        var masterKey = hostKeys.Value.MasterKey;

        var http = httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, $"https://{hostname}/api/manual");
        request.Headers.Add("x-functions-key", masterKey);
        var response = await http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
    }

    private string GetResourceId(PipelineService service) => service switch
    {
        PipelineService.ChartScreen => _options.ChartScreenResourceId,
        PipelineService.ChartQuant  => _options.ChartQuantResourceId,
        PipelineService.SparkTrade  => _options.SparkTradeResourceId,
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
