
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
    videoindexparsedMsg = null;
    log.Info($"###############################################Indexer processing: {newVideoServiceBusMessage}");

    if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }


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
   

    IJob job = _context.Jobs.Create("My Indexing Job");

    string MediaProcessorName = "Azure Media Indexer 2 Preview";

    var processor = GetLatestMediaProcessorByName(MediaProcessorName);

    var configuration = ConfigurationManager.AppSettings["IndexerConfig"];

    // Create a task with the encoding details, using a string preset.
    ITask task = job.Tasks.AddNew("My Indexing Task",
        processor,
        configuration,
        TaskOptions.None);

    // Specify the input asset to be indexed.
    task.InputAssets.Add(inputAsset);

    // Add an output asset to contain the results of the job.
    task.OutputAssets.AddNew($"ClosedCaptions_WebVtt_default", AssetCreationOptions.None);

    // Use the following event handler to check job progress.  
    job.StateChanged += new EventHandler<JobStateChangedEventArgs>((sender, e) =>{
        log.Info("Index Job state changed event:");
        log.Info("  Index Previous state: " + e.PreviousState);
        log.Info("  Index Current state: " + e.CurrentState);

        switch (e.CurrentState)
        {
            case JobState.Finished:
                log.Info("");
                log.Info(" Index Job is finished.");
                log.Info("");
                break;
            case JobState.Canceling:
            case JobState.Queued:
            case JobState.Scheduled:
            case JobState.Processing:
                log.Info("Index Please wait...\n");
                break;
            case JobState.Canceled:
            case JobState.Error:
                // Cast sender as a job.
                IJob jobError = (IJob)sender;
                // Display or log error details as needed.
                // LogJobStop(job.Id);
                break;
            default:
                break;
        }
    });
    log.Info("Submitting Indexing job");
    // Launch the job.
    job.Submit();

    // Check job execution and wait for job to finish.
    Task progressJobTask = job.GetExecutionProgressTask(CancellationToken.None);

    progressJobTask.Wait();         

    // If job state is Error, the event handling
    // method for job progress should log errors.  Here we check
    // for error state and exit if needed.
    if (job.State == JobState.Error)
    {
        ErrorDetail error = job.Tasks.First().ErrorDetails.First();
        log.Info(string.Format("Error: {0}. {1}",
                                        error.Code,
                                        error.Message));
        
        return;
    }

    var outputAsset = job.OutputMediaAssets[0];
    outputAsset.AlternateId = assetId;   
    outputAsset.Update();

    _context.Locators.Create(
                LocatorType.Sas,
                outputAsset,
                AccessPermissions.Read,
                TimeSpan.FromDays(30000));

    log.Info($"Added indexed asset id {outputAsset.Id} alternateId {assetId}");
    videoindexparsedMsg = outputAsset.Id;
}
 static IMediaProcessor GetLatestMediaProcessorByName(string mediaProcessorName)
{
    var processor = _context.MediaProcessors
        .Where(p => p.Name == mediaProcessorName)
        .ToList()
        .OrderBy(p => new Version(p.Version))
        .LastOrDefault();

    if (processor == null)
        throw new ArgumentException(string.Format("Unknown media processor",
                                                    mediaProcessorName));

    return processor;
}
