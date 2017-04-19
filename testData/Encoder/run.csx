
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

public static void Run(string newVideoServiceBusMessage, TraceWriter log)
{
    if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }    

    try{

        var assetId = newVideoServiceBusMessage;
        
        var assetInstance =
        from a in _context.Assets
        where a.Id == assetId
        select a;
        
        // Reference the asset as an IAsset.
        var inputAsset = assetInstance.FirstOrDefault();    

        var encodedAsset =
                EncodeToAdaptiveBitrateMP4s(inputAsset, AssetCreationOptions.None, log);
        
        PublishAssetGetURLs(encodedAsset, log);        
        
    }catch(Exception ex){
        log.Info($"Error: There was a problem with the asset processing: {ex.ToString()}");
    }
}
public static IAsset UploadFile(string fileName, AssetCreationOptions options, TraceWriter log)
{
    IAsset inputAsset = _context.Assets.CreateFromFile(
        fileName,
        options,
        (af, p) =>
        {
           log.Info(string.Format("Uploading '{0}' - Progress: {1:0.##}%", af.Name, p.Progress));
        });

    log.Info(string.Format("Asset {0} created.", inputAsset.Id));

    return inputAsset;
}


static public IAsset EncodeToAdaptiveBitrateMP4s(IAsset asset, AssetCreationOptions options, TraceWriter log)
{
    // Prepare a job with a single task to transcode the specified asset
    // into a multi-bitrate asset.

    IJob job = _context.Jobs.CreateWithSingleTask(
        "Media Encoder Standard",
        "H264 Single Bitrate 4x3 SD",
        asset,
        "Adaptive Bitrate",
        options);

    log.Info("Submitting transcoding job...");

    // Submit the job and wait until it is completed.
    job.Submit();

    job = job.StartExecutionProgressTask(
        j =>
        {
            log.Info(string.Format("Encoding Job state: {0}", j.State));
            log.Info(string.Format("Encoding Job progress: {0:0.##}%", j.GetOverallProgress()));
        },
        CancellationToken.None).Result;

    log.Info("Encoding Transcoding job finished.");

    IAsset outputAsset = job.OutputMediaAssets[0];   

    outputAsset.AlternateId = asset.Id;
    outputAsset.Update();
    
    return outputAsset;
}
static public void PublishAssetGetURLs(IAsset asset, TraceWriter log)
{
    // Publish the output asset by creating an Origin locator for adaptive streaming,
    // and a SAS locator for progressive download.

    _context.Locators.Create(
        LocatorType.OnDemandOrigin,
        asset,
        AccessPermissions.Read,
        TimeSpan.FromDays(30000));

    _context.Locators.Create(
        LocatorType.Sas,
        asset,
        AccessPermissions.Read,
        TimeSpan.FromDays(30000));
}