const User = require("./../models/userModel.js");
const jwt = require("jsonwebtoken");

async function socketConnecton(io, userId) {
  io.use(async function (socket, next) {
    let joinServerParameters = JSON.parse(
      socket.handshake.query.joinServerParameters
    );
    let token = joinServerParameters.token;
    const verifiedUser = await jwt.verify(
      token,
      "THIS-IS-CHAT-APPLICATION-API"
    );
    socket.id = verifiedUser._id;
    next();
  });

  let count = 0;

  io.on("connection", async (socket) => {
    console.log("User connected");
    await User.findByIdAndUpdate(socket.id, { isOnline: true });
    const onlineUsers = await User.find({ active: true });
    console.log(socket.id);
    console.log(`${socket.id},${++count} connected`);
    io.emit("online-users", { onlineUsers });
    socket.on("message", (msg, socketId) => {
      console.log(msg);

      io.to(socket.id).emit("message", { socket: socket.id, msg });
      socket.on("disconnect", async () => {
        console.log("User disconnected");
        await User.findByIdAndUpdate(userId, { isOnline: false });
      });
    });
  });
}

module.exports = socketConnecton;
