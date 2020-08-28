const {
  getIDAndPictureByUsername,
  saveMessageToDB,
} = require("../utils/dbUtils");
const moment = require("moment");
const redis = require("../redis/redis");
moment().format();

module.exports = (http) => {
  const io = require("socket.io")(http);

  let userCount = 0;
  let userList = [];

  io.on("connect", (socket) => {
    console.log("a user connected");

    socket.on("message", async ({ message, username }) => {
      const { user_id, userURL } = await getIDAndPictureByUsername(username);
      const timestamp = moment();
      // creates a message for broadcast to all open sockets
      const newMessage = { message: message, username, userURL, timestamp };
      // creates a message formatted for database storage
      const dbMessage = { user_id, message };
      try {
        //
        await saveMessageToDB(dbMessage);
        // send the message to all open sockets
        io.emit("newMessage", newMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("signin", ({ username }) => {
      userCount++;
      console.log(userCount);
      io.emit("count", userCount);

      userList.push(username);
      io.emit("userlist", userList);
      // assigns the anon username to the socketID
      redis.set(socket.id.toString(), username);
      // console.log(socket.id.toString(),'socketid',username2,'username')

      // claims the anon username as in-use
      redis.set(username, "true");

      redis.get(username, (data) => {
        console.log(data);
      });

      redis.keys("*", (err, data) => {
        console.log(data.length, data);
        socket.emit("data", data);
      });
    });

    socket.on("disconnect", () => {
      // retrieves the username attached to the socketID on disconnect
      redis.get(socket.id.toString(), (err, username) => {
        if (err) return console.error(err);
        console.log(username, "testing");
        console.log(username, "disconnected");

        if (!username) return;
        //frees the username and socketID from the in-use storage

        redis.del(socket.id.toString());
        redis.del(username);

        userCount--;
        io.emit("count", userCount);
        userList = userList.filter((user) => {
          console.log(user, username);
          return user !== username;
        });
        redis.keys("*", (err, data) => {
          console.log(data.length, data);
        });
        console.log(userList);
        io.emit("userlist", userList);
      });
    });
  });
  return io;
};

/* messageObject = {
message: String,
username:  String,
userURL:  String,
timestamp: String
}
*/

/*
  sendMessage = {
  username: String,
  message: String,
  }
 */
