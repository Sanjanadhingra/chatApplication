const server = require("./app");
const socket = require("socket.io");

const io = socket(server);
const socketConnection = require("./utils/socket");
async function startNodeServer() {
  await socketConnection(io);
}
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/Chat", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Db connection successful"));

startNodeServer().then(() => console.log("socket connected"));
server.listen(9001, () => console.log("listening on port 9000"));
