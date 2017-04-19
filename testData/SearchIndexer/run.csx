
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
    log.Info("Search Indexer processing: {videoindexparsedMsg}");

    if(_cachedCredentials == null){
        var account = ConfigurationManager.AppSettings["MediaServicesAccountName"];
        var key =  ConfigurationManager.AppSettings["MediaServicesAccountKey"];

        _cachedCredentials = new MediaServicesCredentials(account, key);
    }

    if(_context == null){
        _context = new CloudMediaContext(_cachedCredentials);
    }

    var assetId = videoindexparsedMsg;

    var assetInstance =
        from a in _context.Assets
        where a.Id == assetId
        select a;
    // Reference the asset as an IAsset.
    var inputAsset = assetInstance.FirstOrDefault();

    if(inputAsset == null){
        log.Info($"Error: Could not find asset with Id {videoindexparsedMsg}");
        return;
    }

    var parentInstance =
        from a in _context.Assets
        where a.Id == inputAsset.AlternateId
        select a;

    var parentAsset = parentInstance.FirstOrDefault();

    if(parentAsset == null){
        log.Info($"Error: Could not find parent asset with Id {inputAsset.AlternateId}");
        return;
    }

    var tempFile = Path.GetTempFileName();

    var file = inputAsset.AssetFiles?.ToList().FirstOrDefault();

    if(file == null){
        log.Info($"Error: Could not find asset files {videoindexparsedMsg}");
        return;
    }

    file.Download(tempFile);   

    if(!File.Exists(tempFile)){
        log.Info($"Error: Could not find download asset files {videoindexparsedMsg}");
        return;
    }

    var data = File.ReadAllText(tempFile);

    var indexList = Parse(data, parentAsset.AlternateId);

    log.Info($"Parsed {indexList.Count} vtt items");

    File.Delete(tempFile);  

    UpdateIndex(indexList);  
}

static void UpdateIndex(List<IndexText> indexes){

    var searchIndexName = ConfigurationManager.AppSettings["AzureSearchIndex"];
    var searchApiKey = ConfigurationManager.AppSettings["AzureSearchApiKey"];
    var searchInstanceName = ConfigurationManager.AppSettings["AzureSearchInstanceName"];

    var ss = new SearchServiceClient(searchInstanceName, new SearchCredentials(searchApiKey));
    
    // DeleteSearchIndexIfExistsAsync(ss).Wait();
    // CreateSearchIndexAsync(ss).Wait();
    
    var client = ss.Indexes.GetClient(searchIndexName);
    var batch = IndexBatch.Upload(indexes);

    var result = client.Documents.IndexAsync(batch).Result;
}

static List<IndexText> Parse(string vtt, string videoId){
    string[] lines = vtt.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);

    var tcStart = default(TimeSpan);
    var tcEnd = default(TimeSpan);

    var indexList = new List<IndexText>();

    foreach (var l in lines)
    {
        if (l == "WEBVTT" || string.IsNullOrWhiteSpace(l))
        {
            continue;
        }

        if (l.IndexOf("-->") != -1)
        {
            //this is a timecode
            var tc = l.Replace("-->", "|").Split('|');

            tcStart = TimeSpan.Parse(tc[0]);
            tcEnd = TimeSpan.Parse(tc[1]);
        }
        else
        {
            var s = tcStart.TotalMilliseconds.ToString();
            var e = tcEnd.TotalMilliseconds.ToString();
            //this is text
            var idx = new IndexText
            {
                Text = l,
                Start = s, 
                End = e,
                IndexId = videoId + s + e,
                VideoId = videoId

            };
            indexList.Add(idx);
        }
    }

    return indexList;
}

private static async Task CreateSearchIndexAsync(SearchServiceClient client)
{
    var definition = new Index()
    {
        Name = ConfigurationManager.AppSettings["AzureSearchIndex"],
        Fields = FieldBuilder.BuildForType<IndexText>()
    };

    await client.Indexes.CreateAsync(definition);
}

private static async Task DeleteSearchIndexIfExistsAsync(SearchServiceClient client)
{
    if (await client.Indexes.ExistsAsync("videos"))
    {
        await client.Indexes.DeleteAsync("videos");
    }
}


public class IndexText
{
    [Key]
    [IsFilterable]
    public string IndexId { get; set; }
    public string Start { get; set; }
    public string End { get; set; }
    
    [IsSearchable]
    [Analyzer(AnalyzerName.AsString.EnLucene)]
    public string Text { get; set; }
    [IsSortable]
    [IsFilterable]
    [IsSearchable]
    public string VideoId { get; set; }
}

public class ODataResponse
{
    [JsonProperty("odata.context")]
    public string Context { get; set; }
    public List<IndexText> Value { get; set; }
}