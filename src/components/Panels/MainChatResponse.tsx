import * as React from "react";
import { ChatResponseType } from "../../types/types";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Dots from "../Animations/Dots";
import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const MainChatResponse: React.FC<ChatResponseType> = ({
  chatResponse = "",
  children,
  isInProgress,
}) => {
  const [copiedItemIndex, setCopiedItemIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text.replace(/<br\/>/g, '\n'));
    setCopiedItemIndex(index);
    
    // Reset "Copied" state after 2 seconds
    setTimeout(() => {
      setCopiedItemIndex(null);
    }, 2000);
  };

  // Extract plain text from HTML
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="rounded-xl my-4 md:my-6 w-[95%] md:w-4/5 p-4 md:p-6 min-h-[300px] border border-gray-500 bg-gray-800/20 backdrop-blur-sm shadow-lg overflow-y-auto">
      {isInProgress ? (
        <div className="flex items-center justify-center h-full w-full">
          <Dots mainText={"Generating response"} />
        </div>
      ) : (
        <div className="flex flex-col w-full h-auto">
          {children && children.length > 0 ? (
            children.map((item, index) => {
              const key = Object.keys(item)[0];
              const content = item[key];
              return (
                <div 
                  key={index} 
                  className="w-full mb-6 bg-gray-900/30 p-4 rounded-lg border border-gray-700/50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-primary">{key}</h3>
                    <button
                      onClick={() => copyToClipboard(stripHtml(content), index)}
                      className="btn btn-sm btn-ghost"
                      title="Copy to clipboard"
                    >
                      {copiedItemIndex === index ? (
                        <FaCheck className="text-green-400" />
                      ) : (
                        <FaCopy />
                      )}
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      className="text-base md:text-lg tracking-normal text-gray-200 font-normal"
                      rehypePlugins={[rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-40 w-full text-gray-400">
              No results to display
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainChatResponse;
