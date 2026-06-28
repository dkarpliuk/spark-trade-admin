using Azure.Storage.Blobs;
using Microsoft.Extensions.Caching.Memory;
using Cyberwyvern.Azure.Logging;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using SparkTrade.Admin.Auth;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;
using SparkTrade.Admin.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();
builder.UseMiddleware<InvocationLoggingMiddleware>();
if (!builder.Environment.IsDevelopment())
    builder.UseMiddleware<AdminAuthorizationMiddleware>();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => options.SerializerOptions.ConfigureAppDefaults());
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options => options.JsonSerializerOptions.ConfigureAppDefaults());

var pipelineStorageConnection = builder.Configuration["PipelineStorage"]!;

// Logging
AddLogging(builder.Services, pipelineStorageConnection);

// Options
builder.Services.AddOptions<AppConfig>().Bind(builder.Configuration);
builder.Services.AddOptions<PipelineConfig>().Bind(builder.Configuration.GetSection("Pipeline"));

// Services
builder.Services.AddMemoryCache();
builder.Services.AddSingleton(_ => new BlobContainerClient(pipelineStorageConnection, StorageNames.AnalysisImagesContainer));
builder.Services.AddSingleton<IPipelineStatusService, PipelineStatusService>();
builder.Services.AddSingleton<IPipelineHistoryService>(sp => new PipelineHistoryService(
    new TableRepository<ChartQuantAudit>(pipelineStorageConnection, StorageNames.ChartQuantAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.ChartQuantLogsTable),
    new TableRepository<SparkTradeAudit>(pipelineStorageConnection, StorageNames.SparkTradeAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.SparkTradeLogsTable),
    sp.GetRequiredService<IMemoryCache>()));

builder.Build().Run();

static void AddLogging(IServiceCollection services, string connectionString)
{
    services.AddSerilog(lc => lc
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Error)
        .MinimumLevel.Override("Azure", LogEventLevel.Error)
        .WriteTo.Console()
        .WriteTo.AzureTableStorage(connectionString, StorageNames.AdminLogsTable, "InvocationId"));
}
