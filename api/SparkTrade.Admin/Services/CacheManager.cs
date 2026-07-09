using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace SparkTrade.Admin.Services;

public interface ICacheManager
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);

    Task SetAsync<T>(string key, T value, CancellationToken ct = default);

    Task SetMemoryAsync<T>(string key, T value, CancellationToken ct = default);
}

public class CacheManagerSettings
{
    public TimeSpan MemoryExpiration { get; set; }

    public TimeSpan BlobExpiration { get; set; }
}

public class CacheManager(IMemoryCache memoryCache, BlobCacheService blobCache, IOptions<CacheManagerSettings> settings) : ICacheManager
{
    private readonly CacheManagerSettings _settings = settings.Value!;

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        if (memoryCache.TryGetValue<T>(key, out var value) && value is not null)
            return value;

        value = await blobCache.GetAsync<T>(key, _settings.BlobExpiration, ct);
        if (value is not null)
            memoryCache.Set(key, value, _settings.MemoryExpiration);

        return value;
    }

    public async Task SetAsync<T>(string key, T value, CancellationToken ct = default)
    {
        await SetMemoryAsync(key, value, ct);
        await blobCache.SetAsync(key, value, _settings.BlobExpiration, ct);
    }

    public Task SetMemoryAsync<T>(string key, T value, CancellationToken ct = default)
    {
        memoryCache.Set(key, value, _settings.MemoryExpiration);
        return Task.CompletedTask;
    }
}
