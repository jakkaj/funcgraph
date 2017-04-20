import test from 'ava';
import * as path from "path";
import * as fs from "fs";
import {configGrapher} from "../src/configGrapher";
import {node, dotBuilder, connection, edge }  from "../src/dotgraph";
import {functionWalker} from "../src/functionWalk";

var dir = path.join(__dirname, '..', '..','..', 'tests', 'testData');
console.log("Working test data: " + dir);

async function t(){

	 var w = new functionWalker(dir);

	 var result = await w.doWalk();

	 console.log("Walked result" + result)

	 
};

t();


