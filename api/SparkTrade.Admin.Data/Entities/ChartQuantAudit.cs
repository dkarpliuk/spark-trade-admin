namespace SparkTrade.Admin.Data.Entities;

public class ChartQuantAudit : CorrelatedTableEntity
{
    public string Symbol { get; set; } = "";
    public string Interval { get; set; } = "";
    public DateTimeOffset ChartTimestamp { get; set; }
    public string BlobName { get; set; } = "";
    public string Signal { get; set; } = "";
}
