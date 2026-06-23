using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Options;
using SparkTrade.Admin.Configuration;

namespace SparkTrade.Admin.Functions;

public class GetRolesFunction(IOptions<AppConfig> appConfig)
{
    private const string AdminRole = "admin";

    private readonly AppConfig _appConfig = appConfig.Value;

    [Function("GetRoles")]
    public async Task<IActionResult> GetRoles(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "GetRoles")] HttpRequest req,
        CancellationToken ct)
    {
        var principal = await req.ReadFromJsonAsync<ClientPrincipal>(ct);
        var roles = new List<string>();

        if (principal is { IdentityProvider: "github" } &&
            principal.UserDetails == _appConfig.AdminGitHubUsername)
        {
            roles.Add(AdminRole);
        }

        return new OkObjectResult(new { roles });
    }

    private record ClientPrincipal(
        string? IdentityProvider,
        string? UserId,
        string? UserDetails,
        string[]? UserRoles);
}
