import test from 'ava';
import * as path from "path";
import * as fs from "fs";
import {configGrapher} from "../src/configGrapher";
import {node, dotBuilder, connection, edge }  from "../src/dotgraph";
import {functionWalker} from "../src/functionWalk";

var dir = path.join(__dirname, '..', '..','..', 'tests', 'testData');
console.log("Working test data: " + dir);

async function t(){

	var funcwalker = new configGrapher(dir);
	var result = await funcwalker.walk();        
        
	//t.is(result.indexOf("svg")!=-1, true);
	await fs.writeFileSync("tests/testData/svgSample.svg", result);
	
	var compareSvg:string = fs.readFileSync("tests/testData/svgSample.svg", "utf-8");
	
	var sResult = result == compareSvg;
	 
};

t();


