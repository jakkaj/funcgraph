
var format = require("string-format");
format.extend(String.prototype)

class dotBuilder{
    build(nodes, edge){
        var builder = "digraph app {\r\n";

        nodes.forEach((node)=>{
            builder += "\r\n" + node.build();
        })

        edge.forEach((edge)=>{
            builder += "\r\n" + edge.build();
        })

        builder += "\r\n}";

        return builder;
    }
}


class node{
    constructor(shape, style, color, elements){
        this.shape = shape; 
        this.style = style;
        this.color = color;
        this.elements =  elements;
    }

    build(){
        var builder = "node [shape={shape},style={style},color={color}]".format(this);

        this.elements.forEach((ele)=>{
            builder += "\r\n\" " + ele + "\"";
        });

        return builder;
    }
}

class edge {
    constructor(style, arrowhead, direction, connections){
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

        var builder = "[edge";
        
        if(style && style != null && style!=""){
            builder += " " + style;
        }
        
        builder += "]";

        this.connections.forEach((ele)=>{
            builder += "\r\n " + ele.build();
        });

        return builder;
    }
}

class connection{
    constructor(from, to, label){
        this.from = from;
        this.to = to;
        this.label = label;
    }

    build(){
        var builder = "\"{from}\" -> \"{to}\"".format(this);
        if(this.label && this.label != ""){
            builder += " [ label = \"{label}\" ]".format(this);
        }     

        return builder;   
    }
}

module.exports = {
    node : node,
    dotBuilder : dotBuilder,
    connection : connection,
    edge : edge
}