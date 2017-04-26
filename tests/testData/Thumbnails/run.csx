
using Microsoft.WindowsAzure.MediaServices.Client;

using System.Diagnostics;
using System.IO;
using System.Text;
using System.Configuration;

private static MediaServicesCredentials _cachedCredentials;
private static CloudMediaContext _context = null;

public static async Task Run(string newVideoServiceBusMessage, TraceWriter log)
{   
}