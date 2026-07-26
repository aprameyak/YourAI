# YourAI

![Electron](https://img.shields.io/badge/Electron-47848F?logo=electron&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)

## About

**YourAI** is a cross-platform offline desktop LLM chat application built with **Electron** and **TypeScript**. It provides a modern dark chat interface and connects to a locally running **Ollama** instance to run open-source models like LLaMA 3 entirely on-device — no internet connection or API keys required.

## Features

- Fully offline operation — all inference runs locally via Ollama, no data leaves your machine
- Cross-platform desktop app supporting macOS, Windows, and Linux
- Multi-turn conversation history within each session
- Dark, responsive chat UI
- Ollama status detection and friendly onboarding when the local server is not running
- Cancel and retry controls for slow or stalled model responses
- Packaged as a distributable desktop binary via electron-builder

## Technology Stack

- **Desktop Framework**: Electron
- **Language**: TypeScript, Node.js
- **Model Inference**: Ollama (local LLMs, e.g. LLaMA 3)
