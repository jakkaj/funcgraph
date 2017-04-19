'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configGrapher_1 = require("./configGrapher");
var http = require('http');
var port = process.env.port || 1337;
var svg2png = require("svg2png");
var url = require('url');
var dir = "";
if (process.env.HOME) {
    dir = process.env.HOME + "\\site\\wwwroot";
}
else {
    dir = "C:\\Users\\jorkni\\Documents\\temp\\funcs\\VideoIngestion\\Func";
}
//var funcwalker = funcwalk.walkConfigs();
//var promise = funcwalk.walk();
http.createServer(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var queryData = url.parse(req.url, true).query;
        var format = queryData.format || "svg";
        var funcwalker = new configGrapher_1.configGrapher(dir);
        try {
            var result = yield funcwalker.walk();
            if (format == "png") {
                svg2png(result, { width: 2560, height: 2048 })
                    .then((buffer) => {
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.end(buffer, 'binary');
                });
            }
            else {
                res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
                res.end(result);
            }
        }
        catch (e) {
            console.log("Bad: " + e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("There was problem: " + e);
        }
    });
}).listen(port);
//# sourceMappingURL=server.js.map