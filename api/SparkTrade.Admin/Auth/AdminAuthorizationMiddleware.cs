using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Options;
using SparkTrade.Admin.Configuration;

namespace SparkTrade.Admin.Auth;

public class AdminAuthorizationMiddleware(IOptions<AppConfig> appConfig) : IFunctionsWorkerMiddleware
{
    private static readonly JsonSerializerOptions ClientPrincipalJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var httpContext = context.GetHttpContext();
        if (httpContext is null)
        {
            await next(context);
            return;
        }

        var principal = ReadClientPrincipal(httpContext.Request);

        if (principal is not { IdentityProvider: "github" } || principal.UserDetails != appConfig.Value.AdminGitHubUsername)
        {
            httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }

        await next(context);
    }

    private static ClientPrincipal? ReadClientPrincipal(HttpRequest request)
    {
        if (!request.Headers.TryGetValue("x-ms-client-principal", out var header) || string.IsNullOrEmpty(header))
            return null;

        var json = Encoding.UTF8.GetString(Convert.FromBase64String(header!));
        return JsonSerializer.Deserialize<ClientPrincipal>(json, ClientPrincipalJsonOptions);
    }

    private record ClientPrincipal(
        string? IdentityProvider,
        string? UserId,
        string? UserDetails,
        string[]? UserRoles);
}
