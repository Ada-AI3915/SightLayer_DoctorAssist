// component called Message that renders a message bubble with different styles based on the author of the message.
// the Message component takes three props: message, author, and myRole.
export default function Message({ message, author, myRole }) {
  return (
    <div
      className={`flex w-full px-4 py-1 ${
        author === myRole || author === "me" ? "justify-end" : "justify-start"
      }`}
    >
      {author !== myRole && (
        <div className="mt-auto flex h-full">
          <div className="w-0 h-0 border-transparent border-b-gray-400 border-b-[16px] border-l-[8px] mb-[10px]" />
        </div>
      )}
      <p
        className={`px-4 py-2 max-w-[80%] rounded-xl ${
          author === myRole || author === "me"
            ? "bg-blue-700 text-white after:border-blue-600"
            : "bg-gray-400 text-black"
        }`}
      >
        {
          // split by newline characters (\n) and mapped to individual <span> elements with a line break (<br />) between them. This ensures that each line of the message is rendered properly.
          message.split("\n").map((span, index) => (
            <span key={index}>
              {span}
              <br />
            </span>
          ))
        }
      </p>
      {author === myRole && (
        <div className="mt-auto flex h-full">
          <div className="w-0 h-0 border-transparent border-b-blue-700 border-b-[16px] border-r-[8px] mb-[10px]" />
        </div>
      )}
    </div>
  );
}
