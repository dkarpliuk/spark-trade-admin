namespace SparkTrade.Admin.Contracts;

public class PipelineRunDto
{
    public string? Symbol { get; set; }
    public string? Interval { get; set; }
    public DateTimeOffset? ChartTimestamp { get; set; }

    public string? BlobName { get; set; }
    public string? Signal { get; set; }
    public string? Decision { get; set; }

    public DateTimeOffset? Start => Logs.Count > 0 ? Logs[^1].Timestamp : null;
    public DateTimeOffset? End => Logs.Count > 0 ? Logs[0].Timestamp : null;
    public long? DurationMs => Start is { } start && End is { } end ? (long)Math.Round((end - start).TotalMilliseconds) : null;

    public IReadOnlyList<PipelineLogDto> Logs { get; set; } = [];
}
