export async function parseQuery(userInput) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Extract job search parameters.

Return ONLY JSON:
{
  "role": "",
  "company": "",
  "location": "",
  "remote": true/false
}
          `,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    }),
  });

  const data = await res.json();

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return { role: userInput };
  }
}
