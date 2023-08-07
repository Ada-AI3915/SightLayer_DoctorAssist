import { useState, useEffect } from "react";
import { socket } from "./utils/socket";
import Modal from "./components/Modal";
import Chat from "./components/Chat";
import Chatbot from "./components/Chatbot";
import Logo from "./assets/img/logo.jpeg";

function App() {
  const [connectionId, setConnectionId] = useState(""); // state variable to store the connection ID
  const [role, setRole] = useState(""); // state variable to store the role
  const [modalStatus, setModalStatus] = useState(true); // state variable to manage the modal status
  const [messages, setMessages] = useState([]); // state variable to store chat messages
  const defaultBotMessages = [
    {
      question: 'Potential response text: "Discovery questions"',
      answer: "",
    },
    {
      question: 'Potential response text: "Book an appointment"',
      answer: "",
    },
    {
      question: 'Potential response text: "Provide drug information"',
      answer: "",
    },
    {
      question: 'Backoffice use: "Categorize topic"',
      answer: "",
    },
    {
      question: 'Backoffice use: "Assess patient sentiment"',
      answer: "",
    },
  ];
  const [botMessages, setBotMessages] = useState(defaultBotMessages);

  useEffect(() => {
    const onConnect = () => {
      console.log("💖", "Connected!", socket.id); // log a message when the socket is connected
      setConnectionId(socket.id); // set the connection ID to the socket ID
    };

    const onDisconnect = () => {
      console.log("💥", "Disconnected!"); // log a message when the socket is disconnected
    };

    socket.on("connect", onConnect); // listen for the "connect" event
    socket.on("disconnect", onDisconnect); // listen for the "disconnect" event

    return () => {
      socket.off("connect", onConnect); // remove the "connect" event listener when the component is unmounted
      socket.off("disconnect", onDisconnect); // remove the "disconnect" event listener when the component is unmounted
    };
  }, []);

  useEffect(() => {
    if (!modalStatus) {
      socket.emit("set role", role, connectionId); // emit a "set role" event to the server with the role and connection ID
    }
  }, [role, connectionId, modalStatus]);

  return (
    <div className="h-[100%] w-[80%] relative overflow-hidden">
      <div className="h-[15%] flex items-center justify-center">
        <img src={Logo} alt="logo" className="h-12 max-h-[90%]" />
      </div>
      <div className="w-full h-[75%] flex items-center justify-center">
        {!modalStatus && (
          <Chat role={role} messages={messages} setMessages={setMessages} />
        )}
        {role === "clinician" && !modalStatus && (
          <Chatbot
            role={role}
            botMessages={botMessages}
            setBotMessages={setBotMessages}
          />
        )}
        <Modal
          title={"Select Role"}
          role={role}
          setRole={(val) => setRole(val)}
          modalStatus={modalStatus}
          setModalStatus={setModalStatus}
        />
      </div>
      {role === "clinician" && !modalStatus && (
        <div className="w-full h-[10%] flex items-center justify-center">
          <button
            className="h-12 w-[48%] mx-auto bg-black rounded-xl border-2 border-gray-600 text-white"
            onClick={() => {
              socket.emit("clear", "conversation");
              setMessages([]);
            }}
          >
            Clear Conversation
          </button>
          <button
            className="h-12 w-[48%] mx-auto bg-black rounded-xl border-2 border-gray-600 text-white"
            onClick={() => {
              socket.emit("clear", "bot responses");
              setBotMessages(defaultBotMessages);
            }}
          >
            Clear All AI Responses
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
