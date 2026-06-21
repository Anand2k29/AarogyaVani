const input = "base64image"; // doesn't matter for the test of scheme
async function test() {
    console.log("Testing Pollinations AI...");
    const response = await fetch("https://text.pollinations.ai/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Hello" }]
        })
    });
    console.log(response.status, await response.text());
}
test();
