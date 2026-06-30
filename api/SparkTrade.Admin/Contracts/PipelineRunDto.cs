namespace SparkTrade.Admin.Contracts;

public enum PipelineStatus
{
    Unknown,
    Complete,
    Partial,
    Running,
    Failed,
}

public class PipelineRunDto
{
    public PipelineStatus Status
    {
        get
        {
            if (Logs.Count == 0)
                return PipelineStatus.Unknown;
            if (Logs.Any(x => x.Level is "Error" or "Fatal" or "Critical"))
                return PipelineStatus.Failed;
            if (Decision is null && End is { } end && DateTimeOffset.UtcNow - end < TimeSpan.FromMinutes(1))
                return PipelineStatus.Running;
            if (Decision is null)
                return PipelineStatus.Partial;
            return PipelineStatus.Complete;
        }
    }

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
