
"use strict";
var walker = require("walk"), 
    fs = require("fs"), 
    path = require("path");

    class configWalker{    

        constructor(path){
            this.path = path;
            this.walker = walker.walk(path);

            this.in = "in";
            this.out = "out";
        }     

        _bindingFilter(value, arr){
            arr.forEach((a) => {
                if(a.name == value.name && a.type == value.type){
                    return true;
                }
            });
            return false;
        }

        consolodateBindings(configs){
            
            var outward = [];
            var inward = [];

            
            configs.forEach((c)=>{
                c.bindings.forEach((binding)=>{

                    var pushObj = {name:binding.name, type:binding.type, direction:binding.direction};

                    var f = this._bindingFilter;

                    if(binding.direction == this.in && !this._bindingFilter(binding, inward)){
                        inward.push(pushObj);
                    }
                    else if (binding.direction == this.out && !this._bindingFilter(binding, outward)){
                        outward.push(pushObj);
                    }
                });            
            });

            return {inward: inward, outward:outward}
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
                });

                this.walker.on("errors", function (root, nodeStatsArray, next) {
                    next();
                });
        
                this.walker.on("end",  () => {
                    console.log("all done");
                    var consolodatedBindings = this.consolodateBindings(pusher);
                    var nodes = this.buildNodes(pusher, consolodatedBindings);
                    good(result);
                });
            });
        }

        buildNodes(allFunctions, consolodatedBindings){

        }

        buildGraph(allFunctions, consolodatedBindings){
            

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

