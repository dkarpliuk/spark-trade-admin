using System.IO.Compression;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MessagePack;
using MessagePack.Resolvers;
using SparkTrade.Admin.Configuration;

namespace SparkTrade.Admin.Services;

public interface IBlobCache
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, CancellationToken ct = default);
}

public class BlobCacheService(BlobServiceClient blobServiceClient) : IBlobCache
{
    private static readonly MessagePackSerializerOptions SerializerOptions =
        MessagePackSerializerOptions.Standard.WithResolver(ContractlessStandardResolver.Instance);

    private readonly BlobContainerClient container = blobServiceClient.GetBlobContainerClient(StorageNames.HistoryCacheContainer);

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
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

        var bytes = Decompress(response.Value.Content.ToArray());

        try
        {
            return MessagePackSerializer.Deserialize<T>(bytes, SerializerOptions, ct);
        }
        catch (MessagePackSerializationException)
        {
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, CancellationToken ct = default)
    {
        var bytes = MessagePackSerializer.Serialize(value, SerializerOptions, ct);
        var compressed = Compress(bytes);
        await container.GetBlobClient(BlobName(key)).UploadAsync(new BinaryData(compressed), overwrite: true, ct);
    }

    private static string BlobName(string key) => $"{key}.dat.gz";

    private static byte[] Compress(byte[] data)
    {
        using var output = new MemoryStream();
        using (var gzip = new GZipStream(output, CompressionLevel.Optimal, leaveOpen: true))
            gzip.Write(data);
        return output.ToArray();
    }

    private static byte[] Decompress(byte[] data)
    {
        using var input = new MemoryStream(data);
        using var gzip = new GZipStream(input, CompressionMode.Decompress);
        using var output = new MemoryStream();
        gzip.CopyTo(output);
        return output.ToArray();
    }
}
