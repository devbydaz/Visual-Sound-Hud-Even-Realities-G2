# Visual-Sound-Hud-Even-Realities-G2
A real-time audio classification and visual feedback system. This project listens to the environment and translates sounds into immediate visual cues, projecting them directly onto Even Realities G2 smart glasses while simultaneously updating a companion app.

**Disclaimer**
Not a Safety Device: This software is an experimental prototype intended for educational and accessibility exploration. It is not a certified medical device or a reliable safety mechanism. Do not rely on this application for emergency alerts (e.g., fire alarms, sirens, or approaching vehicles). The developer assumes no liability for missed audio events, false positives, or any resulting damages or injuries. **Always use dedicated, certified alerting devices for personal safety.**

**Features**
Real-Time ML Inference: Utilises TensorFlow and the YAMNet model to classify over 500 different environmental sounds with zero delay.

Smart Glasses HUD Integration: Leverages the Even Hub SDK to push low-latency text and ASCII-art alerts directly to the user's field of vision.

Companion UI: A fully responsive, dark-mode web application featuring animated visualisers, deep gradients, and contextual Material Icons.

"Lock-On" Debouncing System: Intelligent backend logic that prevents UI flickering by holding high-confidence sounds on screen and filtering out background noise.

Emergency Alerting: Distinct visual warnings for high-priority sounds like alarms, sirens, smoke detectors, and glass shattering. **PLEASE SEE DISCLAIMER ABOVE**

**Architecture**
The project is split into two primary components communicating over WebSockets:

1. The Inference Backend (Python)
A Python-based WebSocket server that ingests raw audio chunks from the frontend.

Machine Learning: Uses tensorflow_hub to run audio through Google's YAMNet model.

Audio Processing: Normalises and clips audio streams using numpy.

Stability Logic: Implements a custom timer and confidence threshold (Rule A/B) to lock onto dominant sounds and ignore transient noise.

2. The Client Frontend (TypeScript / HTML)
A lightweight web application that captures microphone input and manages the visual output.

Hardware Bridge: Connects to the Even Realities G2 glasses via @evenrealities/even_hub_sdk. (https://hub.evenrealities.com/docs/getting-started/overview)

Dual-Output Translation: Maps detected YAMNet classes into two visual streams:

HUD (Glasses): Clean, recognisable ASCII art (e.g., \((!))/ ALARM, V^..^V DOG).

Phone (Web): Formatted text and Material Icons.

Audio Streaming: Captures PCM audio events from the Even Hub and streams them securely to the backend via an ngrok tunnel. 

**Getting Started**

Prerequisites
Even Realities G2 Smart Glasses

Node.js & npm (for the frontend/SDK)

Python 3.8+ (for the ML backend)

ngrok (to expose the local WebSocket server to the web client)

Please see Even Realities documentation for creating apps. An example is shown below:

# 1. Create the new project folder
npm create vite@latest APPNAME -- --template vanilla-ts

# 2. Move into the new directory
cd APPNAME

# 3. Install the Even Realities SDK
npm install @evenrealities/even_hub_sdk

# 4. Start the local development server
npm run dev
