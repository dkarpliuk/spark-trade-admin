using Azure;
using Azure.Data.Tables;
using System.Text.Json.Serialization;

namespace SparkTrade.Admin.Data.Entities;

public interface ICorrelated
{
    string? CorrelationId { get; set; }
}

public abstract class TableEntityBase : ITableEntity
{
    [JsonIgnore]
    public string PartitionKey { get; set; } = "";
    [JsonIgnore]
    public string RowKey { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    [JsonIgnore]
    public ETag ETag { get; set; }
}

public abstract class CorrelatedTableEntity : TableEntityBase, ICorrelated
{
    public string? CorrelationId { get; set; }
}