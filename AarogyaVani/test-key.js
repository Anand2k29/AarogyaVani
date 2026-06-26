const key = "AIzaSyBpQmd9VXNkXH2rFzdC9KYGH5_TRrBttUc";
const PROMPT = "Please return a JSON object with a single key 'status' set to 'ok'.";
const input = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function run() {
    try {
        const payload = {
            contents: [{
                parts: [
                    { text: PROMPT },
                    { inline_data: { mime_type: "image/jpeg", data: input } },
                    { text: "Extract text." }
                ]
            }],
            generationConfig: { response_mime_type: "application/json" }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google API HTTP ${response.status} - ${errText}`);
        }
        const data = await response.json();
        console.log("Success:", JSON.stringify(data.candidates[0].content.parts[0].text));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
