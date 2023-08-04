const axios = require("axios");
const dotenv = require("dotenv");
const socketIO = require("socket.io");

// configure dotenv
dotenv.config({ path: ".env" });

// store the socket IDs of the clinician and patient.
const socketInfo = {
  clinician: "",
  patient: "",
};
// store the chat history between the clinician and patient.
const mainChatHistory = [];
// store the chat history with the chatbot, respectively.
const botChatHistory = [];

// create socket.io server
const io = socketIO(process.env.SOCKET_PORT, { cors: { origin: true } });
console.log(`Socket Server is running on port ${process.env.SOCKET_PORT}`)

// an event listener which is triggered when a client connects to the socket server.
io.on("connection", (socket) => {
  console.info("#-> Connection triggered with:", socket.id);

  // event listener which is triggered when the client sets their role (clinician or patient). The callback function receives the role and socketId parameters.
  socket.on("set role", (role, socketId) => {
    console.log("#-> Set SocketId:", role, socketId);
    // socketID is stored in the socketInfo object using the role as the key.
    socketInfo[role] = socketId;
    // emitted to the client, sending the mainChatHistory array as the data.
    socket.emit("receive", mainChatHistory);
    // if the role is "clinician", the bot response event is emitted to the client, sending the botChatHistory array as the data.
    role === "clinician" && socket.emit("bot response", botChatHistory);
  });

  // event listener which is triggered when a new message is sent by the client. The callback function receives the newMessage parameter.
  socket.on("send", (newMessage) => {
    // newMessage object is pushed to the mainChatHistory array.
    mainChatHistory.push(newMessage);
    // if the author of the new message is "clinician", the receive event is emitted to the patient socket, sending the new message as the data.
    if (newMessage.author === "clinician") {
      socket.to(socketInfo["patient"]).emit("receive", [newMessage]);
    }
    // if the author of the new message is "patient", the receive event is emitted to the clinician socket, sending the new message as the data.
    else if (newMessage.author === "patient") {
      socket.to(socketInfo["clinician"]).emit("receive", [newMessage]);
    }
  });

  // event listener which is triggered when the client requests a response from the chatbot. The callback function is an asynchronous function.
  socket.on("bot request", async () => {
    try {
      // POST request to the CHATBOT_SERVER with the mainChatHistory array as the request payload.
      const response = await axios.post(process.env.CHATBOT_SERVICE_API_URL + '/get-reference', { history: mainChatHistory });
      const botResponse = {
        author: "bot",
        message: response.data.botMessage,
      };
      // botResponse object is pushed to the botChatHistory array.
      botChatHistory.push(botResponse);
      // emitted to the client, sending the botResponse object as the data.
      socket.emit("bot response", [botResponse]);
    } catch (error) {
      // an error message is logged and emitted to the client.
      console.error('Error:', error);
      const botResponse = {
        author: "bot",
        message: "😭 Sorry, unable to connect to chatbot service!",
      };
      socket.emit("bot response", [botResponse]);
    }
  });
});
