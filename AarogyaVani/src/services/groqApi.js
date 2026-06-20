export const analyzePrescription = async (base64Image, languageId = 'en') => {
  const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("Groq API Key is not configured in .env!");
  }

  const getLanguageName = (id) => {
    switch(id) {
      case 'hi': return 'Hindi';
      case 'or': return 'Odia';
      case 'kn': return 'Kannada';
      case 'te': return 'Telugu';
      default: return 'English';
    }
  };

  const currentLangName = getLanguageName(languageId);

  try {
    const SYSTEM_PROMPT = `
You are a highly skilled pharmacist AI specializing in deciphering handwritten doctor prescriptions.
Your goal is to extract the medicines, understand complex medical abbreviations,
and TRANSLATE the usage instructions, medicine context, warnings, and summary OVER INTO the user's exactly requested language.

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
- FULL TRANSLATION: Translate "usedFor", "translatedDosage", "warning", AND "rawSummary" ENTIRELY into the required language.
- Output ONLY valid JSON, do not include markdown blocks like \`\`\`json.
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-instruct',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${SYSTEM_PROMPT}\n\nThe user's requested output language is: ${currentLangName}. Please decipher the attached prescription image.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      throw new Error(data.error.message);
    }

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      try {
          return JSON.parse(content);
      } catch (e) {
          console.error("JSON Parse failed", content);
          throw new Error("Failed to parse AI response.");
      }
    }
    return "Could not analyze the image properly.";
  } catch (error) {
    console.error('Error with Groq API:', error);
    throw new Error('Failed to analyze the prescription. ' + error.message);
  }
};
