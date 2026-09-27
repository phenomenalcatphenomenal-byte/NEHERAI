export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let apiKey = process.env.GROQ_API_KEY 
        || process.env.GROK_API_KEY 
        || process.env.groq_api_key 
        || process.env.grok_api_key 
        || process.env.GROQ_KEY 
        || process.env.GROK_KEY
        || process.env.API_KEY;

    if (!apiKey) {
        // Automatically check if any environment variable value starts with 'gsk_'
        for (const [key, val] of Object.entries(process.env)) {
            if (typeof val === 'string' && val.trim().startsWith('gsk_')) {
                apiKey = val.trim();
                break;
            }
        }
    }

    if (!apiKey) {
        const availableKeys = Object.keys(process.env).filter(k => !k.startsWith('VERCEL') && !k.startsWith('AWS') && !k.startsWith('NODE'));
        console.error('GROQ_API_KEY is not configured. Available custom keys:', availableKeys);
        return res.status(500).json({ 
            error: 'Server configuration error: GROQ_API_KEY (or GROK_API_KEY) is missing from Vercel Environment Variables.',
            custom_env_keys_found: availableKeys
        });
    }

    try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: req.body.messages,
                model: 'qwen/qwen3.8-27b',
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await groqRes.json();

        if (!groqRes.ok) {
            console.error('Groq API Error Response:', data);
            return res.status(groqRes.status).json({ 
                error: data?.error?.message || 'Error communicating with Groq API',
                details: data
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Internal Handler Error:', error);
        res.status(500).json({ 
            error: error.message || 'Internal Server Error' 
        });
    }
}

