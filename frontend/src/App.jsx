import { useState, useEffect } from "react";
import { socket } from "./utils/socket";
import Modal from "./components/Modal";
import Chat from "./components/Chat";
import Chatbot from "./components/Chatbot";

function App() {
  const [connectionId, setConnectionId] = useState("");              // state variable to store the connection ID
  const [role, setRole] = useState("");                              // state variable to store the role
  const [modalStatus, setModalStatus] = useState(true);              // state variable to manage the modal status
  const [messages, setMessages] = useState([]);                      // state variable to store chat messages
  const [botMessages, setBotMessages] = useState([]);                // state variable to store bot messages

  useEffect(() => {
    const onConnect = () => {
      console.log("💖", "Connected!", socket.id);                    // log a message when the socket is connected
      setConnectionId(socket.id);                                    // set the connection ID to the socket ID
    };

    const onDisconnect = () => {
      console.log("💥", "Disconnected!");                            // log a message when the socket is disconnected
    };

    socket.on("connect", onConnect);                                 // listen for the "connect" event
    socket.on("disconnect", onDisconnect);                           // listen for the "disconnect" event

    return () => {
      socket.off("connect", onConnect);                              // remove the "connect" event listener when the component is unmounted
      socket.off("disconnect", onDisconnect);                        // remove the "disconnect" event listener when the component is unmounted
    };
  }, []);

  useEffect(() => {
    if (!modalStatus) {
      socket.emit("set role", role, connectionId);                   // emit a "set role" event to the server with the role and connection ID
    }
  }, [role, connectionId, modalStatus]);

  return (
    <div className="h-[80%] w-[80%] flex relative overflow-hidden">
      {role === "clinician" && !modalStatus && (
        <Chatbot
          role={role}
          botMessages={botMessages}
          setBotMessages={setBotMessages}
        />
      )}
      {!modalStatus && (
        <Chat role={role} messages={messages} setMessages={setMessages} />
      )}
      <Modal
        title={"Select Role"}
        role={role}
        setRole={(val) => setRole(val)}
        modalStatus={modalStatus}
        setModalStatus={setModalStatus}
      />
    </div>
  );
}

export default App;
