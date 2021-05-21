const User = require("./../models/userModel.js");
const jwt = require("jsonwebtoken");
const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");
const onlineUsersId = [];

async function socketConnecton(io) {
  //io.use(await SocketAuthorization);

  io.on("connection", async (socket) => {
    console.log("User connected");
    console.log(socket.client.conn.server.clientsCount + " users connected");
    //console.log(socket.client.conn.server.clients);
    //console.log(socket);

    socket.on("login", async (currentUserdata) => {
      socket.id = currentUserdata.id;
      onlineUsers.push(socket.id);
      //  await User.findByIdAndUpdate(socket.id, { isOnline: true });
      //const onlineUsers = await User.find({ active: true });
      const onlineUsers = await User.find({ _id: { $in: onlineUsersId } });

      io.emit("online-users", { onlineUsers });
    });

    socket.on("message", async (data) => {
      const messageAttributes = {
        content: data.content,
        userId: data.id,
      };

      await Message.create(messageAttributes);
      io.to(data.id.toString()).emit("message", messageAttributes);
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected");
      //await User.findByIdAndUpdate(socket.id, { isOnline: false });
      const offlineUser = onlineUsersId.indexOf(socket.id);
      onlineUsersId.splice(offlineUser, 1);
      console.log(socket.client.conn.server.clientsCount + " users connected");
      //console.log(socket.client.conn.server.clients);
    });
  });
}

module.exports = socketConnecton;
