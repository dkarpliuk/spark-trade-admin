namespace SparkTrade.Admin.Data.Entities;

public class LogEntity : CorrelatedTableEntity
{
    public string Level { get; set; } = "";

    public string Message { get; set; } = "";

    public string? InvocationId { get; set; }
}
