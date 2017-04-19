
#r "Microsoft.WindowsAzure.Storage"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Microsoft.WindowsAzure.MediaServices.Client;

using System.Diagnostics;
using System.IO;
using System.Text;
using System.Configuration;
using System.Threading;

private static MediaServicesCredentials _cachedCredentials;
private static CloudMediaContext _context = null;

public static void Run(string newVideoServiceBusMessage, out string videoindexparsedMsg, TraceWriter log)
{    
}