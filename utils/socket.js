const User = require("./../models/userModel.js");

const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");
const onlineUsersId = [];

async function socketConnecton(io) {
  io.use(SocketAuthorization);

  io.on("connection", async (socket) => {
    console.log(socket.client.conn.server.clientsCount + " users connected");
    let count = io.sockets.clients;
    console.log(count);
    onlineUsersId.push(socket.id);
    //  await User.findByIdAndUpdate(socket.id, { isOnline: true });
    //const onlineUsers = await User.find({ active: true });
    let userStatus = {};
    let regUsers = await User.find({}, { _id: 1 }).lean();
    let onlineUsers = await User.find({ _id: { $in: onlineUsersId } }).lean();
    let offlineUsers = regUsers.filter((ele) => {
      return onlineUsers.indexOf(ele) === -1;
    });
    // userStatus['regUsers']=regUsers
    userStatus["onlineUsers"] = onlineUsers;
    userStatus["offlineUsers"] = offlineUsers;
    io.emit("User-status", userStatus);

    //////////////////////////////////////////

    // socket.on("last-message", async () => {
    //   const loggedInUser = await Message.aggregate([
    //     { $match: { from: socket.id, userId: socket.id } },
    //     { $sort: { createdAt: -1 } },
    //     { $group: { _id: "$userId", lastMessage: { $ } } },
    //   ]);
    // });

    //////////////////////////////////////on message event
    socket.on("message", async (data) => {
      const messageAttributes = {
        userName: data.userName,
        content: data.content,
        userId: data.id,
        from: socket.id,
      };

      await Message.create(messageAttributes);
      io.to(data.id.toString()).emit("message", {
        messageAttributes,
        socketId: socket.id,
      });
    });

    socket.on("load-all-messages", async (data) => {
      const result = await Message.find({
        $and: [{ from: socket.id }, { userId: data.id }],
      }).lean();
      io.to(data.id.toString()).emit("load-all-messages", { result });
    });
    //////////////disconnection event
    socket.on("disconnect", async () => {
      console.log("User disconnected");
      //await User.findByIdAndUpdate(socket.id, { isOnline: false });
      let userStatus = {};
      let regUsers = await User.find({}, { _id: 1 }).lean();

      const offlineUser = onlineUsersId.indexOf(socket.id);
      onlineUsersId.splice(offlineUser, 1);
      let offlineUsers = regUsers.filter((ele) => {
        return onlineUsersId.indexOf(ele) === -1;
      });
      // userStatus['regUsers']=regUsers
      userStatus["onlineUsers"] = onlineUsersId;
      userStatus["offlineUsers"] = offlineUsers;

      console.log(socket.client.conn.server.clientsCount + " users connected");
      // socket.broadcast.emit("online-users", { onlineUsers });
      io.emit("User-status", userStatus);
    });
  });
}

module.exports = socketConnecton;
