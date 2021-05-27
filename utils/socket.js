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
    let regUsers = await User.find({}, { '_id': 1 }).lean();
    let onlineUsers = await User.find({ _id: { $in: onlineUsersId } }).lean();
    let offlineUsers = regUsers.filter((ele) => {
      return onlineUsers.indexOf(ele) === -1;
    });
    // userStatus['regUsers']=regUsers
    userStatus["onlineUsers"] = onlineUsers;
    userStatus["offlineUsers"] = offlineUsers;
    io.emit("User-status", userStatus);

    //////////////////////////////////////////last message event
    const lastMessage = await Message.aggregate([
      {
        $match: { $or: [{ senderId: socket.id }, { receiverId: socket.id }] },
      },
      {
        $addFields: {
          conversationWith: {
            $cond: {
              if: { $eq: ["$senderId", socket.id] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
        },
      },
      {
        sort: { createdAt: -1 },
      },
      {
        $group: { _id: "$conversationWith", message: { $first: "$$ROOT" } },
      },
    ]);
    socket.emit("last-message", { lastMessage });
    
    // On typing event

    socket.on("typing",async (data)=>{
      io.to(data.id.toString()).emit("display",socket.id);
    });

    //on message event

    socket.on("message", async (data) => {
      const messageAttributes = {
        userName: data.userName,
        content: data.content,
        receiverId: data.id,
        senderId: socket.id,
      };

      await Message.create(messageAttributes);
      io.to(data.id.toString()).emit("message", {
        messageAttributes,
        socketId: socket.id,
      });
    });

    /////////////////////////load All message event
    socket.on("load-all-messages", async (data) => {
      const result = Message.find({
        $or: [
          {
            senderId: socket.id,
            receiverId: data.id,
          },
          {
            sender: data.id,
            receiverId: socket.id,
          },
        ],
      });

      const loadAllMessages = await result.sort("-createdAt");
      socket.emit("load-all-messages", { loadAllMessages });
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
