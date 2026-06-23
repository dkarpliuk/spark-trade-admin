using System.Text.Json;
using Azure.Storage.Blobs;
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

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

var pipelineStorageConnection = builder.Configuration["PipelineStorage"]!;

AddLogging(builder.Services, pipelineStorageConnection);

builder.Services.AddOptions<AppConfig>().Bind(builder.Configuration);

builder.Services.AddSingleton(_ => new BlobContainerClient(pipelineStorageConnection, StorageNames.AnalysisImagesContainer));

builder.Services.AddSingleton<IPipelineHistoryService>(_ => new PipelineHistoryService(
    new TableRepository<ChartQuantAudit>(pipelineStorageConnection, StorageNames.ChartQuantAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.ChartQuantLogsTable),
    new TableRepository<SparkTradeAudit>(pipelineStorageConnection, StorageNames.SparkTradeAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.SparkTradeLogsTable)));

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
