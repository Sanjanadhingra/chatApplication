const User = require("./../models/userModel.js");

const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");

let socketConnection = {};

socketConnection.connect = (io) => {
  //////////Socket authorization
  io.use(SocketAuthorization);

  /////////////////Connection event
  io.on("connection", async (socket) => {
    console.log(socket.client.conn.server.clientsCount + " users connected");
    console.log(socket.id);
    await User.findByIdAndUpdate(socket.id, {
      active: true,
    });

    const getAllUsers = await User.find({},{password:0});
    console.log(getAllUsers);
    //////////////////////////////////////////last message event
    // const lastMessage = await Message.aggregate([
    //   {
    //     $match: { $or: [{ senderId: socket.id }, { receiverId: socket.id }] },
    //   },
    //   {
    //     $addFields: {
    //       conversationWith: {
    //         $cond: {
    //           if: { $eq: ["$senderId", socket.id] },
    //           then: "$receiverId",
    //           else: "$senderId",
    //         },
    //       },
    //     },
    //   },
    //   {
    //     sort: { createdAt: -1 },
    //   },
    //   {
    //     $group: { _id: "$conversationWith", message: { $first: "$$ROOT" } },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       "message._id": 0,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "message.conversationWith",
    //       foreignField: "_id",
    //       as: "userProfile",
    //     },
    //   },
    // ]);

    socket.emit("getAllUsers", getAllUsers);

    /////////////////////////////////////////on message event

    socket.on("sendMessage", async (data) => {
      const IsUserexists = await User.findById(data.recieverId);
      console.log(data);
      const messageAttributes = {
        content: data.content,
        recieverId: data.recieverId,
        senderId: socket.id,
      };

      await Message.create(messageAttributes);

      io.to(data.recieverId.toString()).emit(
        "recieveMessage",
        messageAttributes
      );
    });

    /////////////////////////load All message event
    socket.on("getAllMessages", async (data) => {
      console.log(data);
      const loadAllMessages = await Message.find({
        $or: [
          {
            senderId: socket.id,
            recieverId: data.id,
          },
          {
            senderId: data.id,
            recieverId: socket.id,
          },
        ],
      });

      console.log(loadAllMessages);
      socket.emit("loadAllMessages", loadAllMessages);
    });

    ////////////////disconnection event
    socket.on("disconnect", async () => {
      console.log("User disconnected");
      await User.findByIdAndUpdate(socket.id, { active: false });
      const getAllUsers = await User.find({});
      console.log(socket.client.conn.server.clientsCount + " users connected");
      socket.emit("getAllUsers", getAllUsers);
    });
  });
};

module.exports = socketConnection;
