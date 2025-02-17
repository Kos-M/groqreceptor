import * as React from "react";
import { ChatResponseType } from "../../types/types";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Dots from "../Animations/Dots";

const MainChatResponse: React.FC<ChatResponseType> = ({
  chatResponse = "",
  children,
  isInProgress,
}) => {
  return (
    <div className=" z-5000 rounded-xl text-black my-8 w-4/5 p-4 h-2/3 border-gray-500 border-1 border-opacity-30 overflow-y-scroll mt-24">
      {isInProgress ? (
        <>
          <Dots mainText={"Thinking"} />
        </>
      ) : null}

      <div className="flex flex-grw justify-center items-center flex-col w-full h-auto p-4">
        {children &&
          children.map((item) => {
            console.log(item);
            return (
              <>
                <ReactMarkdown
                  className="text-lg tracking-tightest text-white/70 font-[510] px-4 py-2"
                  rehypePlugins={[rehypeRaw]}
                >
                  {item[Object.keys(item)[0]]}
                </ReactMarkdown>
              </>
            );
          })}
      </div>
    </div>
  );
};

export default MainChatResponse;
