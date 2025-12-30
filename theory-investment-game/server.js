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

// System prompt for hypothesis additions (expanding existing hypotheses)
const ADDITION_PROMPT = `You are a sarcastic academic colleague who loves to one-up other researchers with absurd elaborations.
Given an existing hypothesis, generate a SHORT addition (1 sentence, under 100 characters) that:
- Sarcastically "builds upon" the original in an absurd way
- Uses pompous academic language
- Is concise and punchy
- Adds a ridiculous twist or "clarification"

Examples of additions:
- "...particularly during retrograde Mercury."
- "...as first theorized by my cat."
- "...which explains everything except the actual data."
- "...peer-reviewed by a focus group of squirrels."

Generate ONLY the addition text, starting with "..." - no quotes or extra formatting.`;

// System prompt for research entity suggestions
const ENTITY_PROMPT = `You are a creative game designer suggesting mysterious research subjects for a satirical academic board game.
Given an entity type (matter, creature, phenomenon, place, or mechanism), suggest an intriguing research subject that:
- Is absurd but sounds like something academics might actually study
- Has comedic potential for pseudo-scientific hypotheses
- Is specific enough to be interesting (not too generic)
- Could inspire humorous theories

Examples by type:
- Matter: "Quantum Cheese", "Dark Glitter", "Ethereal Socks"
- Creature: "Procrastinating Squirrels", "Bureaucratic Dolphins", "Passive-Aggressive Fungi"
- Phenomenon: "Collective Coffee Addiction", "Meeting-Induced Narcolepsy", "Retroactive Embarrassment"
- Place: "The Bermuda Parking Lot", "Atlantis Community College", "The Uncanny Valley Mall"
- Mechanism: "Karmic Accounting", "Quantum Procrastination", "Recursive Blame Shifting"

Generate ONLY the entity name (2-4 words), no quotes or extra formatting.`;

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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

// Generate hypothesis addition using OpenAI
async function generateAdditionWithOpenAI(existingHypothesis) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: ADDITION_PROMPT },
                { role: 'user', content: `Existing hypothesis: "${existingHypothesis}"\n\nGenerate a sarcastic addition:` }
            ],
            max_tokens: 60,
            temperature: 0.9
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
}

// Generate hypothesis addition using Anthropic Claude
async function generateAdditionWithAnthropic(existingHypothesis) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 60,
            system: ADDITION_PROMPT,
            messages: [
                { role: 'user', content: `Existing hypothesis: "${existingHypothesis}"\n\nGenerate a sarcastic addition:` }
            ]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text.trim();
}

// Generate hypothesis addition using Google Gemini
async function generateAdditionWithGoogle(existingHypothesis) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${ADDITION_PROMPT}\n\nExisting hypothesis: "${existingHypothesis}"\n\nGenerate a sarcastic addition:`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 60,
                temperature: 0.9
            }
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text.trim();
}

// Generate entity suggestion using OpenAI
async function generateEntityWithOpenAI(entityType, variationIndex = 0) {
    const variations = ['unique', 'creative', 'unexpected'];
    const variation = variations[variationIndex % variations.length];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: ENTITY_PROMPT },
                { role: 'user', content: `Suggest a ${variation} and funny research ${entityType} for a satirical academic game (suggestion #${variationIndex + 1}):` }
            ],
            max_tokens: 30,
            temperature: 1.0
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
}

// Generate entity suggestion using Anthropic Claude
async function generateEntityWithAnthropic(entityType, variationIndex = 0) {
    const variations = ['unique', 'creative', 'unexpected'];
    const variation = variations[variationIndex % variations.length];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 30,
            system: ENTITY_PROMPT,
            messages: [
                { role: 'user', content: `Suggest a ${variation} and funny research ${entityType} for a satirical academic game (suggestion #${variationIndex + 1}):` }
            ]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text.trim();
}

// Generate entity suggestion using Google Gemini
async function generateEntityWithGoogle(entityType, variationIndex = 0) {
    const variations = ['unique', 'creative', 'unexpected'];
    const variation = variations[variationIndex % variations.length];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${ENTITY_PROMPT}\n\nSuggest a ${variation} and funny research ${entityType} for a satirical academic game (suggestion #${variationIndex + 1}):`
                }]
            }],
            generationConfig: {
                maxOutputTokens: 30,
                temperature: 1.0
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

// API endpoint to generate multiple hypothesis suggestions
app.post('/api/generate-suggestions', async (req, res) => {
    const { entity, existingHypotheses = [], count = 3 } = req.body;
    const llm = getAvailableLLM();

    if (!llm) {
        return res.status(503).json({
            error: 'No LLM API key configured',
            fallback: true
        });
    }

    try {
        // Generate multiple hypotheses in parallel
        const suggestions = await Promise.all(
            Array(count).fill().map(async (_, i) => {
                // Add previous suggestions to avoid list to reduce duplicates
                const avoidList = [...existingHypotheses];

                switch (llm) {
                    case 'openai':
                        return await generateWithOpenAI(entity, avoidList);
                    case 'anthropic':
                        return await generateWithAnthropic(entity, avoidList);
                    case 'google':
                        return await generateWithGoogle(entity, avoidList);
                }
            })
        );

        res.json({ suggestions, provider: llm });
    } catch (error) {
        console.error('LLM API error:', error);
        res.status(500).json({
            error: error.message,
            fallback: true
        });
    }
});

// API endpoint to generate a sarcastic addition to an existing hypothesis
app.post('/api/generate-addition', async (req, res) => {
    const { existingHypothesis } = req.body;
    const llm = getAvailableLLM();

    if (!llm) {
        return res.status(503).json({
            error: 'No LLM API key configured',
            fallback: true
        });
    }

    if (!existingHypothesis) {
        return res.status(400).json({
            error: 'existingHypothesis is required',
            fallback: true
        });
    }

    try {
        let addition;

        switch (llm) {
            case 'openai':
                addition = await generateAdditionWithOpenAI(existingHypothesis);
                break;
            case 'anthropic':
                addition = await generateAdditionWithAnthropic(existingHypothesis);
                break;
            case 'google':
                addition = await generateAdditionWithGoogle(existingHypothesis);
                break;
        }

        res.json({ addition, provider: llm });
    } catch (error) {
        console.error('LLM API error:', error);
        res.status(500).json({
            error: error.message,
            fallback: true
        });
    }
});

// API endpoint to generate entity suggestions for game setup
app.post('/api/generate-entities', async (req, res) => {
    const { entityType, count = 3 } = req.body;
    const llm = getAvailableLLM();

    if (!llm) {
        return res.status(503).json({
            error: 'No LLM API key configured',
            fallback: true
        });
    }

    try {
        // Generate multiple entity suggestions in parallel with variation indices
        const entities = await Promise.all(
            Array(count).fill().map(async (_, index) => {
                switch (llm) {
                    case 'openai':
                        return await generateEntityWithOpenAI(entityType, index);
                    case 'anthropic':
                        return await generateEntityWithAnthropic(entityType, index);
                    case 'google':
                        return await generateEntityWithGoogle(entityType, index);
                }
            })
        );

        res.json({ entities, provider: llm });
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
