/**
 * AarogyaVani – Browser Native Audio Service
 * ============================================
 * Uses window.speechSynthesis to provide natural voice readout
 * of deciphered prescriptions in native languages.
 * 
 * Supports both short codes ('en', 'hi', 'kn') and
 * full names ('English', 'Hindi', 'Kannada').
 */

// Map short codes AND full names → BCP47 language tags
const LANG_TAG_MAP: Record<string, string> = {
    // Short codes
    'en': 'en-IN',
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
    'ml': 'ml-IN',
    // Full names (case-insensitive handled below)
    'english': 'en-IN',
    'hindi': 'hi-IN',
    'kannada': 'kn-IN',
    'telugu': 'te-IN',
    'tamil': 'ta-IN',
    'marathi': 'mr-IN',
    'bengali': 'bn-IN',
    'gujarati': 'gu-IN',
    'malayalam': 'ml-IN',
    // BCP47 pass-through
    'en-us': 'en-US',
    'en-in': 'en-IN',
    'hi-in': 'hi-IN',
    'kn-in': 'kn-IN',
};

function resolveLangTag(languageCode: string): string {
    const key = languageCode.toLowerCase().trim();
    return LANG_TAG_MAP[key] || 'en-IN';
}

export function isLanguageSupported(languageCode: string): boolean {
    if (!window.speechSynthesis) return false;
    const langTag = resolveLangTag(languageCode);
    const voices = window.speechSynthesis.getVoices();
    // Check for exact or partial match (same primary language)
    return voices.some(v => v.lang === langTag || v.lang.startsWith(langTag.split('-')[0]));
}

export function speakInstructions(
    text: string, 
    languageCode: string, 
    fallbacks?: { en?: string; hi?: string }
) {
    if (!window.speechSynthesis) {
        console.warn("[AarogyaVani] speechSynthesis not supported in this browser.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    let langTag = resolveLangTag(languageCode);
    let textToSpeak = text;

    // Fetch all available voices
    const allVoices = window.speechSynthesis.getVoices();
    const voices = allVoices; 
    
    let selectedVoice = voices.find(v => v.lang === langTag && v.localService && !v.name.includes('Online'))
                     || voices.find(v => v.lang === langTag && v.localService)
                     || voices.find(v => v.lang.startsWith(langTag.split('-')[0]) && v.localService)
                     || voices.find(v => v.lang === langTag)
                     || voices.find(v => v.lang.startsWith(langTag.split('-')[0]));

    // FALLBACK LOGIC
    if (!selectedVoice && fallbacks) {
        console.warn(`[AarogyaVani] No voice for ${languageCode}. Trying fallbacks...`);
        
        // Try Hindi fallback
        if (fallbacks.hi) {
            const hiTag = 'hi-IN';
            const hiVoice = voices.find(v => v.lang === hiTag) || voices.find(v => v.lang.startsWith('hi'));
            if (hiVoice) {
                console.log(`[AarogyaVani] Falling back to Hindi audio.`);
                langTag = hiTag;
                textToSpeak = fallbacks.hi;
                selectedVoice = hiVoice;
            }
        }

        // Try English fallback if Hindi failed or wasn't provided
        if (!selectedVoice && fallbacks.en) {
            const enTag = 'en-IN';
            const enVoice = voices.find(v => v.lang === enTag) || voices.find(v => v.lang.startsWith('en'));
            if (enVoice) {
                console.log(`[AarogyaVani] Falling back to English audio.`);
                langTag = enTag;
                textToSpeak = fallbacks.en;
                selectedVoice = enVoice;
            }
        }
    }

    console.log(`[AarogyaVani] Speaking in ${langTag} (input: "${languageCode}")`);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langTag;
    utterance.rate = 0.85; 
    utterance.pitch = 1.0;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`[AarogyaVani] Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
        console.log(`[AarogyaVani] No specific voice found for ${langTag}, using browser default`);
    }

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
