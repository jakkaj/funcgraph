
import * as format from "string-format";
format.extend(String.prototype)

class dotBuilder{
    build(nodes, edge, title){
        var builder = "digraph app {\r\n";
        builder += "graph [ fontname=Consolas,center=true," +
        "nodesep=.8," +
        "ranksep=\".2 equally\"," + 
        "sep=2.2" +
        "];";
        
        //builder += "graph [ bgcolor=white, fontname=Arial, fontcolor=black, " +
                 //        "fontsize=10 ]\r\n";
        nodes.forEach((node)=>{
            builder += "\r\n" + node.build();
        })

        edge.forEach((edge)=>{
            builder += "\r\n" + edge.build();
        })

        builder += "labelloc=\"t\";\r\nlabel=\"" + title + "\";";

        builder += "\r\n}";

        return builder;
    }
}


class node{
    private shape:string;
    private style:string
    private color:string;
    private elements:string[];

    constructor(shape:string, style:string, color:string, elements:string[]){
        this.shape = shape; 
        this.style = style;
        this.color = color;
        this.elements =  elements;
    }

    build(){
        var builder = `node [margin=.3,fontname=Consolas,fontsize=10,shape=${this.shape},style=${this.style},color=${this.color}]`;

        this.elements.forEach((ele)=>{
            builder += "\r\n \"" + ele + "\"";
        });

        return builder;
    }
}

class edge {
    private style:string;
    private arrowhead:string;
    private direction:string;
    private connections:connection[];

    constructor(style:string, arrowhead:string, direction:string, connections:connection[]){
        this.style = style; 
        this.arrowhead = arrowhead;
        this.direction = direction;
        this.connections = connections;
    }

    build(){

        var attr = [];

        if(this.style){
            attr.push("style=" + this.style);
        }

        if(this.arrowhead){
            attr.push("arrowhead=" + this.arrowhead);
        }

        if(this.direction){
            attr.push("direction=" + this.direction);
        }        

        var style = attr.join();

        var builder = "edge [fontname=Consolas,fontsize=10, ";
        
        if(style && style != null && style!=""){
            builder += " " + style;
        }
        
        builder += " ]";

        this.connections.forEach((ele)=>{
            builder += "\r\n " + ele.build();
        });

        return builder;
    }
}

class connection{
    private from:string;
    private to:string;
    private label:string;

    constructor(from:string, to:string, label:string){
        this.from = from;
        this.to = to;
        this.label = label;
    }

    build(){
        var builder = `"${this.from}" -> "${this.to}"`;
        if(this.label && this.label != ""){
            builder +=  `[ label = "      ${this.label}     " ]`;
        }     

        return builder;   
    }
}

export {node, dotBuilder, connection, edge };
