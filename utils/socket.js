const User = require("./../models/userModel.js");

const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");

async function socketConnecton(io) {
  //////////Socket authorization
  io.use(SocketAuthorization);

  /////////////////Connection event
  io.on("connection", async (socket) => {
    console.log(socket.client.conn.server.clientsCount + " users connected");
    await User.findByIdAndUpdate(socket.id, {
      active: true,
    });

    const lastMssg = userService.lastMessage(socket.id);
    //////////////////////////////////////////last message event
    /*const lastMessage = await Message.aggregate([
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
      {
        $project: {
          _id: 0,
          "message._id": 0,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "message.conversationWith",
          foreignField: "_id",
          as: "userProfile",
        },
      },
    ]);*/

    socket.emit("last-message", { lastMssg });
    
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
            senderId: data.id,
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
      await User.findByIdAndUpdate(socket.id, { active: false });

      console.log(socket.client.conn.server.clientsCount + " users connected");
      io.emit("onlineUsers", userStatus);
    });
  });
}

module.exports = socketConnecton;
