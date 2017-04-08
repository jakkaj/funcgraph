'use strict';

var funcwalk = require("./funcwalk");

var http = require('http');
var port = process.env.port || 1337;

var svg2png = require("svg2png");
var url = require('url');

var dir = "";

if(process.env.HOME){
    dir = process.env.HOME + "\\site\\wwwroot"; 
}else{
     dir = "C:\\Temp\\VideoManagementFunctions\\func";
}

//var funcwalker = funcwalk.walkConfigs();



//var promise = funcwalk.walk();

http.createServer(function (req, res) {
    
    var queryData = url.parse(req.url, true).query;

    var format = queryData.format || "svg";

    var funcwalker = new funcwalk.walkConfigs(dir);



    funcwalker.walk()
        .then((result)=>
        {   
            
            if(format == "png"){
                
                svg2png(result, { width: 2560, height: 2048 })
                .then((buffer)=>{
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.end(buffer, 'binary');
                });
                

            }else{
                
                res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
                res.end(result);

            }
        })
        .catch((result) =>{
            console.log("Bad: " + result);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("There was problem: " + result);
        })

}).listen(port);
