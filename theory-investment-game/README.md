# Theory Investment Game

A Monopoly-style board game where players invest their life in establishing scientific theories.

## How to Play

1. Open `index.html` in a web browser
2. Configure the entity you'll be researching (type and name)
3. Add 2-4 players with names and colors
4. Select a board configuration or load a custom map
5. Click "Start Game" to begin!

## Game Rules

### Objective
Earn the most fame points by successfully investing in hypotheses that become established theories.

### Players
- Each player starts at age 30 with 5 years of available life
- Players die at age 90 (life years used for investments age you)
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
| **SABBATICAL** | Gain 2 extra years of life |
| **PEER_REVIEW** | If you have published theories, gain bonus fame |
| **GRANT** | Receive funded research time and fame |
| **SCANDAL** | Lose fame due to controversy |
| **COLLABORATION** | Both you and a random player gain fame |
| **EUREKA** | Breakthrough! Gain years and fame |

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

- Pure HTML/CSS/JavaScript - no dependencies
- Pixel art styled with "Press Start 2P" font
- Responsive design for various screen sizes
- Single-machine multiplayer (pass-and-play)

## Files

```
theory-investment-game/
├── index.html          # Main game page
├── styles.css          # Pixel art styling
├── game.js             # Game logic
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
