using Azure.Data.Tables;
using Cyberwyvern.Azure.TableRepository;
using Cyberwyvern.Azure.TableRepository.Converters;
using SparkTrade.Admin.Data.Entities;
using System.Linq.Expressions;

namespace SparkTrade.Admin.Data.Repositories;

public class ChartQuantLogsRepository : TableRepositoryBase<ChartQuantLog>
{
    private const int SearchDepth = 10;

    public ChartQuantLogsRepository(string connectionString, string tableName)
        : base(connectionString, tableName) { }

    public ChartQuantLogsRepository(TableServiceClient serviceClient, string tableName)
        : base(serviceClient, tableName) { }

    public async Task<DateOnly?> GetNextPartitionDateAsync(
        DateOnly current,
        Expression<Func<ChartQuantLog, bool>>? oDataFilter = null,
        CancellationToken ct = default)
    {
        var upperExclusive = current;

        for (var step = 0; step < SearchDepth; step++)
        {
            var rangeWidth = 1 << step;
            var lowerInclusive = upperExclusive.AddDays(-rangeWidth);

            var found = await GetLastPartitionDateInRangeAsync(lowerInclusive, upperExclusive, oDataFilter, ct);
            if (found is not null)
                return found;

            upperExclusive = lowerInclusive;
        }

        return null;
    }

    public async Task<string?> GetLastRecordIdAsync(DateOnly partitionDate, CancellationToken ct = default)
    {
        var filter = CompositeId.GetPartitionFilter(partitionDate);
        var lastRecord = await Client
            .QueryAsync<TableEntity>(e => e.PartitionKey == filter, maxPerPage: 1, cancellationToken: ct)
            .ToModels<ChartQuantLog>()
            .FirstOrDefaultAsync(ct);

        return lastRecord?.CompositeId;
    }

    private async Task<DateOnly?> GetLastPartitionDateInRangeAsync(
        DateOnly lowerInclusive,
        DateOnly upperExclusive,
        Expression<Func<ChartQuantLog, bool>>? oDataFilter = null,
        CancellationToken ct = default)
    {
        var filterFrom = CompositeId.GetPartitionFilter(lowerInclusive);
        var filterTo = CompositeId.GetPartitionFilter(upperExclusive);
        var filter = TableClient.CreateQueryFilter($"PartitionKey ge {filterFrom} and PartitionKey lt {filterTo}");
        if (oDataFilter is not null)
            filter = $"{filter} and {TableClient.CreateQueryFilter(oDataFilter)}";

        return await Client
            .QueryAsync<TableEntity>(filter, select: ["PartitionKey", "RowKey"], cancellationToken: ct)
            .Select(e => CompositeId.FromKeys(e.PartitionKey, e.RowKey).PartitionDate)
            .MaxAsync(cancellationToken: ct);
    }
}
