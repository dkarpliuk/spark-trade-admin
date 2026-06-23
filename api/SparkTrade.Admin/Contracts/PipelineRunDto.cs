using Cyberwyvern.Azure.Logging;
using SparkTrade.Admin.Data.Entities;

namespace SparkTrade.Admin.Contracts;

public class PipelineRunDto
{
    public ChartQuantAudit? ChartQuantAudit { get; set; }
    public SparkTradeAudit? SparkTradeAudit { get; set; }
    public IReadOnlyList<LogEntity> ChartQuantLogs { get; set; } = [];
    public IReadOnlyList<LogEntity> SparkTradeLogs { get; set; } = [];
}
