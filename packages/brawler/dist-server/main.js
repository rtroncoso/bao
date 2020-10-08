"use strict";

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _socket = _interopRequireDefault(require("socket.io"));

var _lanceGg = require("lance-gg");

var _BrawlerServerEngine = _interopRequireDefault(require("./server/BrawlerServerEngine"));

var _BrawlerGameEngine = _interopRequireDefault(require("./common/BrawlerGameEngine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = process.env.PORT || 3000;

var INDEX = _path.default.join(__dirname, '../dist/index.html'); // define routes and socket


var server = (0, _express.default)();
server.get('/', function (req, res) {
  res.sendFile(INDEX);
});
server.use('/', _express.default.static(_path.default.join(__dirname, '../dist/')));
var requestHandler = server.listen(PORT, function () {
  return console.log("Listening on ".concat(PORT));
});
var io = (0, _socket.default)(requestHandler); // Game Instances

var gameEngine = new _BrawlerGameEngine.default({
  traceLevel: _lanceGg.Lib.Trace.TRACE_NONE
});
var serverEngine = new _BrawlerServerEngine.default(io, gameEngine, {
  debug: {},
  updateRate: 6
}); // start the game

serverEngine.start();
//# sourceMappingURL=main.js.map