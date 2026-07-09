using System.IO.Compression;
using System.Text.Json;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using SparkTrade.Admin.Configuration;

namespace SparkTrade.Admin.Services;

public class BlobCacheService(BlobServiceClient blobServiceClient)
{
    private static readonly JsonSerializerOptions SerializerOptions = CreateSerializerOptions();

    private readonly BlobContainerClient container = blobServiceClient.GetBlobContainerClient(StorageNames.HistoryCacheContainer);

    public async Task<T?> GetAsync<T>(string key, TimeSpan expiration, CancellationToken ct = default)
    {
        Response<BlobDownloadResult> response;
        try
        {
            response = await container.GetBlobClient(BlobName(key)).DownloadContentAsync(ct);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return default;
        }

        if (DateTimeOffset.UtcNow - response.Value.Details.LastModified > expiration)
            return default;

        await using var raw = response.Value.Content.ToStream();
        await using var gzip = new GZipStream(raw, CompressionMode.Decompress);
        return await JsonSerializer.DeserializeAsync<T>(gzip, SerializerOptions, ct);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken ct = default)
    {
        var buffer = new MemoryStream();
        await using (var gzip = new GZipStream(buffer, CompressionLevel.Optimal, leaveOpen: true))
            await JsonSerializer.SerializeAsync(gzip, value, SerializerOptions, ct);

        buffer.Position = 0;
        await container.GetBlobClient(BlobName(key)).UploadAsync(buffer, overwrite: true, ct);
    }

    private static string BlobName(string key) => $"{key}.json.gz";

    private static JsonSerializerOptions CreateSerializerOptions()
    {
        var options = new JsonSerializerOptions();
        options.ConfigureAppDefaults();
        return options;
    }
}
