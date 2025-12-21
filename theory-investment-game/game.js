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

        // Play hop sound effect (visual feedback via bounce)
        if (anim.currentStep <= anim.totalSteps) {
            // Continue to next step
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
    constructor(name, color, index) {
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
        log(`${this.name} has passed away at age ${this.age}. Their legacy lives on through ${this.theoriesPublished.length} theories.`, 'important');
    }

    hireStudent(type) {
        const cost = STUDENT_TYPES[type].cost;
        if (this.spendFame(cost)) {
            this.students.push(type);
            log(`${this.name} hired a ${STUDENT_TYPES[type].name} for ${cost} fame.`);
            return true;
        }
        return false;
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

        // Draw space type icon
        ctx.fillStyle = '#000';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';

        const icons = {
            [SPACE_TYPES.START]: 'GO',
            [SPACE_TYPES.HYPOTHESIS]: space.isProven ? 'T' : 'H',
            [SPACE_TYPES.RECRUIT]: 'R',
            [SPACE_TYPES.CONFERENCE]: 'C',
            [SPACE_TYPES.SABBATICAL]: 'S',
            [SPACE_TYPES.PEER_REVIEW]: 'PR',
            [SPACE_TYPES.GRANT]: 'G',
            [SPACE_TYPES.SCANDAL]: '!',
            [SPACE_TYPES.COLLABORATION]: 'CO',
            [SPACE_TYPES.EUREKA]: 'E!'
        };

        ctx.fillText(icons[space.type] || '?', pos.x + spaceSize/2 - 1, pos.y + spaceSize/2 + 4);

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

        div.innerHTML = `
            <div class="name" style="color: ${player.color}">${player.name}${activeIndicator}</div>
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
        // Hypothesis exists - can invest more
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
            <p>Investment cost: ${space.investmentCost} years</p>
            <p class="info-text">Available life years: ${availableYears}</p>
            `,
            [
                {
                    text: 'Invest',
                    action: () => {
                        if (availableYears >= space.investmentCost) {
                            const existingInv = space.investments.find(i => i.playerIndex === player.index);
                            if (existingInv) {
                                existingInv.years += space.investmentCost;
                            } else {
                                space.investments.push({ player: player.name, years: space.investmentCost, playerIndex: player.index });
                            }
                            player.investLife(space.investmentCost);
                            log(`${player.name} invested ${space.investmentCost} more years in "${space.hypothesis}".`);
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

    // Move to next alive player
    nextPlayer();

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
    document.getElementById('current-turn').textContent = `Turn: ${player.name}`;
    document.getElementById('current-turn').style.color = player.color;
    updatePlayerStats();
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
    // Get entity info
    GameState.entity.type = document.getElementById('entity-type').value;
    GameState.entity.name = document.getElementById('entity-name').value || 'The Unknown';

    // Get players
    const playerInputs = document.querySelectorAll('.player-input');
    playerInputs.forEach((input, index) => {
        const name = input.querySelector('.player-name').value || `Player ${index + 1}`;
        const color = input.querySelector('.player-color').value;
        GameState.players.push(new Player(name, color, index));
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
