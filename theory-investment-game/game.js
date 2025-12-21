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
    theories: [],
    currentPlayerIndex: 0,
    isNPCTurn: false,
    gameOver: false,
    turnNumber: 1,
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

const SPACE_COLORS = {
    [SPACE_TYPES.START]: '#4ecdc4',
    [SPACE_TYPES.HYPOTHESIS]: '#ffd93d',
    [SPACE_TYPES.RECRUIT]: '#ff6b6b',
    [SPACE_TYPES.CONFERENCE]: '#9b59b6',
    [SPACE_TYPES.SABBATICAL]: '#3498db',
    [SPACE_TYPES.PEER_REVIEW]: '#e74c3c',
    [SPACE_TYPES.GRANT]: '#2ecc71',
    [SPACE_TYPES.SCANDAL]: '#c0392b',
    [SPACE_TYPES.COLLABORATION]: '#1abc9c',
    [SPACE_TYPES.EUREKA]: '#f39c12'
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

    if (anim.progress >= 1) {
        // Complete current step
        anim.currentStep++;
        anim.currentPos = (anim.startPos + anim.currentStep) % GameState.board.length;
        anim.progress = 0;

        // Play hop sound effect
        if (anim.currentStep <= anim.totalSteps) {
            if (anim.type === 'npc') {
                playSound('npcMove');
            } else {
                playSound('hop');
            }
        }

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

function generateAIHypothesis() {
    const template = AI_HYPOTHESIS_TEMPLATES[Math.floor(Math.random() * AI_HYPOTHESIS_TEMPLATES.length)];
    return template.replace('{entity}', GameState.entity.name);
}

function generateAIHypothesisAddition() {
    return AI_HYPOTHESIS_ADDITIONS[Math.floor(Math.random() * AI_HYPOTHESIS_ADDITIONS.length)];
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

function handleAIHypothesisSpace(player, space) {
    if (!space.hypothesis) {
        // New hypothesis space
        const decision = makeAIDecision(player, space, 'hypothesis_new');

        if (decision.action === 'invest' && player.availableYears >= space.investmentCost) {
            space.hypothesis = decision.hypothesis;
            space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
            player.investLife(space.investmentCost);
            log(`${player.name} proposed: "${decision.hypothesis}" and invested ${space.investmentCost} years.`, 'important');
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
            // Check if AI is adding to the hypothesis
            if (decision.addition) {
                space.hypothesis = space.hypothesis + ' ' + decision.addition;
                log(`${player.name} expanded the hypothesis: "${decision.addition}"`, 'important');
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
    // Big arrow pointing right
    const p = 3 * scale; // pixel size
    ctx.fillStyle = '#000';

    // Arrow body
    for (let i = -3; i <= 2; i++) {
        ctx.fillRect(cx + i * p - p, cy - p, p, p * 2);
    }
    // Arrow head
    ctx.fillRect(cx + 2 * p, cy - 2 * p, p, p * 4);
    ctx.fillRect(cx + 3 * p, cy - p, p, p * 2);
}

function drawHypothesisIcon(ctx, cx, cy, scale) {
    // Beaker/flask with bubbles
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Beaker neck
    ctx.fillRect(cx - p, cy - 8 * p, p * 2, p * 2);
    // Beaker body (wider)
    ctx.fillRect(cx - 3 * p, cy - 6 * p, p * 6, p * 8);
    // Liquid inside (lighter)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(cx - 2 * p, cy - 2 * p, p * 4, p * 4);
    // Bubbles
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - p, cy - p, p, p);
    ctx.fillRect(cx + p, cy - 3 * p, p, p);
}

function drawProvenIcon(ctx, cx, cy, scale) {
    // Star shape
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Star made of pixels
    // Top point
    ctx.fillRect(cx - p/2, cy - 8 * p, p, p * 2);
    // Upper middle
    ctx.fillRect(cx - p * 1.5, cy - 6 * p, p * 3, p * 2);
    // Wide middle bar
    ctx.fillRect(cx - 5 * p, cy - 4 * p, p * 10, p * 2);
    // Lower middle
    ctx.fillRect(cx - 3 * p, cy - 2 * p, p * 6, p * 2);
    // Bottom points
    ctx.fillRect(cx - 4 * p, cy, p * 2, p * 3);
    ctx.fillRect(cx + 2 * p, cy, p * 2, p * 3);
}

function drawRecruitIcon(ctx, cx, cy, scale) {
    // Person with graduation cap
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Graduation cap top
    ctx.fillRect(cx - 4 * p, cy - 8 * p, p * 8, p);
    ctx.fillRect(cx - 2 * p, cy - 9 * p, p * 4, p);
    // Head
    ctx.fillRect(cx - 2 * p, cy - 7 * p, p * 4, p * 4);
    // Body
    ctx.fillRect(cx - 3 * p, cy - 2 * p, p * 6, p * 5);
    // Arms
    ctx.fillRect(cx - 5 * p, cy - 1 * p, p * 2, p * 3);
    ctx.fillRect(cx + 3 * p, cy - 1 * p, p * 2, p * 3);
}

function drawConferenceIcon(ctx, cx, cy, scale) {
    // Podium with microphone
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Microphone head
    ctx.fillRect(cx - p, cy - 9 * p, p * 2, p * 2);
    // Microphone stand
    ctx.fillRect(cx - p/2, cy - 7 * p, p, p * 4);
    // Podium top
    ctx.fillRect(cx - 4 * p, cy - 3 * p, p * 8, p * 2);
    // Podium body
    ctx.fillRect(cx - 3 * p, cy - p, p * 6, p * 4);
    // Podium front detail
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(cx - 2 * p, cy, p * 4, p * 2);
}

function drawSabbaticalIcon(ctx, cx, cy, scale) {
    // Palm tree
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Trunk
    ctx.fillRect(cx - p, cy - 2 * p, p * 2, p * 6);
    // Left fronds
    ctx.fillRect(cx - 5 * p, cy - 6 * p, p * 4, p);
    ctx.fillRect(cx - 6 * p, cy - 7 * p, p * 3, p);
    ctx.fillRect(cx - 4 * p, cy - 5 * p, p * 3, p);
    // Right fronds
    ctx.fillRect(cx + p, cy - 6 * p, p * 4, p);
    ctx.fillRect(cx + 3 * p, cy - 7 * p, p * 3, p);
    ctx.fillRect(cx + p, cy - 5 * p, p * 3, p);
    // Top fronds
    ctx.fillRect(cx - p, cy - 8 * p, p * 2, p * 2);
    // Coconuts
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(cx - 2 * p, cy - 4 * p, p, p);
    ctx.fillRect(cx + p, cy - 4 * p, p, p);
}

function drawPeerReviewIcon(ctx, cx, cy, scale) {
    // Magnifying glass
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Glass circle (outer)
    ctx.fillRect(cx - 3 * p, cy - 8 * p, p * 6, p);
    ctx.fillRect(cx - 4 * p, cy - 7 * p, p, p * 2);
    ctx.fillRect(cx + 3 * p, cy - 7 * p, p, p * 2);
    ctx.fillRect(cx - 4 * p, cy - 4 * p, p, p * 2);
    ctx.fillRect(cx + 3 * p, cy - 4 * p, p, p * 2);
    ctx.fillRect(cx - 3 * p, cy - 2 * p, p * 6, p);
    // Handle
    ctx.fillRect(cx + 2 * p, cy - p, p * 2, p);
    ctx.fillRect(cx + 3 * p, cy, p * 2, p * 2);
    ctx.fillRect(cx + 4 * p, cy + 2 * p, p * 2, p * 2);
    // Glass shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(cx - 2 * p, cy - 6 * p, p * 2, p * 2);
}

function drawGrantIcon(ctx, cx, cy, scale) {
    // Money bag with $ sign
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Bag top (tied)
    ctx.fillRect(cx - p, cy - 9 * p, p * 2, p);
    ctx.fillRect(cx - 2 * p, cy - 8 * p, p * 4, p);
    // Bag body
    ctx.fillRect(cx - 3 * p, cy - 7 * p, p * 6, p);
    ctx.fillRect(cx - 4 * p, cy - 6 * p, p * 8, p * 6);
    ctx.fillRect(cx - 3 * p, cy, p * 6, p * 2);
    // $ sign
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - p/2, cy - 5 * p, p, p * 5);
    ctx.fillRect(cx - 2 * p, cy - 4 * p, p * 4, p);
    ctx.fillRect(cx - 2 * p, cy - 2 * p, p * 4, p);
}

function drawScandalIcon(ctx, cx, cy, scale) {
    // Warning triangle with !
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Triangle outline
    ctx.fillRect(cx - p/2, cy - 9 * p, p, p);
    ctx.fillRect(cx - p, cy - 8 * p, p * 2, p);
    ctx.fillRect(cx - 2 * p, cy - 7 * p, p * 4, p);
    ctx.fillRect(cx - 2 * p, cy - 6 * p, p, p);
    ctx.fillRect(cx + p, cy - 6 * p, p, p);
    ctx.fillRect(cx - 3 * p, cy - 5 * p, p, p);
    ctx.fillRect(cx + 2 * p, cy - 5 * p, p, p);
    ctx.fillRect(cx - 3 * p, cy - 4 * p, p, p);
    ctx.fillRect(cx + 2 * p, cy - 4 * p, p, p);
    ctx.fillRect(cx - 4 * p, cy - 3 * p, p, p);
    ctx.fillRect(cx + 3 * p, cy - 3 * p, p, p);
    ctx.fillRect(cx - 4 * p, cy - 2 * p, p, p);
    ctx.fillRect(cx + 3 * p, cy - 2 * p, p, p);
    ctx.fillRect(cx - 5 * p, cy - p, p * 10, p * 2);
    // Exclamation mark
    ctx.fillRect(cx - p/2, cy - 6 * p, p, p * 3);
    ctx.fillRect(cx - p/2, cy - 2 * p, p, p);
}

function drawCollaborationIcon(ctx, cx, cy, scale) {
    // Two people shaking hands
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Left person head
    ctx.fillRect(cx - 5 * p, cy - 7 * p, p * 2, p * 2);
    // Left person body
    ctx.fillRect(cx - 5 * p, cy - 5 * p, p * 2, p * 4);
    // Right person head
    ctx.fillRect(cx + 3 * p, cy - 7 * p, p * 2, p * 2);
    // Right person body
    ctx.fillRect(cx + 3 * p, cy - 5 * p, p * 2, p * 4);
    // Handshake in middle
    ctx.fillRect(cx - 3 * p, cy - 3 * p, p * 2, p);
    ctx.fillRect(cx - p, cy - 2 * p, p * 2, p * 2);
    ctx.fillRect(cx + p, cy - 3 * p, p * 2, p);
    // Arms connecting
    ctx.fillRect(cx - 4 * p, cy - 3 * p, p, p);
    ctx.fillRect(cx + 3 * p, cy - 3 * p, p, p);
}

function drawEurekaIcon(ctx, cx, cy, scale) {
    // Lightbulb with rays
    const p = 2 * scale;
    ctx.fillStyle = '#000';

    // Bulb top
    ctx.fillRect(cx - 2 * p, cy - 8 * p, p * 4, p);
    ctx.fillRect(cx - 3 * p, cy - 7 * p, p * 6, p * 2);
    ctx.fillRect(cx - 3 * p, cy - 5 * p, p * 6, p * 2);
    ctx.fillRect(cx - 2 * p, cy - 3 * p, p * 4, p);
    // Bulb base
    ctx.fillRect(cx - p, cy - 2 * p, p * 2, p);
    ctx.fillRect(cx - 2 * p, cy - p, p * 4, p);
    ctx.fillRect(cx - p, cy, p * 2, p * 2);
    // Rays
    ctx.fillRect(cx - 6 * p, cy - 6 * p, p * 2, p);
    ctx.fillRect(cx + 4 * p, cy - 6 * p, p * 2, p);
    ctx.fillRect(cx - p/2, cy - 10 * p, p, p);
    // Inner glow
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(cx - p, cy - 6 * p, p * 2, p * 2);
}

function renderBoard() {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const board = GameState.board;
    const numSpaces = board.length;

    // Calculate board dimensions
    const spaceSize = 60;
    const padding = 20;
    const sideLength = Math.ceil(numSpaces / 4);
    const boardWidth = sideLength * spaceSize + padding * 2;
    const boardHeight = sideLength * spaceSize + padding * 2;

    canvas.width = Math.max(boardWidth, 500);
    canvas.height = Math.max(boardHeight, 500);

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate positions for each space (going clockwise)
    const positions = [];
    const startX = padding;
    const startY = canvas.height - padding - spaceSize;

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
            ctx.strokeStyle = space.isProven ? '#fff' : '#ffd93d';
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

        ctx.fillStyle = '#9b59b6';
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

    GameState.theories.forEach(theory => {
        const div = document.createElement('div');
        div.className = 'theory-item';
        div.innerHTML = `
            <div class="theory-name">${theory.hypothesis}</div>
            <div class="theory-author">Published by: ${theory.author}</div>
            <div class="theory-significance">Significance: ${'★'.repeat(theory.significance)}${'☆'.repeat(6 - theory.significance)}</div>
        `;
        container.appendChild(div);
    });
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
            ${availableYears < space.investmentCost ? '<p style="color: #ff6b6b;">Warning: You don\'t have enough life years!</p>' : ''}
            `,
            [
                {
                    text: 'Invest',
                    action: () => {
                        const hypothesis = document.getElementById('hypothesis-input').value.trim();
                        if (hypothesis && availableYears >= space.investmentCost) {
                            space.hypothesis = hypothesis;
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
                <label>Add to hypothesis (optional):</label>
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
                    text: 'Add Only',
                    action: () => {
                        const addition = document.getElementById('hypothesis-addition').value.trim();
                        if (addition) {
                            space.hypothesis = space.hypothesis + ' ' + addition;
                            log(`${player.name} expanded the hypothesis: "${addition}"`, 'important');
                            renderBoard();
                        }
                        endTurn();
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
        <p style="color: #ff6b6b;">Your research has been called into question!</p>
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
        <p style="color: #ffd93d; font-size: 12px;">A moment of brilliance!</p>
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
    document.getElementById('current-turn').style.color = '#9b59b6';
    document.getElementById('roll-dice-btn').disabled = true;

    log('Scientific Underdeterminism is taking its turn...', 'important');
    playSound('dice');

    // Show NPC rolling modal with mystical effect
    showModal(
        'The Universe Decides...',
        `
        <div class="dice-container">
            <span class="dice" id="npc-rolling-dice" style="font-size: 64px;">🎲</span>
            <div class="dice-result" id="npc-dice-result" style="opacity: 0; color: #9b59b6;">?</div>
        </div>
        <p style="text-align: center; color: #9b59b6; font-size: 8px;">Scientific Underdeterminism moves...</p>
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
        fameAwarded: fameReward
    });

    showModal(
        'THEORY ESTABLISHED!',
        `
        <p style="color: #ffd93d;">Scientific Underdeterminism has validated a hypothesis!</p>
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
        document.getElementById('roll-dice-btn').disabled = false;
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
        document.getElementById('roll-dice-btn').disabled = false;
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
// SETUP & INITIALIZATION
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
            const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#9b59b6'];
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

    log(`The research on "${GameState.entity.name}" begins!`, 'important');
    log(`${GameState.players.length} researchers compete for scientific glory.`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initSetupScreen);
