<p align="center">
  <img src="AarogyaVani/assets/icon.png" alt="AarogyaVani Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">AarogyaVani 🎙️🩺</h1>
<h3 align="center">The Intelligent Health Guardian for the Elderly</h3>
<p align="center"><em>"Empowering Care through Vernacular AI & Real-time Cloud Orchestration"</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-green?logo=android" alt="Platform" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-blue?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google" alt="AI Engine" />
  <img src="https://img.shields.io/badge/Languages-9_Indian-orange" alt="Languages" />
  <img src="https://img.shields.io/badge/Version-1.2-E91E63" alt="Version" />
</p>

---

## 📥 Download APK

> **Latest Stable Build (April 6, 2026):**
> 👉 **[AarogyaVani v1.2 — Download APK](https://expo.dev/artifacts/eas/5YsSKe7z2JGHE54EaD3UFU.apk)**

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
| **AI Engine** | Google Generative AI (`gemini-2.0-flash`) processes the image |
| **Output** | Structured extraction of medicine names, dosages, frequencies & timings |
| **Fallback** | Multi-model cascade: Google AI → Groq LPU (`llama-3.2-11b-vision-instruct`) |

### 🗣️ Pillar 2: Vernacular Voice Engine
| Aspect | Detail |
|--------|--------|
| **Languages** | Hindi, English, Kannada, Telugu, Odia, Tamil, Bengali, Marathi, Gujarati (**9 total**) |
| **How It Works** | Medicine names stay in English; usage instructions are translated and spoken aloud in the patient's native language |
| **Smart Fallback** | If a regional voice isn't available on the device, auto-falls back to Hindi → English |
| **Tech** | Native `expo-speech` API with intelligent voice detection |

### 👨‍👩‍👧 Pillar 3: Care Anchor Network (Family Connectivity)
| Aspect | Detail |
|--------|--------|
| **Real-time Sync** | Patient data (meds, vitals, alerts) syncs instantly across all linked family devices via Firebase Firestore |
| **Caregiver Portal** | Dedicated secure portal for family members to monitor adherence, schedule appointments & log vitals |
| **SOS Emergency** | One-tap emergency trigger sends cloud alert + GPS telemetry to all linked anchors |

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 📸 **AI Bilingual Scanner** | Instant extraction & vernacular translation of prescriptions using Vision AI |
| ☁️ **Cloud Sync (Real-time)** | Patient data syncs instantly across family devices via Firebase Firestore |
| 🏢 **Care Anchor Portal** | Secure portal for caregivers to monitor adherence, schedule appointments & log vitals |
| 👤 **Medical Profile Editor** | Manage patient identity, age & chronic health notes in the PHI cloud vault |
| 📅 **Health Calendar** | Dynamic scheduling — caregiver-set appointments sync to patient's dashboard |
| 🆘 **Intelligent SOS** | One-tap emergency with cloud alerts & GPS telemetry |
| 🌍 **Vernacular Voice** | Complete voice support for 9 Indian languages |
| 💊 **Medication Tracker** | 7-day adherence visualization with pill streaks & reminders |
| 🧘 **Wellness Hub** | Guided yoga routines, wellness tips & activity tracking |
| 📊 **Health Insights** | Adherence trends, health score & weekly AI-generated reports |

---

## 📱 App Screens

| Screen | Purpose |
|--------|---------|
| **Login** | Google Sign-In authentication |
| **Dashboard** | Today's meds, appointments, SOS access, vitals summary |
| **Scanner** | Camera/gallery → AI extraction → voice readout |
| **Details** | Parsed medicines with dosage, frequency & language selector |
| **Meds** | 7-day adherence chart, pill streaks, reminders |
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
┌───────────────────┐    ┌──────────────────────────┐
│  CLOUD INTELLIGENCE│    │   CLOUD SYNC LAYER       │
│                   │    │                          │
│  🧠 Google AI      │    │  ☁️ Firebase Firestore    │
│  gemini-2.0-flash │    │  (Real-time NoSQL)       │
│       │           │    │                          │
│       ▼           │    │  🔐 Firebase Auth         │
│  ⚡ Groq LPU       │    │  (Google Sign-In)        │
│  (Fallback)       │    │                          │
└───────────────────┘    └─────────┬────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼                             ▼
           ┌───────────────┐            ┌──────────────┐
           │ 👨‍👩‍👧 Care Anchor │            │ 🆘 SOS Alert  │
           │ Family Portal  │            │ GPS + Notify  │
           └───────────────┘            └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile Core** | React Native (Expo SDK 54) | Cross-platform, OTA updates, rapid iteration |
| **Web Frontend** | React 19 + TypeScript + Vite | Premium glassmorphism UI for desktop access |
| **AI Vision** | Google Generative AI (Gemini 2.0 Flash) | Best-in-class handwriting OCR & medical understanding |
| **AI Fallback** | Groq LPU (Llama 3.2 11B Vision) | Ultra-low latency inference fallback |
| **Authentication** | Firebase Auth + Google Sign-In | Zero-friction elderly-friendly login |
| **Real-time DB** | Firebase Firestore | Instant cross-device family sync |
| **Voice Engine** | expo-speech / Web Speech API | Native regional language synthesis |
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

### 1. Clone & Install
```bash
git clone https://github.com/Anand2k29/AarogyaVani-GenAI.git
cd AarogyaVani
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `AarogyaVani/` directory:
```dotenv
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your_google_client_id
```

### 3. Run Mobile App
```bash
npx expo start
```
Scan the QR code with **Expo Go** on your Android device, or press `a` to launch on an Android emulator.

### 4. Build APK (Optional)
```bash
npx eas build --platform android --profile preview
```

### 5. Run Web Version
```bash
cd ..
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

- 🌍 **Inclusive by Design** — Built for rural, elderly, and low-literacy users, not just urban tech-savvy ones
- 🗣️ **Native Vernacular Voice** — Seamless voice instructions in 9 Indian languages
- 🛡️ **Absolute Data Privacy** — Zero-knowledge PHI Vault with 100% on-device storage
- 📸 **Zero Manual Entry** — AI Vision Engine auto-extracts from prescription photos
- 👨‍👩‍👧 **Care Anchor Connectivity** — Syncs seniors directly with tech-savvy family members

---

## 👨‍💻 Team Ana

| Members |
|---------|
| **Jyotasana** |
| **Anand Minejes** |

---

<p align="center">
  <strong>Built with ❤️ for India's Elderly</strong><br/>
  <em>AarogyaVani — Because Every Voice Deserves to Be Heard</em>
</p>

---

*Disclaimer: AarogyaVani is an AI-assisted healthcare prototype. Always verify medical instructions with a certified professional.*
