using Azure.Data.Tables;

namespace SparkTrade.Admin.Data.Repositories;

public class TableRepository<T>(string connectionString, string tableName) : ITableRepository<T>
    where T : class, ITableEntity
{
    private const int MaxSteps = 10;

    private readonly TableClient _client = new TableServiceClient(connectionString).GetTableClient(tableName);

    public async Task<IReadOnlyList<T>> GetByPartitionAsync(string partitionKey, CancellationToken ct = default)
    {
        return await _client
            .QueryAsync<T>(e => e.PartitionKey == partitionKey, cancellationToken: ct)
            .ToListAsync(ct);
    }

    public async Task<string?> FindPreviousPartitionKeyAsync(
        string current,
        Func<string, int, string> keyIncrement,
        CancellationToken ct = default)
    {
        var upperExclusive = current;

        for (var step = 0; step < MaxSteps; step++)
        {
            var rangeWidth = 1 << step;
            var lowerInclusive = keyIncrement(upperExclusive, -rangeWidth);

            var found = await GetMaxPartitionKeyInRangeAsync(lowerInclusive, upperExclusive, ct);
            if (found is not null)
                return found;

            upperExclusive = lowerInclusive;
        }

        return null;
    }

    private async Task<string?> GetMaxPartitionKeyInRangeAsync(string lowerInclusive, string upperExclusive, CancellationToken ct = default)
    {
        var filter = TableClient.CreateQueryFilter($"PartitionKey ge {lowerInclusive} and PartitionKey lt {upperExclusive}");

        return await _client
            .QueryAsync<TableEntity>(filter, select: ["PartitionKey"], cancellationToken: ct)
            .Select(e => e.PartitionKey)
            .MaxAsync(cancellationToken: ct);
    }
}
