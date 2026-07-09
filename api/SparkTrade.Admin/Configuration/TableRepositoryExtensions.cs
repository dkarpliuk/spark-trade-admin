using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Configuration;

public static class TableRepositoryExtensions
{
    public static IServiceCollection AddKeyedRepository<T>(this IServiceCollection services, string tableName) where T : class, ITableEntity
    {
        return services.AddKeyedTransient<ITableRepository<T>>(tableName, (sp, _) => new TableRepository<T>(sp.GetRequiredService<TableServiceClient>(), tableName));
    }
}