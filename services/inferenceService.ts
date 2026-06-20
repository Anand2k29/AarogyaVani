export interface PrescriptionItem {
    medicineName: string;
    usedFor: string;
    translatedDosage: string;
    warning: string;
}

export interface DecodeResult {
    items: PrescriptionItem[];
    rawSummary: string;
    rawSummaryEnglish: string;
    rawSummaryHindi: string;
    processingTimeMs: number;
    provider?: string;
}

const SYSTEM_PROMPT = `
You are a highly skilled pharmacist AI specializing in deciphering handwritten doctor prescriptions.
Your goal is to extract the medicines, understand complex medical abbreviations (like 1 Tab BD, SOS, TDS),
and carefully TRANSLATE the usage instructions, medicine context, warnings, and summary OVER INTO the user's exactly requested language.

Output your response STRICTLY as a valid JSON object matching this structure:
{
    "items": [
        {
            "medicineName": "Paracetamol 500mg",
            "usedFor": "Fever and mild pain (in requested language)",
            "translatedDosage": "Take 1 tablet twice a day after meals (in requested language)",
            "warning": "Do not exceed 4 tablets in 24 hours (in requested language)"
        }
    ],
    "rawSummary": "A brief 1-2 sentence summary of the prescription in the requested language.",
    "rawSummaryEnglish": "A brief 1-2 sentence summary in English.",
    "rawSummaryHindi": "A brief 1-2 sentence summary in Hindi."
}

Important Rules:
- If an abbreviation implies a time (e.g., BD = twice daily, PC = after meals), translate it fully.
- Keep the warning practical and brief.
- FULL TRANSLATION: "medicineName" ALWAYS remains English (Latin), but translate ALL OTHER fields ("usedFor", "translatedDosage", "warning", summarization fields) into the requested target language.
- Output ONLY valid JSON, do not include markdown blocks like \`\`\`json.
`;

// ── Main decode function ─────────────────────────────────────────
export async function decodePrescription(
    base64ImageOrText: string,
    language: string,
    isQA: boolean = false,
    manualGeminiKey?: string
): Promise<DecodeResult> {
    const t0 = performance.now();
    
    // Build full language name for the prompt
    const langMap: Record<string, string> = {
        'en': 'English', 'hi': 'Hindi', 'kn': 'Kannada',
        'te': 'Telugu', 'ta': 'Tamil', 'ml': 'Malayalam',
        'mr': 'Marathi', 'bn': 'Bengali', 'gu': 'Gujarati',
    };
    const fullLang = langMap[language] || language;

    // Use OpenRouter exclusively for 100% Free Gemini API bypassing Google's strict Quotas
    // @ts-ignore
    const apiKey = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();

    const payloadTextPrompt = isQA
        ? `User Question: "${base64ImageOrText}". Refer to their medications if provided. Language: ${fullLang}. Answer briefly as if speaking.`
        : `${SYSTEM_PROMPT}\n\nThe user's requested output language is: ${fullLang}.
        Please decipher the attached prescription image. Ensure your response is purely JSON code. Start your output with { and end with }. Do not output any markdown or conversational text.`;

    try {
        console.log(`[AarogyaVani] Trying Stable OpenRouter API...`);
        const OR_MODEL = "meta-llama/llama-3.2-11b-vision-instruct";
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AarogyaVani'
            },
            body: JSON.stringify({
                model: OR_MODEL,
                response_format: { type: "json_object" },
                messages: [{
                    role: "user",
                    content: isQA ? payloadTextPrompt : [
                        { type: "text", text: payloadTextPrompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64ImageOrText}` } }
                    ]
                }],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter HTTP ${response.status}:`, errText);
            throw new Error(`OpenRouter ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || '';
        console.log(`[AarogyaVani] ✓ OpenRouter API success`);
        return parseResult(content, t0, "Free AI", isQA);
    } catch (error: any) {
        console.error(`[AarogyaVani] API failed:`, error.message);
        throw new Error(error.message || 'API Connection Failed.');
    }
}

// ── JSON parser ──────────────────────────────────────────────────
function parseResult(responseText: string, startTime: number, provider: string, isQA: boolean): DecodeResult {
    if (isQA) {
        return {
            items: [],
            rawSummary: responseText,
            rawSummaryEnglish: responseText, // Same for QA
            rawSummaryHindi: responseText, // Same for QA
            processingTimeMs: Math.round(performance.now() - startTime),
            provider: `${provider} (Voice)`
        };
    }

    let jsonStr = responseText.trim();
    // Strip markdown code fences
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    // Try to extract JSON if there's extra text around it
    if (!jsonStr.startsWith('{')) {
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            jsonStr = jsonStr.substring(start, end + 1);
        }
    }

    try {
        const data = JSON.parse(jsonStr);
        return {
            items: data.items || [],
            rawSummary: data.rawSummary || '',
            rawSummaryEnglish: data.rawSummaryEnglish || '',
            rawSummaryHindi: data.rawSummaryHindi || '',
            processingTimeMs: Math.round(performance.now() - startTime),
            provider
        };
    } catch (e) {
        console.error(`[AarogyaVani] JSON parse failed. Raw response:`, responseText.substring(0, 200));
        throw new Error(`Failed to parse prescription data from ${provider}. The AI response wasn't in the expected format.`);
    }
}
