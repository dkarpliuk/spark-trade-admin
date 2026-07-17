using Cyberwyvern.Azure.TableRepository;

namespace SparkTrade.Admin.Data.Entities;

public class SparkTradeAudit : IEntity, ICorrelated
{
    public string? CompositeId { get; set; }

    public string Symbol { get; set; } = "";
    public string Interval { get; set; } = "";
    public DateTimeOffset ChartTimestamp { get; set; }
    public string DecisionResult { get; set; } = "";
    public string? CorrelationId { get; set; }
}
