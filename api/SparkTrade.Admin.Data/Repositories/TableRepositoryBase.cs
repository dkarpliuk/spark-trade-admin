using Azure.Data.Tables;
using Cyberwyvern.Azure.TableRepository;
using Cyberwyvern.Azure.TableRepository.Converters;

namespace SparkTrade.Admin.Data.Repositories;

public class TableRepositoryBase<T> : TableRepository<T> where T : IEntity, new()
{
    public TableRepositoryBase(string connectionString, string tableName)
        : base(connectionString, tableName) { }

    public TableRepositoryBase(TableServiceClient serviceClient, string tableName)
        : base(serviceClient, tableName) { }

    public async Task<IReadOnlyList<T>> GetPartitionAsync(DateOnly partitionDate, CancellationToken ct = default)
    {
        return await Client
            .QueryAsync<TableEntity>(e => e.PartitionKey == ODataFilter(partitionDate), cancellationToken: ct)
            .ToModels<T>()
            .ToListAsync(cancellationToken: ct);
    }

    protected string ODataFilter(DateOnly date) => date.ToString(CompositeId.PartitionKeyFormat);
}
