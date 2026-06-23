namespace SparkTrade.Admin.Data.Entities;

public class SparkTradeAudit : TableEntityBase
{
    public string Symbol { get; set; } = "";
    public string Interval { get; set; } = "";
    public DateTimeOffset ChartTimestamp { get; set; }
    public string DecisionResult { get; set; } = "";
}
