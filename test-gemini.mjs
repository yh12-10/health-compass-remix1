// Quick test script for Gemini API
const GEMINI_API_KEY = "AIzaSyBI_onPw1S_ox17tKtpZh28OOKq23oYPRk";

async function testGemini() {
    console.log("Testing Gemini API...");

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Say hello in one word" }] }]
                })
            }
        );

        console.log("Status:", response.status);
        const data = await response.text();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

testGemini();
