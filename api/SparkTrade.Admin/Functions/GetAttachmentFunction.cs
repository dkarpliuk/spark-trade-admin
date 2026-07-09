using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SparkTrade.Admin.Configuration;
using SparkTrade.Admin.Contracts;
using System.Diagnostics;

namespace SparkTrade.Admin.Functions;

public class GetAttachmentFunction(BlobServiceClient blobService)
{
    [Function("GetAttachment")]
    public async Task<IActionResult> GetAttachment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "attachment/{type}/{blobName}")] HttpRequest req,
        string type,
        string blobName,
        CancellationToken ct)
    {
        if (!Enum.TryParse<PipelineAttachmentType>(type, ignoreCase: true, out var attachmentType))
            return new NotFoundResult();

        var blobContainer = blobService.GetBlobContainerClient(attachmentType switch
        {
            PipelineAttachmentType.ChartScreenshot => StorageNames.AnalysisImagesContainer,
            PipelineAttachmentType.AnalysisText => StorageNames.AnalysisTextContainer,
            _ => throw new UnreachableException($"Unhandled attachment type {attachmentType}"),
        });

        var blobClient = blobContainer.GetBlobClient(blobName);

        if (!await blobClient.ExistsAsync(ct))
            return new NotFoundResult();

        var download = await blobClient.DownloadStreamingAsync(cancellationToken: ct);
        var contentType = string.IsNullOrEmpty(download.Value.Details.ContentType)
            ? "application/octet-stream"
            : download.Value.Details.ContentType;

        return new FileStreamResult(download.Value.Content, contentType);
    }
}
