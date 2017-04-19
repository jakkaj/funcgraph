import test from 'ava';
import * as path from "path";
import * as fs from "fs";
import {configGrapher} from "../src/configGrapher";
import {node, dotBuilder, connection, edge }  from "../src/dotgraph";
import {functionWalker} from "../src/functionWalk";

var dir = path.join(__dirname, '..', '..', 'tests', 'testData');


test('fullSvg', async t => {
	var funcwalker = new configGrapher(dir);
	var result = await funcwalker.walk();        
        
	t.is(result.indexOf("svg")!=-1, true);
	//to update the compare copy await fs.writeFileSync("tests/testData/svgSample.svg", result);
	var compareSvg:string = fs.readFileSync("tests/testData/svgSample.svg", "utf-8");

	t.is(compareSvg, result);

	t.pass();
});

