using System.Text.Json;
using System.Text.Json.Serialization;

namespace SparkTrade.Admin.Configuration;

public static class JsonOptionsExtensions
{
    public static void ConfigureAppDefaults(this JsonSerializerOptions options)
    {
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    }
}
