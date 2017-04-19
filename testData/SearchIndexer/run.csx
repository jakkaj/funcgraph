
#r "Microsoft.WindowsAzure.Storage"
#r "System.ComponentModel.DataAnnotations"
#r "Newtonsoft.Json"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Microsoft.WindowsAzure.MediaServices.Client;

using System.Diagnostics;
using System.IO;
using System.Text;
using System.Configuration;
using System.Threading;

using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;
using System.ComponentModel.DataAnnotations;
using ExtensionGoo.Standard.Extensions;
using Newtonsoft.Json;

private static MediaServicesCredentials _cachedCredentials;
private static CloudMediaContext _context = null;

public static async Task Run(string videoindexparsedMsg, TraceWriter log)
{    
}