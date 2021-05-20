const express = require("express");
const path = require("path");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

// function getSocketIo() {
//   return io;
// }

app.use(express.json());
///we use middleware by app.use
app.use(cors());
app.use((req, res, next) => {
  console.log("welcome to our own middleware");
  next();
});
app.use(express.static(path.join(__dirname, "/public")));

app.use("/api/v1/users", userRouter);
// app.all("*", (req, res, next) => {
//   res.status(400).json({
//     status: "fail",
//     message: `Can't get ${req.originalUrl} on this server`,
//   });
// });
app.all("/*", (request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message"
  );
  response.header(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, OPTIONS"
  );
  response.header("Access-Control-Max-Age", 1800);
  next();
});
module.exports = server;
