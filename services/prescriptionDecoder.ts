import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DecodedPrescription {
    medicineName: string; // E.g., Paracetamol (in Target Language)
    usedFor: string; // E.g., For Fever (in Target Language)
    translatedDosage: string; // (in Target Language)
    warning: string; // (in Target Language)
}

export interface DecodedPrescriptionResult {
    items: DecodedPrescription[];
    rawSummary: string;
    ttsScript: string; // Unified flowing natural speech script in Target Language
    processingTimeMs: number;
    provider?: string;
}

const buildSystemPrompt = (targetLanguage: string) => `
You are an expert pharmacist AI native in the ${targetLanguage} language. Your task is to extract information from medical prescriptions and return a strict JSON object.

CRITICAL INSTRUCTION: Every single output field (medicine names, usages, warnings, summaries) MUST BE fully translated and written entirely natively in the ${targetLanguage} language script (e.g. Devanagari for Hindi). Do not return English text unless the target language is English or if deciphering a Latin specific drug compound strictly requires it.

The output MUST contain strictly these keys:
{
    "items": [
        {
            "medicineName": "Extracted medicine name (Translate to ${targetLanguage})",
            "usedFor": "What the medicine is for (Translate to ${targetLanguage})",
            "translatedDosage": "How exactly to take the medicine (Translate to ${targetLanguage})",
            "warning": "Any strict warnings (Translate to ${targetLanguage})"
        }
    ],
    "rawSummary": "A brief summary of the entire prescription translated nicely into ${targetLanguage}.",
    "ttsScript": "A single, highly natural sounding paragraph written entirely in ${targetLanguage} combining all medicines, usages, and dosages, that reads perfectly like a doctor speaking. This is meant for Text-to-Speech audio reading."
}
Do not include any markdown code block fences (like \`\`\`json). Return purely the JSON object.
`;

const OPENROUTER_MODELS = [
    { id: "google/gemini-2.5-flash", vision: true },
    { id: "qwen/qwen3.6-plus:free", vision: true },
    { id: "google/gemma-3-27b-it:free", vision: true },
    { id: "openrouter/free", vision: true }
];

export async function decodePrescriptionText(
    input: string,
    apiKey?: string,
    isImage: boolean = true,
    targetLanguage: string = 'en'
): Promise<DecodedPrescriptionResult> {
    const t0 = performance.now();
    
    // Ignore template placeholder strings
    const sanitizeKey = (k: any) => (typeof k === 'string' && !k.includes('your_')) ? k : '';

    const providedKey = sanitizeKey(apiKey);
    // @ts-ignore
    const envGemini = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : '');
    // @ts-ignore
    const envOpenRouter = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENROUTER_API_KEY : '');

    // Prioritize Gemini, then OpenRouter, then whatever is provided
    const key = envGemini || providedKey || envOpenRouter;

    if (!key) throw new Error("Missing API Key. Please insert your API key in .env.local or the Settings menu.");

    // Dynamic Language Map Resolution
    const langNames: Record<string, string> = { 'en': 'English', 'hi': 'Hindi', 'kn': 'Kannada', 'te': 'Telugu', 'ta': 'Tamil', 'mr': 'Marathi', 'bn': 'Bengali', 'gu': 'Gujarati', 'ml': 'Malayalam' };
    const resolvedLanguage = langNames[targetLanguage] || 'English';
    const PROMPT = buildSystemPrompt(resolvedLanguage);

    let cleanContent = '';
    let usedProvider = '';

    // Route 1: Direct Gemini API (If it's an official Google 'AIza' key)
    if (key.startsWith('AIza')) {
        console.log(`[DecoderService] Directly utilizing Google Generative AI Native Framework -> [gemini-2.5-flash] for ${resolvedLanguage}`);
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const parts: any[] = [{ text: PROMPT }];
        if (isImage) {
            parts.push({ inlineData: { data: input, mimeType: "image/jpeg" } });
            parts.push({ text: `Extract prescription text into JSON format.` });
        } else {
            parts.push({ text: `Text: ${input}` });
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseMimeType: "application/json" }
        });
        cleanContent = result.response.text();
        usedProvider = "Native Gemini 2.5";
    } else {
        // Route 2: OpenRouter Fallback System
        let lastError: Error | null = null;
        for (const model of OPENROUTER_MODELS) {
            try {
                console.log(`[DecoderService] OpenRouter Model Inference: ${model.id} -> [${resolvedLanguage}]`);
                let userContent: any;
                if (isImage && model.vision) {
                    userContent = [
                        { type: "text", text: `${PROMPT}\n\nPlease decipher this prescription image. Output ONLY valid JSON.` },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input}` } }
                    ];
                } else if (isImage && !model.vision) {
                    continue;
                } else {
                    userContent = `Here is the prescription text to decode:\n\n${input}`;
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : "https://aarogyavani.app",
                        "X-Title": "AarogyaVani"
                    },
                    body: JSON.stringify({
                        model: model.id,
                        messages: [
                            ...(typeof userContent === 'string'
                                ? [{ role: "system", content: PROMPT }, { role: "user", content: userContent }]
                                : [{ role: "user", content: userContent }]
                            ),
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.1,
                        max_tokens: 4096
                    })
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                cleanContent = data.choices?.[0]?.message?.content || '';
                usedProvider = model.id.split('/').pop() || 'OpenRouter';
                break; // Break the cascade if valid

            } catch (error: any) {
                console.warn(`[DecoderService] ${model.id} failed:`, error.message);
                lastError = error;
            }
        }
        if (!cleanContent) throw new Error(`Prescription decoding failed. Last error: ${lastError?.message}`);
    }

    // Process and Extract
    cleanContent = cleanContent.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleanContent.startsWith('{')) {
        const start = cleanContent.indexOf('{');
        const end = cleanContent.lastIndexOf('}');
        if (start !== -1 && end !== -1) cleanContent = cleanContent.substring(start, end + 1);
    }

    const parsed = JSON.parse(cleanContent);
    const result: DecodedPrescriptionResult = {
        items: parsed.items || [],
        rawSummary: parsed.rawSummary || '',
        ttsScript: parsed.ttsScript || parsed.rawSummary || 'Audio generation failed',
        processingTimeMs: Math.round(performance.now() - t0),
        provider: usedProvider
    };

    console.log(`[DecoderService] ✓ Valid inference in ${result.processingTimeMs}ms — ${result.items.length} items`);
    return result;
}
