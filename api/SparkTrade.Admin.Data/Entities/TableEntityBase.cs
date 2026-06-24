using Azure;
using Azure.Data.Tables;

namespace SparkTrade.Admin.Data.Entities;

public interface ICorrelated
{
    string? CorrelationId { get; set; }
}

public abstract class TableEntityBase : ITableEntity
{
    public string PartitionKey { get; set; } = "";
    public string RowKey { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}

public abstract class CorrelatedTableEntity : TableEntityBase, ICorrelated
{
    public string? CorrelationId { get; set; }
}