export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                messages: req.body.messages,
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!groqRes.ok) {
            throw new Error(`Groq API error: ${groqRes.statusText}`);
        }

        const data = await groqRes.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Groq:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
