import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";
import Message from "./Message";

// this component represents the chat interface where clinician can send and receive messages with chatbot.
// the Chatbot component is defined as a functional component that takes two props: botMessages and setBotMessages.
export default function Chatbot({ botMessages, setBotMessages }) {
  const chatRef = useRef(null);

  // function to display and send a message
  const displayMessage = () => {
    socket.emit("bot request");                                        // emits a send event using the socket object.
  };

  // function to receive a new message
  useEffect(() => {
    // defines a callback function receiveMessage that takes a newMessage parameter.
    const receiveMessage = (newMessage) => {
      setBotMessages([...botMessages, ...newMessage]);                 // updates the messages state variable by adding the new message(s) to the existing messages array.
    };
    socket.on("bot response", receiveMessage);                         // registers the receiveMessage function as a listener for the receive event using the socket.on method.
    return () => {
      socket.off("bot response", receiveMessage);                      // returns a cleanup function that removes the receiveMessage listener using the socket.off method.
    };
  }, [socket, botMessages]);                                           // ensures that the effect is re-run whenever the socket or messages variables change.

  // function to scroll to end automatically
  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;          // auto scroll to end
  }, [chatRef, botMessages])

  return (
    <section className="relative h-full w-[48%] mx-auto flex items-center justify-center flex-col bg-white bg-slate-100">
      {/* a header element that displays the sender of the messages. */}
      <header className="relative h-20 w-full flex items-center justify-center border-2 border-b-blue-100">
        <h1 className="font-bold text-xl">
          From: <span className="text-blue-600">Chatbot</span>
        </h1>
      </header>

      {/* contains a list of Message components, each representing a message in the chat. */}
      <main className="relative h-auto w-full flex flex-col gap-3 overflow-y-scroll" style={{height: 'calc(100% - 148px)'}} ref={chatRef}>
        {botMessages.length > 0 &&
          botMessages.map((msg, i) => (
            <Message
              key={i}
              message={msg.message}
              author={msg.author}
            />
          ))}
      </main>

      {/* includes a button to get the bot's message. */}
      <footer className="relative w-full flex items-center justify-center py-2 px-4 border-2 border-t-blue-100">
        <button
          onClick={displayMessage}
          className="w-[160px] h-12 px-4 mt-auto text-sm bg-blue-600 text-white"
        >
          Bot Request
        </button>
      </footer>
    </section>
  );
}
