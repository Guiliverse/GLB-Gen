import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import dotenv from "dotenv";
import routes from "./routes.js";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
dotenv.config();
var corsOptions = {
  origin: "*",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, "public");
console.log(dir);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(routes);
app.use("/static", express.static(dir));

const server = http.createServer(app);

server.listen(process.env.PORT || 5000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
