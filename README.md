# 🌾 KrishiMitra (कृषि मित्र) — SmartKissan

<div align="center">

### Offline-First Multimodal AI Agricultural Ecosystem & Smart Farm Management Platform

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CI/CD](https://img.shields.io/badge/GitHub%20Actions-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)
![Android APK](https://img.shields.io/badge/Android%20APK-Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Offline AI](https://img.shields.io/badge/Offline%20AI-SmolLM2%20GGUF-FF6F00?style=for-the-badge&logo=huggingface&logoColor=white)

**Empowering Indian Farmers Through Artificial Intelligence, Voice Technology & Offline Accessibility.**

[Features](#-key-features) • [AI Architecture](#-multi-tier-ai-architecture) • [Offline AI](#-dynamic-on-device-offline-ai) • [Tech Stack](#-technology-stack) • [Getting Started](#-getting-started) • [CI/CD](#-cicd-pipeline--apk-build) • [Project Structure](#-project-structure)

</div>

---

## 📖 Overview

**KrishiMitra (SmartKissan)** is a next-generation, farmer-centric mobile AI platform designed to bridge the gap between modern technology and Indian agriculture.

Built using **React Native 0.81.4**, **Expo SDK 54**, and **TypeScript**, KrishiMitra provides an integrated agricultural ecosystem featuring intelligent crop advisories, multimodal plant disease diagnosis, real-time APMC mandi intelligence, hyperlocal weather forecasting, multilingual voice assistance across **7–10 Indian languages**, government scheme discovery, and dynamic on-device AI.

Designed specifically for small and marginal farmers, the platform prioritizes accessibility, affordability, and reliability in rural environments where internet connectivity may be limited, unstable, or completely unavailable. Its hybrid **Cloud + Edge AI architecture** ensures that essential agricultural guidance remains accessible even when farmers are completely offline.

---

## 🎯 Our Mission

To empower farmers with accessible, intelligent, and actionable agricultural information through:

* 🌱 **AI-powered crop health monitoring** and disease diagnosis.
* 🗣️ **Vernacular voice interaction** and card-level text-to-speech accessibility across 7–10 Indian languages.
* 📶 **Offline-first agricultural intelligence** powered by on-device GGUF inference.
* 📊 **Smart mandi pricing** and predictive festival-driven market insights.
* 🌦️ **Hyperlocal weather forecasting** and proactive farm danger alerts.
* 🏛️ **Government agricultural scheme discovery** and direct eligibility assistance.
* 🛒 **Affordable agricultural products** and direct-to-buyer marketplace opportunities.

---

## ✨ Key Features

### 🤖 1. Multi-Tier AI Crop Advisory
An intelligent agricultural assistant that provides personalized farming guidance through conversational AI:
* **Interactive AI Chat:** Real-time consultation covering pest management, organic remedies, fertilizer schedules, irrigation, and seasonal planting recommendations.
* **Multi-Model Intelligence:** Uses Groq-hosted language models and Google Gemini for conversational and multimodal AI capabilities.
* **Multilingual Understanding:** Supports 7–10 Indian languages including Hindi, English, and major regional dialects.
* **Actionable Recommendations:** Provides practical, farmer-friendly answers instead of complex technical jargon.
* **Intelligent Fallback:** Automatically switches between available cloud AI providers and local offline intelligence.

### 📶 2. Dynamic On-Device Offline AI
KrishiMitra includes a lightweight local AI engine designed for agricultural assistance without an active internet connection, powered by **SmolLM2-135M-Instruct (`Q2_K` GGUF)**:
* **Lightweight Model:** Approximately **84 MB**, optimized for resource-constrained mobile devices.
* **On-Demand Download:** Farmers can download the AI model directly from the Profile / Settings screen.
* **Live Download Progress:** Displays real-time download progress while retrieving the model from Hugging Face.
* **Zero Repository Bloat:** Model weights are downloaded dynamically and stored locally rather than bundled into the Git repository.
* **Offline Agricultural Knowledge Base:** Includes curated agricultural information for answering common farming queries without internet access.
* **Automatic Offline Switching:** Activates local AI inference seamlessly when network connectivity becomes unavailable.

### 🎙️ 3. Kisan Vani (किसान वाणी) — Voice Assistant
An accessible, hands-free agricultural assistant that allows farmers to interact with the platform using voice:
* **Speech Recognition:** Voice-driven interaction powered by `expo-speech-recognition`.
* **Text-to-Speech:** Converts AI-generated agricultural recommendations into spoken guidance using `expo-speech`.
* **Multilingual Accessibility:** Designed for vernacular communication across 7–10 Indian languages.
* **Customizable Narration:** Supports configurable speech pitch and speaking rate.
* **Card-Level Audio Readout:** Dedicated speaker controls on every section provide spoken explanations for dashboard info, weather forecasts, crop advisories, mandi insights, and danger alerts.
* **Farmer-Friendly Experience:** Eliminates reading barriers and makes agricultural information effortless to access in the field.

### 🩺 4. Multimodal Crop Disease & Pest Diagnostics
AI-powered plant health analysis using smartphone camera images:
* **Camera & Gallery Integration:** Capture live crop photographs or upload existing images.
* **Computer Vision Analysis:** Analyzes visible plant symptoms to identify diseases such as leaf blight and rust.
* **Disease Diagnosis:** Provides disease identification, root causes, and severity assessment.
* **Organic Treatment Recommendations:** Suggests accessible organic remedies and preventive measures.
* **Chemical Treatment Guidance:** Provides targeted treatment recommendations and safe dosage information.

### 📊 5. Smart Mandi Intelligence & Agricultural Marketplace
Provides farmers with real-time market intelligence to maximize profits and avoid distress selling:
* **Real-Time Mandi Prices:** Track agricultural commodity prices across APMC mandis.
* **Cross-Mandi Comparison:** Compare nearby market rates to identify higher-paying mandis.
* **Festival & Seasonal Demand Intelligence:** Proactively alerts farmers on the dashboard about upcoming festival demand surges (e.g., paddy/dhaan demand) so they hold stock rather than selling at low prices.
* **Direct-to-Buyer Marketplace:** Farmers can publish crop listings with quantity, pricing, and contact information.
* **Integrated Agri-Store:** Discover and purchase certified seeds, fertilizers, and farming equipment at affordable rates.

### ⛅ 6. Hyperlocal Weather & Proactive Farm Alerts
Provides weather intelligence tailored to the farmer's exact GPS location:
* **GPS-Based Weather:** Uses OpenWeatherMap API for localized weather tracking.
* **Weather Monitoring:** Displays temperature, humidity, wind speed, and rainfall probability.
* **Severe Weather & Danger Alerts:** Proactive warnings for heatwaves, frost, pest outbreaks, and heavy rainfall.
* **Crop-Specific Daily Advisory:** Weather-informed guidance for irrigation, spraying, and harvesting schedules.
* **Voice Notifications:** Makes critical weather and danger alerts accessible via native spoken audio.

### 🏛️ 7. Government Scheme Eligibility & Assistance
Helps farmers discover agricultural welfare schemes and apply directly:
* **Farmer Profile-Based Matching:** Automatically identifies eligible central and state government agricultural schemes based on farmer data.
* **Eligibility Assistance:** Breaks down scheme benefits and eligibility criteria in simple local language.
* **Direct Application Links:** Embeds direct links to official government portals right inside the app.

### 👨‍🌾 8. Farmer Profile, Community & Gamification
A personalized farming dashboard that encourages continuous engagement:
* **Farm Activity Tracking:** Monitor advisory requests, crop health checks, marketplace activity, and community participation.
* **Achievements & Badges:** Unlock milestones such as *Soil Champion*, *Organic Pioneer*, and *Smart Farmer*.
* **Farmer Community:** Share knowledge, farming experiences, questions, and practical solutions.

---

## 🧠 Multi-Tier AI Architecture

KrishiMitra implements a **four-tier AI fallback hierarchy** designed to maintain uninterrupted agricultural assistance across unstable networks and AI provider outages.

### AI Inference Flow

```text
                 ┌───────────────────────────────┐
                 │       FARMER USER QUERY       │
                 │   Text / Voice / Crop Image   │
                 └───────────────┬───────────────┘
                                 │
                     INTERNET CONNECTIVITY?
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                   YES                        NO
                    │                         │
                    ▼                         │
        ┌──────────────────────────┐          │
        │ TIER 1: GROQ             │          │
        │ openai/gpt-oss           │          │
        └────────────┬─────────────┘          │
                     │                        │
             Failure / Rate Limit             │
                     │                        │
                     ▼                        │
        ┌──────────────────────────┐          │
        │ TIER 2: GROQ             │          │
        │ Qwen Model               │          │
        └────────────┬─────────────┘          │
                     │                        │
              Provider Failure                │
                     │                        │
                     ▼                        │
        ┌──────────────────────────┐          │
        │ TIER 3: GOOGLE GEMINI    │          │
        │ Flash / Multimodal AI    │          │
        └────────────┬─────────────┘          │
                     │                        │
              Network Failure                 │
                     │                        │
                     └────────────┬───────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ TIER 4: ON-DEVICE AI     │
                    │                          │
                    │ SmolLM2 Q2_K GGUF        │
                    │ Offline Agricultural KB  │
                    │ Local Inference Engine   │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   FARMER-FRIENDLY ANSWER │
                    │    Text / Voice Output   │
                    └──────────────────────────┘
```

### Hybrid Edge-Cloud Responsibilities

| Component | Responsibility |
| :--- | :--- |
| **Cloud AI** | Advanced conversational and agricultural reasoning |
| **Groq Models** | Ultra-low-latency conversational inference |
| **Google Gemini** | Multimodal crop image analysis and AI fallback |
| **Edge AI** | On-device local inference without internet connectivity |
| **Agricultural Knowledge Base** | Curated offline agricultural information and remedies |
| **Voice Engine** | Speech recognition (ASR) and spoken responses (TTS) in 7–10 languages |
| **Local Storage** | Offline GGUF model files, cached data, and application state |

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    MOBILE CLIENT                             │
│                  React Native + Expo                         │
│                                                              │
│   Camera / Gallery    Voice Assistant    Dashboard           │
│   Crop Diagnostics    Kisan Vani         Weather / Market    │
│   Farmer Profile      Agri-Store         Community           │
└────────────────────────────┬─────────────────────────────────┘
                             │
                  NETWORK CONNECTIVITY CHECK
                             │
                ┌────────────┴────────────┐
                │                         │
          ONLINE / LOW BW            OFFLINE / NO SIGNAL
                │                         │
                ▼                         ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│     CLOUD AI LAYER       │  │       EDGE AI LAYER           │
│                          │  │                               │
│ Groq Conversational AI   │  │ SmolLM2 GGUF Model            │
│ Google Gemini            │  │ Local Inference Engine        │
│ Multimodal Vision        │  │ Offline Agricultural KB       │
│ Weather APIs             │  │ Cached Agricultural Data      │
│ Mandi Market Feeds       │  │ Offline Advisory Engine       │
│ Government Scheme Data   │  │                               │
└─────────────┬────────────┘  └──────────────┬────────────────┘
              │                              │
              └──────────────┬───────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │   FARMER ADVISORY UI   │
                 │  Text / Voice / Alerts │
                 └────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | React Native `0.81.4`, Expo `SDK 54` |
| **Programming Languages** | TypeScript `5.x`, JavaScript `ESNext` |
| **Navigation** | Expo Router `v6` |
| **UI & Styling** | NativeWind, TailwindCSS |
| **Icons & Components** | Lucide React, `@expo/vector-icons` |
| **Voice Recognition** | `expo-speech-recognition` |
| **Text-to-Speech** | `expo-speech` |
| **Audio Support** | `expo-av` |
| **Cloud AI Inference** | Groq SDK / REST API (`openai/gpt-oss`, `Qwen`) |
| **Multimodal AI** | Google Gemini API |
| **Offline AI Model** | `SmolLM2-135M-Instruct` (`Q2_K` GGUF) |
| **Model Hosting** | Hugging Face |
| **Local Storage** | `@react-native-async-storage/async-storage` |
| **File Management** | `expo-file-system/legacy` |
| **Weather Services** | OpenWeatherMap API |
| **Build System** | EAS CLI |
| **CI/CD** | GitHub Actions (`Ubuntu 24.04`, `Node.js 22`, `OpenJDK 17`) |

---

## 📂 Project Structure

```bash
KrishiMitra/
│
├── .github/
│   └── workflows/
│       └── react-native-cicd.yml
│
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── Advisory.tsx
│   │   ├── Community.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Market.tsx
│   │   └── Store.tsx
│   │
│   ├── _layout.tsx
│   ├── index.tsx
│   └── SignIn.tsx
│
├── assets/
│   └── Fonts, Icons & Splash Screens
│
├── components/
│   ├── Advisory/
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   └── MessageList.tsx
│   │
│   ├── Dashboard/
│   │   ├── WeatherCard.tsx
│   │   ├── CropHealthCard.tsx
│   │   └── AdvisoryCard.tsx
│   │
│   ├── models/
│   │   └── ProfileModel.tsx
│   │
│   ├── Narrator/
│   │
│   └── VoiceAssistant/
│       └── KisanVaniModal.tsx
│
├── services/
│   ├── AIService.ts
│   ├── GeminiService.ts
│   ├── NarratorService.ts
│   └── OfflineModelService.ts
│
├── app.json
├── eas.json
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to set up **KrishiMitra** locally.

### Prerequisites
Ensure the following tools are installed:
* **Node.js:** `v22.x` or higher
* **Package Manager:** Yarn (recommended) or npm
* **Java Development Kit:** OpenJDK 17
* **Android Studio:** For Android emulator and local Android builds
* **Git:** For repository cloning

### 1. Clone the Repository

```bash
git clone https://github.com/Upiottxat/KrishiMitra.git
cd KrishiMitra
```

### 2. Install Dependencies

Using Yarn:
```bash
yarn install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

Create your environment file using the provided example:
```bash
cp .env.example .env
```

Add your API credentials:
```env
NODE_VERSION=22

EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

> **Important:** Never commit your actual API keys or `.env` file to a public repository. For GitHub Actions builds, configure the required secrets under **GitHub Repository → Settings → Secrets and variables → Actions**.

### 4. Start the Development Server

```bash
# Start Expo development server
yarn start

# Run on Android
yarn android

# Run on Web
yarn web
```

---

## 📶 Dynamic On-Device Offline AI

KrishiMitra supports standalone on-device agricultural intelligence without bundling large model weights into the APK or Git repository.

### Offline AI Model Specifications

| Specification | Details |
| :--- | :--- |
| **Model** | `SmolLM2-135M-Instruct` |
| **Format** | GGUF |
| **Quantization** | `Q2_K` |
| **Approximate Size** | `84 MB` |
| **Hosting** | Hugging Face |
| **Storage** | Device-local application storage |
| **Inference** | On-device |
| **Connectivity** | No internet required after model download |

### How to Activate Offline AI
1. Open the **KrishiMitra** application.
2. Navigate to the **Profile / Settings** section.
3. Locate the **ऑफ़लाइन AI मॉडल (Offline AI Model)** card.
4. Tap **मॉडल डाउनलोड करें (Download Model)**.
5. Monitor the live download progress indicator.
6. Once downloaded, the app automatically switches to local GGUF inference whenever internet connectivity drops.

<details>
<summary><b>How Offline AI Works Under the Hood</b></summary>

1. The application continuously monitors network connectivity state.
2. When internet access is available, Tier 1–3 cloud AI providers handle requests.
3. When connectivity is lost (or in Airplane Mode), `OfflineModelService.ts` routes queries to the local inference pathway.
4. The downloaded `SmolLM2` GGUF model processes supported queries on-device.
5. The curated offline agricultural knowledge base supplements responses with verified domain-specific remedies.

*Note: A one-time model download is required before using the standalone local model offline.*
</details>

---

## 📱 APK Installation & Demo

KrishiMitra provides automated Android APK builds through its GitHub Actions CI/CD workflow.

### Installation Steps
1. Open the [KrishiMitra GitHub Actions](https://github.com/Upiottxat/KrishiMitra/actions) page.
2. Select the latest successful **React Native CI/CD** workflow run.
3. Navigate to the **Artifacts** section and download `app-builds`.
4. Extract the APK and install it on any Android device (**Android 8.0+**).

### Feature Demonstration Guide

| Feature | How to Test |
| :--- | :--- |
| **AI Crop Advisory** | Open **Advisory** and submit any farming or pest control question |
| **Kisan Vani** | Activate the voice assistant modal and speak a query in your native language |
| **Text-to-Speech** | Tap speaker icons on any dashboard card to hear spoken guidance |
| **Crop Diagnosis** | Capture or upload a crop leaf photograph for disease detection |
| **Mandi Intelligence** | Open **Market** to view APMC commodity prices and festival demand alerts |
| **Weather & Alerts** | Open **Dashboard** to view GPS-based local weather and danger alerts |
| **Offline AI** | Download the GGUF model, turn on **Airplane Mode**, and submit a query |
| **Farmer Community** | Open **Community** to explore farmer discussions and badges |
| **Agri-Store** | Open **Store** to browse affordable seeds, fertilizers, and tools |

---

## 🏗️ CI/CD Pipeline & APK Build

KrishiMitra includes an automated CI/CD pipeline using **GitHub Actions** and **Expo Application Services (EAS CLI)**.

### Pipeline Configuration

| Configuration | Details |
| :--- | :--- |
| **Workflow** | `.github/workflows/react-native-cicd.yml` |
| **CI Platform** | GitHub Actions |
| **Runner** | `Ubuntu 24.04` |
| **Node.js** | `v22` |
| **Java** | `Temurin OpenJDK 17` |
| **Build System** | EAS CLI |
| **Build Profile** | `production-apk` |
| **Output** | Android APK (`app-prod.apk`) |
| **Artifact** | `app-builds` |

### Triggering an Automated Build
1. Push your changes to the `main` branch (or trigger manually via **Actions → React Native CI/CD → Run workflow**).
2. Select the `prod-apk` build option and start the workflow.
3. Download the generated `app-prod.apk` from the workflow summary and artifacts.

---

## 🔐 Permissions & Native Capabilities

| Permission | Purpose |
| :--- | :--- |
| `CAMERA` | Capturing crop photographs for multimodal disease diagnosis |
| `RECORD_AUDIO` | Voice input and Kisan Vani speech recognition |
| `ACCESS_FINE_LOCATION` | GPS-based hyperlocal weather and regional mandi data |
| `INTERNET` | Cloud AI inference, weather/mandi APIs, and GGUF model downloads |
| `FOREGROUND_SERVICE` | Supporting reliable background operations such as model downloads |

---

## 🌱 Future Scope

* **Expanded Indic Language Coverage:** Extending speech and NLP pipelines to additional regional dialects.
* **Advanced Crop Disease Detection:** Scaling computer vision models to cover more crops, pests, and soil deficiencies.
* **Predictive Mandi Analytics:** Enhancing price forecasting using multi-year historical market trends and festival demand cycles.
* **Smart Government Scheme Discovery:** Expanding automated eligibility matching across all central and state portals.
* **Offline Data Synchronization:** Seamless background sync of cached advisories and mandi prices once connectivity returns.
* **IoT Sensor Integration:** Connecting soil moisture sensors and smart weather stations directly to the farmer dashboard.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are always welcome!

1. **Fork** the repository.
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add AmazingFeature"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request** describing your improvements.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🏆 Recognition

**KrishiMitra (SmartKissan)** — **1st Prize Winner**, Internal College Hackathon.  
An initiative dedicated to bringing intelligent, offline-capable, and vernacular agricultural technology to Indian farmers.

<div align="center">

### 🌾 Made with ❤️ for Indian Farmers
**KrishiMitra — खेती का साथी, किसान का मित्र।**  
*Empowering Farmers. Enabling Smarter Agriculture. Building a Better Tomorrow.*

</div>
