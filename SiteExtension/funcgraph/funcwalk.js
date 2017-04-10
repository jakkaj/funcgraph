
"use strict";
var walker = require("walk"), 
    fs = require("fs"), 
    path = require("path"), 
    dotgraph = require("./dotgraph.js"), 
    viz = require('viz.js');
    

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
                ["eventHub", "path"],  
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
                
                if(arr[i].name == value.name && arr[i].direction == value.direction){
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

            if(propVal.startsWith("%")){
                propVal = process.env[propVal.substr(1, propVal.length-2)];
            }

            if(!propVal || propVal == "" || propVal == null){
                propVal = discoveredFuncType;
            }


            
            return {type:type, funcType: discoveredFuncType, name: propVal, matchedProp: propMatch, varName: binding.name };
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

                    if(matchedBindingType.varName == "$return" || matchedBindingType.varName == "res"){
                        return;
                    }

                    var pushObj = {name:matchedBindingType.name + "(" + matchedBindingType.funcType + ")", type:matchedBindingType.funcType, 
                        direction:binding.direction, varName: binding.name, funcName:binding.funcName};

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

                      allBindingTypes.push(pushObj);                    
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
                    var folderSplit = root.split(path.sep);
                    var folderName = folderSplit[folderSplit.length - 1];

                    if(name.indexOf("function.json")!= -1){                                      
                        

                        fs.readFile(name, {encoding: 'utf-8'}, (err, buffer) =>{
                            if(!err && buffer.indexOf("{")!= -1){                       
                                
                                var data = JSON.parse(buffer.trim());
                                data.funcName = folderName;
                                data.bindings.forEach((binding)=>{
                                    binding.funcName = folderName;
                                });
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
                    try{
                        console.log("all done");
                        var consolodatedBindings = this.consolodateBindings(pusher);
                        var dot = this.buildNodes(pusher, consolodatedBindings);
                        var svg = this.buildGraph(dot);
                        good(svg);
                    }catch (e) {
                        bad(e);
                    }
                    
                });
            });
        }

        buildNodes(allFunctions, consolodatedBindings){
            
            var ab = consolodatedBindings.allBindings;
            
            var ioNodes = new dotgraph.node("record", "filled", "yellow", 
                consolodatedBindings.allBindings.map((ele) => ele.name)
            );

            var funcNodes = new dotgraph.node("doublecircle", "filled", "lightblue", 
                allFunctions.map((ele) => ele.funcName)
            );

            var connectionFrom = ab.filter((binding)=>binding.direction == this.out);
            var connectionTo = ab.filter((binding)=>binding.direction == this.in);           


            var edgesTo = new dotgraph.edge("bold", null, null, connectionTo.map((binding)=>new dotgraph.connection(binding.name, binding.funcName, binding.varName)));
            var edgesFrom = new dotgraph.edge("bold", null, null, connectionFrom.map((binding)=>new dotgraph.connection(binding.funcName, binding.name, binding.varName)));

            //var ioString = ioNodes.build();
            //var funcString = funcNodes.build();
            //var edgesToString = edgesTo.build();
            //var edgesFromString = edgesFrom.build();

            var graphName = process.env.WEBSITE_HOSTNAME || "Local"

            var builder = new dotgraph.dotBuilder();
            var builtDot = builder.build([ioNodes, funcNodes], [edgesTo, edgesFrom], "Function Graph\r\n" + graphName + "\r\n\r\nhttps://github.com/jakkaj/funcgraph\r\n\r\n");
            return builtDot;
        }

        buildGraph(dot){
            return viz(dot, { format: "svg" });
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

