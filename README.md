# YourAI - Private Local AI Chat

YourAI is a fast, private desktop chat application that runs completely offline. Built with Electron and Ollama, it provides a ChatGPT-like experience with no internet required and 100% privacy.

## Overview

YourAI offers a complete local AI chat solution that prioritizes speed, privacy, and user control. All conversations remain on your device with no data transmitted to external servers.

## Key Features

- **Lightning Fast**: Optimized for speed with llama3.2 model
- **100% Private**: All data stays on your device
- **Smart Chat**: Remembers conversation context
- **Save Chats**: Export and save conversations locally
- **Clean UI**: Modern, responsive design
- **Offline Operation**: Works completely without internet
- **Real-time Streaming**: Live response streaming with typing indicators
- **Model Selection**: Switch between different AI models
- **Conversation Management**: Save, load, and manage chat history

## System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 2GB free space for models
- **OS**: macOS 10.15+, Windows 10+, or Linux
- **Internet**: Only for initial Ollama download

## Installation

### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [https://ollama.com/download](https://ollama.com/download)

### Step 2: Download AI Model

```bash
ollama pull llama3.2
```

### Step 3: Install and Start YourAI

```bash
git clone https://github.com/yourusername/yourai.git
cd yourai
npm install
npm start
```

## Usage

### Starting a Chat
1. Type your message in the input field
2. Press Enter or click Send
3. Watch the AI respond in real-time with streaming text

### Managing Conversations
- **New Chat**: Click "New Chat" to start a fresh conversation
- **Save Chat**: Click "Save" to store the current conversation locally
- **Cancel Response**: Click "Cancel" to stop long responses
- **Model Selection**: Use the dropdown to switch between available models

### Available Models
- **llama3.2**: Fast, efficient general-purpose model (recommended)
- **mistral**: High-quality responses with good reasoning
- **codellama**: Specialized for code and programming tasks

## Troubleshooting

### Common Issues

**"Ollama is not running"**
```bash
# Start Ollama manually
ollama serve

# On macOS with Homebrew
brew services start ollama
```

**"Model not found"**
```bash
# Download the required model
ollama pull llama3.2

# Check available models
ollama list
```

**Slow responses**
- Ensure you're using llama3.2: `ollama pull llama3.2`
- Close other applications to free up memory
- Check that you have 8GB+ RAM available
- Try shorter, more focused questions

**Connection errors**
- Verify Ollama is running: `ollama serve`
- Check if port 11434 is available
- Restart Ollama if necessary

### Status Indicators

- **"Ready to chat!"**: Everything is working correctly
- **"Ollama running but model not found"**: Need to download the model
- **"Ollama not running"**: Need to start Ollama service

## Performance Optimization

### For Maximum Speed
1. Use llama3.2 model (smaller, faster than llama3)
2. Keep questions focused and concise
3. Close other applications to free up memory
4. Restart the application occasionally to clear memory cache

### For Better Quality
1. Use mistral or llama3 for more detailed responses
2. Ask detailed questions with more context
3. Use conversation history to build context
4. Try different models for specific tasks (codellama for code)

## Privacy and Security

YourAI is designed with privacy as a core principle:

- All conversations are stored locally on your device
- No data is transmitted to external servers
- No tracking, analytics, or data collection
- Complete control over your conversation data
- Works entirely offline after initial setup

## Development

### Project Structure
```
YourAI/
├── index.js          # Main Electron process
├── renderer.js       # Frontend logic
├── preload.js        # IPC bridge
├── index.html        # User interface
└── package.json      # Dependencies and scripts
```

### Building from Source
```bash
git clone https://github.com/yourusername/yourai.git
cd yourai
npm install
npm start
```

### Available Scripts
- `npm start`: Launch the application
- `npm run build`: Build for distribution
- `npm run dev`: Development mode with hot reload

## Comparison with Other AI Chat Solutions

| Feature | ChatGPT | Perplexity | Gemini | YourAI |
|---------|---------|------------|--------|--------|
| Speed | High | High | High | Very High |
| Privacy | No | No | No | Complete |
| Offline | No | No | No | Yes |
| Cost | Subscription | Free/Paid | Free/Paid | Free |
| Setup | Instant | Instant | Instant | 2 minutes |

## Roadmap

### Phase 1: Core Features
- [x] Error handling and diagnostics
- [x] Response streaming
- [x] Model selection
- [ ] Conversation search
- [ ] Export options (PDF, Markdown)

### Phase 2: User Experience
- [ ] Code syntax highlighting
- [ ] Keyboard shortcuts
- [ ] Auto-save functionality
- [ ] Theme customization
- [ ] Better UI polish

### Phase 3: Advanced Features
- [ ] File upload and analysis
- [ ] Voice input (speech-to-text)
- [ ] Conversation branching
- [ ] System tray integration
- [ ] Global hotkey support

## Contributing

Contributions are welcome! Please focus on:
- Performance improvements
- User experience enhancements
- Bug fixes and stability
- Documentation improvements

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify system requirements
3. Ensure Ollama is properly installed and running
4. Check the status indicators in the application

YourAI provides a viable alternative to cloud-based AI chat solutions with complete privacy and local control.
