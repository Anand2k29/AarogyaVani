import type { DecodedPrescription } from './prescriptionDecoder';

export type SupportedLanguage = 'hindi' | 'kannada' | 'hinglish';

/**
 * Cross-platform TTS Utility for AarogyaVani.
 * Gracefully handles Web (window.speechSynthesis) and dynamically calls Expo Speech on mobile.
 */
export class TTSEngine {
  // Detector ensuring we are running in Web vs App
  private static isWeb = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /**
   * Speaks the extracted medical instructions intelligently routed by language.
   * 
   * @param scriptToSpeak The text to be spoken
   * @param language The language chosen by the user
   */
  public static async speakInstruction(scriptToSpeak: string, language: SupportedLanguage): Promise<void> {
    let languageCode = '';

    // 1. Audio Language Mapping Engine Strict Logic
    if (language === 'hindi') {
      languageCode = 'hi-IN';
    } else if (language === 'kannada') {
      languageCode = 'kn-IN';
    } else if (language === 'hinglish') {
      languageCode = 'en-IN'; 
    } else {
      console.warn('[TTSEngine] Fallback language invoked.');
      languageCode = 'en-US';
    }

    if (!scriptToSpeak) {
      console.warn('[TTSEngine] No string found to speak for standard mapping execution.');
      return;
    }

    // Stop traversing sounds
    this.stopSpeaking();

    // 2. Cross-Platform TTS Bridging
    if (this.isWeb && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.playWebSpeech(scriptToSpeak, languageCode);
    } else {
      await this.playMobileSpeech(scriptToSpeak, languageCode);
    }
  }

  /**
   * Immediately halts any active synthesized speech engines.
   */
  public static stopSpeaking(): void {
    if (this.isWeb && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else {
      try {
        const Speech = require('expo-speech');
        Speech.stop();
      } catch (e) {
        console.warn('Expo Speech not available');
      }
    }
  }

  // --- Private Implementations ---

  private static playWebSpeech(text: string, languageCode: string): void {
    console.log(`[TTSEngine/Web] Firing window.speechSynthesis routing -> [${languageCode}]`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 0.9; // Slightly slower for elderly
    window.speechSynthesis.speak(utterance);
  }

  private static async playMobileSpeech(text: string, languageCode: string): Promise<void> {
    console.log(`[TTSEngine/Mobile] Firing Expo Speech routing -> [${languageCode}]`);
    try {
      const Speech = require('expo-speech');
      Speech.speak(text, {
        language: languageCode,
        rate: 0.9, 
        pitch: 1.0,
        onDone: () => console.log('[TTSEngine/Mobile] Sequence finalized')
      });
    } catch (e) {
      console.warn('Expo Speech could not be loaded dynamically', e);
    }
  }
}
