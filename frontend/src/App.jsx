import { useState, useEffect } from "react";
import { setConfiguration, Container, Row, Col } from "react-grid-system";
import { socket } from "./utils/socket";
import Modal from "./components/Modal";
import Chat from "./components/Chat";
import Chatbot from "./components/Chatbot";
import Logo from "./assets/img/logo.jpeg";

setConfiguration({ maxScreenClass: "xl" });

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
  const clearBotMessages = () => {
    socket.emit("clear", "bot responses");
    setBotMessages(defaultBotMessages);
  };
  const [showBotMessages, setShowBotMessages] = useState(false);

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
    <Container className="w-full h-full text-sm md:text-normal xl:text-lg">
      <Row className="h-full">
        {modalStatus && (
          <div className="h-96 w-96 max-w-[100%] max-h-[100%] mx-auto my-auto">
            <div className="h-16">
              <img src={Logo} alt="logo" className="h-8 mx-auto" />
            </div>
            <Modal
              title={"Select Role"}
              role={role}
              setRole={(val) => setRole(val)}
              modalStatus={modalStatus}
              setModalStatus={setModalStatus}
            />
          </div>
        )}
        {!modalStatus && (
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            className="h-full overflow-hidden"
          >
            <Row className="h-[15%]">
              <img
                src={Logo}
                alt="logo"
                className="w-[80%] max-w-[600px] my-auto mx-auto"
              />
            </Row>
            <Row className="h-[85%]">
              <Col
                xs={0}
                sm={0}
                md={3}
                lg={3}
                xl={3}
                className={role === "clinician" ? "hidden" : "hidden md:block"}
              />
              {!showBotMessages && (
                <Col xs={12} sm={12} md={6} lg={6} xl={6} className="h-full">
                  <Chat
                    role={role}
                    messages={messages}
                    setMessages={setMessages}
                  />
                  {role === "clinician" && (
                    <Row className="h-20">
                      <Col xs={6} sm={6} md={12}>
                        <button
                          className="h-12 mt-3 w-full bg-black rounded-xl border-2 border-gray-600 text-white"
                          onClick={() => {
                            socket.emit("clear", "conversation");
                            setMessages([]);
                          }}
                        >
                          Clear Conversation
                        </button>
                      </Col>
                      <Col xs={6} sm={6} md={12} className="md:hidden">
                        <button
                          className="h-12 mt-3 w-full bg-black rounded-xl border-2 border-gray-600 text-white"
                          onClick={() => setShowBotMessages(true)}
                        >
                          Show AI Bot Responses
                        </button>
                      </Col>
                    </Row>
                  )}
                </Col>
              )}

              {role === "clinician" && (
                <Col xs={12} sm={12} md={6} lg={6} xl={6} className="h-full">
                  <Chatbot
                    role={role}
                    botMessages={botMessages}
                    setBotMessages={setBotMessages}
                    clearBotMessages={clearBotMessages}
                    setShowBotMessages={setShowBotMessages}
                  />
                </Col>
              )}
            </Row>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default App;
