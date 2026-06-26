const key = "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";
const PROMPT = "Please return a JSON object with a single key 'status' set to 'ok'.";
const input = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function run() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://aarogyavani.app",
                "X-Title": "AarogyaVani Mobile"
            },
            body: JSON.stringify({
                model: "google/gemini-1.5-flash",
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

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API HTTP ${response.status} - ${errText}`);
        }
        const data = await response.json();
        console.log("Success:", JSON.stringify(data.choices[0].message.content));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
