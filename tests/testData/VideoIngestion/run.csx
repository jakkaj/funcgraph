#r "Microsoft.WindowsAzure.Storage"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, Binder binder, ICollector<StagingEntity> videoStaging, TraceWriter log)
{
}