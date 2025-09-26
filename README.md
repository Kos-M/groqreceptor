# Groq Receptor

## Project Description
The Groq Receptor is a minimalist web-based dashboard designed to facilitate the creation, management, and utilization of prompt templates with the GroqCloud API and its powerful language models. Built with React, Vite, and TailwindCSS, it offers a user-friendly interface for interacting with Groq's inference engine, allowing users to experiment with different prompts and observe model responses efficiently.

## Features
*   **Prompt Template Management**: Create, save, and load custom prompt templates.
*   **GroqCloud API Integration**: Seamlessly interact with Groq's high-performance inference API.
*   **Real-time Inference**: Send prompts to Groq models and receive responses in real-time.
*   **Local Storage Persistence**: Store API keys and prompt templates securely in local storage.
*   **Responsive UI**: A clean and responsive user interface built with React and TailwindCSS.

## Setup

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or Yarn
*   A GroqCloud API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kos-M/groqreceptor.git
    cd groqreceptor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Groq API key:
    ```
    VITE_GROQ_API_KEY="YOUR_GROQ_API_KEY"
    ```
    *Note: For local development, you might directly input the key in the UI, but for production builds, using environment variables is recommended.*

## Usage

### Running the application locally
To start the development server and watch for TailwindCSS changes:
```bash
npm run dev
# or yarn dev
```
Open your browser to `http://localhost:5173` (or the port indicated in your terminal).

### Building for Production
To create a production-ready build:
```bash
npm run build
# or yarn build
```
This will generate optimized static assets in the `dist` directory.

### Deployment
This project uses `gh-pages` for deployment to GitHub Pages.

1.  **Build the project (if not already done):**
    ```bash
    npm run predeploy
    ```
2.  **Deploy to GitHub Pages:**
    ```bash
    npm run deploy
    ```

## Project Structure
*   `src/`: Contains the main application source code.
    *   `src/App.tsx`: Main React component.
    *   `src/Groqqer.ts`: Core logic for interacting with the Groq API.
    *   `src/components/`: Reusable React components.
    *   `src/types/`: TypeScript type definitions.
    *   `src/utils/helper.ts`: Utility functions for local storage and data manipulation.
*   `public/`: Static assets.
*   `tailwind.config.js`: TailwindCSS configuration.
*   `vite.config.ts`: Vite build configuration.

## Core Logic: `src/Groqqer.ts`
This file encapsulates the functionality for interacting with the GroqCloud API.

### `class Groqqer`
Manages the Groq API key, prompt templates, and handles inference requests.

#### `Groqqer.validate(): Promise<boolean>`
Asynchronously validates the provided Groq API key by making a test call to the API. Returns `true` if the key is valid, `false` otherwise.

#### `Groqqer.loadTemplates(templatePath: string): Promise<string>`
Loads prompt templates from a specified path. This method is responsible for fetching and preparing templates for use.

#### `Groqqer.inference(msg: string): Promise<Groq.Chat.Completions.ChatCompletion>`
Sends a message (`msg`) to the configured Groq model for inference. Returns a `ChatCompletion` object containing the model's response.

#### `Groqqer.createAllKeys(): Promise<void>`
Asynchronously creates or ensures the existence of necessary keys (e.g., API key, default templates) in local storage.

## Utility Functions: `src/utils/helper.ts`
This file provides helper functions for common tasks, primarily related to local storage management.

#### `setToLocalStorage<T>(key: string, value: T, force: boolean = false): void`
Stores a value (`value`) in local storage under the given `key`. If `force` is `true`, it overwrites any existing value. Otherwise, it only sets the value if the key doesn't already exist.

#### `getFromLocalStorage<T>(key: string): string`
Retrieves a value from local storage associated with the given `key`. Returns the value as a string.

#### `flattenAndConcatenate(obj: any): string`
Flattens a nested object and concatenates its string values into a single string. Useful for preparing data for display or further processing.

#### `searchLocalStorageWithPrefix(prefix: string, exact: boolean = false): string[]`
Searches local storage for keys that start with the specified `prefix`. If `exact` is `true`, it only returns keys that exactly match the prefix. Returns an array of matching keys.

#### `deleteItemsFromLocalStorage(foundValues: string[]): void`
Deletes items from local storage corresponding to the provided array of `foundValues` (keys).
