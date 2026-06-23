using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;
using SparkTrade.Admin.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

var pipelineStorageConnection = builder.Configuration["PipelineStorage"]!;

builder.Services.AddSingleton<IPipelineHistoryService>(_ => new PipelineHistoryService(
    new TableRepository<ChartQuantAudit>(pipelineStorageConnection, StorageNames.ChartQuantAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.ChartQuantLogsTable),
    new TableRepository<SparkTradeAudit>(pipelineStorageConnection, StorageNames.SparkTradeAuditTable),
    new TableRepository<LogEntity>(pipelineStorageConnection, StorageNames.SparkTradeLogsTable)));

builder.Build().Run();
