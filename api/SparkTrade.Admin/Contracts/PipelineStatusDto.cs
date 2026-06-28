using System.Text.Json.Serialization;

namespace SparkTrade.Admin.Contracts;

public enum AppStatus
{
    Running,
    Stopped,
    Unknown,
}

public enum PipelineService
{
    ChartScreen,
    ChartQuant,
    SparkTrade,
}

public class PipelineStatusDto
{
    [JsonPropertyName(nameof(PipelineService.ChartScreen))]
    public AppStatus ChartScreen { get; set; }

    [JsonPropertyName(nameof(PipelineService.ChartQuant))]
    public AppStatus ChartQuant { get; set; }

    [JsonPropertyName(nameof(PipelineService.SparkTrade))]
    public AppStatus SparkTrade { get; set; }
}
