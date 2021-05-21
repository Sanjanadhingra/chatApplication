const User = require("./../models/userModel.js");
const jwt = require("jsonwebtoken");
const SocketAuthorization = require("./middlewares");

async function socketConnecton(io) {
  //io.use(await SocketAuthorization);

  io.on("connection", async (socket) => {
    console.log("User connected");
    console.log(socket.client.conn.server.clientsCount + " users connected");
    //console.log(socket.client.conn.server.clients);
    //console.log(socket);

    socket.on("login", async (currentUserdata) => {
      socket.id = currentUserdata._id;
      await User.findByIdAndUpdate(socket.id, { isOnline: true });
      const onlineUsers = await User.find({ active: true });

      io.emit("online-users", { onlineUsers });
    });

    socket.on("message", (msg, anotherSocketId) => {
      io.to(anotherSocketId).emit("message", { socket: socket.id, msg });
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected");
      await User.findByIdAndUpdate(userId, { isOnline: false });
    });
  });
}

module.exports = socketConnecton;
