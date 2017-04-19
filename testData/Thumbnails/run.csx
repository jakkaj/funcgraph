
using Microsoft.WindowsAzure.MediaServices.Client;

using System.Diagnostics;
using System.IO;
using System.Text;
using System.Configuration;

private static MediaServicesCredentials _cachedCredentials;
private static CloudMediaContext _context = null;

public static async Task Run(string newVideoServiceBusMessage, TraceWriter log)
{   
    log.Info($"Thumbing: {newVideoServiceBusMessage}");

     if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }
 
    // var blob = $"staging/{newVideoServiceBusMessage.OriginalAssetName}";

    // log.Info($"*************************Processing thumbnails: {blob}");

    // var attributes = new Attribute[]
    // {
    //     new BlobAttribute(blob),
    //     new StorageAccountAttribute("techoneecmmedia_STORAGE")
    // };   

    // var reader = await binder.BindAsync<CloudBlockBlob>(attributes);
    
    // byte[] bytes = null;

    // using(var ms = new MemoryStream()){
    //     await reader.DownloadToStreamAsync (ms);   
    //     bytes = ms.ToArray();
    // } 
      

    var assetId = newVideoServiceBusMessage;

    var assetInstance =
        from a in _context.Assets
        where a.Id == assetId
        select a;
    // Reference the asset as an IAsset.
    var inputAsset = assetInstance.FirstOrDefault();

    if(inputAsset == null){
        log.Info($"Error: Could not find asset with Id {newVideoServiceBusMessage}");
        return;
    }

    var origMedia = inputAsset
           .AssetFiles
           .ToList()
           .Where(af => af.Name.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

    if(origMedia == null){
         log.Info($"Error: Could not find asset mp4 file");
        return;
    }



    List<string> _directories = new List<string>();

    List<string> _files = new List<string>();
   
    //temp file for the source video
    var temp = Path.GetTempFileName();   
    _files.Add(temp);

    origMedia.Download(temp);    

    if(!File.Exists(temp)){
        log.Info("Could not download the remote file");
        return;
    }

     //File.WriteAllBytes(temp, bytes); 
   
     //temp working directory 
     var tempPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
    Directory.CreateDirectory(tempPath);  
    _directories.Add(tempPath);
 
     //get thumbnails

     var agumentsThumbs = $"-i \"{temp}\" -vf  \"thumbnail,scale=640:360\" -frames:v 1 thumblarge.jpg";
    
     var result = _runFf(agumentsThumbs, log, tempPath);
  
     if(result != 0){
        _clean(_files, _directories);
        log.Info("Error: FF exit thumb1 not 0");
        return;
    }

     agumentsThumbs = $"-i \"{temp}\" -vf  \"thumbnail,scale=320:150\" -frames:v 1 thumbsmall.jpg";

     result = _runFf(agumentsThumbs, log, tempPath);

     if(result != 0){
        _clean(_files, _directories);
        log.Info("Error: FF exit thumb1 not 0");
        return;
    }

    var thumb1 = $"{tempPath}\\thumblarge.jpg";
    var thumb2 = $"{tempPath}\\thumbsmall.jpg";

    if(!File.Exists(thumb1) || !File.Exists(thumb2)){
        _clean(_files, _directories);
        log.Info("Error: No thumbs");
        return;
    }

   
    var g = Guid.NewGuid().ToString();

    var assetCreate = _context.Assets.CreateFromFile(thumb1, AssetCreationOptions.None);
    assetCreate.AlternateId = inputAsset.Id;
    assetCreate.Update();    

    var assetCreate2 = _context.Assets.CreateFromFile(thumb2, AssetCreationOptions.None);
    assetCreate2.AlternateId = inputAsset.Id;
    assetCreate2.Update(); 
   
    
     _context.Locators.Create(
                LocatorType.Sas,
                assetCreate,
                AccessPermissions.Read,
                TimeSpan.FromDays(30000));

    _context.Locators.Create(
                LocatorType.Sas,
                assetCreate2,
                AccessPermissions.Read,
                TimeSpan.FromDays(30000));
}

static void _clean(List<string> files, List<string> directories){
    foreach(var f in files){
        if(File.Exists(f)){
            File.Delete(f);
        }
    }

    foreach(var d in directories){
        if(Directory.Exists(d)){
            Directory.Delete(d, true);
        }
    }
}


static int _runFf(string arugments, TraceWriter log, string workingDirectory = null)
        {
    var f = @"D:\home\site\wwwroot\Encoder\ffmpeg.exe";

    var psi = new ProcessStartInfo();


    psi.FileName = f;
    psi.Arguments = arugments;
    psi.RedirectStandardOutput = true;
    psi.RedirectStandardError = true;
    psi.UseShellExecute = false;
    
    if (workingDirectory != null)
    {
        psi.WorkingDirectory = workingDirectory;
    }
    
    log.Info($"Args: {psi.Arguments}");

    var process = Process.Start(psi);

    while (!process.HasExited)
    {
        var line = process.StandardError.ReadLine();
        log.Info(line);
    }

    process.WaitForExit((int)TimeSpan.FromSeconds(60).TotalMilliseconds);
   
    return process.ExitCode;
}