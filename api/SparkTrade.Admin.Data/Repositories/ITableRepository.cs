using Azure.Data.Tables;

namespace SparkTrade.Admin.Data.Repositories;

public interface ITableRepository<T> where T : class, ITableEntity
{
    Task<IReadOnlyList<T>> GetByPartitionAsync(
        string partitionKey,
        CancellationToken ct = default);

    Task<string?> FindPreviousPartitionKeyAsync(
        string current,
        Func<string, int, string> keyIncrement,
        CancellationToken ct = default);

    Task<string?> GetTopRowKeyAsync(string partitionKey, CancellationToken ct = default);
}
