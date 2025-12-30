const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Check which LLM is available
function getAvailableLLM() {
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if (process.env.GOOGLE_API_KEY) return 'google';
    return null;
}

// System prompt for hypothesis generation
const SYSTEM_PROMPT = `You are a sarcastic and humorous academic who generates absurd pseudo-scientific hypotheses.
Your hypotheses should be:
- Written in overly formal academic language
- Completely ridiculous but sound superficially plausible
- Satirizing academic pretentiousness
- About 1-2 sentences long
- Related to the given entity/topic

Examples of the tone:
- "The fundamental nature of cheese is intrinsically linked to lunar gravitational fluctuations, as evidenced by the correlation between Swiss cheese holes and tidal patterns."
- "Consciousness emerges exclusively from the quantum entanglement of breakfast cereals with cosmic background radiation."

Generate ONLY the hypothesis text, no quotes or extra formatting.`;

// Generate hypothesis using OpenAI
async function generateWithOpenAI(entity, existingHypotheses) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Generate a humorous pseudo-scientific hypothesis about "${entity}". ${existingHypotheses.length > 0 ? `Existing hypotheses to avoid repeating: ${existingHypotheses.join('; ')}` : ''}` }
            ],
            max_tokens: 150,
            temperature: 0.9
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
}

// Generate hypothesis using Anthropic Claude
async function generateWithAnthropic(entity, existingHypotheses) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            system: SYSTEM_PROMPT,
            messages: [
                { role: 'user', content: `Generate a humorous pseudo-scientific hypothesis about "${entity}". ${existingHypotheses.length > 0 ? `Existing hypotheses to avoid repeating: ${existingHypotheses.join('; ')}` : ''}` }
            ]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text.trim();
}

// Generate hypothesis using Google Gemini
async function generateWithGoogle(entity, existingHypotheses) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${SYSTEM_PROMPT}\n\nGenerate a humorous pseudo-scientific hypothesis about "${entity}". ${existingHypotheses.length > 0 ? `Existing hypotheses to avoid repeating: ${existingHypotheses.join('; ')}` : ''}`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.9
            }
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text.trim();
}

// API endpoint to check if LLM is available
app.get('/api/llm-status', (req, res) => {
    const llm = getAvailableLLM();
    res.json({
        available: !!llm,
        provider: llm
    });
});

// API endpoint to generate hypothesis
app.post('/api/generate-hypothesis', async (req, res) => {
    const { entity, existingHypotheses = [] } = req.body;
    const llm = getAvailableLLM();

    if (!llm) {
        return res.status(503).json({
            error: 'No LLM API key configured',
            fallback: true
        });
    }

    try {
        let hypothesis;

        switch (llm) {
            case 'openai':
                hypothesis = await generateWithOpenAI(entity, existingHypotheses);
                break;
            case 'anthropic':
                hypothesis = await generateWithAnthropic(entity, existingHypotheses);
                break;
            case 'google':
                hypothesis = await generateWithGoogle(entity, existingHypotheses);
                break;
        }

        res.json({ hypothesis, provider: llm });
    } catch (error) {
        console.error('LLM API error:', error);
        res.status(500).json({
            error: error.message,
            fallback: true
        });
    }
});

// Start server
app.listen(PORT, () => {
    const llm = getAvailableLLM();
    console.log(`Theory Investment Game server running at http://localhost:${PORT}`);
    if (llm) {
        console.log(`LLM provider: ${llm}`);
    } else {
        console.log('No LLM API key configured - AI players will use fallback hypotheses');
    }
});
