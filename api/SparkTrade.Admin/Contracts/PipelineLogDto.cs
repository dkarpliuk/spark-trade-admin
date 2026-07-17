using SparkTrade.Admin.Data.Entities;

namespace SparkTrade.Admin.Contracts;

public class PipelineLogDto
{
    public string? Id { get; set; }
    public string Service { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public string Level { get; set; } = "";
    public string Message { get; set; } = "";
    public string? InvocationId { get; set; }
    public string? CorrelationId { get; set; }
}

public static class PipelineLogDtoExtensions
{
    public static PipelineLogDto ToLogDto(this ChartQuantLog log) => new()
    {
        Id = log.CompositeId,
        Service = "ChartQuant",
        Timestamp = log.EventTimestamp,
        Level = log.Level,
        Message = log.Message,
        InvocationId = log.InvocationId,
        CorrelationId = log.CorrelationId
    };

    public static PipelineLogDto ToLogDto(this SparkTradeLog log) => new()
    {
        Id = log.CompositeId,
        Service = "SparkTrade",
        Timestamp = log.EventTimestamp,
        Level = log.Level,
        Message = log.Message,
        InvocationId = log.InvocationId,
        CorrelationId = log.CorrelationId
    };
}
