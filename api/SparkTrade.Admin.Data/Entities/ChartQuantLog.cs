using Cyberwyvern.Azure.TableRepository;

namespace SparkTrade.Admin.Data.Entities;

public class SparkTradeLog : IEntity, ICorrelated
{
    public string? CompositeId { get; set; }

    public string Level { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTimeOffset? EventTimestamp { get; set; }
    public string? InvocationId { get; set; }
    public string? CorrelationId {  get; set; }
}
