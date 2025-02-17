import Groq from "groq-sdk";
import { setToLocalStorage } from "./utils/helper";

// Define the Groqqer class 
export class Groqqer {
  private model: string;
  private client: Groq;
  /**
   * Constructor for Groqqer class
   */
  constructor(private apiKey :string) {
    this.model ="llama-3.3-70b-versatile"; //"llama3-8b-8192"//   "llama3-8b-8192"; // TODO make this dynamic
    this.client = new Groq({
      apiKey:this.apiKey,
      dangerouslyAllowBrowser:true
    });
    this.createAllKeys()
  }

  loadTemplates(templatePath: string) : Promise<string>{
    return new Promise((resolve) => {
      fetch(templatePath)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load template file");
        return response.text();
      })
      .then((template) => {
         resolve(template)
      })
    })
  }
  /**
   * Makes a chat completion inference
   * @param msg The message to be used for the inference
   * @returns The chat completion result
   */
   inference(msg: string): Promise<Groq.Chat.Completions.ChatCompletion> {
    return new Promise(async(resolve, reject) => { 
      try {
        const chatCompletionn : Groq.Chat.Completions.ChatCompletion = await this.client.chat.completions.create({
          messages: [
            {
              role: "user",
              content: msg,
            },
          ],
          model: this.model,
          response_format:{ "type": "json_object" }
        });
        resolve( chatCompletionn);
  
      } catch(e){
        reject(e)
      }
     })
  }

 async createAllKeys(){
    const existingData :any= {
      'groq_api': '{"value": ""}',
    }
    Object.keys(existingData).forEach((key)=>{
      setToLocalStorage(key , existingData[key], false);
    })
  }
 
}
 