# YourAI

YourAI is a professional, offline desktop application for interacting with large language models (LLMs) locally. Built with Electron, it provides a modern, responsive chat interface and leverages [Ollama](https://ollama.com) to run open-source models like LLaMA 3 entirely on your device—no internet or API keys required.

---

## Features

- Cross-platform desktop app (macOS, Linux, Windows)
- Modern, dark, and responsive chat UI
- 100% offline: all data stays on your device
- Fast, secure, and open-source
- Multi-turn chat with local LLMs (e.g., LLaMA 3)
- Friendly onboarding and status detection
- Cancel and retry support for slow responses

---

## Screenshots

<!-- Add screenshots here after first run -->

---

## Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)
- [Ollama](https://ollama.com/download) (for local LLM inference)
  - Start Ollama:
    - macOS: `brew services start ollama`
    - Linux: `ollama serve`
  - Download a model (e.g. llama3):
    ```bash
    ollama pull llama3
    ```

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/yourai.git
   cd yourai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage

1. Ensure Ollama is running and your model is downloaded.
2. Start the app:
   ```bash
   npm start
   ```
3. Interact with YourAI in the chat window.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.

---

## License

MIT

---

## Contact

For questions or support, please open an issue on GitHub.
