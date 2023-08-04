import copy from 'copy-to-clipboard';

// component called Message that renders a message bubble with different styles based on the author of the message.
// it also includes a copy button for messages from the bot.
// the Message component takes three props: message, author, and myRole.
export default function Message({ message, author, myRole }) {
  return (
    <div
      className={`flex w-full px-4 py-1 ${
        author === myRole || author === "me" ? "justify-start" : "justify-end"
      }`}
    >
      <p
        className={`px-4 py-2 max-w-[80%] text-white rounded-3xl ${
          author === myRole || author === "me" ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        {
          // split by newline characters (\n) and mapped to individual <span> elements with a line break (<br />) between them. This ensures that each line of the message is rendered properly.
          message.split('\n').map((span, index) => (
            <span key={index}>{span}<br /></span>
          ))
        }
        {
          // display a copy button for messages from the bot
          author === 'bot' && <button onClick={() => copy(message)} title="Copy to clipboard" className="w-6 h-6 float-right bg-white border border-gray-200 rounded-[50%]">📋</button>
        }
      </p>
    </div>
  );
}
