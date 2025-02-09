// Import required modules
import "groq-sdk/shims/node"
import Groq from "groq-sdk";
import dotenv from "dotenv";
import handlebars from "handlebars";
import fs from 'fs';
import path from 'path';

import { readFileSync } from 'fs';
import { promisify } from 'util';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Load environment variables from .env file
dotenv.config();

 
// Define the Tester class 
class Tester {
  private model: string;
  private client: Groq;
  private templates: chatTemplates = {};

  /**
   * Constructor for Tester class
   */
  constructor() {
    this.model = process.env["GROQ_MODEL"] || "llama3-8b-8192";
    this.client = new Groq({
      apiKey: process.env["GROQ_API_KEY"],
    });
  }

  /**
   * Makes a chat completion inference
   * @param msg The message to be used for the inference
   * @returns The chat completion result
   */
  async inference(msg: string): Promise<Groq.Chat.Completions.ChatCompletion> {
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
    return chatCompletionn;
  }

  /**
   * Loads a chat template from a file
   * @returns A promise that resolves with the loaded template
   */
    loadChatTemplate(templateName : string): Promise<string> {
      return new Promise((resolve, reject) => { 
        // You can use fs.readFile or fs.readFileSync to read a file
        // For now, I'll use readFileSync
        this.templates = {
          testInstructions : readFile(path.join(process.cwd(), '/templates/jestTest.template'), 'utf8'),
          coverLetter : readFile(path.join(process.cwd(), '/templates/coverLetter.template'), 'utf8')

        }
    
        Promise.all(Object.values(this.templates)).then((results) => {
          Object.keys(this.templates).forEach((key: string, index: number) => {
            this.templates[key] = results[index];
            
          });
        }).then(() => {
          console.log(this.templates); // Now all templates should be populated
          resolve(this.templates[templateName]);
        });
        
       })
 
  }
}

// Define the main function
async function main(): Promise<void> {
  // Create a new chat completion
  const test1 = new Tester();
  const template = await test1.loadChatTemplate('coverLetter')

  // const testingCode = await readFile(path.join(process.cwd(), '/workspace/index.ts'), 'utf8')
  const templateCompiled = handlebars.compile(template);
  const msgFromTemplate = templateCompiled({
    listing:'',
    candidate_covers:'',
    candidate_cv: ''
  });
  const result = await test1.inference(msgFromTemplate);
  console.log(result.choices[0].message);
  // writeFile(path.join(process.cwd(), '/workspace/test.js'), result.choices[0].message.content)
}

// Call the main function
main();