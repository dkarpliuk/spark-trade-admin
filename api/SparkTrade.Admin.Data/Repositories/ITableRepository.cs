using SparkTrade.Admin.Data.Entities;

namespace SparkTrade.Admin.Data.Repositories;

public interface ITableRepository<T> where T : TableEntityBase
{
    Task<IReadOnlyList<T>> GetByPartitionAsync(
        string partitionKey,
        CancellationToken ct = default);

    Task<string?> FindPreviousPartitionKeyAsync(
        string current,
        Func<string, int, string> keyIncrement,
        CancellationToken ct = default);
}
