"use strict";

import * as walkerClass from "walk";
import * as path from "path";
import * as fs from "fs";

class functionWalker{
    private path:string;
    private walker:any;

    constructor(path:string){
        this.path = path;
        this.walker = walkerClass.walk(path);
    }

    public doWalk():Promise<string>{         

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
                        good(pusher);
                    }catch (e) {
                        bad(e);
                    }
                    
                });
            });
        }
    }

export {functionWalker};