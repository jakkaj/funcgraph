
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

public static void Run(Stream myBlob, string name, out string newVideoServiceBusOutput, TraceWriter log)
{
    newVideoServiceBusOutput = "";
     if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }

    var nameParts = name.Split('/');    
    var partition = nameParts[0];
    var guid = nameParts[1];

    var tempPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
    Directory.CreateDirectory(tempPath);  
    var temp = Path.Combine(tempPath, $"{guid}.mp4");   

    using(var ms = File.OpenWrite(temp)){
        myBlob.CopyTo(ms);      
    }

    var fileInfo = new FileInfo(temp);

    if(!File.Exists(temp) || fileInfo.Length < 1000){
        log.Info($"Video is not present or too small. Post some bytes!");  
        return;
    }  
    
    
    try{
        var inputAsset =
            UploadFile(temp, AssetCreationOptions.None, log);   
        
        inputAsset.AlternateId = guid.ToString();
        inputAsset.Update();

        newVideoServiceBusOutput = inputAsset.Id.ToString();
        log.Info($"### New Asset: {inputAsset.Id}, altId {inputAsset.AlternateId}");

     }catch(Exception ex){
        log.Info($"Error: There was a problem with the asset processing: {ex.ToString()}");
    }
   

    _clean(tempPath);
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

static void _clean(string d){
    Directory.Delete(d, true);
}