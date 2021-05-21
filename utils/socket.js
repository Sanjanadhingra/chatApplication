const User = require("./../models/userModel.js");

const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");
const onlineUsersId = [];

async function socketConnecton(io) {
  io.use(await SocketAuthorization);

  io.on("connection", async (socket) => {
    console.log(socket.client.conn.server.clientsCount + " users connected");
    onlineUsersId.push(socket.id);
    //  await User.findByIdAndUpdate(socket.id, { isOnline: true });
    //const onlineUsers = await User.find({ active: true });
    const onlineUsers = await User.find({ _id: { $in: onlineUsersId } });
    io.emit("online-users", { onlineUsers });

    /////////////////////on message event
    socket.on("message", async (data) => {
      const messageAttributes = {
        userName: data.userName,
        content: data.content,
        userId: data.id,
      };

      await Message.create(messageAttributes);
      io.to(data.id.toString()).emit("message", {
        messageAttributes,
        socketId: socket.id,
      });
    });

    //////////////disconnection event
    socket.on("disconnect", async () => {
      console.log("User disconnected");
      //await User.findByIdAndUpdate(socket.id, { isOnline: false });
      const offlineUser = onlineUsersId.indexOf(socket.id);
      onlineUsersId.splice(offlineUser, 1);
      console.log(socket.client.conn.server.clientsCount + " users connected");
      socket.broadcast.emit("online-users", { onlineUsers });
    });
  });
}

module.exports = socketConnecton;
