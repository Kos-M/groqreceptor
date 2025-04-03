import { useEffect, useState } from "react";
import TopHeader from "./components/Headers/TopHeader";
import DataSidebar from "./components/Sidebars/DataSidebar";
import SettingsPanel from "./components/Panels/SettingsPanel";
import MainChatResponse from "./components/Panels/MainChatResponse";
import { FaChevronLeft, FaChevronRight, FaCog, FaKeyboard, FaTrash } from "react-icons/fa";
import DOMPurify from "dompurify";
import { setToLocalStorage, getFromLocalStorage } from "./utils/helper";
import handlebars from "handlebars";
import ErrorMessage from "./components/Feedback/ErrorMessage";

import { GenericEvent, Template } from "./types/types"; // Import shared type
let client: Groqqer;
import { Groqqer } from "./Groqqer";

type InputDetails = {
  template: string;
  value: string;
};
type InputData = {
  [key: string]: InputDetails;
};

interface DynamicState {
  [key: string]: InputDetails;
}

const SAVE_DALAY = 500;
function App() {
  const [state, setState] = useState<DynamicState>({});

  const [apiVal, setApiVal] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [validatingApi, setValidatingApi] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePane, setActivePane] = useState<'left' | 'main' | 'right'>('main');

  const [inputData, setInputData] = useState<InputData>({});
  const [outputKeys, setOutputKeys] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [error, setError] = useState("");
  const [timeoutUpdateID, setTimeoutUpdateID] = useState<number>(-1);

  const [chatResponse, setChatResponse] = useState("");
  const [chatResponses, setChatResponses] = useState<
    { [key: string]: string }[]
  >([]);

  useEffect(() => {
    try {
      const savedApiKey = getFromLocalStorage("groq_api");
      setApiVal(savedApiKey);
      
      if (savedApiKey) {
        validateApiKey(savedApiKey);
      }
    } catch (e) {
      console.log(e);
    }

    // Check if the screen is mobile-sized
    const checkIsMobile = () => {
      const isMobileScreen = window.innerWidth < 768;
      setIsMobile(isMobileScreen);
      
      // Always start with the main pane active
      setActivePane('main');
    };
    
    // Initial check
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Validate API key
  const validateApiKey = async (apiKey: string) => {
    if (!apiKey) {
      setApiKeyValid(false);
      return;
    }
    
    setValidatingApi(true);
    try {
      client = new Groqqer(apiKey);
      
      // Test API key using the validate method
      const isValid = await client.validate();
      
      if (isValid) {
        setApiKeyValid(true);
        setError("");
      } else {
        throw new Error("Invalid API key");
      }
    } catch (e: any) {
      console.error("API key validation error:", e);
      setApiKeyValid(false);
      
      // More specific error messages based on the error type
      if (e.message?.includes("401") || e.message?.includes("403")) {
        setError("Invalid API key. Please check your Groq Receptor API key and try again.");
      } else if (e.message?.includes("429")) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError("Failed to validate API key. Please check your connection and try again.");
      }
    } finally {
      setValidatingApi(false);
    }
  };

  // Toggle sidebar function for mobile
  const togglePane = (pane: 'left' | 'main' | 'right') => {
    if (activePane === pane) {
      setActivePane('main');
    } else {
      setActivePane(pane);
    }
  };

  // Update dynamic state variables
  const updateState = (key: string, value: InputDetails) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  const storeApi = async (evt: GenericEvent) => {
    const newApiKey = evt.target.value;
    setApiVal(newApiKey);
    setError("");
    
    try {
      setToLocalStorage(
        "groq_api",
        JSON.stringify({ value: newApiKey }),
        true
      );
      
      if (newApiKey) {
        await validateApiKey(newApiKey);
      } else {
        setApiKeyValid(null);
      }
    } catch (e) {
      console.log(e);
      setError("Failed to save API key");
    }
  };

  const getInputToDataMapping = (template: Template | null) => {
    if (!template) return;
    const finalMaping: InputData = {};
    template.params.forEach((param) => {
      if (param.type === "Input") {
        const paramValue = {
          value: getFromLocalStorage(`__${template.name}__${param.name}`),
          template: template.name,
        };
        finalMaping[param.name] = paramValue;
      }
    });
    return finalMaping;
  };

  const loadTemplateInputsToState = (template: Template | null) => {
    if (!template) return;
    template.params.forEach((param) => {
      updateState(param.name, {
        value: getFromLocalStorage(`__${template.name}__${param.name}`),
        template: template.name,
      });
    });
  };

  const getOutputKeys = (template: Template): string[] => {
    const outs: string[] = [];
    template.params.forEach((param) => {
      if (param.type === "Output") {
        outs.push(param.name);
      }
    });
    return outs;
  };

  const clearResults = () => {
    setChatResponses([]);
    setChatResponse("");
    setError("");
  };

  const generate = async (activeTemplate: Template | null) => {
    if (!activeTemplate) return;
    setInProgress(true);
    setError("");
    setChatResponses([]);
    setChatResponse("");

    if (!client) client = new Groqqer(getFromLocalStorage("groq_api"));
    const templateCompiled = handlebars.compile(activeTemplate.body);

    let paramTOValue: { [key: string]: string } = {};
    Object.keys(inputData).forEach((paramName) => {
      paramTOValue[paramName] = inputData[paramName].value;
    });
    const msgFromTemplate = templateCompiled(paramTOValue);

    client
      .inference(msgFromTemplate)
      .then((resp) => {
        const { choices } = resp;
        console.log(resp);
        if (choices && choices.length > 0) {
          let parsed = JSON.parse(
            resp.choices[0].message.content?.toString() || "{}"
          );

          const destructured: { [key: string]: string } = outputKeys.reduce(
            (acc, key) => ({ ...acc, [key]: parsed[key] }),
            {}
          );
          // sanitize responses - use br tags - make response to array
          const sanitizedReady: { [key: string]: string }[] = [];
          Object.keys(destructured).forEach((key: string) => {
            let value = destructured[key]?.replaceAll("\n", "<br/>");
            sanitizedReady.push({ [key]: DOMPurify.sanitize(value) });
          });
          setChatResponses(sanitizedReady);
          setInProgress(false);
          
          // If on mobile, switch to main pane after generating
          if (isMobile) {
            setActivePane('main');
          }
        }
      })
      .catch((e) => {
        setInProgress(false);
        if (e.message.startsWith("429")) {
          const jsonString = e.message.split("429 ")[1];
          setError(JSON.parse(jsonString)?.error.message || "Rate limit exceeded. Please try again later.");
        } else {
          setError(e.message || "An error occurred during generation. Please try again.");
        }
      });
  };

  const onTemplateChange = (activeTemplate: Template) => {
    setInputData(getInputToDataMapping(activeTemplate) ?? {});
    setOutputKeys(getOutputKeys(activeTemplate));
    setSelectedTemplate(activeTemplate);
    loadTemplateInputsToState(activeTemplate);
    clearResults();
  };

  const onInputChangeTyped = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (timeoutUpdateID > 0) clearTimeout(timeoutUpdateID);
    const paramName: string = evt.target.name;
    const value: string = evt.target.value;
    const templateName: string = inputData[paramName].template;
    const uniqueKey: string = `__${templateName}__${paramName}`;

    const paramValue = {
      value,
      template: templateName,
    };
    updateState(paramName, paramValue);

    let timeID: any = setTimeout(() => {
      console.log(evt.target.value);
      console.log();

      setToLocalStorage(uniqueKey, JSON.stringify({ value }), true);
      loadTemplateInputsToState(selectedTemplate);
    }, SAVE_DALAY);
    setTimeoutUpdateID(timeID);
  };

  useEffect(() => {
    if (Object.keys(state).length === 0) return;
    setInputData(getInputToDataMapping(selectedTemplate) ?? {});

    console.log(state);
  }, [state]);

  // Display error message after sidebar in input/output panel
  const ErrorContainer = ({ error, onDismiss }: { error: string, onDismiss: () => void }) => {
    if (!error) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md overflow-hidden">
          <ErrorMessage message={error} onDismiss={onDismiss} />
        </div>
      </div>
    );
  };

  // Welcome screen / empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <h2 className="text-2xl font-bold mb-4 text-primary">Welcome to Groq Receptor</h2>
      <p className="text-lg mb-8 text-gray-300 max-w-lg">
        To get started, {apiKeyValid ? "select a template from the right sidebar" : "add your Groq Receptor API key in the settings panel"}
      </p>
      <div className="flex flex-col items-center justify-center">
        {!apiKeyValid && (
          <button 
            onClick={() => setActivePane('right')}
            className="btn btn-primary mb-4"
          >
            Open Settings
          </button>
        )}
        {apiKeyValid && !selectedTemplate && (
          <button 
            onClick={() => setActivePane('right')}
            className="btn btn-primary mb-4"
          >
            Select Template
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app h-screen flex flex-col">
      <TopHeader />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Overlay - show on any screen size when sidebar is active */}
        {activePane !== 'main' && (
          <div 
            className="bg-black/30 backdrop-blur-sm fixed inset-0 z-10"
            onClick={() => setActivePane('main')}
          ></div>
        )}
        
        {/* Left sidebar (input/output panel) */}
        <div 
          className={`fixed top-14 bottom-0 left-0 z-20 w-[85%] max-w-[400px] shadow-xl transition-transform duration-300 ${
            activePane === 'left' ? 'translate-x-0' : '-translate-x-full'
          } bg-black bg-opacity-30 border-r border-gray-800 overflow-hidden backdrop-blur-md flex flex-col`}
        >
          <>
            <div className="sticky top-0 z-10 flex justify-end p-2 border-b border-gray-800 bg-black bg-opacity-30 backdrop-blur-md">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setActivePane('main')}
              >
                <FaChevronLeft />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-6">
              {/* Input Fields for Template */}
              {selectedTemplate && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Input Parameters</h2>
                    
                    {selectedTemplate.params
                      .filter((item) => item.type === "Input")
                      .map((param, index) => (
                        <div key={index} className="mb-6">
                          <label className="block text-accent font-medium mb-2">
                            {param.name}
                          </label>
                          <textarea
                            className="textarea textarea-bordered w-full h-32 text-black dark:text-white shadow-inner rounded-lg"
                            name={param.name}
                            value={(state[param.name]?.value as string) || ""}
                            placeholder={`Enter ${param.name}...`}
                            onChange={onInputChangeTyped}
                          />
                        </div>
                      ))}
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Output Parameters</h2>
                    {selectedTemplate.params
                      .filter((item) => item.type === "Output")
                      .map((param, index) => (
                        <div key={index} className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-accent font-medium">
                              {param.name}
                            </label>
                          </div>
                          {chatResponses.map((resp, respIdx) => (
                            <div key={respIdx} className="mb-4">
                              <div
                                className="prose prose-sm max-w-none p-3 bg-base-200/50 rounded-lg shadow-md overflow-auto"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(resp[param.name] || ""),
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </>
        </div>
        
        {/* Main content area */}
        <div className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ${
          activePane !== 'main' ? 'opacity-20' : ''
        }`}>
          {/* Sidebar toggle buttons for all screen sizes */}
          <div className="fixed top-20 left-2 z-10">
            <button
              onClick={() => setActivePane('left')}
              className="btn btn-sm btn-circle shadow-md bg-base-300/50 hover:bg-base-300"
              title="Show input panel"
            >
              <FaKeyboard size={14} />
            </button>
          </div>
          
          <div className="fixed top-20 right-2 z-10">
            <button
              onClick={() => setActivePane('right')}
              className="btn btn-sm btn-circle shadow-md bg-base-300/50 hover:bg-base-300"
              title="Show template selector"
            >
              <FaCog size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden relative p-4 pt-20">
            {(chatResponse || chatResponses.length > 0) ? (
              <div className="flex flex-col h-full max-w-4xl mx-auto">
                <div className="flex justify-end p-2 mb-4">
                  <button
                    onClick={clearResults}
                    className="btn btn-sm btn-error gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <FaTrash size={14} />
                    Clear Results
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  <MainChatResponse
                    chatResponse={chatResponse || ""}
                    isInProgress={inProgress}
                  >
                    {chatResponses}
                  </MainChatResponse>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full max-w-4xl mx-auto">
                <EmptyState />
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar (template selector) */}
        <div
          className={`fixed top-14 bottom-0 right-0 z-20 w-[85%] max-w-[350px] shadow-xl transition-transform duration-300 ${
            activePane === 'right' ? 'translate-x-0' : 'translate-x-full'
          } bg-black bg-opacity-30 border-l border-gray-800 overflow-hidden backdrop-blur-md flex flex-col`}
        >
          <>
            <div className="sticky top-0 z-10 flex justify-start p-2 border-b border-gray-800 bg-black bg-opacity-30 backdrop-blur-md">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setActivePane('main')}
              >
                <FaChevronLeft />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <DataSidebar>
                <SettingsPanel
                  onApiChange={storeApi}
                  apiValue={apiVal}
                  onTemplateChange={onTemplateChange}
                  doGenerate={generate}
                  isMobile={isMobile}
                  apiKeyValid={apiKeyValid}
                  validatingApi={validatingApi}
                  error={error}
                  onErrorDismiss={() => setError("")}
                />
              </DataSidebar>
            </div>
          </>
        </div>
        
        {/* Bottom Navigation - show on mobile only */}
        {isMobile && (
          <div className="fixed bottom-0 inset-x-0 h-16 bg-base-300 border-t border-gray-700 z-30 flex justify-between items-center px-4">
            <button 
              className={`p-4 rounded-full ${activePane === 'left' ? 'bg-primary text-primary-content' : 'text-gray-400'}`}
              onClick={() => togglePane('left')}
            >
              <FaKeyboard size={20} />
            </button>
            <div className="flex-1"></div>
            <button 
              className={`p-4 rounded-full ${activePane === 'right' ? 'bg-primary text-primary-content' : 'text-gray-400'}`}
              onClick={() => togglePane('right')}
            >
              <FaCog size={20} />
            </button>
          </div>
        )}
      </div>
      
      {/* Global error message container */}
      <ErrorContainer error={error} onDismiss={() => setError("")} />
    </div>
  );
}

export default App;
