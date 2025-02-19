import { useEffect, useState } from "react";
import TopHeader from "./components/Headers/TopHeader";
import DataSidebar from "./components/Sidebars/DataSidebar";
import SettingsPanel from "./components/Panels/SettingsPanel";
import MainChatPanelResponse from "./components/Panels/MainChatResponse";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DOMPurify from "dompurify";
import { setToLocalStorage, getFromLocalStorage } from "./utils/helper";
import handlebars from "handlebars";

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
  const [inProgress, setInProgress] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

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
      setApiVal(getFromLocalStorage("groq_api"));
    } catch (e) {
      console.log(e);
    }

    client = new Groqqer(getFromLocalStorage("groq_api"));
  }, []);

  // Update dynamic state variables
  const updateState = (key: string, value: InputDetails) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  const storeApi = (evt: GenericEvent) => {
    setApiVal(evt.target.value);
    console.log("evt.target.value ", evt.target.value);
    try {
      setToLocalStorage(
        "groq_api",
        JSON.stringify({ value: evt.target.value }),
        true
      );
    } catch (e) {
      console.log(e);
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
        }
      })
      .catch((e) => {
        setInProgress(false);
        if (e.message.startsWith("429")) {
          const jsonString = e.message.split("429 ")[1];
          setError(JSON.parse(jsonString)?.error.message);
        }
      });
  };

  const onTemplateChange = (activeTemplate: Template) => {
    setInputData(getInputToDataMapping(activeTemplate) ?? {});
    setOutputKeys(getOutputKeys(activeTemplate));
    setSelectedTemplate(activeTemplate);
    loadTemplateInputsToState(activeTemplate);
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

  return (
    <div className="h-screen relative w-screen">
      <TopHeader />
      <div className="relative flex flex-grow flex-row">
        {/* Sidebar */}
        <div
          className={`relative top-0 left-0 h-full w-72 border-r-1 border-gray-800   transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DataSidebar>
            <div className="flex flex-col space-y-20 py-4 w-full px-4">
              {Object.keys(inputData).map((key) => {
                return (
                  <label className="form-control w-full px-2">
                    <div className="label">
                      <span className="label-text text-accent capitalize text-sm">
                        {key}
                      </span>
                    </div>
                    <textarea
                      className="textarea textarea-primary text-black dark:text-white h-48"
                      placeholder={key}
                      key={key}
                      name={key}
                      onChange={onInputChangeTyped}
                      value={state[key]?.value}
                    ></textarea>
                  </label>
                );
              })}
            </div>
          </DataSidebar>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute bottom-4 left-4 bg-gray-700 text-white p-2 rounded-full"
          >
            <FaChevronLeft size={20} />
          </button>
        </div>
        {/* Expand Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 left-0 bg-gray-700 text-white rounded-full transform -translate-x-1/2"
          >
            <FaChevronRight size={20} />
          </button>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-grow  flex-col items-center overflow-y-scroll justify-center  h-screen ">
          <pre className="text-red-600 text-wrap pt-14 px-2 relative w-2/3 overflow-auto">
            {error}
          </pre>

          <MainChatPanelResponse
            isInProgress={inProgress}
            chatResponse={chatResponse}
          >
            {chatResponses}
          </MainChatPanelResponse>
        </div>

        {/* Right Sticky Bar */}
        <div className="sticky right-0 top-0 h-screen">
          <SettingsPanel
            doGenerate={generate}
            apiValue={apiVal}
            onApiChange={storeApi}
            onTemplateChange={onTemplateChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
