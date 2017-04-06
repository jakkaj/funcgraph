
"use strict";
var walker = require("walk"), 
    fs = require("fs"), 
    path = require("path"), 
    dotgraph = require("./dotgraph.js");

    class configWalker{    

        constructor(path){
            this.path = path;
            this.walker = walker.walk(path);

            this.in = "in";
            this.out = "out";

            this.funcTypes = [
                ["http", "webHookType"],
                ["queueTrigger", "queueName"],
                ["blob", "path"],
                ["timerTrigger", "schedule"],
                ["serviceBus", ["queueName", "topicName"]],
                ["manualTrigger", null],
                ["eventHubTrigger", "path"], 
                ["documentDB", "databaseName"],
                ["table", "tableName"], 
                ["notificationHub", "hubName"],
                ["sendGrid", null],
                ["queueTrigger", "queueName"],
                ["twilioSms", null]
            ];
        }     

        _bindingFilter(value, arr){
            
            for(var i = 0; i < arr.length; i++){
                
                if(arr[i].name == value.name){
                    return true;
                }
            }

            return false;
        }

        findBindingType(binding){
            var type = binding.type;
            var discoveredFuncType = "";
            var propMatch = "";
            var propVal = "";

            this.funcTypes.forEach((funcType)=>{
                if(type.toLowerCase().indexOf(funcType[0].toLowerCase()) != -1){
                    propMatch = funcType[1];
                    discoveredFuncType = funcType[0];                    
                }
            });

            if(discoveredFuncType == ""){
                console.log("Warn: No functype discovered for: " + type);
                return null;
            }

            if(propMatch == null){
                propVal = discoveredFuncType;
            }else{           

                if (!(propMatch instanceof Array)) {
                    propVal = binding[propMatch];
                }else{
                    propMatch.forEach((p)=>{
                        var p = this.findProp(p, binding);
                        if(p!=null){
                            propVal = binding[p];
                        }
                    });
                }
            }

            if(!propVal || propVal == "" || propVal == null){
                propVal = discoveredFuncType;
            }


            
            return {type:type, funcType: discoveredFuncType, name: propVal, matchedProp: propMatch };
        }

        findProp(propName, obj){
            for(var prop in obj){

                if(prop.toLowerCase().indexOf(propName.toLowerCase())!=-1){
                    return prop;
                }
                // var regexMatch = /.+?Name/gi.exec(prop);

                // if(regexMatch && regexMatch.length > 0){
                //     return obj[prop]; 
                // }
            }
            return null;
        }

        consolodateBindings(configs){
            
            var outward = [];
            var inward = [];
            var all = [];
            var allBindingTypes = [];
            
            configs.forEach((c)=>{
                c.bindings.forEach((binding)=>{                    

                    var matchedBindingType = this.findBindingType(binding);

                    if(matchedBindingType == null){
                        return;
                    }

                    var pushObj = {name:matchedBindingType.name, type:matchedBindingType.funcType, direction:binding.direction};

                    var f = this._bindingFilter;

                    if(binding.direction == this.in && !this._bindingFilter(binding, inward)){
                        inward.push(pushObj);
                    }
                    else if (binding.direction == this.out && !this._bindingFilter(binding, outward)){
                        outward.push(pushObj);
                    }

                    if(!this._bindingFilter(binding, all)){
                        all.push(pushObj);
                    }                    

                    if(!this._bindingFilter(pushObj, allBindingTypes)){
                        allBindingTypes.push(pushObj);
                    }                    
                });            
            });

            return {inward: inward, outward:outward, all:all, allBindings:allBindingTypes }
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
                                data.funcName = fileStats.name;
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
            
            var ab = consolodatedBindings.allBindings;
            
            var ioNodes = new dotgraph.node("box", "filled", "yellow", 
                consolodatedBindings.allBindings.map((ele) => ele.name + "(" + ele.type + ")")
            );

            var funcNodes = new dotgraph.node("doublecircle", "filled", "orange", 
                allFunctions.map((ele) => ele.funcName)
            );

            var ioString = ioNodes.build();
            var funcString = funcNodes.build();
            
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

