# Theory Investment Game

A Monopoly-style board game where players invest their life in establishing scientific theories.

## How to Play

### Quick Start (No Server)
1. Open `index.html` directly in a web browser
2. Configure the entity you'll be researching (type and name)
3. Add 2-4 players with names and colors
4. Select a board configuration or load a custom map
5. Click "Start Game" to begin!

### With AI-Generated Hypotheses (Recommended)
1. Copy `.env.example` to `.env` and add an API key (see LLM Setup below)
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server
4. Open `http://localhost:3000` in your browser
5. The game header will show "AI: OpenAI/Claude/Gemini" when LLM is active

## Game Rules

### Objective
Earn the most fame points by successfully investing in hypotheses that become established theories.

### Players
- Each player starts at age 30 and dies at age 90
- Available years = (90 - current age) + student years
- Investing in hypotheses ages you (unless using student years)
- Some spaces rejuvenate you (decrease your age)
- Track both total fame and available fame (total - spent on students)

### The Scientific Underdeterminism NPC
This special character takes a turn after all players have moved. When it lands on a hypothesis space with investments, that hypothesis becomes a proven theory! The player with the most invested years publishes the paper and earns fame based on a significance dice roll.

### Space Types

| Space | Effect |
|-------|--------|
| **START** | Gain 2 fame when passing |
| **HYPOTHESIS** | Create or invest in hypotheses about the entity |
| **RECRUIT** | Hire students using fame (they provide research years) |
| **CONFERENCE** | Present work and gain fame |
| **SABBATICAL** | Rejuvenate by 2 years (decrease age) |
| **PEER_REVIEW** | If you have published theories, gain bonus fame |
| **GRANT** | Rejuvenate and gain fame |
| **SCANDAL** | Lose fame due to controversy |
| **COLLABORATION** | Both you and a random player gain fame |
| **EUREKA** | Breakthrough! Rejuvenate and gain fame |

### Students
Hire students at RECRUIT spaces to provide research years:
- **Undergraduate**: 1 year, costs 5 fame
- **Master Student**: 3 years, costs 15 fame
- **PhD Student**: 7 years, costs 35 fame

Students' years are consumed when investing in hypotheses (used before your own life years).

### Win Conditions
1. **All players die**: The player with the highest total fame wins
2. **Last one standing**: If all but one player dies AND that player has the highest fame, they win immediately

## Creating Custom Maps

Maps are text files with one space per line:

```
# Comments start with #
TYPE|NAME|EXTRA_DATA
```

### Space Types
- `START` - Starting space
- `HYPOTHESIS` - Research hypothesis (EXTRA_DATA = investment cost in years)
- `RECRUIT` - Hire students
- `CONFERENCE` - Academic conference
- `SABBATICAL` - Research leave
- `PEER_REVIEW` - Peer review process
- `GRANT` - Research funding
- `SCANDAL` - Academic scandal
- `COLLABORATION` - Research collaboration
- `EUREKA` - Breakthrough moment

### Example Map
```
START|The Academy|0
HYPOTHESIS|First Theory|3
GRANT|Funding Office|0
HYPOTHESIS|Second Theory|4
RECRUIT|Graduate School|0
```

See the `maps/` folder for more examples.

## Technical Details

- HTML/CSS/JavaScript frontend
- Optional Node.js server for LLM integration
- Pixel art styled with "Press Start 2P" font
- Responsive design with scalable board canvas
- Single-machine multiplayer (pass-and-play)
- AI players with configurable difficulty

## LLM Setup (Optional)

The game supports AI-generated hypotheses when AI players land on hypothesis spaces. This creates humorous, sarcastic pseudo-scientific hypotheses instead of using pre-written templates.

### Supported Providers

Only one API key is required. The game uses the first available:

| Provider | Model | Environment Variable |
|----------|-------|---------------------|
| OpenAI | GPT-3.5 Turbo | `OPENAI_API_KEY` |
| Anthropic | Claude 3 Haiku | `ANTHROPIC_API_KEY` |
| Google | Gemini Pro | `GOOGLE_API_KEY` |

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

3. Start the server:
   ```bash
   npm install
   npm start
   ```

4. The status indicator in the game header shows whether LLM is active:
   - "AI: OpenAI" / "AI: Claude" / "AI: Gemini" - LLM is generating hypotheses
   - "AI: Templates" - Using fallback pre-written hypotheses

### Running Without LLM

The game works perfectly without any API keys. AI players will use pre-written fallback hypotheses that are still humorous and thematic. Simply open `index.html` directly in your browser.

## Files

```
theory-investment-game/
├── index.html          # Main game page
├── styles.css          # Pixel art styling
├── game.js             # Game logic and rendering
├── server.js           # Express server for LLM API proxy
├── package.json        # Node.js dependencies
├── .env.example        # Environment variable template
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── maps/               # Sample map configurations
    ├── philosophy_of_science.txt
    ├── quantum_physics.txt
    └── social_science.txt
```

## Credits

Inspired by the philosophical concepts of scientific underdetermination and the sociology of scientific knowledge.

---

*"In science, the credit goes to the man who convinces the world, not to the man to whom the idea first occurs."* - Francis Darwin
