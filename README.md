# 🌾 KrishiMitra (कृषि मित्र) — SmartKissan

<div align="center">

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Upiottxat/KrishiMitra/actions)
[![Build](https://img.shields.io/badge/Android%20APK-Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Upiottxat/KrishiMitra/actions)
[![Offline AI](https://img.shields.io/badge/Offline%20AI-SmolLM2%20GGUF-FF6F00?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/unsloth/SmolLM2-135M-Instruct-GGUF)

**Next-Generation AI Agricultural Companion & Farm Management Platform for Farmers**

[Features](#-key-features) • [AI Architecture](#-multi-tier-ai-architecture) • [Offline AI](#-dynamic-on-device-offline-ai) • [Getting Started](#-getting-started) • [CI/CD](#-cicd-pipeline--apk-build) • [Project Structure](#-project-structure)

</div>

---

## 📖 Overview

**KrishiMitra (SmartKissan)** is an intelligent, farmer-centric mobile application designed to bridge technology and agriculture. Built using **React Native (New Architecture)** and **Expo SDK 54**, the platform provides actionable crop advisories, multimodal plant disease detection, real-time APMC mandi prices, hyper-local weather alerts, hands-free voice assistance (**Kisan Vani**), and **offline AI intelligence** for remote rural fields with limited or zero internet connectivity.

---

## ✨ Key Features

### 🤖 1. Multi-Tier AI Crop Advisory
- **Interactive Chat Assistant**: Real-time consultation covering pest control, organic remedies, fertilizer schedules, and seasonal planting tips.
- **Multilingual Understanding**: Seamlessly understands and responds in Hindi, English, and regional dialects.
- **Farmer-Friendly UI**: Clean, non-technical status badges (`🟢 ऑनलाइन AI सक्रिय` / `📶 ऑफ़लाइन AI`) designed specifically for ease of use.

### 📶 2. Dynamic On-Device Offline AI
- **SmolLM2-135M-Instruct (Q2_K GGUF)**: Lightweight ~84 MB model optimized for resource-constrained mobile hardware.
- **On-Demand Download**: Downloadable with one click directly from the **Settings / Profile** screen featuring a live progress bar.
- **Zero Repo Bloat**: Weights are fetched dynamically at runtime via Hugging Face and stored locally via `expo-file-system`, keeping the Git repository lightweight.
- **Offline Agricultural Database**: Embedded expert knowledge base for instant answers when internet access is unavailable.

### 🎙️ 3. Kisan Vani (किसान वाणी — Voice Assistant)
- **Hands-Free Operation**: Voice-driven conversational assistant powered by `expo-speech-recognition`.
- **Text-to-Speech (TTS) Narration**: Reads answers aloud via `expo-speech` with customizable pitch and rate, enabling accessible advisory for illiterate or busy farmers working in fields.

### 🩺 4. Crop Health & Disease Diagnosis
- **Visual Plant Diagnosis**: Capture crop photos with the built-in camera or upload from the gallery.
- **Multimodal AI Analysis**: Analyzes plant leaf symptoms and diagnoses diseases, providing cause, severity, organic solutions, and chemical treatments.

### 📊 5. Real-Time Mandi Prices & Market
- **Live Mandi Rates**: Track daily commodity rates across agricultural mandis.
- **Direct-to-Buyer Selling**: Post crop harvest listings with pricing, quantity, and contact options.
- **Farmer Store**: Purchase agricultural inputs, certified seeds, organic fertilizers, and farm equipment.

### ⛅ 6. Hyper-Local Weather Forecast
- **GPS-Based Weather**: Powered by OpenWeatherMap API for live temperature, humidity, wind speed, and rain probability.
- **Actionable Farm Alerts**: Timely guidance on optimal spraying, harvesting, and irrigation windows based on upcoming weather.

### 👨‍🌾 7. Farmer Profile & Gamification
- **Farm Tracking**: View progress statistics (Advisories requested, Health checks completed, Store orders, Community posts).
- **Achievements & Badges**: Unlock milestones like *Soil Champion*, *Organic Pioneer*, and *Smart Farmer*.

---

## 🧠 Multi-Tier AI Architecture

KrishiMitra implements a 4-tier fault-tolerant AI fallback hierarchy:

```
                  ┌───────────────────────────────┐
                  │      Farmer User Query        │
                  └──────────────┬────────────────┘
                                 │
                     Internet Connected?
                     ├── YES ──┐
                     │         │
                     │  ┌──────▼──────────────────────────┐
                     │  │ Tier 1: Groq (openai/gpt-oss)   │
                     │  └──────┬──────────────────────────┘
                     │         │ (Failure / Rate-limit Fallback)
                     │  ┌──────▼──────────────────────────┐
                     │  │ Tier 2: Groq (qwen/qwen3.8-27b) │
                     │  └──────┬──────────────────────────┘
                     │         │ (Failure / Multimodal Vision Fallback)
                     │  ┌──────▼──────────────────────────┐
                     │  │ Tier 3: Google Gemini Flash     │
                     │  └──────┬──────────────────────────┘
                     │         │ (Network Drop / Offline)
                     └── NO ───┤
                               │
                        ┌──────▼──────────────────────────┐
                        │ Tier 4: On-Device Offline AI    │
                        │ - SmolLM2 Q2 GGUF Engine        │
                        │ - Agricultural Knowledge Base   │
                        └─────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [React Native 0.81.4](https://reactnative.dev/) (New Architecture), [Expo SDK 54](https://expo.dev/) |
| **Routing & Navigation** | [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Languages** | [TypeScript](https://www.typescriptlang.org/), JavaScript (ESNext) |
| **Styling & Components**| [NativeWind / TailwindCSS](https://www.nativewind.dev/), [Lucide React](https://lucide.dev/), `@expo/vector-icons` |
| **Voice & Speech** | `expo-speech`, `expo-speech-recognition`, `expo-av` |
| **Storage & File System**| `@react-native-async-storage/async-storage`, `expo-file-system/legacy` |
| **AI Models & SDKs** | Groq SDK / REST, `@google/generative-ai`, Hugging Face SmolLM2-135M GGUF |
| **Build & CI/CD** | [EAS CLI](https://docs.expo.dev/eas/), GitHub Actions (Ubuntu 24.04, Node 22, OpenJDK 17) |

---

## 📂 Project Structure

```bash
KrishiMitra/
├── .github/
│   └── workflows/
│       └── react-native-cicd.yml   # Automated GitHub Actions CI/CD pipeline
├── app/                            # Expo Router file-based pages
│   ├── (tabs)/                     # Tab navigation screens
│   │   ├── _layout.tsx             # Bottom tab bar configuration
│   │   ├── Advisory.tsx            # AI Chat consultation screen
│   │   ├── Community.tsx           # Farmer community forum & discussion
│   │   ├── Dashboard.tsx           # Home dashboard with quick actions
│   │   ├── Market.tsx              # Live Mandi rates & crop marketplace
│   │   └── Store.tsx               # Agricultural equipment & input store
│   ├── _layout.tsx                 # Root layout & providers
│   ├── index.tsx                   # Splash / onboarding entry screen
│   └── SignIn.tsx                  # Authentication screen
├── assets/                         # Fonts, icons, and splash screens
├── components/                     # Reusable UI components
│   ├── Advisory/                   # ChatHeader, ChatInput, MessageList
│   ├── Dashboard/                  # WeatherCard, CropHealthCard, AdvisoryCard
│   ├── models/
│   │   └── ProfileModel.tsx        # Farmer profile, stats, achievements & Offline AI manager
│   ├── Narrator/                   # Speech synthesizer audio controls
│   └── VoiceAssistant/
│       └── KisanVaniModal.tsx      # Hands-free voice assistant modal
├── services/                       # Application business logic & APIs
│   ├── AIService.ts                # Multi-tier AI orchestrator (Groq + Gemini + Offline)
│   ├── GeminiService.ts            # Multimodal vision & diagnosis service
│   ├── NarratorService.ts          # Native speech synthesis manager
│   └── OfflineModelService.ts      # SmolLM2 GGUF dynamic download & local inference
├── app.json                        # Expo configuration & native permissions
├── eas.json                        # EAS build profiles (production-apk, preview, dev)
└── package.json                    # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v22.x` or higher
- **Package Manager**: `yarn` (recommended) or `npm`
- **Java Development Kit**: OpenJDK `17` (required for Android local builds)
- **Expo Go App** (on physical Android/iOS device) or **Android Studio Emulator**

### 1. Clone the Repository

```bash
git clone https://github.com/Upiottxat/KrishiMitra.git
cd KrishiMitra
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env` and insert your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_VERSION=22
EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

> **Note**: For GitHub Actions automated CI builds, configure these keys under **Repository Settings → Secrets and variables → Actions**.

### 4. Run the Development Server

```bash
# Start Metro bundler
yarn start

# Run on Android emulator / connected device
yarn android

# Run on Web browser
yarn web
```

---

## 📶 Dynamic On-Device Offline AI

KrishiMitra supports standalone on-device intelligence without preloading heavy model weights into the APK or Git repository:

1. Open the app and tap the **Profile / Settings** icon in the header.
2. Scroll to the **ऑफ़लाइन AI मॉडल (Offline AI)** card.
3. Tap **मॉडल डाउनलोड करें (Download Model)**.
4. The app streams the **SmolLM2-135M-Instruct-Q2_K.gguf** (~84 MB) directly from Hugging Face into device sandbox storage.
5. Once downloaded, the app activates offline AI inference automatically whenever connectivity drops.

---

## 🏗️ CI/CD Pipeline & APK Build

The project includes an enterprise-grade automated CI/CD pipeline configured with **GitHub Actions** and **EAS CLI**:

- **Workflow File**: `.github/workflows/react-native-cicd.yml`
- **Runner Environment**: Ubuntu with **Node 22** and **Temurin OpenJDK 17**
- **Production Profile**: `production-apk` builds a standalone release APK without Expo development client overhead.
- **Artifact Upload**: Generates and uploads `app-prod.apk` under GitHub Actions Artifacts (`app-builds`).

### Triggering a Build:
1. Push to the `main` branch.
2. Go to **Actions → React Native CI/CD → Run workflow**.
3. Select `prod-apk` and click **Run workflow**.
4. Download the generated `app-prod.apk` directly from the workflow summary!

---

## 📜 Permissions & Native Capabilities

| Permission | Purpose |
|---|---|
| `CAMERA` | Taking crop photos for instant disease detection |
| `RECORD_AUDIO` | Voice commands and speech input for Kisan Vani |
| `ACCESS_FINE_LOCATION` | Hyper-local weather forecasting and regional mandi rates |
| `INTERNET` | Cloud AI API communication & model streaming |
| `FOREGROUND_SERVICE` | Reliable background download for the offline AI model |

---

## 🤝 Contributing

Contributions are warmly welcomed! Please feel free to open an issue or submit a pull request:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Made with ❤️ for Indian Farmers 🌾</sub>
</div>
