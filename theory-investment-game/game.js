// Theory Investment Game - Main Game Logic

// ============================================
// GAME STATE
// ============================================
const GameState = {
    entity: {
        type: '',
        name: ''
    },
    players: [],
    npc: {
        name: 'Scientific Underdeterminism',
        position: 0
    },
    board: [],
    boardPositions: [], // Stored positions for hover detection
    boardSpaceSize: 60,
    theories: [],
    currentPlayerIndex: 0,
    isNPCTurn: false,
    gameOver: false,
    turnNumber: 1,
    // LLM state
    llm: {
        available: false,
        provider: null
    },
    // Animation state
    animation: {
        active: false,
        type: null, // 'player' or 'npc'
        entityIndex: null,
        currentPos: 0,
        targetPos: 0,
        progress: 0, // 0-1 for interpolation within a step
        bounceHeight: 0
    }
};

// Animation constants
const ANIMATION_STEP_DURATION = 200; // ms per space
const ANIMATION_BOUNCE_HEIGHT = 15; // pixels

// ============================================
// SOUND SYSTEM
// ============================================
let audioContext = null;
let soundEnabled = true;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
        soundEnabled = false;
    }
}

function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    switch (type) {
        case 'hop':
            playHopSound();
            break;
        case 'dice':
            playDiceSound();
            break;
        case 'diceResult':
            playDiceResultSound();
            break;
        case 'land':
            playLandSound();
            break;
        case 'fame':
            playFameSound();
            break;
        case 'theory':
            playTheorySound();
            break;
        case 'rejuvenate':
            playRejuvenateSound();
            break;
        case 'hire':
            playHireSound();
            break;
        case 'scandal':
            playScandalSound();
            break;
        case 'npcMove':
            playNPCMoveSound();
            break;
        case 'eureka':
            playEurekaSound();
            break;
        case 'death':
            playDeathSound();
            break;
        case 'click':
            playClickSound();
            break;
        case 'win':
            playWinSound();
            break;
    }
}

function createOscillator(freq, type = 'sine', duration = 0.1) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);

    return { osc, gain };
}

function playHopSound() {
    const freq = 300 + Math.random() * 100;
    createOscillator(freq, 'sine', 0.08);
    setTimeout(() => createOscillator(freq * 1.2, 'sine', 0.06), 30);
}

function playDiceSound() {
    // Rattling dice sound
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const freq = 200 + Math.random() * 300;
            createOscillator(freq, 'square', 0.03);
        }, i * 40);
    }
}

function playDiceResultSound() {
    createOscillator(440, 'sine', 0.15);
    setTimeout(() => createOscillator(550, 'sine', 0.15), 80);
    setTimeout(() => createOscillator(660, 'sine', 0.2), 160);
}

function playLandSound() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
}

function playFameSound() {
    // Ascending arpeggio
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        setTimeout(() => createOscillator(freq, 'sine', 0.15), i * 60);
    });
}

function playTheorySound() {
    // Triumphant fanfare
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            createOscillator(freq, 'sine', 0.25);
            createOscillator(freq * 0.5, 'sine', 0.25); // Add bass
        }, i * 100);
    });
}

function playRejuvenateSound() {
    // Magical sparkle ascending
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const freq = 800 + i * 100 + Math.random() * 50;
            createOscillator(freq, 'sine', 0.1);
        }, i * 50);
    }
}

function playHireSound() {
    createOscillator(400, 'triangle', 0.1);
    setTimeout(() => createOscillator(500, 'triangle', 0.1), 100);
    setTimeout(() => createOscillator(600, 'triangle', 0.15), 200);
}

function playScandalSound() {
    // Descending doom sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.4);
}

function playNPCMoveSound() {
    // Ethereal/mystical sound
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 220;
    osc2.frequency.value = 223; // Slight detuning for ethereal effect

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.3);
    osc2.stop(audioContext.currentTime + 0.3);
}

function playEurekaSound() {
    // Light bulb moment!
    setTimeout(() => createOscillator(800, 'sine', 0.1), 0);
    setTimeout(() => createOscillator(1000, 'sine', 0.1), 50);
    setTimeout(() => createOscillator(1200, 'sine', 0.15), 100);
    setTimeout(() => {
        createOscillator(1600, 'sine', 0.3);
        createOscillator(800, 'sine', 0.3);
    }, 150);
}

function playDeathSound() {
    // Somber descending
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
        setTimeout(() => createOscillator(freq, 'sine', 0.3), i * 150);
    });
}

function playClickSound() {
    createOscillator(600, 'square', 0.02);
}

function playWinSound() {
    // Victory fanfare
    const melody = [523, 523, 523, 698, 880, 784, 698, 880, 1047];
    const durations = [0.1, 0.1, 0.1, 0.3, 0.1, 0.1, 0.3, 0.1, 0.4];

    let time = 0;
    melody.forEach((freq, i) => {
        setTimeout(() => {
            createOscillator(freq, 'sine', durations[i]);
            createOscillator(freq * 0.5, 'sine', durations[i]);
        }, time);
        time += durations[i] * 800;
    });
}

// ============================================
// CONSTANTS
// ============================================
const STUDENT_TYPES = {
    undergraduate: { name: 'Undergraduate', years: 1, cost: 5 },
    master: { name: 'Master Student', years: 3, cost: 15 },
    phd: { name: 'PhD Student', years: 7, cost: 35 }
};

const SPACE_TYPES = {
    START: 'start',
    HYPOTHESIS: 'hypothesis',
    RECRUIT: 'recruit',
    CONFERENCE: 'conference',
    SABBATICAL: 'sabbatical',
    PEER_REVIEW: 'peer_review',
    GRANT: 'grant',
    SCANDAL: 'scandal',
    COLLABORATION: 'collaboration',
    EUREKA: 'eureka'
};

// Muted earth tone colors (reduced saturation)
const SPACE_COLORS = {
    [SPACE_TYPES.START]: '#4a5a4d',      // Muted forest green
    [SPACE_TYPES.HYPOTHESIS]: '#a89458', // Muted gold
    [SPACE_TYPES.RECRUIT]: '#7a6048',    // Muted sepia
    [SPACE_TYPES.CONFERENCE]: '#524035', // Muted sepia dark
    [SPACE_TYPES.SABBATICAL]: '#5a6b5a', // Muted sage green
    [SPACE_TYPES.PEER_REVIEW]: '#6b4a4e', // Muted burgundy
    [SPACE_TYPES.GRANT]: '#4a5a4d',      // Muted dark green
    [SPACE_TYPES.SCANDAL]: '#7a4540',    // Muted dark red
    [SPACE_TYPES.COLLABORATION]: '#5f4a3a', // Muted brown
    [SPACE_TYPES.EUREKA]: '#b8a060'      // Muted gold light
};

const SPACE_DESCRIPTIONS = {
    [SPACE_TYPES.START]: 'Begin your academic journey! Passing this space rejuvenates you by 2 years.',
    [SPACE_TYPES.HYPOTHESIS]: 'A research opportunity! Create a new hypothesis or invest in an existing one. If Scientific Underdeterminism lands here, the hypothesis becomes a proven theory.',
    [SPACE_TYPES.RECRUIT]: 'Graduate recruitment center. Spend fame points to hire students who extend your available research years.',
    [SPACE_TYPES.CONFERENCE]: 'Present your work and gain recognition! Earn 3 fame points for attending.',
    [SPACE_TYPES.SABBATICAL]: 'Take a well-deserved break. Rejuvenate by 3 years of life.',
    [SPACE_TYPES.PEER_REVIEW]: 'Your work is under scrutiny. Lose 2 years to the review process, but if you have students, one will help (and graduate).',
    [SPACE_TYPES.GRANT]: 'Research funding! Receive a grant that rejuvenates you by 5 years.',
    [SPACE_TYPES.SCANDAL]: 'Academic misconduct allegations! Lose 5 fame points as your reputation suffers.',
    [SPACE_TYPES.COLLABORATION]: 'Team up with a colleague! Gain 2 fame and rejuvenate by 1 year through shared research.',
    [SPACE_TYPES.EUREKA]: 'A flash of brilliance! Make a breakthrough discovery and gain 5 fame points.'
};

const MAX_AGE = 90;
const STARTING_AGE = 30;

// ============================================
// DEFAULT MAP CONFIGURATION
// ============================================
const DEFAULT_MAP = `
# Theory Investment Game - Default Board
# Format: TYPE|NAME|EXTRA_DATA
# EXTRA_DATA for hypothesis spaces: investment_cost

START|Academic Career Begins|0
HYPOTHESIS|Research Question 1|3
GRANT|Research Grant|0
HYPOTHESIS|Research Question 2|2
RECRUIT|Graduate School|0
HYPOTHESIS|Research Question 3|4
CONFERENCE|Annual Symposium|0
HYPOTHESIS|Research Question 4|3
PEER_REVIEW|Journal Review|0
HYPOTHESIS|Research Question 5|2
SABBATICAL|Research Leave|0
HYPOTHESIS|Research Question 6|5
SCANDAL|Academic Scandal|0
HYPOTHESIS|Research Question 7|3
COLLABORATION|Research Network|0
HYPOTHESIS|Research Question 8|4
EUREKA|Breakthrough Moment|0
HYPOTHESIS|Research Question 9|2
GRANT|Major Funding|0
HYPOTHESIS|Research Question 10|3
RECRUIT|Faculty Hiring|0
HYPOTHESIS|Research Question 11|4
CONFERENCE|Global Conference|0
HYPOTHESIS|Research Question 12|3
`;

// ============================================
// UTILITY FUNCTIONS
// ============================================
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function log(message, type = 'normal') {
    const logEl = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[Turn ${GameState.turnNumber}] ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

function showModal(title, bodyHTML, buttons) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;

    const buttonsContainer = document.getElementById('modal-buttons');
    buttonsContainer.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'pixel-btn';
        button.textContent = btn.text;
        button.onclick = () => {
            btn.action();
            if (btn.closeModal !== false) {
                hideModal();
            }
        };
        buttonsContainer.appendChild(button);
    });

    modal.style.display = 'flex';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

// getAvailableLifeYears removed - use player.availableYears instead

// ============================================
// ANIMATION SYSTEM
// ============================================
let animationFrameId = null;
let lastAnimationTime = 0;

function animateMovement(type, entityIndex, startPos, steps, onComplete) {
    const boardLength = GameState.board.length;
    const targetPos = (startPos + steps) % boardLength;

    GameState.animation = {
        active: true,
        type: type,
        entityIndex: entityIndex,
        startPos: startPos,
        currentPos: startPos,
        targetPos: targetPos,
        totalSteps: steps,
        currentStep: 0,
        progress: 0,
        bounceHeight: 0,
        onComplete: onComplete
    };

    lastAnimationTime = performance.now();
    runAnimationFrame();
}

function runAnimationFrame() {
    const now = performance.now();
    const deltaTime = now - lastAnimationTime;
    lastAnimationTime = now;

    const anim = GameState.animation;
    if (!anim.active) return;

    // Update progress within current step
    anim.progress += deltaTime / ANIMATION_STEP_DURATION;

    // Handle completing one or more steps (in case of lag/tab switch)
    while (anim.progress >= 1 && anim.currentStep < anim.totalSteps) {
        // Complete current step
        anim.progress -= 1;
        anim.currentStep++;
        anim.currentPos = (anim.startPos + anim.currentStep) % GameState.board.length;

        // Play hop sound effect
        if (anim.type === 'npc') {
            playSound('npcMove');
        } else {
            playSound('hop');
        }
    }

    // Check if animation is complete
    if (anim.currentStep >= anim.totalSteps) {
        // Animation complete
        anim.active = false;

        // Update actual position
        if (anim.type === 'player') {
            GameState.players[anim.entityIndex].position = anim.targetPos;
        } else if (anim.type === 'npc') {
            GameState.npc.position = anim.targetPos;
        }

        renderBoard();

        if (anim.onComplete) {
            anim.onComplete();
        }
        return;
    }

    // Calculate bounce height using sine wave
    anim.bounceHeight = Math.sin(anim.progress * Math.PI) * ANIMATION_BOUNCE_HEIGHT;

    renderBoard();
    animationFrameId = requestAnimationFrame(runAnimationFrame);
}

function getAnimatedPosition(type, entityIndex, positions, spaceSize) {
    const anim = GameState.animation;

    if (!anim.active) return null;

    const isAnimating = (type === 'player' && anim.type === 'player' && anim.entityIndex === entityIndex) ||
                        (type === 'npc' && anim.type === 'npc');

    if (!isAnimating) return null;

    const currentSpacePos = positions[anim.currentPos];
    const nextPos = (anim.currentPos + 1) % GameState.board.length;
    const nextSpacePos = positions[nextPos];

    if (!currentSpacePos || !nextSpacePos) return null;

    // Interpolate between current and next position
    const t = easeInOutQuad(anim.progress);
    const x = currentSpacePos.x + (nextSpacePos.x - currentSpacePos.x) * t;
    const y = currentSpacePos.y + (nextSpacePos.y - currentSpacePos.y) * t - anim.bounceHeight;

    return { x, y };
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ============================================
// PLAYER CLASS
// ============================================
class Player {
    constructor(name, color, index, isAI = false) {
        this.name = name;
        this.color = color;
        this.index = index;
        this.position = 0;
        this.age = STARTING_AGE;
        this.totalFame = 0;
        this.spentFame = 0;
        this.students = [];
        this.theoriesPublished = [];
        this.isAlive = true;
        this.isAI = isAI;
    }

    get availableFame() {
        return this.totalFame - this.spentFame;
    }

    get availableYears() {
        // Years until death plus student years
        let years = MAX_AGE - this.age;
        this.students.forEach(s => {
            years += STUDENT_TYPES[s].years;
        });
        return years;
    }

    addFame(amount) {
        this.totalFame += amount;
        playSound('fame');
        log(`${this.name} gained ${amount} fame points!`, 'important');
    }

    spendFame(amount) {
        if (this.availableFame >= amount) {
            this.spentFame += amount;
            return true;
        }
        return false;
    }

    rejuvenate(years) {
        // Decrease age (but not below starting age)
        const oldAge = this.age;
        this.age = Math.max(STARTING_AGE, this.age - years);
        const actualYears = oldAge - this.age;
        if (actualYears > 0) {
            playSound('rejuvenate');
            log(`${this.name} rejuvenated by ${actualYears} years! Now age ${this.age}.`);
        }
    }

    investLife(years, useStudents = true) {
        let yearsToInvest = years;
        let studentsUsed = [];

        if (useStudents) {
            // Use students first (prioritize lower value students)
            const studentOrder = ['undergraduate', 'master', 'phd'];
            for (const type of studentOrder) {
                while (yearsToInvest > 0 && this.students.includes(type)) {
                    const studentYears = STUDENT_TYPES[type].years;
                    if (studentYears <= yearsToInvest) {
                        yearsToInvest -= studentYears;
                        const idx = this.students.indexOf(type);
                        this.students.splice(idx, 1);
                        studentsUsed.push(type);
                    } else {
                        break;
                    }
                }
            }
        }

        // Remaining years come from own life (increases age)
        if (yearsToInvest > 0) {
            this.age += yearsToInvest;
        }

        // Check for death
        if (this.age >= MAX_AGE) {
            this.die();
        }

        return { studentsUsed, personalYears: yearsToInvest };
    }

    die() {
        this.isAlive = false;
        playSound('death');
        log(`${this.name} has passed away at age ${this.age}. Their legacy lives on through ${this.theoriesPublished.length} theories.`, 'important');
    }

    hireStudent(type) {
        const cost = STUDENT_TYPES[type].cost;
        if (this.spendFame(cost)) {
            this.students.push(type);
            playSound('hire');
            log(`${this.name} hired a ${STUDENT_TYPES[type].name} for ${cost} fame.`);
            return true;
        }
        return false;
    }
}

// ============================================
// AI SYSTEM
// ============================================
const AI_HYPOTHESIS_TEMPLATES = [
    "The {entity} exhibits quantum fluctuations",
    "{entity} behavior follows a cyclical pattern",
    "There exists a hidden variable affecting {entity}",
    "{entity} is influenced by external forces",
    "The structure of {entity} is self-organizing",
    "{entity} demonstrates emergent properties",
    "Observable {entity} is only part of a larger system",
    "{entity} evolution follows predictable rules",
    "The nature of {entity} is fundamentally probabilistic",
    "{entity} can be modeled using network theory"
];

const AI_HYPOTHESIS_ADDITIONS = [
    "Furthermore, this relates to temporal dynamics.",
    "This implies a deeper underlying mechanism.",
    "Additionally, boundary conditions play a key role.",
    "Moreover, symmetry principles may apply.",
    "This connects to information-theoretic constraints.",
    "The effect is measurable under controlled conditions.",
    "This suggests a universal scaling law.",
    "Causality must be carefully considered here.",
    "Environmental factors modulate this effect.",
    "This extends to higher-order interactions."
];

// Check LLM availability on startup
async function checkLLMAvailability() {
    try {
        const response = await fetch('/api/llm-status');
        const data = await response.json();
        GameState.llm.available = data.available;
        GameState.llm.provider = data.provider;
        if (data.available) {
            console.log(`LLM available: ${data.provider}`);
        }
    } catch (e) {
        // Server not running or endpoint not available
        GameState.llm.available = false;
        console.log('LLM not available - using fallback hypotheses');
    }
}

// Generate hypothesis using LLM API
async function generateLLMHypothesis() {
    if (!GameState.llm.available) {
        return generateFallbackHypothesis();
    }

    try {
        // Collect existing hypotheses to avoid repetition
        const existingHypotheses = GameState.board
            .filter(s => s.hypothesis)
            .map(s => s.hypothesis);

        const response = await fetch('/api/generate-hypothesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entity: GameState.entity.name,
                existingHypotheses
            })
        });

        const data = await response.json();

        if (data.fallback || data.error) {
            return generateFallbackHypothesis();
        }

        return data.hypothesis;
    } catch (e) {
        console.warn('LLM generation failed, using fallback:', e);
        return generateFallbackHypothesis();
    }
}

// Generate hypothesis addition using LLM API
async function generateLLMHypothesisAddition(existingHypothesis) {
    if (!GameState.llm.available) {
        return generateFallbackHypothesisAddition();
    }

    try {
        const response = await fetch('/api/generate-hypothesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entity: GameState.entity.name,
                existingHypotheses: [existingHypothesis + ' (add a sarcastic elaboration to this)']
            })
        });

        const data = await response.json();

        if (data.fallback || data.error) {
            return generateFallbackHypothesisAddition();
        }

        // Truncate if too long for an addition
        const addition = data.hypothesis;
        if (addition.length > 150) {
            return addition.substring(0, 147) + '...';
        }
        return addition;
    } catch (e) {
        console.warn('LLM addition failed, using fallback:', e);
        return generateFallbackHypothesisAddition();
    }
}

function generateFallbackHypothesis() {
    const template = AI_HYPOTHESIS_TEMPLATES[Math.floor(Math.random() * AI_HYPOTHESIS_TEMPLATES.length)];
    return template.replace('{entity}', GameState.entity.name);
}

function generateFallbackHypothesisAddition() {
    return AI_HYPOTHESIS_ADDITIONS[Math.floor(Math.random() * AI_HYPOTHESIS_ADDITIONS.length)];
}

// Legacy sync functions (kept for compatibility, but prefer async versions)
function generateAIHypothesis() {
    return generateFallbackHypothesis();
}

function generateAIHypothesisAddition() {
    return generateFallbackHypothesisAddition();
}

function makeAIDecision(player, space, decisionType) {
    // AI decision-making logic
    const availableYears = player.availableYears;
    const availableFame = player.availableFame;

    switch (decisionType) {
        case 'hypothesis_new':
            // Decide whether to create a new hypothesis
            // AI is more likely to invest if they have plenty of years
            if (availableYears >= space.investmentCost * 2) {
                return { action: 'invest', hypothesis: generateAIHypothesis() };
            } else if (availableYears >= space.investmentCost && Math.random() > 0.3) {
                return { action: 'invest', hypothesis: generateAIHypothesis() };
            }
            return { action: 'skip' };

        case 'hypothesis_existing':
            // Decide whether to invest in existing hypothesis
            // Check current investment leader
            const myInvestment = space.investments.find(i => i.playerIndex === player.index);
            const maxInvestment = Math.max(...space.investments.map(i => i.years));
            const myYears = myInvestment ? myInvestment.years : 0;

            // More likely to invest if behind or can take the lead
            if (availableYears >= space.investmentCost) {
                // 40% chance to add to the hypothesis when investing
                const addition = Math.random() > 0.6 ? generateAIHypothesisAddition() : null;
                if (myYears < maxInvestment && Math.random() > 0.2) {
                    return { action: 'invest', addition };
                } else if (myYears >= maxInvestment && Math.random() > 0.5) {
                    return { action: 'invest', addition };
                }
            }
            return { action: 'pass' };

        case 'recruit':
            // Decide which students to hire
            const studentsToHire = [];
            // Prioritize PhD students if affordable
            if (availableFame >= STUDENT_TYPES.phd.cost && Math.random() > 0.3) {
                studentsToHire.push('phd');
            } else if (availableFame >= STUDENT_TYPES.master.cost && Math.random() > 0.4) {
                studentsToHire.push('master');
            } else if (availableFame >= STUDENT_TYPES.undergraduate.cost && Math.random() > 0.5) {
                studentsToHire.push('undergraduate');
            }
            return { action: studentsToHire.length > 0 ? 'hire' : 'leave', students: studentsToHire };

        default:
            return { action: 'continue' };
    }
}

function executeAITurn(player) {
    log(`${player.name} (AI) is thinking...`);

    // Add a delay to simulate thinking
    setTimeout(() => {
        playSound('dice');
        const roll = rollDice();
        log(`${player.name} rolled a ${roll}`);

        // Show dice modal briefly
        showModal(
            `${player.name} (AI) Rolling...`,
            `
            <div class="dice-container">
                <span class="dice">🎲</span>
                <div class="dice-result">${roll}</div>
            </div>
            `,
            []
        );

        setTimeout(() => {
            playSound('diceResult');
        }, 300);

        setTimeout(() => {
            hideModal();

            const startPos = player.position;
            const targetPos = (startPos + roll) % GameState.board.length;

            // Start the movement animation
            animateMovement('player', player.index, startPos, roll, () => {
                // Animation complete - handle space for AI
                const space = GameState.board[targetPos];
                handleAISpaceLanding(player, space);
            });
        }, 800);
    }, 500);
}

function handleAISpaceLanding(player, space) {
    playSound('land');
    log(`${player.name} landed on "${space.name}" (${space.type})`);

    // Small delay before AI makes decision
    setTimeout(() => {
        switch (space.type) {
            case SPACE_TYPES.START:
                handleStartSpace(player);
                break;
            case SPACE_TYPES.HYPOTHESIS:
                handleAIHypothesisSpace(player, space);
                break;
            case SPACE_TYPES.RECRUIT:
                handleAIRecruitSpace(player);
                break;
            case SPACE_TYPES.CONFERENCE:
                handleConferenceSpace(player);
                break;
            case SPACE_TYPES.SABBATICAL:
                handleSabbaticalSpace(player);
                break;
            case SPACE_TYPES.PEER_REVIEW:
                handlePeerReviewSpace(player);
                break;
            case SPACE_TYPES.GRANT:
                handleGrantSpace(player);
                break;
            case SPACE_TYPES.SCANDAL:
                handleScandalSpace(player);
                break;
            case SPACE_TYPES.COLLABORATION:
                handleCollaborationSpace(player);
                break;
            case SPACE_TYPES.EUREKA:
                handleEurekaSpace(player);
                break;
            default:
                endTurn();
        }
    }, 300);
}

async function handleAIHypothesisSpace(player, space) {
    if (!space.hypothesis) {
        // New hypothesis space - use LLM if available
        const availableYears = player.availableYears;
        const shouldInvest = availableYears >= space.investmentCost * 2 ||
                            (availableYears >= space.investmentCost && Math.random() > 0.3);

        if (shouldInvest && player.availableYears >= space.investmentCost) {
            // Show thinking message while generating
            if (GameState.llm.available) {
                log(`${player.name} is formulating a hypothesis...`);
            }

            // Generate hypothesis (async if LLM available)
            const hypothesis = await generateLLMHypothesis();

            space.hypothesis = hypothesis;
            space.contributions.push({ text: hypothesis, author: player.name, playerIndex: player.index });
            space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
            player.investLife(space.investmentCost);
            log(`${player.name} proposed: "${hypothesis}" and invested ${space.investmentCost} years.`, 'important');
            renderBoard();
            updatePlayerStats();
            checkGameEnd();
            if (!GameState.gameOver) {
                setTimeout(() => endTurn(), 500);
            }
        } else {
            log(`${player.name} decided to skip this research opportunity.`);
            setTimeout(() => endTurn(), 300);
        }
    } else if (!space.isProven) {
        // Existing hypothesis
        const decision = makeAIDecision(player, space, 'hypothesis_existing');

        if (decision.action === 'invest' && player.availableYears >= space.investmentCost) {
            // Check if AI should add to the hypothesis (40% chance, use LLM if available)
            if (Math.random() > 0.6) {
                if (GameState.llm.available) {
                    log(`${player.name} is elaborating on the hypothesis...`);
                }
                const addition = await generateLLMHypothesisAddition(space.hypothesis);
                space.hypothesis = space.hypothesis + ' ' + addition;
                space.contributions.push({ text: addition, author: player.name, playerIndex: player.index });
                log(`${player.name} expanded the hypothesis: "${addition}"`, 'important');
            }

            const existingInv = space.investments.find(i => i.playerIndex === player.index);
            if (existingInv) {
                existingInv.years += space.investmentCost;
            } else {
                space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
            }
            player.investLife(space.investmentCost);
            log(`${player.name} invested ${space.investmentCost} more years in the hypothesis.`);
            renderBoard();
            updatePlayerStats();
            checkGameEnd();
            if (!GameState.gameOver) {
                setTimeout(() => endTurn(), 500);
            }
        } else {
            log(`${player.name} decided not to invest in this hypothesis.`);
            setTimeout(() => endTurn(), 300);
        }
    } else {
        // Already proven
        log(`${player.name} observed the established theory.`);
        setTimeout(() => endTurn(), 300);
    }
}

function handleAIRecruitSpace(player) {
    const decision = makeAIDecision(player, null, 'recruit');

    if (decision.action === 'hire' && decision.students.length > 0) {
        let hired = false;
        for (const studentType of decision.students) {
            if (player.hireStudent(studentType)) {
                hired = true;
                break; // Just hire one per turn
            }
        }
        if (!hired) {
            log(`${player.name} couldn't afford to hire students.`);
        }
        updatePlayerStats();
        setTimeout(() => endTurn(), 500);
    } else {
        log(`${player.name} decided not to hire any students.`);
        setTimeout(() => endTurn(), 300);
    }
}

// ============================================
// BOARD RENDERING
// ============================================
function parseMap(mapText) {
    const lines = mapText.trim().split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('#'));

    return lines.map((line, index) => {
        const parts = line.split('|');
        const type = parts[0].trim().toLowerCase();
        const name = parts[1] ? parts[1].trim() : `Space ${index}`;
        const extraData = parts[2] ? parseInt(parts[2].trim()) : 0;

        return {
            index,
            type,
            name,
            investmentCost: type === SPACE_TYPES.HYPOTHESIS ? extraData : 0,
            hypothesis: null,
            contributions: [], // Track who contributed what to the hypothesis
            investments: [],
            isProven: false
        };
    });
}

// ============================================
// PIXEL ART ICONS
// ============================================
function drawSpaceIcon(ctx, type, x, y, size, isProven = false) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const scale = size / 60; // Base size is 60px

    ctx.save();

    switch (type) {
        case SPACE_TYPES.START:
            // Arrow pointing right (GO!)
            drawStartIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.HYPOTHESIS:
            if (isProven) {
                // Star/trophy for proven theory
                drawProvenIcon(ctx, centerX, centerY, scale);
            } else {
                // Question mark/beaker for hypothesis
                drawHypothesisIcon(ctx, centerX, centerY, scale);
            }
            break;
        case SPACE_TYPES.RECRUIT:
            // Graduate person
            drawRecruitIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.CONFERENCE:
            // Podium/microphone
            drawConferenceIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.SABBATICAL:
            // Palm tree
            drawSabbaticalIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.PEER_REVIEW:
            // Magnifying glass
            drawPeerReviewIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.GRANT:
            // Money bag
            drawGrantIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.SCANDAL:
            // Warning sign
            drawScandalIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.COLLABORATION:
            // Two people/handshake
            drawCollaborationIcon(ctx, centerX, centerY, scale);
            break;
        case SPACE_TYPES.EUREKA:
            // Lightbulb
            drawEurekaIcon(ctx, centerX, centerY, scale);
            break;
    }

    ctx.restore();
}

function drawStartIcon(ctx, cx, cy, scale) {
    // Quill pen and inkwell - classical scientific beginning
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Inkwell base
    ctx.beginPath();
    ctx.ellipse(cx - 4 * s, cy + 6 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s, cy + 6 * s);
    ctx.lineTo(cx - 10 * s, cy + 2 * s);
    ctx.quadraticCurveTo(cx - 10 * s, cy - 2 * s, cx - 4 * s, cy - 2 * s);
    ctx.quadraticCurveTo(cx + 2 * s, cy - 2 * s, cx + 2 * s, cy + 2 * s);
    ctx.lineTo(cx + 2 * s, cy + 6 * s);
    ctx.stroke();

    // Quill pen (angled)
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, cy);
    ctx.quadraticCurveTo(cx + 6 * s, cy - 8 * s, cx + 12 * s, cy - 14 * s);
    ctx.stroke();

    // Quill feather
    ctx.beginPath();
    ctx.moveTo(cx + 12 * s, cy - 14 * s);
    ctx.quadraticCurveTo(cx + 8 * s, cy - 12 * s, cx + 6 * s, cy - 16 * s);
    ctx.quadraticCurveTo(cx + 10 * s, cy - 14 * s, cx + 12 * s, cy - 14 * s);
    ctx.fill();
    ctx.moveTo(cx + 12 * s, cy - 14 * s);
    ctx.quadraticCurveTo(cx + 14 * s, cy - 10 * s, cx + 10 * s, cy - 8 * s);
    ctx.quadraticCurveTo(cx + 14 * s, cy - 12 * s, cx + 12 * s, cy - 14 * s);
    ctx.fill();
}

function drawHypothesisIcon(ctx, cx, cy, scale) {
    // Classical alchemical retort/flask
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Flask body (round bottom)
    ctx.beginPath();
    ctx.arc(cx, cy + 2 * s, 8 * s, 0.3 * Math.PI, 0.7 * Math.PI, false);
    ctx.stroke();

    // Flask neck
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 4 * s);
    ctx.lineTo(cx - 2 * s, cy - 12 * s);
    ctx.lineTo(cx + 2 * s, cy - 12 * s);
    ctx.lineTo(cx + 3 * s, cy - 4 * s);
    ctx.stroke();

    // Flask rim
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 12 * s);
    ctx.lineTo(cx + 3 * s, cy - 12 * s);
    ctx.stroke();

    // Liquid level indication (wavy line)
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, cy + 2 * s);
    ctx.quadraticCurveTo(cx - 2 * s, cy, cx, cy + 2 * s);
    ctx.quadraticCurveTo(cx + 2 * s, cy + 4 * s, cx + 5 * s, cy + 2 * s);
    ctx.stroke();

    // Question mark above (representing hypothesis)
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.arc(cx + 8 * s, cy - 10 * s, 3 * s, Math.PI, 0, true);
    ctx.lineTo(cx + 11 * s, cy - 6 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 11 * s, cy - 3 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
}

function drawProvenIcon(ctx, cx, cy, scale) {
    // Laurel wreath - symbol of established achievement
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#4a5a4d';
    ctx.lineWidth = 1.2 * s;
    ctx.lineCap = 'round';

    // Left branch of laurel
    for (let i = 0; i < 5; i++) {
        const angle = -0.4 - i * 0.25;
        const leafX = cx - 6 * s + i * 1.5 * s;
        const leafY = cy - 6 * s + i * 3 * s;
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 4 * s, 2 * s, angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Right branch of laurel
    for (let i = 0; i < 5; i++) {
        const angle = 0.4 + i * 0.25;
        const leafX = cx + 6 * s - i * 1.5 * s;
        const leafY = cy - 6 * s + i * 3 * s;
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 4 * s, 2 * s, angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Central stem/ribbon at bottom
    ctx.strokeStyle = '#a89458';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy + 8 * s);
    ctx.quadraticCurveTo(cx, cy + 6 * s, cx + 4 * s, cy + 8 * s);
    ctx.stroke();
}

function drawRecruitIcon(ctx, cx, cy, scale) {
    // Classical scholar with scroll - period appropriate student
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Scholar's head (with period wig suggestion)
    ctx.beginPath();
    ctx.arc(cx, cy - 8 * s, 5 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Curly wig sides
    ctx.beginPath();
    ctx.arc(cx - 5 * s, cy - 6 * s, 2 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 5 * s, cy - 6 * s, 2 * s, 0, Math.PI * 2);
    ctx.stroke();

    // Scholarly robe/gown
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy - 3 * s);
    ctx.lineTo(cx - 6 * s, cy + 10 * s);
    ctx.lineTo(cx + 6 * s, cy + 10 * s);
    ctx.lineTo(cx + 4 * s, cy - 3 * s);
    ctx.closePath();
    ctx.stroke();

    // Scroll being held
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.ellipse(cx + 10 * s, cy + 2 * s, 2 * s, 5 * s, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 8 * s, cy - 2 * s);
    ctx.lineTo(cx + 5 * s, cy + 2 * s);
    ctx.stroke();
}

function drawConferenceIcon(ctx, cx, cy, scale) {
    // Royal Society style lectern with open book
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Lectern stand
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10 * s);
    ctx.lineTo(cx - 6 * s, cy + 10 * s);
    ctx.lineTo(cx + 6 * s, cy + 10 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10 * s);
    ctx.lineTo(cx, cy - 2 * s);
    ctx.stroke();

    // Lectern top surface (angled)
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, cy - 4 * s);
    ctx.lineTo(cx + 8 * s, cy - 4 * s);
    ctx.lineTo(cx + 6 * s, cy);
    ctx.lineTo(cx - 6 * s, cy);
    ctx.closePath();
    ctx.stroke();

    // Open book on lectern
    ctx.lineWidth = 1.2 * s;
    // Left page
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6 * s);
    ctx.quadraticCurveTo(cx - 4 * s, cy - 8 * s, cx - 7 * s, cy - 6 * s);
    ctx.lineTo(cx - 7 * s, cy - 2 * s);
    ctx.stroke();
    // Right page
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6 * s);
    ctx.quadraticCurveTo(cx + 4 * s, cy - 8 * s, cx + 7 * s, cy - 6 * s);
    ctx.lineTo(cx + 7 * s, cy - 2 * s);
    ctx.stroke();
    // Text lines on pages
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy - 5 * s);
    ctx.lineTo(cx - 2 * s, cy - 5 * s);
    ctx.moveTo(cx + 2 * s, cy - 5 * s);
    ctx.lineTo(cx + 6 * s, cy - 5 * s);
    ctx.stroke();
}

function drawSabbaticalIcon(ctx, cx, cy, scale) {
    // Stack of books with candle - scholarly rest and contemplation
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Stack of books
    // Bottom book
    ctx.beginPath();
    ctx.rect(cx - 8 * s, cy + 4 * s, 12 * s, 4 * s);
    ctx.stroke();
    // Middle book
    ctx.beginPath();
    ctx.rect(cx - 7 * s, cy, 10 * s, 3.5 * s);
    ctx.stroke();
    // Top book (slightly angled)
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy - 4 * s);
    ctx.lineTo(cx + 5 * s, cy - 3 * s);
    ctx.lineTo(cx + 5 * s, cy);
    ctx.lineTo(cx - 6 * s, cy - 0.5 * s);
    ctx.closePath();
    ctx.stroke();

    // Candle holder and candle
    ctx.beginPath();
    ctx.moveTo(cx + 6 * s, cy + 8 * s);
    ctx.lineTo(cx + 10 * s, cy + 8 * s);
    ctx.lineTo(cx + 9 * s, cy + 4 * s);
    ctx.lineTo(cx + 7 * s, cy + 4 * s);
    ctx.closePath();
    ctx.stroke();
    // Candle
    ctx.beginPath();
    ctx.rect(cx + 7 * s, cy - 4 * s, 2 * s, 8 * s);
    ctx.stroke();
    // Flame
    ctx.fillStyle = '#a89458';
    ctx.beginPath();
    ctx.moveTo(cx + 8 * s, cy - 4 * s);
    ctx.quadraticCurveTo(cx + 6 * s, cy - 8 * s, cx + 8 * s, cy - 10 * s);
    ctx.quadraticCurveTo(cx + 10 * s, cy - 8 * s, cx + 8 * s, cy - 4 * s);
    ctx.fill();
}

function drawPeerReviewIcon(ctx, cx, cy, scale) {
    // Period spectacles examining a document
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Document/paper
    ctx.beginPath();
    ctx.rect(cx - 8 * s, cy - 2 * s, 14 * s, 12 * s);
    ctx.stroke();
    // Text lines on document
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy + 1 * s);
    ctx.lineTo(cx + 4 * s, cy + 1 * s);
    ctx.moveTo(cx - 6 * s, cy + 4 * s);
    ctx.lineTo(cx + 4 * s, cy + 4 * s);
    ctx.moveTo(cx - 6 * s, cy + 7 * s);
    ctx.lineTo(cx + 2 * s, cy + 7 * s);
    ctx.stroke();

    // Classical round spectacles above
    ctx.lineWidth = 1.5 * s;
    // Left lens
    ctx.beginPath();
    ctx.arc(cx - 4 * s, cy - 8 * s, 4 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Right lens
    ctx.beginPath();
    ctx.arc(cx + 4 * s, cy - 8 * s, 4 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(cx - 0.5 * s, cy - 8 * s);
    ctx.lineTo(cx + 0.5 * s, cy - 8 * s);
    ctx.stroke();
    // Temple arms
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, cy - 8 * s);
    ctx.lineTo(cx - 11 * s, cy - 6 * s);
    ctx.moveTo(cx + 8 * s, cy - 8 * s);
    ctx.lineTo(cx + 11 * s, cy - 6 * s);
    ctx.stroke();
}

function drawGrantIcon(ctx, cx, cy, scale) {
    // Royal coin purse with coins - period patronage
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Coin purse body
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy - 4 * s);
    ctx.quadraticCurveTo(cx - 8 * s, cy + 4 * s, cx, cy + 8 * s);
    ctx.quadraticCurveTo(cx + 8 * s, cy + 4 * s, cx + 6 * s, cy - 4 * s);
    ctx.stroke();

    // Purse opening with drawstring
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4 * s, 6 * s, 2 * s, 0, 0, Math.PI, true);
    ctx.stroke();
    // Drawstring ties
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy - 5 * s);
    ctx.quadraticCurveTo(cx - 6 * s, cy - 10 * s, cx - 2 * s, cy - 10 * s);
    ctx.moveTo(cx + 4 * s, cy - 5 * s);
    ctx.quadraticCurveTo(cx + 6 * s, cy - 10 * s, cx + 2 * s, cy - 10 * s);
    ctx.stroke();

    // Gold coins spilling out
    ctx.fillStyle = '#a89458';
    ctx.strokeStyle = '#6a5a3a';
    ctx.lineWidth = 1 * s;
    // Coin 1
    ctx.beginPath();
    ctx.ellipse(cx + 8 * s, cy + 2 * s, 4 * s, 3 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Coin 2
    ctx.beginPath();
    ctx.ellipse(cx + 6 * s, cy + 6 * s, 3.5 * s, 2.5 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawScandalIcon(ctx, cx, cy, scale) {
    // Broken quill and spilled ink - scientific scandal
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Broken quill - upper part
    ctx.beginPath();
    ctx.moveTo(cx + 8 * s, cy - 12 * s);
    ctx.quadraticCurveTo(cx + 4 * s, cy - 10 * s, cx + 2 * s, cy - 6 * s);
    ctx.stroke();
    // Feather on upper part
    ctx.beginPath();
    ctx.moveTo(cx + 8 * s, cy - 12 * s);
    ctx.quadraticCurveTo(cx + 5 * s, cy - 14 * s, cx + 4 * s, cy - 10 * s);
    ctx.fill();

    // Broken quill - lower part (fallen)
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, cy - 4 * s);
    ctx.lineTo(cx - 8 * s, cy + 4 * s);
    ctx.stroke();

    // Break mark (jagged)
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * s, cy - 6 * s);
    ctx.lineTo(cx, cy - 5 * s);
    ctx.lineTo(cx + 1 * s, cy - 4 * s);
    ctx.lineTo(cx - 2 * s, cy - 4 * s);
    ctx.stroke();

    // Spilled ink blot
    ctx.fillStyle = '#2e2420';
    ctx.beginPath();
    ctx.ellipse(cx - 4 * s, cy + 6 * s, 6 * s, 4 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Smaller splatter
    ctx.beginPath();
    ctx.ellipse(cx + 2 * s, cy + 8 * s, 3 * s, 2 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawCollaborationIcon(ctx, cx, cy, scale) {
    // Two hands shaking with period sleeve cuffs
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left sleeve cuff
    ctx.beginPath();
    ctx.moveTo(cx - 12 * s, cy - 2 * s);
    ctx.lineTo(cx - 12 * s, cy + 4 * s);
    ctx.lineTo(cx - 8 * s, cy + 4 * s);
    ctx.lineTo(cx - 8 * s, cy - 2 * s);
    ctx.stroke();
    // Lace cuff detail
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.arc(cx - 10 * s, cy - 3 * s, 2 * s, 0, Math.PI, true);
    ctx.stroke();

    // Right sleeve cuff
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + 12 * s, cy - 2 * s);
    ctx.lineTo(cx + 12 * s, cy + 4 * s);
    ctx.lineTo(cx + 8 * s, cy + 4 * s);
    ctx.lineTo(cx + 8 * s, cy - 2 * s);
    ctx.stroke();
    // Lace cuff detail
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.arc(cx + 10 * s, cy - 3 * s, 2 * s, 0, Math.PI, true);
    ctx.stroke();

    // Clasped hands in center
    ctx.lineWidth = 1.5 * s;
    // Left hand reaching right
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, cy + 1 * s);
    ctx.lineTo(cx - 2 * s, cy + 1 * s);
    ctx.quadraticCurveTo(cx, cy - 2 * s, cx + 2 * s, cy);
    ctx.stroke();
    // Right hand reaching left
    ctx.beginPath();
    ctx.moveTo(cx + 8 * s, cy + 1 * s);
    ctx.lineTo(cx + 2 * s, cy + 1 * s);
    ctx.quadraticCurveTo(cx, cy + 4 * s, cx - 2 * s, cy + 2 * s);
    ctx.stroke();
    // Thumb detail
    ctx.beginPath();
    ctx.moveTo(cx - 1 * s, cy - 1 * s);
    ctx.lineTo(cx + 1 * s, cy + 3 * s);
    ctx.stroke();
}

function drawEurekaIcon(ctx, cx, cy, scale) {
    // Newton's apple with enlightenment rays - classical eureka
    const s = scale;
    ctx.strokeStyle = '#3a3028';
    ctx.fillStyle = '#6b4a4e';
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';

    // Apple body
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6 * s);
    ctx.bezierCurveTo(cx - 8 * s, cy - 6 * s, cx - 8 * s, cy + 6 * s, cx, cy + 6 * s);
    ctx.bezierCurveTo(cx + 8 * s, cy + 6 * s, cx + 8 * s, cy - 6 * s, cx, cy - 6 * s);
    ctx.fill();
    ctx.strokeStyle = '#5a3a40';
    ctx.stroke();

    // Apple stem
    ctx.strokeStyle = '#3a3028';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6 * s);
    ctx.quadraticCurveTo(cx + 2 * s, cy - 10 * s, cx + 1 * s, cy - 12 * s);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#4a5a4d';
    ctx.beginPath();
    ctx.moveTo(cx + 1 * s, cy - 10 * s);
    ctx.quadraticCurveTo(cx + 6 * s, cy - 12 * s, cx + 5 * s, cy - 8 * s);
    ctx.quadraticCurveTo(cx + 2 * s, cy - 9 * s, cx + 1 * s, cy - 10 * s);
    ctx.fill();

    // Enlightenment rays (radiating lines)
    ctx.strokeStyle = '#a89458';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    // Top ray
    ctx.moveTo(cx, cy - 14 * s);
    ctx.lineTo(cx, cy - 17 * s);
    // Upper left
    ctx.moveTo(cx - 8 * s, cy - 8 * s);
    ctx.lineTo(cx - 11 * s, cy - 11 * s);
    // Upper right
    ctx.moveTo(cx + 8 * s, cy - 8 * s);
    ctx.lineTo(cx + 11 * s, cy - 11 * s);
    // Left
    ctx.moveTo(cx - 10 * s, cy);
    ctx.lineTo(cx - 13 * s, cy);
    // Right
    ctx.moveTo(cx + 10 * s, cy);
    ctx.lineTo(cx + 13 * s, cy);
    ctx.stroke();
}

function renderBoard() {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const board = GameState.board;
    const numSpaces = board.length;
    const container = document.getElementById('board-container');

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Set canvas to fill container (accounting for device pixel ratio for sharpness)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';

    // Calculate logical board dimensions
    const baseSpaceSize = 60;
    const basePadding = 20;
    const sideLength = Math.ceil(numSpaces / 4);
    const logicalBoardWidth = sideLength * baseSpaceSize + basePadding * 2;
    const logicalBoardHeight = sideLength * baseSpaceSize + basePadding * 2;

    // Calculate scale to fit board in container while maintaining aspect ratio
    const scaleX = containerWidth / logicalBoardWidth;
    const scaleY = containerHeight / logicalBoardHeight;
    const scale = Math.min(scaleX, scaleY);

    // Apply scaling (including device pixel ratio)
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

    // Store scale for hover detection
    GameState.boardScale = scale;

    // Use logical dimensions for drawing
    const spaceSize = baseSpaceSize;
    const padding = basePadding;

    // Clear canvas with parchment background
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, logicalBoardWidth, logicalBoardHeight);

    // Add subtle aged paper texture effect
    ctx.fillStyle = 'rgba(112, 66, 20, 0.03)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * logicalBoardWidth;
        const y = Math.random() * logicalBoardHeight;
        const size = Math.random() * 3 + 1;
        ctx.fillRect(x, y, size, size);
    }

    // Draw decorative border
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, logicalBoardWidth - 16, logicalBoardHeight - 16);
    ctx.strokeStyle = '#a89458';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, logicalBoardWidth - 24, logicalBoardHeight - 24);

    // Calculate positions for each space (going clockwise)
    const positions = [];
    const startX = padding;
    const startY = logicalBoardHeight - padding - spaceSize;

    for (let i = 0; i < numSpaces; i++) {
        let x, y;
        const perSide = Math.ceil(numSpaces / 4);

        if (i < perSide) {
            // Bottom edge (left to right)
            x = startX + i * spaceSize;
            y = startY;
        } else if (i < perSide * 2) {
            // Right edge (bottom to top)
            x = startX + (perSide - 1) * spaceSize;
            y = startY - (i - perSide + 1) * spaceSize;
        } else if (i < perSide * 3) {
            // Top edge (right to left)
            x = startX + (perSide - 1 - (i - perSide * 2 + 1)) * spaceSize;
            y = startY - (perSide - 1) * spaceSize;
        } else {
            // Left edge (top to bottom)
            x = startX;
            y = startY - (perSide - 1 - (i - perSide * 3 + 1)) * spaceSize;
        }

        positions.push({ x, y });
    }

    // Store positions for hover detection
    GameState.boardPositions = positions;
    GameState.boardSpaceSize = spaceSize;

    // Draw spaces
    board.forEach((space, i) => {
        const pos = positions[i];
        if (!pos) return;

        const color = SPACE_COLORS[space.type] || '#666';

        // Draw space background
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, spaceSize - 2, spaceSize - 2);

        // Draw border for hypothesis spaces with content
        if (space.hypothesis) {
            ctx.strokeStyle = space.isProven ? '#fff' : '#c8b070';
            ctx.lineWidth = 3;
            ctx.strokeRect(pos.x + 2, pos.y + 2, spaceSize - 6, spaceSize - 6);
        }

        // Draw space type icon using pixel art
        drawSpaceIcon(ctx, space.type, pos.x, pos.y, spaceSize - 2, space.isProven);

        // Draw investment cost for hypothesis
        if (space.type === SPACE_TYPES.HYPOTHESIS && space.investmentCost > 0) {
            ctx.fillStyle = '#000';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText(space.investmentCost + 'y', pos.x + spaceSize/2 - 1, pos.y + spaceSize - 8);
        }
    });

    // Draw players
    GameState.players.forEach((player, pIndex) => {
        if (!player.isAlive) return;

        // Check for animated position
        const animPos = getAnimatedPosition('player', pIndex, positions, spaceSize);
        const basePos = animPos || positions[player.position];
        if (!basePos) return;

        const offsetX = (pIndex % 2) * 25 + 8;
        const offsetY = Math.floor(pIndex / 2) * 20 + 8;

        const drawX = basePos.x + offsetX;
        const drawY = basePos.y + offsetY;

        // Draw shadow when bouncing
        if (animPos && GameState.animation.bounceHeight > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(drawX, basePos.y + offsetY + GameState.animation.bounceHeight * 0.3,
                       8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player token
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Player number
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText((pIndex + 1).toString(), drawX, drawY + 3);
    });

    // Draw NPC
    const animNpcPos = getAnimatedPosition('npc', null, positions, spaceSize);
    const npcBasePos = animNpcPos || positions[GameState.npc.position];
    if (npcBasePos) {
        const npcX = npcBasePos.x + spaceSize/2;
        const npcY = npcBasePos.y + spaceSize/2;

        // Draw shadow when bouncing
        if (animNpcPos && GameState.animation.bounceHeight > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(npcX, positions[GameState.animation.currentPos].y + spaceSize/2 + 8 + GameState.animation.bounceHeight * 0.3,
                       10, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#7a6080';
        ctx.beginPath();
        ctx.moveTo(npcX, npcY - 12);
        ctx.lineTo(npcX + 10, npcY + 8);
        ctx.lineTo(npcX - 10, npcY + 8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add a mystical glow effect during animation
        if (animNpcPos) {
            ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(npcX, npcY - 16);
            ctx.lineTo(npcX + 14, npcY + 10);
            ctx.lineTo(npcX - 14, npcY + 10);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // Store positions for click handling
    canvas.positionData = positions;
}

function updatePlayerStats() {
    const container = document.getElementById('player-stats');
    container.innerHTML = '';

    GameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `player-stat ${player.isAlive ? '' : 'dead'}`;
        div.style.borderLeftColor = player.color;

        const activeIndicator = GameState.currentPlayerIndex === index && !GameState.isNPCTurn ? ' ◄' : '';
        const aiBadge = player.isAI ? '<span class="ai-badge">AI</span>' : '';

        div.innerHTML = `
            <div class="name" style="color: ${player.color}">${player.name}${aiBadge}${activeIndicator}</div>
            <div class="stats">
                <span>Age: <span class="stat-value">${player.age}</span></span>
                <span>Avail: <span class="stat-value">${player.availableYears}y</span></span>
                <span>Fame: <span class="stat-value">${player.availableFame}/${player.totalFame}</span></span>
                <span>Students: <span class="stat-value">${player.students.length}</span></span>
            </div>
        `;
        container.appendChild(div);
    });

    // Update NPC position
    document.getElementById('npc-position').textContent = `Position: ${GameState.board[GameState.npc.position]?.name || 'Start'}`;
}

function updateTheoriesList() {
    const container = document.getElementById('theories-list');
    container.innerHTML = '';

    if (GameState.theories.length === 0) {
        container.innerHTML = '<div style="color: #666; font-size: 8px;">No theories established yet</div>';
        return;
    }

    GameState.theories.forEach((theory, index) => {
        const div = document.createElement('div');
        div.className = 'theory-item';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div class="theory-name">${theory.hypothesis}</div>
            <div class="theory-author">Published by: ${theory.author}</div>
            <div class="theory-significance">Significance: ${'★'.repeat(theory.significance)}${'☆'.repeat(6 - theory.significance)}</div>
        `;

        // Add hover handlers for tooltip
        div.addEventListener('mouseenter', (e) => {
            const content = generateTheoryTooltipContent(theory);
            showBoardTooltip(e.clientX, e.clientY, content);
        });

        div.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('board-tooltip');
            if (tooltip.classList.contains('visible')) {
                showBoardTooltip(e.clientX, e.clientY, tooltip.innerHTML);
            }
        });

        div.addEventListener('mouseleave', () => {
            hideBoardTooltip();
        });

        container.appendChild(div);
    });
}

function generateTheoryTooltipContent(theory) {
    let html = `
        <div class="tooltip-title">Established Theory</div>
        <div class="tooltip-type">Published by ${theory.author}</div>
        <div class="tooltip-desc">Significance: ${'★'.repeat(theory.significance)}${'☆'.repeat(6 - theory.significance)} (${theory.fameAwarded} fame awarded)</div>
    `;

    html += `<div class="tooltip-hypothesis proven">`;

    // Show contributions with authors
    if (theory.contributions && theory.contributions.length > 0) {
        html += `<div class="tooltip-contributions">`;
        theory.contributions.forEach((contrib, idx) => {
            const isFirst = idx === 0;
            const label = isFirst ? 'Proposed by' : 'Added by';
            html += `<div class="tooltip-contribution">
                <div class="tooltip-contribution-author">${label} ${contrib.author}:</div>
                <div class="tooltip-contribution-text">"${contrib.text}"</div>
            </div>`;
        });
        html += `</div>`;
    } else {
        // Fallback for old data without contributions array
        html += `<div class="tooltip-hypothesis-text">"${theory.hypothesis}"</div>`;
    }

    if (theory.investments && theory.investments.length > 0) {
        html += `<div class="tooltip-investments">`;
        html += `<div style="color: #6a9a98; margin-bottom: 4px;">Total Investments:</div>`;
        theory.investments.forEach(inv => {
            html += `<div class="tooltip-investor"><span>${inv.player}</span><span>${inv.years} yrs</span></div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    html += `<div class="tooltip-status proven">ESTABLISHED THEORY</div>`;

    return html;
}

// ============================================
// GAME ACTIONS
// ============================================
function handleHypothesisSpace(player, space) {
    if (!space.hypothesis) {
        // First player to land here - can create hypothesis
        const availableYears = player.availableYears;

        showModal(
            'New Research Opportunity!',
            `
            <p>You've discovered an unexplored research area about <strong>${GameState.entity.name}</strong>!</p>
            <p>You can formulate a hypothesis and invest ${space.investmentCost} years of life.</p>
            <div class="input-group">
                <label>Your Hypothesis:</label>
                <input type="text" id="hypothesis-input" placeholder="Enter your hypothesis about ${GameState.entity.name}...">
            </div>
            <p class="info-text">Available life years: ${availableYears}</p>
            ${availableYears < space.investmentCost ? '<p style="color: #a86060;">Warning: You don\'t have enough life years!</p>' : ''}
            `,
            [
                {
                    text: 'Invest',
                    action: () => {
                        const hypothesis = document.getElementById('hypothesis-input').value.trim();
                        if (hypothesis && availableYears >= space.investmentCost) {
                            space.hypothesis = hypothesis;
                            space.contributions.push({ text: hypothesis, author: player.name, playerIndex: player.index });
                            space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
                            player.investLife(space.investmentCost);
                            log(`${player.name} proposed: "${hypothesis}" and invested ${space.investmentCost} years.`, 'important');
                            renderBoard();
                            updatePlayerStats();
                            checkGameEnd();
                            if (!GameState.gameOver) endTurn();
                        }
                    }
                },
                {
                    text: 'Skip',
                    action: () => endTurn()
                }
            ]
        );
    } else if (!space.isProven) {
        // Hypothesis exists - can invest more or add to description
        const availableYears = player.availableYears;
        const currentInvestment = space.investments.reduce((sum, inv) => sum + inv.years, 0);

        let investmentsHTML = '<div class="investment-display">';
        space.investments.forEach(inv => {
            investmentsHTML += `<div class="investor"><span>${inv.player}</span><span>${inv.years} years</span></div>`;
        });
        investmentsHTML += '</div>';

        showModal(
            'Active Hypothesis',
            `
            <p><strong>Hypothesis:</strong> "${space.hypothesis}"</p>
            <p>Current investments:</p>
            ${investmentsHTML}
            <div class="input-group" style="margin-top: 10px;">
                <label>Add to hypothesis (requires investment):</label>
                <input type="text" id="hypothesis-addition" placeholder="Expand or refine the hypothesis...">
            </div>
            <p>Investment cost: ${space.investmentCost} years</p>
            <p class="info-text">Available life years: ${availableYears}</p>
            `,
            [
                {
                    text: 'Invest',
                    action: () => {
                        if (availableYears >= space.investmentCost) {
                            // Check if player added to the hypothesis
                            const addition = document.getElementById('hypothesis-addition').value.trim();
                            if (addition) {
                                space.hypothesis = space.hypothesis + ' ' + addition;
                                space.contributions.push({ text: addition, author: player.name, playerIndex: player.index });
                                log(`${player.name} expanded the hypothesis: "${addition}"`, 'important');
                            }

                            const existingInv = space.investments.find(i => i.playerIndex === player.index);
                            if (existingInv) {
                                existingInv.years += space.investmentCost;
                            } else {
                                space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
                            }
                            player.investLife(space.investmentCost);
                            log(`${player.name} invested ${space.investmentCost} more years in the hypothesis.`);
                            renderBoard();
                            updatePlayerStats();
                            checkGameEnd();
                            if (!GameState.gameOver) endTurn();
                        }
                    }
                },
                {
                    text: 'Pass',
                    action: () => endTurn()
                }
            ]
        );
    } else {
        // Already proven - just info
        showModal(
            'Established Theory',
            `<p>This hypothesis has already been proven and established as a theory.</p>
            <p><strong>"${space.hypothesis}"</strong></p>`,
            [{ text: 'OK', action: () => endTurn() }]
        );
    }
}

function handleRecruitSpace(player) {
    const availableFame = player.availableFame;

    let studentsHTML = '';
    Object.entries(STUDENT_TYPES).forEach(([key, val]) => {
        const canAfford = availableFame >= val.cost;
        studentsHTML += `
            <div class="student-option ${canAfford ? '' : 'disabled'}" data-type="${key}" style="${canAfford ? '' : 'opacity: 0.5;'}">
                <div class="student-type">${val.name}</div>
                <div class="student-info">Provides: ${val.years} years | Cost: ${val.cost} fame</div>
            </div>
        `;
    });

    showModal(
        'Graduate Recruitment',
        `
        <p>Recruit students to help with your research!</p>
        <p>Available fame: ${availableFame}</p>
        <p>Current students: ${player.students.length}</p>
        ${studentsHTML}
        <p class="info-text">Click on a student type to hire</p>
        `,
        [{ text: 'Leave', action: () => endTurn() }]
    );

    // Add click handlers
    setTimeout(() => {
        document.querySelectorAll('.student-option').forEach(el => {
            el.addEventListener('click', () => {
                const type = el.dataset.type;
                if (player.hireStudent(type)) {
                    hideModal();
                    updatePlayerStats();
                    handleRecruitSpace(player); // Show again for more hiring
                }
            });
        });
    }, 100);
}

function handleConferenceSpace(player) {
    const fameGain = rollDice() + 2;
    player.addFame(fameGain);

    showModal(
        'Academic Conference',
        `
        <div class="dice-container">
            <span class="dice">🎲</span>
            <div class="dice-result">+${fameGain} Fame!</div>
        </div>
        <p>You presented your work at a prestigious conference and gained recognition!</p>
        `,
        [{ text: 'Great!', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handleSabbaticalSpace(player) {
    player.rejuvenate(2);

    showModal(
        'Sabbatical Leave',
        `
        <p>You took a well-deserved sabbatical!</p>
        <p>You feel 2 years younger and more energized!</p>
        <p class="info-text">Sometimes stepping back helps you move forward.</p>
        `,
        [{ text: 'Refreshed!', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handlePeerReviewSpace(player) {
    if (player.theoriesPublished.length > 0) {
        const bonus = rollDice();
        player.addFame(bonus);
        showModal(
            'Peer Review',
            `
            <p>Your published work underwent peer review!</p>
            <p>The reviewers were impressed. +${bonus} fame!</p>
            `,
            [{ text: 'OK', action: () => { updatePlayerStats(); endTurn(); } }]
        );
    } else {
        showModal(
            'Peer Review',
            `<p>You have no published theories to review yet.</p>
            <p>Keep researching!</p>`,
            [{ text: 'OK', action: () => endTurn() }]
        );
    }
}

function handleGrantSpace(player) {
    const grantSize = rollDice() + rollDice();
    player.rejuvenate(grantSize);
    player.addFame(2);

    showModal(
        'Research Grant!',
        `
        <div class="dice-container">
            <span class="dice">🎲🎲</span>
            <div class="dice-result">Grant Approved!</div>
        </div>
        <p>You received a major research grant!</p>
        <p>The reduced stress makes you feel ${grantSize} years younger!</p>
        <p>+2 fame for securing funding</p>
        `,
        [{ text: 'Excellent!', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handleScandalSpace(player) {
    playSound('scandal');
    const fameLoss = Math.min(player.totalFame, rollDice() + 1);
    player.totalFame -= fameLoss;
    player.spentFame = Math.min(player.spentFame, player.totalFame);

    showModal(
        'Academic Scandal!',
        `
        <p style="color: #a86060;">Your research has been called into question!</p>
        <p>You lost ${fameLoss} fame points due to controversy.</p>
        <p class="info-text">Perhaps a methodology issue was discovered...</p>
        `,
        [{ text: 'Unfortunate...', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handleCollaborationSpace(player) {
    const otherPlayers = GameState.players.filter(p => p.isAlive && p.index !== player.index);

    if (otherPlayers.length > 0) {
        const collaborator = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        const bonus = 3;
        player.addFame(bonus);
        collaborator.addFame(bonus);

        showModal(
            'Research Collaboration',
            `
            <p>You formed a research collaboration with ${collaborator.name}!</p>
            <p>Both of you gained ${bonus} fame from the joint publication.</p>
            `,
            [{ text: 'Teamwork!', action: () => { updatePlayerStats(); endTurn(); } }]
        );
    } else {
        showModal(
            'Research Collaboration',
            `<p>No other researchers available to collaborate with.</p>`,
            [{ text: 'OK', action: () => endTurn() }]
        );
    }
}

function handleEurekaSpace(player) {
    playSound('eureka');
    const bonusYears = 3;
    const bonusFame = 5;
    player.rejuvenate(bonusYears);
    player.addFame(bonusFame);

    showModal(
        'EUREKA! 💡',
        `
        <p style="color: #c8b070; font-size: 12px;">A moment of brilliance!</p>
        <p>You had a breakthrough insight about ${GameState.entity.name}!</p>
        <p>The excitement makes you feel ${bonusYears} years younger!</p>
        <p>+${bonusFame} fame from the scientific community</p>
        `,
        [{ text: 'Amazing!', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handleStartSpace(player) {
    player.addFame(2);
    showModal(
        'New Academic Year',
        `<p>You passed the start of a new academic year!</p>
        <p>+2 fame for your continued contributions.</p>`,
        [{ text: 'Onward!', action: () => { updatePlayerStats(); endTurn(); } }]
    );
}

function handleSpaceLanding(player, space) {
    playSound('land');
    log(`${player.name} landed on "${space.name}" (${space.type})`);

    switch (space.type) {
        case SPACE_TYPES.START:
            handleStartSpace(player);
            break;
        case SPACE_TYPES.HYPOTHESIS:
            handleHypothesisSpace(player, space);
            break;
        case SPACE_TYPES.RECRUIT:
            handleRecruitSpace(player);
            break;
        case SPACE_TYPES.CONFERENCE:
            handleConferenceSpace(player);
            break;
        case SPACE_TYPES.SABBATICAL:
            handleSabbaticalSpace(player);
            break;
        case SPACE_TYPES.PEER_REVIEW:
            handlePeerReviewSpace(player);
            break;
        case SPACE_TYPES.GRANT:
            handleGrantSpace(player);
            break;
        case SPACE_TYPES.SCANDAL:
            handleScandalSpace(player);
            break;
        case SPACE_TYPES.COLLABORATION:
            handleCollaborationSpace(player);
            break;
        case SPACE_TYPES.EUREKA:
            handleEurekaSpace(player);
            break;
        default:
            endTurn();
    }
}

// ============================================
// NPC LOGIC
// ============================================
function handleNPCTurn() {
    GameState.isNPCTurn = true;
    document.getElementById('current-turn').textContent = `Turn: Scientific Underdeterminism`;
    document.getElementById('current-turn').style.color = '#7a6080';
    document.getElementById('roll-dice-btn').disabled = true;

    log('Scientific Underdeterminism is taking its turn...', 'important');
    playSound('dice');

    // Show NPC rolling modal with mystical effect
    showModal(
        'The Universe Decides...',
        `
        <div class="dice-container">
            <span class="dice" id="npc-rolling-dice" style="font-size: 64px;">🎲</span>
            <div class="dice-result" id="npc-dice-result" style="opacity: 0; color: #7a6080;">?</div>
        </div>
        <p style="text-align: center; color: #7a6080; font-size: 8px;">Scientific Underdeterminism moves...</p>
        `,
        []
    );

    // Animate mystical dice rolling
    const diceEl = document.getElementById('npc-rolling-dice');
    let shakeCount = 0;
    const mysticalSymbols = ['🎲', '✨', '🔮', '⚛️', '🌌', '🎲'];
    const shakeInterval = setInterval(() => {
        diceEl.textContent = mysticalSymbols[shakeCount % mysticalSymbols.length];
        diceEl.style.transform = `rotate(${Math.random() * 60 - 30}deg) scale(${1 + Math.random() * 0.3})`;
        shakeCount++;
        if (shakeCount > 12) {
            clearInterval(shakeInterval);
            diceEl.textContent = '🎲';
            diceEl.style.transform = 'rotate(0deg) scale(1)';
        }
    }, 100);

    setTimeout(() => {
        const roll = rollDice();
        log(`Scientific Underdeterminism rolled a ${roll}`);
        playSound('diceResult');

        document.getElementById('npc-dice-result').textContent = roll;
        document.getElementById('npc-dice-result').style.opacity = '1';

        setTimeout(() => {
            hideModal();

            const startPos = GameState.npc.position;
            const targetPos = (startPos + roll) % GameState.board.length;

            // Start the movement animation
            animateMovement('npc', null, startPos, roll, () => {
                const space = GameState.board[targetPos];

                // Check if landing on a hypothesis with investments
                if (space.type === SPACE_TYPES.HYPOTHESIS && space.hypothesis && !space.isProven) {
                    handleNPCProveTheory(space);
                } else {
                    log(`Scientific Underdeterminism landed on "${space.name}" - nothing happens here.`);
                    finishNPCTurn();
                }
            });
        }, 500);
    }, 1400);
}

function handleNPCProveTheory(space) {
    playSound('theory');
    space.isProven = true;

    // Find who invested the most
    let maxInvestor = space.investments[0];
    space.investments.forEach(inv => {
        if (inv.years > maxInvestor.years) {
            maxInvestor = inv;
        }
    });

    // Roll for significance
    const significance = rollDice();
    const fameReward = significance * 5;

    // Find the player and reward them
    const winner = GameState.players[maxInvestor.playerIndex];
    if (winner) {
        winner.addFame(fameReward);
        winner.theoriesPublished.push(space.hypothesis);
    }

    // Add to theories list
    GameState.theories.push({
        hypothesis: space.hypothesis,
        author: maxInvestor.player,
        significance: significance,
        fameAwarded: fameReward,
        contributions: space.contributions ? [...space.contributions] : [],
        investments: space.investments ? [...space.investments] : []
    });

    showModal(
        'THEORY ESTABLISHED!',
        `
        <p style="color: #c8b070;">Scientific Underdeterminism has validated a hypothesis!</p>
        <p><strong>"${space.hypothesis}"</strong></p>
        <p>This is now an established theory about ${GameState.entity.name}!</p>
        <div class="dice-container">
            <span class="dice">🎲</span>
            <div class="dice-result">Significance: ${'★'.repeat(significance)}${'☆'.repeat(6 - significance)}</div>
        </div>
        <p><strong>${maxInvestor.player}</strong> published the paper and earned <strong>${fameReward} fame!</strong></p>
        `,
        [{
            text: 'Historic!',
            action: () => {
                updatePlayerStats();
                updateTheoriesList();
                renderBoard();
                finishNPCTurn();
            }
        }]
    );

    log(`THEORY: "${space.hypothesis}" proven! ${maxInvestor.player} earned ${fameReward} fame!`, 'theory');
}

function finishNPCTurn() {
    GameState.isNPCTurn = false;
    GameState.turnNumber++;

    // Don't call nextPlayer() here - currentPlayerIndex is already set correctly
    // by endTurn() before NPC turn was triggered. Just skip any dead players.
    let attempts = 0;
    while (!GameState.players[GameState.currentPlayerIndex].isAlive && attempts < GameState.players.length) {
        GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
        attempts++;
    }

    checkGameEnd();

    if (!GameState.gameOver) {
        updateTurnDisplay();
        // Don't enable button here - updateTurnDisplay handles it based on AI status
    }
}

// ============================================
// TURN MANAGEMENT
// ============================================
function nextPlayer() {
    let attempts = 0;
    do {
        GameState.currentPlayerIndex = (GameState.currentPlayerIndex + 1) % GameState.players.length;
        attempts++;
    } while (!GameState.players[GameState.currentPlayerIndex].isAlive && attempts < GameState.players.length);
}

function updateTurnDisplay() {
    const player = GameState.players[GameState.currentPlayerIndex];
    const aiIndicator = player.isAI ? ' (AI)' : '';
    document.getElementById('current-turn').textContent = `Turn: ${player.name}${aiIndicator}`;
    document.getElementById('current-turn').style.color = player.color;
    updatePlayerStats();

    // If current player is AI, automatically start their turn
    if (player.isAI && player.isAlive && !GameState.gameOver && !GameState.animation.active) {
        document.getElementById('roll-dice-btn').disabled = true;
        document.getElementById('roll-dice-btn').textContent = 'AI Thinking...';
        setTimeout(() => executeAITurn(player), 800);
    } else if (!player.isAI) {
        document.getElementById('roll-dice-btn').disabled = false;
        document.getElementById('roll-dice-btn').textContent = 'Roll Dice';
    }
}

function endTurn() {
    // Check if all players have gone, then NPC takes turn
    const startIndex = GameState.currentPlayerIndex;
    nextPlayer();

    if (GameState.currentPlayerIndex <= startIndex || !GameState.players.some(p => p.isAlive)) {
        // All players have gone, NPC turn
        handleNPCTurn();
    } else {
        updateTurnDisplay();
        // Don't enable button here - updateTurnDisplay handles it based on AI status
    }
}

function playerRollDice() {
    const player = GameState.players[GameState.currentPlayerIndex];
    if (!player.isAlive || GameState.isNPCTurn || GameState.gameOver || GameState.animation.active) return;

    document.getElementById('roll-dice-btn').disabled = true;
    playSound('dice');

    const roll = rollDice();
    log(`${player.name} rolled a ${roll}`);

    // Animate dice rolling
    showModal(
        'Rolling...',
        `
        <div class="dice-container">
            <span class="dice" id="rolling-dice">🎲</span>
            <div class="dice-result" id="dice-result" style="opacity: 0">${roll}</div>
        </div>
        `,
        []
    );

    // Animate the dice shaking
    const diceEl = document.getElementById('rolling-dice');
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
        diceEl.style.transform = `rotate(${Math.random() * 40 - 20}deg) scale(${1 + Math.random() * 0.2})`;
        shakeCount++;
        if (shakeCount > 8) {
            clearInterval(shakeInterval);
            diceEl.style.transform = 'rotate(0deg) scale(1)';
            document.getElementById('dice-result').style.opacity = '1';
            playSound('diceResult');
        }
    }, 80);

    setTimeout(() => {
        hideModal();

        const startPos = player.position;
        const targetPos = (startPos + roll) % GameState.board.length;

        // Start the movement animation
        animateMovement('player', player.index, startPos, roll, () => {
            // Animation complete - handle space
            const space = GameState.board[targetPos];
            handleSpaceLanding(player, space);
        });
    }, 900);
}

// ============================================
// WIN CONDITIONS
// ============================================
function checkGameEnd() {
    const alivePlayers = GameState.players.filter(p => p.isAlive);

    if (alivePlayers.length === 0) {
        // All dead - highest total fame wins
        const winner = GameState.players.reduce((a, b) => a.totalFame > b.totalFame ? a : b);
        endGame(winner, 'All researchers have passed away.');
    } else if (alivePlayers.length === 1) {
        // One alive - check if they have highest fame
        const alivePlayer = alivePlayers[0];
        const highestFame = Math.max(...GameState.players.map(p => p.totalFame));

        if (alivePlayer.totalFame >= highestFame) {
            endGame(alivePlayer, 'Last researcher standing with the highest fame!');
        }
    }
}

function endGame(winner, reason) {
    GameState.gameOver = true;
    playSound('win');

    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'block';

    document.getElementById('winner-display').innerHTML = `
        <h2>Winner</h2>
        <div class="winner-name" style="color: ${winner.color}">${winner.name}</div>
        <p style="margin-top: 15px; font-size: 8px;">${reason}</p>
    `;

    let statsHTML = '';
    GameState.players.forEach(player => {
        statsHTML += `
            <div class="final-player-stat" style="border-color: ${player.color}">
                <h3 style="color: ${player.color}">${player.name}</h3>
                <div class="stat-row"><span>Final Age:</span><span class="value">${player.age}</span></div>
                <div class="stat-row"><span>Total Fame:</span><span class="value">${player.totalFame}</span></div>
                <div class="stat-row"><span>Theories:</span><span class="value">${player.theoriesPublished.length}</span></div>
                <div class="stat-row"><span>Status:</span><span class="value">${player.isAlive ? 'Alive' : 'Deceased'}</span></div>
            </div>
        `;
    });
    document.getElementById('final-stats').innerHTML = statsHTML;
}

// ============================================
// BOARD TOOLTIP SYSTEM
// ============================================
function getSpaceAtPosition(mouseX, mouseY) {
    const canvas = document.getElementById('game-board');
    const rect = canvas.getBoundingClientRect();

    // Convert mouse position to logical board coordinates
    // Account for the scale applied during rendering
    const scale = GameState.boardScale || 1;
    const logicalX = (mouseX - rect.left) / scale;
    const logicalY = (mouseY - rect.top) / scale;

    // Check each space
    for (let i = 0; i < GameState.boardPositions.length; i++) {
        const pos = GameState.boardPositions[i];
        if (logicalX >= pos.x && logicalX < pos.x + GameState.boardSpaceSize - 2 &&
            logicalY >= pos.y && logicalY < pos.y + GameState.boardSpaceSize - 2) {
            return i;
        }
    }
    return -1;
}

function generateTooltipContent(spaceIndex) {
    const space = GameState.board[spaceIndex];
    if (!space) return '';

    const typeName = space.type.charAt(0).toUpperCase() + space.type.slice(1).replace('_', ' ');
    const description = SPACE_DESCRIPTIONS[space.type] || 'Unknown space type.';

    let html = `
        <div class="tooltip-title">${space.name}</div>
        <div class="tooltip-type">${typeName}</div>
        <div class="tooltip-desc">${description}</div>
    `;

    // Add hypothesis-specific info
    if (space.type === SPACE_TYPES.HYPOTHESIS) {
        if (space.hypothesis) {
            const statusClass = space.isProven ? 'proven' : '';
            html += `<div class="tooltip-hypothesis ${statusClass}">`;

            // Show contributions with authors
            if (space.contributions && space.contributions.length > 0) {
                html += `<div class="tooltip-contributions">`;
                space.contributions.forEach((contrib, idx) => {
                    const isFirst = idx === 0;
                    const label = isFirst ? 'Proposed by' : 'Added by';
                    html += `<div class="tooltip-contribution">
                        <div class="tooltip-contribution-author">${label} ${contrib.author}:</div>
                        <div class="tooltip-contribution-text">"${contrib.text}"</div>
                    </div>`;
                });
                html += `</div>`;
            } else {
                // Fallback for old data without contributions array
                html += `<div class="tooltip-hypothesis-text">"${space.hypothesis}"</div>`;
            }

            if (space.investments.length > 0) {
                html += `<div class="tooltip-investments">`;
                html += `<div style="color: #6a9a98; margin-bottom: 4px;">Investments:</div>`;
                space.investments.forEach(inv => {
                    html += `<div class="tooltip-investor"><span>${inv.player}</span><span>${inv.years} yrs</span></div>`;
                });
                html += `</div>`;
            }

            html += `</div>`;

            if (space.isProven) {
                html += `<div class="tooltip-status proven">ESTABLISHED THEORY</div>`;
            } else {
                html += `<div class="tooltip-status active">Active Research (Cost: ${space.investmentCost} yrs)</div>`;
            }
        } else {
            html += `<div class="tooltip-status empty">Unmarked (Cost: ${space.investmentCost} yrs to start)</div>`;
        }
    }

    // Show who's on this space
    const playersHere = GameState.players.filter(p => p.position === spaceIndex && p.isAlive);
    const npcHere = GameState.npc.position === spaceIndex;

    if (playersHere.length > 0 || npcHere) {
        html += `<div class="tooltip-status" style="margin-top: 8px; color: #6a9a98;">`;
        if (playersHere.length > 0) {
            html += `Players here: ${playersHere.map(p => p.name).join(', ')}`;
        }
        if (npcHere) {
            html += playersHere.length > 0 ? '<br>' : '';
            html += `Scientific Underdeterminism is here`;
        }
        html += `</div>`;
    }

    return html;
}

function showBoardTooltip(mouseX, mouseY, content) {
    const tooltip = document.getElementById('board-tooltip');
    tooltip.innerHTML = content;
    tooltip.classList.add('visible');

    // Position tooltip near mouse but avoid going off screen
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = mouseX + 15;
    let top = mouseY + 15;

    // Adjust if tooltip would go off right edge
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = mouseX - tooltipRect.width - 15;
    }

    // Adjust if tooltip would go off bottom edge
    if (top + tooltipRect.height > window.innerHeight - 10) {
        top = mouseY - tooltipRect.height - 15;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideBoardTooltip() {
    const tooltip = document.getElementById('board-tooltip');
    tooltip.classList.remove('visible');
}

function initBoardTooltip() {
    const canvas = document.getElementById('game-board');
    let lastHoveredSpace = -1;

    canvas.addEventListener('mousemove', (e) => {
        const spaceIndex = getSpaceAtPosition(e.clientX, e.clientY);

        if (spaceIndex >= 0 && spaceIndex !== lastHoveredSpace) {
            const content = generateTooltipContent(spaceIndex);
            showBoardTooltip(e.clientX, e.clientY, content);
            lastHoveredSpace = spaceIndex;
        } else if (spaceIndex >= 0) {
            // Update position while hovering same space
            const tooltip = document.getElementById('board-tooltip');
            if (tooltip.classList.contains('visible')) {
                showBoardTooltip(e.clientX, e.clientY, tooltip.innerHTML);
            }
        } else {
            hideBoardTooltip();
            lastHoveredSpace = -1;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        hideBoardTooltip();
        lastHoveredSpace = -1;
    });
}

// ============================================
// SETUP AND INITIALIZATION
// ============================================
function initSetupScreen() {
    const addBtn = document.getElementById('add-player-btn');
    const removeBtn = document.getElementById('remove-player-btn');
    const playerInputs = document.getElementById('player-inputs');
    const mapSelect = document.getElementById('map-select');
    const customMapInput = document.getElementById('custom-map-input');
    const startBtn = document.getElementById('start-game-btn');

    addBtn.addEventListener('click', () => {
        const count = playerInputs.children.length;
        if (count < 4) {
            const colors = ['#a86060', '#6a9a98', '#c8b070', '#7a6080'];
            const names = ['Dr. Hypothesis', 'Prof. Theory', 'Doc. Evidence', 'Res. Empiricus'];

            const div = document.createElement('div');
            div.className = 'player-input';
            div.innerHTML = `
                <input type="text" class="player-name" placeholder="Player ${count + 1} Name" value="${names[count]}">
                <input type="color" class="player-color" value="${colors[count]}">
                <label class="ai-toggle"><input type="checkbox" class="player-ai"> AI</label>
            `;
            playerInputs.appendChild(div);
        }
    });

    removeBtn.addEventListener('click', () => {
        if (playerInputs.children.length > 2) {
            playerInputs.removeChild(playerInputs.lastChild);
        }
    });

    mapSelect.addEventListener('change', () => {
        customMapInput.style.display = mapSelect.value === 'custom' ? 'block' : 'none';
    });

    startBtn.addEventListener('click', startGame);

    document.getElementById('play-again-btn').addEventListener('click', () => {
        location.reload();
    });
}

function startGame() {
    // Initialize audio system
    initAudio();
    playSound('click');

    // Get entity info
    GameState.entity.type = document.getElementById('entity-type').value;
    GameState.entity.name = document.getElementById('entity-name').value || 'The Unknown';

    // Get players
    const playerInputs = document.querySelectorAll('.player-input');
    playerInputs.forEach((input, index) => {
        const name = input.querySelector('.player-name').value || `Player ${index + 1}`;
        const color = input.querySelector('.player-color').value;
        const isAI = input.querySelector('.player-ai')?.checked || false;
        GameState.players.push(new Player(name, color, index, isAI));
    });

    // Parse map
    const mapSelect = document.getElementById('map-select').value;
    const mapText = mapSelect === 'custom'
        ? document.getElementById('map-text').value
        : DEFAULT_MAP;

    GameState.board = parseMap(mapText);

    // Initialize display
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    document.getElementById('entity-info').textContent =
        `Researching: ${GameState.entity.name} (${GameState.entity.type})`;

    // Setup game controls
    document.getElementById('roll-dice-btn').addEventListener('click', playerRollDice);

    // Initial render
    renderBoard();
    updatePlayerStats();
    updateTheoriesList();
    updateTurnDisplay();

    // Initialize board tooltip
    initBoardTooltip();

    log(`The research on "${GameState.entity.name}" begins!`, 'important');
    log(`${GameState.players.length} researchers compete for scientific glory.`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSetupScreen();
    // Check LLM availability (async, non-blocking)
    checkLLMAvailability();
});

// Redraw board on window resize
window.addEventListener('resize', () => {
    if (GameState.board && GameState.board.length > 0) {
        renderBoard();
    }
});
