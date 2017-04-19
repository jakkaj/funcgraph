
#r "Microsoft.WindowsAzure.Storage"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

using System.Net;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Configuration;
using System.Threading;


public static HttpResponseMessage Run(HttpRequestMessage req, out string newVideoServiceBusOutput, TraceWriter log)
{
     newVideoServiceBusOutput = "nb:cid:UUID:d6b785af-9aeb-4da2-be6f-4df0984da166";
     return req.CreateResponse(HttpStatusCode.OK, "Coolui");
}