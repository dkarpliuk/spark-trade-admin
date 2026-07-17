using Cyberwyvern.Azure.TableRepository;

namespace SparkTrade.Admin.Data.Entities;

public class ChartQuantAudit : IEntity, ICorrelated
{
    public string CompositeId { get; set; } = "";

    public string Symbol { get; set; } = "";
    public string Interval { get; set; } = "";
    public DateTimeOffset ChartTimestamp { get; set; }
    public string BlobName { get; set; } = "";
    public string TxtBlobName { get; set; } = "";
    public string ModelName { get; set; } = "";
    public string Signal { get; set; } = "";
    public string? CorrelationId { get; set; }
}
