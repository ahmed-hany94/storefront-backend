"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = __importDefault(require("express"));
var pg_1 = require("pg");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var _a = process.env, POSTGRES_HOST = _a.POSTGRES_HOST, POSTGRES_USER = _a.POSTGRES_USER, POSTGRES_PASSWORD = _a.POSTGRES_PASSWORD, POSTGRES_DB = _a.POSTGRES_DB, PORT = _a.PORT;
var pool = new pg_1.Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
});
pool.connect(function (err, client, release) {
    if (err)
        return console.error('Error acquiring client', err.stack);
});
var app = (0, express_1.default)();
exports.app = app;
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(PORT, function () {
    console.log("Listening on http://localhost:".concat(PORT));
});
