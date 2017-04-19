#r "Microsoft.WindowsAzure.Storage"

using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, Binder binder, ICollector<StagingEntity> videoStaging, TraceWriter log)
{
    var guid = Guid.NewGuid();

    // get the video and write it to blob staging area. 

    var bytes = req.Content.ReadAsByteArrayAsync().Result;

    if(bytes == null || bytes.Length < 1000){
        log.Info($"Video is not present or too small. Post some bytes!");  
        return req.CreateResponse(HttpStatusCode.BadRequest, "No video data.");
    }


    log.Info($"Video is {bytes.Length.ToString()} bytes long");     

    string sourceName = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "SourceName", true) == 0)
        .Value;

    string partitionName = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "PartitionName", true) == 0)
        .Value;

     if(string.IsNullOrWhiteSpace(sourceName) || string.IsNullOrWhiteSpace(partitionName)){
        log.Info($"Need querystring params SourceName and PartitionName");  
        return req.CreateResponse(HttpStatusCode.BadRequest, "Missing params PartitionName and/or SourceName");
     }

    var gName = $"staging/{partitionName}/{guid}/vid.mp4";

    var attributes = new Attribute[]
    {
        new BlobAttribute(gName),
        new StorageAccountAttribute("techoneecmmedia_STORAGE")
    };

    var writer = await binder.BindAsync<CloudBlockBlob>(attributes);
    
    await writer.UploadFromByteArrayAsync(bytes, 0, bytes.Length);

    //write the staging entry to the table storage.    
    
    var entity = new StagingEntity{
        RowKey = guid.ToString(),
        PartitionKey = partitionName,
        SourceName = sourceName,
    };

    videoStaging.Add(entity);
  
   return req.CreateResponse(HttpStatusCode.OK, guid.ToString());
}

public class StagingEntity : TableEntity{    
    public string SourceName{get;set;}    
}