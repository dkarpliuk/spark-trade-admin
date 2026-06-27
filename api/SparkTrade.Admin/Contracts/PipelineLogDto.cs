using Cyberwyvern.Azure.Logging;
using SparkTrade.Admin.Data.Entities;

namespace SparkTrade.Admin.Contracts;

public class PipelineLogDto
{
    public string Id { get; set; } = "";
    public string Service { get; set; } = "";
    public DateTimeOffset? Timestamp { get; set; }
    public string Level { get; set; } = "";
    public string Message { get; set; } = "";
    public string? InvocationId { get; set; }
    public string? CorrelationId { get; set; }
}

public static class PipelineLogDtoExtensions
{
    public static PipelineLogDto ToLogDto(this LogEntity log, string service) => new()
    {
        Id = log.RowKey,
        Service = service,
        Timestamp = LogEventExtensions.GetUtcTimestamp(log.RowKey),
        Level = log.Level,
        Message = log.Message,
        InvocationId = log.InvocationId,
        CorrelationId = log.CorrelationId
    };
}
