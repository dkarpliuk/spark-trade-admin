using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace SparkTrade.Admin.Functions;

public class GetChartImageFunction(BlobContainerClient analysisImagesContainer)
{
    [Function("GetChartImage")]
    public async Task<IActionResult> GetChartImage(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "chart-image/{blobName}")] HttpRequest req,
        string blobName,
        CancellationToken ct)
    {
        var blobClient = analysisImagesContainer.GetBlobClient(blobName);

        if (!await blobClient.ExistsAsync(ct))
            return new NotFoundResult();

        var download = await blobClient.DownloadStreamingAsync(cancellationToken: ct);
        var contentType = string.IsNullOrEmpty(download.Value.Details.ContentType)
            ? "application/octet-stream"
            : download.Value.Details.ContentType;

        return new FileStreamResult(download.Value.Content, contentType);
    }
}
