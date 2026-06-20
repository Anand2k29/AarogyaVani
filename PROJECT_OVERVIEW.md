# AarogyaVani: Technical Overview

## 🎯 What is AarogyaVani?
**AarogyaVani** is an AI-powered, vernacular healthcare companion designed specifically for Indian families and the elderly. 

It solves the massive problem of medication non-adherence among senior citizens and those with low health literacy by allowing them to simply scan prescription papers and receive spoken instructions in their native language (Hindi, Kannada, English, etc.). 

It also bridges the gap between elderly patients and their children via the **Care Anchor** system, allowing family members to monitor adherence remotely and receive SOS emergency alerts.

---

## ✨ Core Features
1. **AI Prescription Scanner:** Uses Vision AI to extract medicines, dosages, and timings from hard-to-read prescription photos.
2. **Vernacular Voice Engine:** Speaks reminders and instructions out loud in regional Indian languages.
3. **Medication & Adherence Tracker:** Visualizes 7-day pill adherence and streaks.
4. **Care Anchor Portal:** Allows a designated family member to oversee the patient's schedule, get WhatsApp alerts for missed doses, and receive SOS alerts.
5. **Vitals & Wellness:** Tracks basic health metrics and provides guided Yoga routines.

---

## 🏆 Unique Selling Propositions (USPs)

- 🌍 **Inclusive Target Audience:** Unlike traditional tech-heavy health apps built for urban users, AarogyaVani is explicitly designed for **rural, elderly, and low-literacy users**.
- 🗣️ **Native Vernacular Voice:** English menus and alerts are augmented by **seamless voice instructions** in native Indian languages (Hindi, Kannada, Telugu, etc.).
- 🛡️ **Absolute Data Privacy:** Instead of storing patient data on vulnerable cloud servers, AarogyaVani uses a **100% On-Device PHI Vault**, ensuring a zero-knowledge architecture.
- 📸 **Zero Manual Data Entry:** Say goodbye to complex manual typing. Our **AI Vision Engine** automatically extracts medicines and dosages from a simple photo of handwritten notes.
- 👨‍👩‍👧 **Care Anchor Connectivity:** Moving away from isolated single-user experiences, AarogyaVani **syncs seniors directly with their tech-savvy children** for remote monitoring and SOS intervention.

---

## 🛠️ Tech Stack
This project runs entirely on a modern, lightweight frontend stack without a heavy backend framework.

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling:** Vanilla CSS (Tailored premium Light/Pink aesthetic, no external UI libraries)
- **AI Intelligence:** OpenRouter API (Llama 3.2 Vision / Llama 3.1 8B) & Groq API
- **Voice/Audio:** Native Browser Web Speech API (Neural Synthesis)
- **Routing:** React State (Single Page Application structure)

---

## 💾 Database Architecture

**We do NOT use an external database (No MongoDB, No SQL, No Firebase).**

Instead, AarogyaVani operates on a **Zero-Knowledge, On-Device Architecture** known as the **PHI Vault** (Protected Health Information Vault).

### How Data is Handled:
- **100% Local Storage:** All user data, medications, adherence logs, and vitals are saved directly to the device's browser using HTML5 `localStorage`. 
- **Absolute Privacy:** No sensitive health data ever leaves the user's phone or laptop. We do not own, sell, or store patient records.
- **Stateless AI:** When scanning a prescription, the image is sent strictly to the inference API (OpenRouter/Groq) for extraction, but the results are only saved locally.
- **Simulated Anchor Sync:** Syncing between patient and anchor is handled via local namespaces for prototyping, meaning everything runs blazingly fast entirely on the client-side.

*This ensures maximum security, instant loading times, and zero server-cost scaling for data storage.*

---

## 🚀 How to Use the Project

### 1. Installation & Setup
1. Clone the repository and navigate to the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with your API keys:
   ```env
   VITE_OPENROUTER_API_KEY=your_key_here
   VITE_GROQ_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. General Usage Roles
**Role 1: Elderly Patient Flow** 
1. Click **Login** and select **"Elderly Patient"**.
2. Go to the **Scanner** tab and take a photo of a prescription. The AI will read it aloud in your native language bridging the literacy gap.
3. The extracted medicines are automatically added to your **Reminders** tab. 
4. Press the giant red **SOS Emergency** button on the bottom nav if you need immediate family assistance.

**Role 2: Care Anchor Flow**
1. Click **Login** and select **"Care Anchor (Family Member)"**.
2. View the **Insights** tab to remotely monitor your parent's 7-day adherence streak.
3. Check the dashboard to see exactly which doses they missed today, and trigger a proactive WhatsApp alert check-in with a single click.
