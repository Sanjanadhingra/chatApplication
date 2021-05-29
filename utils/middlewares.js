const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
SocketAuthorization = async (socket, next) => {
  try {
    //console.log(socket.handshake.headers.authorization);
    let token = socket.handshake.headers.authorization.replace("Bearer ", "");
    //JSON.parse(socket.handshake.query.token);
    console.log(token);
    const user = jwt.verify(token, "THIS-IS-CHAT-APPLICATION-API");
    console.log(user);
    const verifiedUser = await User.findById(user.id);
    if (!verifiedUser) throw new Error("The user Doesn't exists");

    console.log(verifiedUser);
    socket.id = verifiedUser._id;
    next();
  } catch (err) {
    return next(new Error("socket token Invalid"));
  }
};

module.exports = SocketAuthorization;
