using Cyberwyvern.Azure.Caching;
using Cyberwyvern.Azure.Logging;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using SparkTrade.Admin.Auth;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();
if (!builder.Environment.IsDevelopment())
    builder.UseMiddleware<AdminAuthorizationMiddleware>();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => options.SerializerOptions.ConfigureAppDefaults());
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options => options.JsonSerializerOptions.ConfigureAppDefaults());

var pipelineStorageConnection = builder.Configuration["PipelineStorage"]!;

// Logging
AddLogging(builder.Services, pipelineStorageConnection);

// Azure clients
builder.Services.AddAzureClients(clients =>
{
    clients.AddTableServiceClient(pipelineStorageConnection);
    clients.AddBlobServiceClient(pipelineStorageConnection);
});

// Options
builder.Services.AddOptions<AppConfig>().Bind(builder.Configuration);
builder.Services.AddOptions<PipelineStateOptions>().Bind(builder.Configuration.GetSection("Pipeline"));

// Services
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddBlobCache(pipelineStorageConnection, StorageNames.HistoryCacheContainer);
builder.Services.AddSingleton<IPipelineStatusService, PipelineStatusService>();
builder.Services.AddSingleton<IPipelineHistoryService, PipelineHistoryService>();
builder.Services.AddSingleton<TableServiceContext>();

builder.Build().Run();

static void AddLogging(IServiceCollection services, string connectionString)
{
    services.AddSerilog(lc => lc
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Error)
        .MinimumLevel.Override("Azure", LogEventLevel.Error)
        .WriteTo.Console()
        .WriteTo.AzureTableStorage<LogEntry>(connectionString, StorageNames.AdminLogsTable, TimeSpan.FromSeconds(10)));
}
