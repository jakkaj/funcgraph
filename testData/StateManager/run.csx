
#r "Microsoft.WindowsAzure.Storage"
#r "Newtonsoft.Json"

using Newtonsoft.Json;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Microsoft.WindowsAzure.MediaServices.Client;
using System.Net;
using System.Configuration;
private static MediaServicesCredentials _cachedCredentials;
private static CloudMediaContext _context = null;
public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
}