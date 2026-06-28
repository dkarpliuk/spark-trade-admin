namespace SparkTrade.Admin.Contracts;

public enum AppStatus
{
    Running,
    Stopped,
    Unknown,
}

public class PipelineStatusDto
{
    public AppStatus ChartScreenStatus { get; set; }
    public AppStatus ChartQuantStatus { get; set; }
    public AppStatus SparkTradeStatus { get; set; }
}
