'use strict';

var funcwalk = require("./funcwalk");

var http = require('http');
var port = process.env.port || 1337;

var dir = "";

if(process.env.HOME){
    dir = process.env.HOME + "\\site\\wwwroot"; 
}else{
     dir = "C:\\Temp\\VideoManagementFunctions\\func";
}

//var funcwalker = funcwalk.walkConfigs();

var funcwalker = new funcwalk.walkConfigs(dir);

funcwalker.walk()
.then((result)=>console.log("Good: " + result.length))
.catch((result) => console.log("Bad: " + result))

http.createServer(function (req, res) {
    
    
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello Wordddld\n');



}).listen(port);
