using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MessagePack;
using MessagePack.Resolvers;
using SparkTrade.Admin.Configuration;

namespace SparkTrade.Admin.Services;

public class BlobCacheService(BlobServiceClient blobServiceClient)
{
    private static readonly MessagePackSerializerOptions SerializerOptions = MessagePackSerializerOptions.Standard
        .WithResolver(ContractlessStandardResolver.Instance)
        .WithCompression(MessagePackCompression.Lz4BlockArray);

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

        return MessagePackSerializer.Deserialize<T>(response.Value.Content.ToMemory(), SerializerOptions, ct);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken ct = default)
    {
        var bytes = MessagePackSerializer.Serialize(value, SerializerOptions, ct);
        await container.GetBlobClient(BlobName(key)).UploadAsync(new BinaryData(bytes), overwrite: true, ct);
    }

    private static string BlobName(string key) => $"{key}.dat";
}
