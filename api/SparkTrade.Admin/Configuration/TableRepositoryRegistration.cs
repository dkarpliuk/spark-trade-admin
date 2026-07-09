using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using SparkTrade.Admin.Data.Repositories;

namespace SparkTrade.Admin.Configuration;

internal static class TableRepositoryRegistration
{
    public static IServiceCollection AddKeyedRepository<T>(this IServiceCollection services, string tableName) where T : class, ITableEntity
    {
        return services.AddKeyedTransient<ITableRepository<T>>(tableName, (sp, _) => new TableRepository<T>(sp.GetRequiredService<TableServiceClient>(), tableName));
    }
}