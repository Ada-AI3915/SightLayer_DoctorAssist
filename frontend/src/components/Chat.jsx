import { useEffect, useState, useRef } from "react";
import { socket } from "../utils/socket";
import Message from "./Message";

// this component represents the chat interface where users can send and receive messages.
// the Chat component is defined as a functional component that takes three props: role, messages, and setMessages.
export default function Chat({ role, messages, setMessages }) {
  const [message, setMessage] = useState("");
  const chatRef = useRef(null);

  // function to display and send a message
  const displayMessage = () => {
    if (message) {
      // checks if the message state variable is not empty.
      socket.emit("send", { author: role, message }); // emits a send event using the socket object, passing an object with the message and author properties.
      setMessages([...messages, { author: role, message }]); // then updates the messages state variable by adding the new message to the existing messages array.
      setMessage(""); // resets the message state variable to an empty string.
    }
  };

  // function to receive a new message
  useEffect(() => {
    // defines a callback function receiveMessage that takes a newMessage parameter.
    const receiveMessage = (newMessage) => {
      if (newMessage.length === 0) setMessages([]);
      else setMessages([...messages, ...newMessage]); // updates the messages state variable by adding the new message(s) to the existing messages array.
    };
    socket.on("receive", receiveMessage); // registers the receiveMessage function as a listener for the receive event using the socket.on method.
    return () => {
      socket.off("receive", receiveMessage); // returns a cleanup function that removes the receiveMessage listener using the socket.off method.
    };
  }, [socket, messages]); // ensures that the effect is re-run whenever the socket or messages variables change.

  // function to scroll to end automatically
  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight; // auto scroll to end
  }, [chatRef, messages]);

  return (
    <section
      className="w-full flex items-center justify-center flex-col bg-gray-200 rounded-[32px] border-2 border-gray-600"
      style={{
        height:
          role === "clinician" ? "calc(100% - 80px)" : "calc(100% - 20px)",
      }}
    >
      {/* a header element that displays the sender of the messages based on the role prop. */}
      <header className="h-16 w-[80%] flex items-center justify-center border-b-2 border-b-gray-600">
        <h1 className="text-[32px] text-black">
          {role === "patient" ? "Patient" : "Clinician"} View
        </h1>
      </header>

      {/* contains a list of Message components, each representing a message in the chat. */}
      <main
        className="w-full overflow-y-auto items-center justify-center p-4"
        style={{ height: "calc(100% - 144px)" }}
        ref={chatRef}
      >
        {messages.map((msg, i) => (
          <Message
            key={i}
            message={msg.message}
            author={msg.author}
            myRole={role}
          />
        ))}
      </main>

      {/* includes a textarea for typing messages and a button to send the message. */}
      <footer className="w-full h-20 flex py-2 px-4 items-center justify-center">
        <input
          onKeyDown={
            (e) => (e.key === "Enter" ? displayMessage() : null) // attached to the textarea and button to handle sending the message when the Enter key and Ctrl key are pressed, respectively.
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send Message..."
          className="w-full h-12 p-2 outline-0 ring-blue-500 resize-none rounded-xl border-2 border-gray-600"
        />
        &nbsp;&nbsp;
        <button
          onClick={displayMessage}
          className="w-[120px] h-12 px-4 bg-blue-900 text-white rounded-xl border-2 border-gray-600"
        >
          Send
        </button>
      </footer>
    </section>
  );
}
