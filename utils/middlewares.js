const User = require("./../models/userModel");

exports.SocketAuthorization = async (socket, next) => {
  try {
    let token = socket.handshake.headers.authorization.replace("Bearer", "");
    //JSON.parse(socket.handshake.query.token);
    console.log(token);
    const user = await jwt.verify(token, "THIS-IS-CHAT-APPLICATION-API");
    const verifiedUser = await User.findById(user._id);
    if (!verifiedUser) throw new Error("The user Doesn't exists");

    socket.id = verifiedUser._id;
    next();
  } catch (err) {
    return next(new Error("socket token Invalid"));
  }
};
