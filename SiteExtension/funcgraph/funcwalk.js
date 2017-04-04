
"use strict";
var walker = require("walk"), 
    fs = require("fs");

class configWalker{    

    constructor(path){
        this.path = path;
        this.walker = walker.walk(path);
    }

    walk (){

        console.log("Walking: " + this.path);

        var pusher = [];
        
        return new Promise((good, bad) => {
        
        this.walker.on("file", function (root, fileStats, next) {
            //console.log(fileStats.name);
            pusher.push(fileStats.name);
            next();
            // fs.readFile(fileStats.name, function () {
            // // doStuff 
            // next();
            // });
        });

        this.walker.on("errors", function (root, nodeStatsArray, next) {
            next();
        });
 
        this.walker.on("end", function () {
            console.log("all done");
            good(pusher);
        });
    });
}

}

//  configWalker.prototype.walk = function(){    

//     var pOoute = this.path;    

    
    
//  }


var walkerOld = (function(){
    return{
init:function(path)
    {
        this.path = path;
    },
    walk : function(){
         
         
         var p = (good, bad) => {
        


        if(this.path == "a"){
            good("worked");
        }else{
            bad("didnt worked");
        }
    }

    return new Promise(p);
    }
    }
    


})();

module.exports = {
    walkConfigs : configWalker
}

