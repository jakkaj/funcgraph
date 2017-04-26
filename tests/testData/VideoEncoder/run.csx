#r "Microsoft.WindowsAzure.Storage"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

using System.Net;

public static async Task Run(Stream videoBlob, string name, Binder binder, TraceWriter log)
{
    
}

public class StagingEntity : TableEntity{    
    public string SourceName{get;set;}
}