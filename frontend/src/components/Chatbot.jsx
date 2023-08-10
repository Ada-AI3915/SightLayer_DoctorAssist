import { useEffect, useState } from "react";
import { Row, Col } from "react-grid-system";
import { Icon } from "@iconify/react";
import copy from "copy-to-clipboard";
import { socket } from "../utils/socket";

// this component represents the chat interface where clinician can send and receive messages with chatbot.
// the Chatbot component is defined as a functional component that takes two props: botMessages and setBotMessages.
export default function Chatbot({
  botMessages,
  setBotMessages,
  clearBotMessages,
  setShowBotMessages,
}) {
  const [loading, setLoading] = useState(false);
  // function to display and send a message
  const displayMessage = (categoryId) => {
    socket.emit("bot request", categoryId); // emits a send event using the socket object.
    const tmpBotMessages = [...botMessages];
    tmpBotMessages[categoryId]["answer"] = (
      <Icon icon="line-md:loading-loop" className="text-xl xl:h-7" />
    );
    setBotMessages(tmpBotMessages);
    setLoading(true);
  };

  // function to receive a new message
  useEffect(() => {
    // defines a callback function receiveMessage that takes a newMessage parameter.
    const receiveMessage = (botChatHistory, categoryId, answer) => {
      if (categoryId) {
        const tmpBotMessages = [...botMessages];
        tmpBotMessages[categoryId]["answer"] = answer;
        setBotMessages(tmpBotMessages);
        setLoading(false);
      } else {
        setBotMessages(botChatHistory);
      }
    };
    socket.on("bot response", receiveMessage); // registers the receiveMessage function as a listener for the receive event using the socket.on method.
    return () => {
      socket.off("bot response", receiveMessage); // returns a cleanup function that removes the receiveMessage listener using the socket.off method.
    };
  }, [socket, botMessages]); // ensures that the effect is re-run whenever the socket or messages variables change.

  return (
    <div className="h-full w-full">
      <div
        className="w-full overflow-y-auto gap-4"
        style={{
          height: "calc(100% - 80px)",
        }}
      >
        {/* contains a list of Message components, each representing a message in the chat. */}
        {botMessages.map((category, categoryId) => (
          <div key={categoryId}>
            <button
              onClick={() => displayMessage(categoryId)}
              className="w-full h-12 px-4 bg-blue-900 text-left text-white rounded-xl border-2 border-gray-600"
            >
              {category["question"]}
            </button>
            <div className="mt-2 mb-4 p-4 bg-gray-100 rounded-xl border-2 border-gray-600">
              {/* display a copy button for messages from the bot */}
              {category["answer"] ? category["answer"] : "Not applicable"}
              {category["answer"] && loading !== true && (
                <button
                  onClick={() => copy(category["answer"])}
                  title="Copy to clipboard"
                  className="w-6 h-6 float-right bg-white border border-gray-200 rounded-[50%]"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Row className="h-20">
        <Col xs={6} sm={6} md={12}>
          <button
            className="h-12 mt-3 w-full bg-black rounded-xl border-2 border-gray-600 text-white"
            onClick={clearBotMessages}
          >
            Clear All AI Responses
          </button>
        </Col>
        <Col xs={6} sm={6} md={12} className="md:hidden">
          <button
            className="h-12 mt-3 w-full bg-black rounded-xl border-2 border-gray-600 text-white"
            onClick={() => setShowBotMessages(false)}
          >
            Hide AI Bot Responses
          </button>
        </Col>
      </Row>
    </div>
  );
}
