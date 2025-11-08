// Task Tracker & Reward System

class TaskRewardApp {
    constructor() {
        this.tasks = [];
        this.coins = 0;
        this.freeTime = 0; // in minutes
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.timerRunning = false;

        this.COINS_PER_TASK = 3;

        this.initializeElements();
        this.loadData();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        // Task elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');

        // Stats elements
        this.coinCountEl = document.getElementById('coinCount');
        this.freeTimeEl = document.getElementById('freeTime');

        // Shop elements
        this.shopItems = document.querySelectorAll('.shop-item');

        // Timer elements
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.resetTimerBtn = document.getElementById('resetTimerBtn');
    }

    attachEventListeners() {
        // Task input
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Shop items
        this.shopItems.forEach(item => {
            const btn = item.querySelector('.btn-shop');
            btn.addEventListener('click', () => {
                const minutes = parseInt(item.dataset.minutes);
                const cost = parseInt(item.dataset.cost);
                this.purchaseTime(minutes, cost);
            });
        });

        // Timer controls
        this.startTimerBtn.addEventListener('click', () => this.startTimer());
        this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        this.resetTimerBtn.addEventListener('click', () => this.resetTimer());
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.saveData();
        this.render();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const wasCompleted = task.completed;
        task.completed = !task.completed;

        // Award coins when task is completed
        if (!wasCompleted && task.completed) {
            this.coins += this.COINS_PER_TASK;
            this.animateCoinEarn();
            this.showNotification(`+${this.COINS_PER_TASK} coins!`);
        } else if (wasCompleted && !task.completed) {
            // Remove coins if unchecking
            this.coins = Math.max(0, this.coins - this.COINS_PER_TASK);
        }

        this.saveData();
        this.render();
    }

    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.completed) {
            // Return coins if deleting a completed task
            this.coins = Math.max(0, this.coins - this.COINS_PER_TASK);
        }

        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.render();
    }

    purchaseTime(minutes, cost) {
        if (this.coins < cost) {
            alert(`Not enough coins! You need ${cost} coins but only have ${this.coins}.`);
            return;
        }

        this.coins -= cost;
        this.freeTime += minutes;
        this.showNotification(`Purchased ${minutes} minutes!`);
        this.saveData();
        this.render();
        this.updateTimerButtons();
    }

    startTimer() {
        if (this.freeTime <= 0) {
            alert('No free time available! Complete tasks to earn coins and purchase time.');
            return;
        }

        if (this.timerSeconds === 0) {
            this.timerSeconds = this.freeTime * 60;
        }

        this.timerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.updateTimerDisplay();

            if (this.timerSeconds <= 0) {
                this.pauseTimer();
                this.showNotification('Time\'s up! Get back to work!');
                this.timerSeconds = 0;
                this.updateTimerDisplay();
            }
        }, 1000);

        this.updateTimerButtons();
    }

    pauseTimer() {
        this.timerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.updateTimerButtons();
    }

    resetTimer() {
        this.pauseTimer();

        // Return unused time to the pool
        const unusedMinutes = Math.floor(this.timerSeconds / 60);
        this.freeTime += unusedMinutes;

        this.timerSeconds = 0;
        this.updateTimerDisplay();
        this.updateTimerButtons();
        this.saveData();
        this.render();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        this.timerDisplay.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimerButtons() {
        const hasTime = this.freeTime > 0 || this.timerSeconds > 0;

        this.startTimerBtn.disabled = !hasTime || this.timerRunning;
        this.pauseTimerBtn.disabled = !this.timerRunning;
        this.resetTimerBtn.disabled = this.timerSeconds === 0;
    }

    animateCoinEarn() {
        this.coinCountEl.classList.add('coin-animation');
        setTimeout(() => {
            this.coinCountEl.classList.remove('coin-animation');
        }, 500);
    }

    showNotification(message) {
        // Simple notification - could be enhanced with a toast library
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    render() {
        // Update stats
        this.coinCountEl.textContent = this.coins;
        this.freeTimeEl.textContent = this.freeTime;

        // Render task list
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started!</div>';
        } else {
            this.taskList.innerHTML = this.tasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input
                        type="checkbox"
                        class="task-checkbox"
                        ${task.completed ? 'checked' : ''}
                        onchange="app.toggleTask(${task.id})"
                    >
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <button class="task-delete" onclick="app.deleteTask(${task.id})">Delete</button>
                </div>
            `).join('');
        }

        this.updateTimerButtons();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveData() {
        const data = {
            tasks: this.tasks,
            coins: this.coins,
            freeTime: this.freeTime,
            timerSeconds: this.timerSeconds
        };
        localStorage.setItem('taskRewardApp', JSON.stringify(data));
    }

    loadData() {
        const stored = localStorage.getItem('taskRewardApp');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.tasks = data.tasks || [];
                this.coins = data.coins || 0;
                this.freeTime = data.freeTime || 0;
                this.timerSeconds = data.timerSeconds || 0;
                if (this.timerSeconds > 0) {
                    this.updateTimerDisplay();
                }
            } catch (e) {
                console.error('Error loading data:', e);
            }
        }
    }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
const app = new TaskRewardApp();
