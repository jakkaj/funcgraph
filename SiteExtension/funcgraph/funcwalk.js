
"use strict";
var walker = require("walk"), 
    fs = require("fs"), 
    path = require("path");

class configWalker{    

    constructor(path){
        this.path = path;
        this.walker = walker.walk(path);
    }     

    complete(configs){
        var t = configs;
    }

    walk (){

        console.log("Walking: " + this.path);

        var pusher = [];
        
        return new Promise((good, bad) => {
        
        this.walker.on("file", (root, fileStats, next) => {
            
            var name = path.join(root, fileStats.name);

            if(name.indexOf("function.json")!= -1){               
                
                console.log(name);

                fs.readFile(name, {encoding: 'utf-8'}, (err, buffer) =>{
                    if(!err && buffer.indexOf("{")!= -1){                       
                        console.log(buffer);
                        var data = JSON.parse(buffer.trim());
                        
                        pusher.push(data);
                    }
                    
                    next();

                });
            }else{
                 next();
            }
            //console.log(fileStats.name);
            
           
            // fs.readFile(fileStats.name, function () {
            // // doStuff 
            // next();
            // });
        });

        this.walker.on("errors", function (root, nodeStatsArray, next) {
            next();
        });
 
        this.walker.on("end",  () => {
            console.log("all done");
            var result = this.complete(pusher);
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

