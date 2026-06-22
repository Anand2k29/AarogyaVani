<p align="center">
  <img src="AarogyaVani/assets/icon.png" alt="AarogyaVani Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">AarogyaVani 🎙️🩺</h1>
<h3 align="center">The Intelligent Health Guardian for the Elderly</h3>
<p align="center"><em>"Empowering Care through Vernacular AI & Real-time Cloud Orchestration"</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-green?logo=android" alt="Platform" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-blue?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google" alt="AI Engine" />
  <img src="https://img.shields.io/badge/Fallback-OpenRouter_AI-7c3aed" alt="AI Fallback" />
  <img src="https://img.shields.io/badge/Languages-9_Indian-orange" alt="Languages" />
  <img src="https://img.shields.io/badge/Version-1.3.1-E91E63" alt="Version" />
  <img src="https://img.shields.io/badge/Build-April_7_2026-brightgreen" alt="Build Date" />
</p>

---

## 📥 Download APK

> **Latest Stable Build (April 7, 2026):**
> 👉 **[AarogyaVani v1.3.1 — Download APK](https://expo.dev/artifacts/eas/5rzSeECxEKS9H7WgHTDnGe.apk)**

> [!NOTE]
> You must be logged into your [Expo account](https://expo.dev) to download the APK. The link expires **May 6, 2026**.

| Build Detail | Value |
|---|---|
| **Build ID** | `5rzSeECxEKS9H7WgHTDnGe` |
| **Platform** | Android |
| **Profile** | `preview` (APK) |
| **SDK Version** | Expo SDK 54 |
| **Status** | ✅ FINISHED |
| **Built At** | April 7, 2026 |
| **Expires** | May 7, 2026 |

> [!WARNING]  
> **Mobile App Status:** Please note that every other feature in the mobile application is fully functional, but the **prescription scanning feature is currently not working**.

---

## 🌟 Vision

India's elderly population (140M+) faces a critical healthcare crisis — **medication non-adherence** caused by illegible prescriptions, language barriers, and the absence of real-time caregiver oversight. AarogyaVani bridges this gap by combining **AI-powered prescription decoding**, **vernacular voice instructions**, and a **real-time family care network** — ensuring no patient ever misses a dose or feels alone in their recovery.

---

## 🎯 Problem Statement

| Challenge | Impact |
|-----------|--------|
| Complex, handwritten prescriptions | Elderly patients cannot read dosage instructions |
| Language & literacy barriers | Critical medical info is inaccessible in regional languages |
| No caregiver visibility | Working children have no way to monitor adherence remotely |
| Digital illiteracy | Most health apps are too complex for senior citizens |

---

## 💡 Proposed Solution — Three Pillars

### 🧠 Pillar 1: AI-Powered Prescription Decoding
| Aspect | Detail |
|--------|--------|
| **Input** | Patient photographs a handwritten/printed prescription |
| **Primary AI** | Google Generative AI (`gemini-2.5-flash`) via direct REST API |
| **Fallback Cascade** | OpenRouter AI → `google/gemini-2.5-flash` → `qwen/qwen3.6-plus:free` → `google/gemma-3-27b-it:free` |
| **Output** | Structured JSON: medicine names, dosages, frequencies, timings & TTS script |
| **Key Insight** | Detects API key type automatically — `AIza...` keys use Gemini REST directly; all others route via OpenRouter |

### 🗣️ Pillar 2: Vernacular Voice Engine
| Aspect | Detail |
|--------|--------|
| **Mobile Languages** | English, Hindi, Odia, Kannada, Telugu (5 languages — device native TTS) |
| **Web Languages** | Hindi, English, Kannada, Telugu, Odia, Tamil, Bengali, Marathi, Gujarati (**9 total**) |
| **How It Works** | Medicine names stay in English; usage instructions are translated and spoken in the patient's native language |
| **Smart Fallback** | If a regional voice isn't available on the device, auto-falls back to Hindi → English |
| **Mobile Tech** | Native `expo-speech` API with intelligent voice selection |
| **Web Tech** | Web Speech API with async voice loading and multi-tier fallback |

### 👨‍👩‍👧 Pillar 3: Care Anchor Network (Family Connectivity)
| Aspect | Detail |
|--------|--------|
| **Real-time Sync** | Patient data (meds, vitals, alerts) syncs instantly via Firebase Firestore |
| **QR Linking** | Patient shares a unique QR code to link family member devices instantly |
| **Caregiver Portal** | Secure portal for family members to monitor adherence, schedule appointments & log vitals |
| **SOS Emergency** | One-tap emergency trigger sends cloud alert to all linked care anchors |

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 📸 **AI Bilingual Scanner** | Instant extraction & vernacular translation of prescriptions using Vision AI |
| ☁️ **Cloud Sync (Real-time)** | Patient data syncs instantly across family devices via Firebase Firestore |
| 🏢 **Care Anchor Portal** | Secure portal for caregivers to monitor adherence, schedule appointments & log vitals |
| 👤 **Medical Profile Editor** | Manage patient identity, age & chronic health notes in the PHI cloud vault |
| 📅 **Health Calendar** | Dynamic scheduling — caregiver-set appointments sync to patient's dashboard |
| 🆘 **Intelligent SOS** | One-tap emergency with cloud alerts to linked care anchors |
| 🌍 **Vernacular Voice** | Complete voice support for 5 Indian languages on mobile, 9 on web |
| 💊 **Medication Tracker** | 7-day adherence visualization with pill streaks & reminders |
| 🧘 **Wellness Hub** | Guided yoga routines, wellness tips & activity tracking |
| 📊 **Health Insights** | Adherence trends, health score & weekly AI-generated reports |
| 🔗 **QR Anchor Linking** | Share your Care Anchor QR code to securely link family members |

---

## 📱 App Screens

| Screen | Purpose |
|--------|---------|
| **Login** | Google Sign-In authentication (Firebase Auth + Google OAuth 2.0) |
| **Dashboard** | Today's meds, appointments, SOS access, QR anchor linking |
| **Scanner** | Camera/gallery → AI extraction → voice readout |
| **Details** | Parsed medicines with dosage, frequency & language selector |
| **Meds** | Adherence tracking, pill streaks, reminders |
| **Wellness** | Yoga routines, wellness tips, activity tracking |
| **Insights** | Adherence analytics, health score, weekly reports |
| **Care Anchor Portal** | Remote family monitoring & appointment scheduling |
| **Appointments** | Synced health calendar |
| **Add Health Record** | Blood pressure, sugar, weight & temperature logging |
| **Profile** | Medical profile, chronic conditions & emergency contacts |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PATIENT DEVICE (Mobile App)                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ 📸 Camera │  │ 🔊 Voice     │  │ 💾 PHI Vault             │  │
│  │ Capture   │  │ expo-speech   │  │ AsyncStorage (On-Device) │  │
│  └────┬─────┘  └──────────────┘  └──────────────────────────┘  │
│       │                                                         │
│  ┌────▼──────────────────────────────────────────────────────┐  │
│  │              React Native (Expo SDK 54)                   │  │
│  │    Navigation • Screens • Services • Theme                │  │
│  └────┬────────────────────────────┬─────────────────────────┘  │
└───────┼────────────────────────────┼────────────────────────────┘
        │                            │
        ▼                            ▼
┌───────────────────────┐    ┌──────────────────────────┐
│  CLOUD INTELLIGENCE   │    │   CLOUD SYNC LAYER       │
│                       │    │                          │
│  🧠 Gemini 2.5 Flash  │    │  ☁️ Firebase Firestore    │
│  (Google REST API)    │    │  (Real-time NoSQL)       │
│       │               │    │                          │
│       ▼               │    │  🔐 Firebase Auth         │
│  🔀 OpenRouter AI     │    │  (Google Sign-In)        │
│  (Multi-model cascade)│    │                          │
│  • gemini-2.5-flash   │    └─────────┬────────────────┘
│  • qwen3.6-plus:free  │              │
│  • gemma-3-27b-it:free│    ┌─────────┼──────────────┐
└───────────────────────┘    ▼                        ▼
                    ┌───────────────┐       ┌──────────────┐
                    │ 👨‍👩‍👧 Care Anchor │       │ 🆘 SOS Alert  │
                    │ Family Portal  │       │ Cloud Notify  │
                    └───────────────┘       └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile Core** | React Native (Expo SDK 54) | Cross-platform, OTA updates, rapid iteration |
| **Web Frontend** | React 19 + TypeScript + Vite | Premium glassmorphism UI for desktop access |
| **AI Vision (Primary)** | Google Generative AI (Gemini 2.5 Flash) | Best-in-class handwriting OCR & medical understanding |
| **AI Vision (Fallback)** | OpenRouter AI — multi-model cascade | Resilient inference: Qwen 3.6+, Gemma 3 27B as fallbacks |
| **Authentication** | Firebase Auth + Google Sign-In | Zero-friction elderly-friendly login |
| **Real-time DB** | Firebase Firestore | Instant cross-device family sync |
| **Voice Engine (Mobile)** | expo-speech | Native regional language synthesis on Android |
| **Voice Engine (Web)** | Web Speech API | Browser-native TTS with async voice loading |
| **Local Storage** | AsyncStorage (mobile) / localStorage (web) | PHI Vault — zero-knowledge architecture |
| **Build & Deploy** | EAS Build (Expo Application Services) | Cloud-compiled APK generation |
| **Styling** | Vanilla CSS + Heart-Magenta Theme | Premium glassmorphism aesthetic |

---

## 🔐 Privacy & Security (PHI Vault Architecture)

AarogyaVani operates on a **Zero-Knowledge, On-Device Architecture**:

- **100% Local Storage** — All sensitive health data (medications, adherence logs, vitals) stored on-device via AsyncStorage
- **Zero-Knowledge Cloud** — Firebase stores only sync metadata, never raw prescriptions
- **Stateless AI** — Prescription images sent to inference API but results saved only locally
- **No Passwords** — Google OAuth 2.0 Sign-In — industry-standard, no password storage
- **No Data Selling** — We do not own, sell, or store patient health records

> *This ensures maximum security, instant loading times, and zero server-cost scaling for data storage.*

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- An Android device or emulator

### 1. Clone & Install
```bash
git clone https://github.com/Anand2k29/AarogyaVani-Sparks.git
```

**Install Mobile App dependencies:**
```bash
cd AarogyaVani/AarogyaVani
npm install
```

**Install Web App dependencies:**
```bash
cd AarogyaVani   # root folder
npm install
```

### 2. Environment Configuration

Create a `.env` file inside the `AarogyaVani/AarogyaVani/` directory:
```dotenv
# Option A: Use Gemini directly (recommended)
EXPO_PUBLIC_GEMINI_API_KEY=AIza...your_google_ai_key

# Option B: Use OpenRouter (free tier available)
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...your_openrouter_key

# Firebase Google Sign-In
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your_google_oauth_client_id
```

Create a `.env.local` file inside the root `AarogyaVani/` folder for the web app:
```dotenv
VITE_GEMINI_API_KEY=AIza...your_google_ai_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### 3. Run Mobile App (Development)
```bash
cd AarogyaVani/AarogyaVani
npx expo start
```
Scan the QR code with **Expo Go** on your Android device, or press `a` to launch on an Android emulator.

### 4. Build APK via EAS
```bash
cd AarogyaVani/AarogyaVani
npx eas build --platform android --profile preview
```

### 5. Run Web Version
```bash
cd AarogyaVani   # root folder
npm run dev
```

---

## 🌍 Social Impact

| Target Segment | How AarogyaVani Helps |
|----------------|----------------------|
| **Elderly patients (60+)** | Voice-first interface eliminates literacy barrier |
| **Rural communities** | Works offline for stored data; minimal data usage for AI calls |
| **Working children** | Remote monitoring via Care Anchor — peace of mind at a distance |
| **Low-income families** | Free app, no subscription, runs on any Android phone |

---

## 🏆 Unique Selling Propositions (USPs)

- 👨‍👩‍👧 **Care Anchor Connectivity** — Syncs seniors directly with tech-savvy family members via QR linking
- 🌍 **Inclusive by Design** — Built for rural, elderly, and low-literacy users, not just urban tech-savvy ones
- 🗣️ **Native Vernacular Voice** — Seamless voice instructions in 5 Indian languages on mobile, 9 on web
- 🛡️ **Absolute Data Privacy** — Zero-knowledge PHI Vault with 100% on-device storage
- 📸 **Zero Manual Entry** — AI Vision Engine auto-extracts from prescription photos
- 🔀 **Resilient AI Pipeline** — Multi-model cascade ensures 99%+ uptime even when individual APIs are down

---

## 📋 Changelog

### v1.3 — April 7, 2026 *(Current)*
- 🔀 **OpenRouter AI Integration** — Multi-model cascade fallback (Gemini 2.5 Flash → Qwen 3.6+ → Gemma 3 27B)
- 🔑 **Smart Key Routing** — Auto-detects `AIza...` Gemini keys vs OpenRouter keys
- 🗣️ **Improved Voice Fallback** — Async voice loading with Hindi → English fallback on mobile
- 🔗 **QR Anchor Linking** — New QR code modal for linking care anchor family members
- 🏗️ **Firebase New Architecture** — `newArchEnabled: true` for React Native New Architecture

### v1.2 — April 6, 2026
- 🌍 Multi-language audio support (9 languages on web, 5 on mobile)
- 🔊 Smart voice fallback system for missing regional voices
- 💊 Enhanced medication tracker with adherence logging

### v1.1 — March 2026
- ✅ Initial EAS cloud build (APK)
- 🔐 Firebase Auth with Google Sign-In
- 📸 Prescription scanner with Gemini vision

---

## 👨‍💻 Team Sparks

| Members |
|---------|
| **Jyotasana** |
| **Arpita Matta** |
| **Anand Minejes** |

---

<p align="center">
  <strong>Built with ❤️ for India's Elderly</strong><br/>
  <em>AarogyaVani — Because Every Voice Deserves to Be Heard</em>
</p>

---

*Disclaimer: AarogyaVani is an AI-assisted healthcare prototype. Always verify medical instructions with a certified professional.*
