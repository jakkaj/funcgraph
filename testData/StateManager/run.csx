
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
    log.Info("C# HTTP trigger function processed a request.");

    // parse query parameter
    string id = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "Id", true) == 0)
        .Value;
 
        if(id == null){
            return req.CreateResponse(HttpStatusCode.BadRequest, "No id");
        }
 
    if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }


    var assetId = id;
    var assetInstance =
        from a in _context.Assets
        where a.AlternateId == assetId
        select a;
    // Reference the asset as an IAsset.
    if(assetInstance == null){
        log.Info($"Error: Could not find asset with Id {assetId}");
         return req.CreateResponse(HttpStatusCode.NotFound, $"{assetId} not found");
    }

    var inputAsset = assetInstance.FirstOrDefault();

    if(inputAsset == null){
        log.Info($"Error: Could not find asset with Id {assetId}");
         return req.CreateResponse(HttpStatusCode.NotFound, "{assetId} not found");
    }

    var parentAssetId = inputAsset.Id;

    var childAssets =  
               from aParentFind in _context.Assets
               where aParentFind.AlternateId == parentAssetId
               select aParentFind;
            
    var assets = childAssets?.ToList();

    if(assets == null){
        return req.CreateResponse(HttpStatusCode.NotFound, "{assetId} not found");
    }

    var thisThumbAssetSmall = assets.FirstOrDefault(_ => _.Name == "thumbsmall.jpg");
    var thisThumbAssetLarge = assets.FirstOrDefault(_ => _.Name == "thumblarge.jpg");
    var thisstreamingAsset = assets.FirstOrDefault(_ => _.Name == "Adaptive Bitrate");
    var ccAsset = assets.FirstOrDefault(_ => _.Name == "ClosedCaptions_WebVtt_default");

    var mp4 = thisstreamingAsset?.AssetFiles?.ToList().FirstOrDefault(af => af.Name.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase)).GetSasUri();
    
    var thumb1 = thisThumbAssetSmall?.AssetFiles?.ToList().FirstOrDefault().GetSasUri();
   
    var thumb2 = thisThumbAssetLarge?.AssetFiles?.ToList().FirstOrDefault().GetSasUri();

    var cc = ccAsset?.AssetFiles?.ToList().FirstOrDefault().GetSasUri();

    var mp4ProgressiveDownloadUris = thisstreamingAsset?.AssetFiles?.ToList().Where(af => af.Name.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase)).Select(af => af.GetSasUri().ToString()).ToList();

    var videoInfo = new VideoInfo(){
        Dash = thisstreamingAsset?.GetMpegDashUri()?.ToString(),
        Hls = thisstreamingAsset?.GetHlsUri()?.ToString(),
        Smooth = thisstreamingAsset?.GetSmoothStreamingUri()?.ToString(),
        AssetId = parentAssetId,
        EncodedAssetId = thisstreamingAsset?.Id,
        Progressive = mp4ProgressiveDownloadUris,
        Thumbs = new ThumbEntity{
            Thumb1 = thumb1?.ToString(), 
            Thumb2 = thumb2?.ToString()
        }, 
        Index = new IndexEntity{
            ClosedCaptions = cc?.ToString()
        }
    };
log.Info("9");
    var ser = JsonConvert.SerializeObject(videoInfo);
    log.Info(ser);
    var content = new StringContent(
        ser, 
        System.Text.Encoding.UTF8, 
        "text/plain");

    var response = req.CreateResponse(HttpStatusCode.OK);
    response.Content = content;

    return response;

   



}

public class VideoInfo {
    public string Dash{get;set;}
    public string Hls{get;set;}
    public string Smooth{get;set;}
    public string AssetId {get;set;}
    public string AssetUri{get;set;}
    public string EncodedAssetUri{get;set;}
    public string EncodedAssetId{get;set;}
    public List<string> Progressive{get;set;}
    public string OriginalAssetName{get;set;}

    public ThumbEntity Thumbs{get;set;}

    public IndexEntity Index{get;set;}
}

public class IndexEntity
{
    public string ClosedCaptions {get;set;}
   
}

public class ThumbEntity
{
    public string Thumb1 {get;set;}
    public string Thumb2 {get;set;}
}
