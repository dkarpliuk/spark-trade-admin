using Azure.Data.Tables;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Data.Entities;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Services;

public sealed class TableServiceContext(TableServiceClient tableServiceClient)
{
    public ChartQuantLogsRepository ChartQuantLogs = new(tableServiceClient, StorageNames.ChartQuantLogsTable);
    public TableRepositoryBase<SparkTradeLog> SparkTradeLogs = new(tableServiceClient, StorageNames.SparkTradeLogsTable);
    public TableRepositoryBase<ChartQuantAudit> ChartQuantAudit = new(tableServiceClient, StorageNames.ChartQuantAuditTable);
    public TableRepositoryBase<SparkTradeAudit> SparkTradeAudit = new(tableServiceClient, StorageNames.SparkTradeAuditTable);
}
