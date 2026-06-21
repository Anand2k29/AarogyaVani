const buildSystemPrompt = (targetLanguage) => `
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

export async function analyzePrescription(input, targetLanguageCode = 'en') {
    const t0 = performance.now();
    
    // Ignore template placeholder strings
    const sanitizeKey = (k) => (typeof k === 'string' && !k.includes('your_')) ? k : '';

    const envGemini = sanitizeKey(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    const envOpenRouter = sanitizeKey(process.env.EXPO_PUBLIC_OPENROUTER_API_KEY);

    const key = envGemini || envOpenRouter;

    if (!key) throw new Error("Missing API Key. Please insert your API key in .env.local");

    const langNames = {
        'en': 'English',
        'hi': 'Hindi',
        'or': 'Odia',
        'kn': 'Kannada',
        'te': 'Telugu',
        'ta': 'Tamil',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'gu': 'Gujarati'
    };
    const resolvedLanguage = langNames[targetLanguageCode] || 'English';
    const PROMPT = buildSystemPrompt(resolvedLanguage);

    let cleanContent = '';
    let usedProvider = '';

    let geminiSuccess = false;

    // Route 1: Direct Gemini API (If it's an official Google 'AIza' key)
    if (key.startsWith('AIza')) {
        try {
            console.log(`[MobileDecoder] Utilizing Native Google REST API -> [gemini-2.5-flash] for ${resolvedLanguage}`);
            
            const payload = {
                contents: [{
                    parts: [
                        { text: PROMPT },
                        { inline_data: { mime_type: "image/jpeg", data: input } },
                        { text: "Extract prescription text into JSON format." }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Google API HTTP ${response.status} - ${errText}`);
            }
            const data = await response.json();
            cleanContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            usedProvider = "Native Gemini 2.5 REST";
            geminiSuccess = true;
        } catch (error) {
            console.warn(`[MobileDecoder] Native Gemini REST failed (${error.message}). Falling back to OpenRouter...`);
        }
    }

    if (!geminiSuccess) {
        // Route 2: OpenRouter Fallback System
        const openRouterKey = envOpenRouter;
        if (!openRouterKey) {
            throw new Error(`Prescription decoding failed. Google API failed (Leaked/Invalid key), and no OpenRouter fallback key found.`);
        }

        let lastError = null;
        for (const model of OPENROUTER_MODELS) {
            try {
                console.log(`[MobileDecoder] OpenRouter Inference: ${model.id} -> [${resolvedLanguage}]`);
                
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openRouterKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://aarogyavani.app",
                        "X-Title": "AarogyaVani Mobile"
                    },
                    body: JSON.stringify({
                        model: model.id,
                        messages: [
                            { role: "user", content: [
                                { type: "text", text: `${PROMPT}\n\nPlease decipher this prescription image. Output ONLY valid JSON.` },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input}` } }
                            ]}
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
                break; 

            } catch (error) {
                console.warn(`[MobileDecoder] ${model.id} failed:`, error.message);
                lastError = error;
            }
        }
        if (!cleanContent) throw new Error(`Prescription decoding failed. Last error: ${lastError?.message}`);
    }

    cleanContent = cleanContent.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleanContent.startsWith('{')) {
        const start = cleanContent.indexOf('{');
        const end = cleanContent.lastIndexOf('}');
        if (start !== -1 && end !== -1) cleanContent = cleanContent.substring(start, end + 1);
    }

    const parsed = JSON.parse(cleanContent);
    const result = {
        items: parsed.items || [],
        rawSummary: parsed.rawSummary || '',
        ttsScript: parsed.ttsScript || parsed.rawSummary || 'Audio generation failed',
        processingTimeMs: Math.round(performance.now() - t0),
        provider: usedProvider
    };

    console.log(`[MobileDecoder] ✓ Valid inference in ${result.processingTimeMs}ms — ${result.items.length} items`);
    return result;
}
