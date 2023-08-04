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
    if (message) {                                                     // checks if the message state variable is not empty.
      socket.emit("send", { author: role, message });                  // emits a send event using the socket object, passing an object with the message and author properties.
      setMessages([...messages, { author: role, message }]);           // then updates the messages state variable by adding the new message to the existing messages array.
      setMessage("");                                                  // resets the message state variable to an empty string.
    }
  };

  // function to receive a new message
  useEffect(() => {
    // defines a callback function receiveMessage that takes a newMessage parameter.
    const receiveMessage = (newMessage) => {
      setMessages([...messages, ...newMessage]);                       // updates the messages state variable by adding the new message(s) to the existing messages array.
    };
    socket.on("receive", receiveMessage);                              // registers the receiveMessage function as a listener for the receive event using the socket.on method.
    return () => {
      socket.off("receive", receiveMessage);                           // returns a cleanup function that removes the receiveMessage listener using the socket.off method.
    };
  }, [socket, messages]);                                              // ensures that the effect is re-run whenever the socket or messages variables change.

  // function to scroll to end automatically
  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;          // auto scroll to end
  }, [chatRef, messages])

  return (
    <section className="relative h-full w-[48%] mx-auto flex items-center justify-center flex-col bg-white bg-slate-100">
      {/* a header element that displays the recipient of the messages based on the role prop. */}
      <header className="relative h-20 w-full flex items-center justify-center border-2 border-b-blue-100">
        <h1 className="font-bold text-xl">
          To:{" "}
          <span className="text-blue-600">
            {role === "patient" ? "Clinician" : "Patient"}
          </span>
        </h1>
      </header>

      {/* contains a list of Message components, each representing a message in the chat. */}
      <main className="relative h-auto w-full flex flex-col gap-3 overflow-y-scroll" style={{height: 'calc(100% - 196px)'}} ref={chatRef}>
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
      <footer className="relative w-full flex items-center justify-center py-2 px-4 border-2 border-t-blue-100">
        <textarea
          onKeyDown={(e) =>
            e.key === "Enter" && e.ctrlKey ? displayMessage() : null   // attached to the textarea and button to handle sending the message when the Enter key and Ctrl key are pressed, respectively.
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your Message..."
          className="w-full h-24 p-2 border-2 border-gray-200 outline-blue-500 ring-blue-500 resize-none"
        />
        &nbsp;&nbsp;
        <button
          onClick={displayMessage}
          className="w-[120px] h-12 px-4 mt-auto text-sm bg-blue-600 text-white"
        >
          Send
        </button>
      </footer>
    </section>
  );
}
