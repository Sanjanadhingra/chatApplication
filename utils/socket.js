const User = require("./../models/userModel.js");
const SocketAuthorization = require("./middlewares");
const Message = require("./../models/messaeModel");
const userService = require("../services/userService.js");

let socketConnection = {};

socketConnection.connect = (io) => {
  //////////Socket authorization
  io.use(SocketAuthorization);

  /////////////////Connection event
  io.on("connection", async (socket) => {
    console.log(socket.client.conn.server.clientsCount + " users connected");
    console.log(socket.id);
    userService.updateUserById(socket.id, {
      active: true,
    });


    const lastMssg = userService.lastMessage(socket.id);
    //////////////////////////////////////////last message event
    /*const lastMessage = await Message.aggregate([
      {
        $match: { $or: [{ senderId: socket.id }, { receiverId: socket.id }] },
      },
=======
    // const getAllUsers = await User.find(
    //   { _id: { $nin: [socket.id] } },
    //   { password: 0 }
    // );
    // console.log(getAllUsers);
    //////////////////////////////////////////last message event
    const getAllUsers = await User.aggregate([
>>>>>>> 1892eae0ac56b004f528f502e03c5581e0e1d17f
      {
        $match: {
          _id: {
            $nin: [socket.id],
          },
        },
      },
      {
        $lookup: {
          from: "messages",
          let: {
            userId: "$_id",
          },
          pipeline: [
            {
              $addFields: {
                conversationWith: {
                  $cond: {
                    if: {
                      $eq: ["$senderId", socket.id],
                    },
                    then: "$recieverId",
                    else: "$senderId",
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$$userId", "$conversationWith"],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "lastMessage",
        },
      },
      {
        $unwind: "$lastMessage",
      },
      {
        $project: { password: 0 },
      },
    ]);*/


    socket.emit("last-message", { lastMssg });
    
    // On typing event

    socket.on("typing",async (data)=>{
      io.to(data.id.toString()).emit("display",socket.id);
    });

    //on message event
    socket.emit("getAllUsers", getAllUsers);

    /////////////////////////////////////////on message event


    socket.on("sendMessage", async (data) => {
      // const IsUserexists = userService.findUserById(data.recieverId);
      // if (IsUserexists){
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
      const criteria = {
        $or: [
          {
            senderId: socket.id,
            recieverId: data.id,
          },
          {
            senderId: data.id,
            recieverId: socket.id,
          },
        ]}
      const loadAllMessages = userService.getAllMessages(criteria)

      console.log(loadAllMessages);
      socket.emit("loadAllMessages", loadAllMessages);
    });

    ////////////////disconnection event
    socket.on("disconnect", async () => {
      console.log("User disconnected");
      userService.updateUserById(socket.id, { active: false });
      const getAllUsers = userService.getAll({});
      console.log(socket.client.conn.server.clientsCount + " users connected");
      socket.emit("getAllUsers", getAllUsers);
    });
  });
};

module.exports = socketConnection;
