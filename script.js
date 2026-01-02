// --- Data Management ---
let goals = JSON.parse(localStorage.getItem('goals-2026')) || [];

const saveGoals = () => {
    localStorage.setItem('goals-2026', JSON.stringify(goals));
    updateTotalProgress();
};

// --- DOM Elements ---
const goalsContainer = document.getElementById('goals-container');
const modalOverlay = document.getElementById('modal-overlay');
const addGoalBtn = document.getElementById('add-goal-btn');
const closeModalBtn = document.querySelector('.close-modal');
const goalForm = document.getElementById('goal-form');
const totalProgressFill = document.getElementById('total-progress');

// --- Initialization & Animations ---
document.addEventListener('DOMContentLoaded', () => {
    gsap.from('.glass-nav', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.hero-section h2', { y: 30, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power4.out' });
    renderGoals();
    updateTotalProgress();
});

// --- Modal Control ---
const openModal = () => {
    modalOverlay.style.display = 'flex';
    gsap.fromTo('.modal-content',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
};

const closeModal = () => {
    gsap.to('.modal-content', {
        scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => {
            modalOverlay.style.display = 'none';
        }
    });
};

addGoalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

// --- Goal Actions ---
goalForm.onsubmit = (e) => {
    e.preventDefault();

    // Process dynamic tasks
    const tasksInput = document.getElementById('goal-tasks').value;
    const taskLines = tasksInput.split('\n').filter(line => line.trim() !== '');

    const tasks = taskLines.length > 0
        ? taskLines.map((text, index) => ({ id: Date.now() + index, text: text.trim(), done: false }))
        : [
            { id: 1, text: '最初の一歩を踏み出す', done: false },
            { id: 2, text: '習慣化を定着させる', done: false }
        ];

    const newGoal = {
        id: Date.now(),
        title: document.getElementById('goal-title').value,
        category: document.getElementById('goal-category').value,
        tasks: tasks,
        progress: 0
    };

    goals.push(newGoal);
    saveGoals();
    renderGoals();

    // Success feedback
    goalForm.reset();
    closeModal();
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa']
    });
};

const toggleTask = (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    const task = goal.tasks.find(t => t.id === taskId);
    task.done = !task.done;

    // Calculate progress
    const doneTasks = goal.tasks.filter(t => t.done).length;
    goal.progress = (doneTasks / goal.tasks.length) * 100;

    saveGoals();
    renderGoals();

    if (task.done) {
        confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#4ade80', '#38bdf8']
        });
    }
};

// --- Rendering ---
const renderGoals = () => {
    if (goals.length === 0) {
        goalsContainer.innerHTML = '<div class="empty-state"><p>まだ目標がありません。＋ボタンから追加してください。</p></div>';
        return;
    }

    goalsContainer.innerHTML = '';
    goals.forEach(goal => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="category-tag">${goal.category.toUpperCase()}</div>
            <h4>${goal.title}</h4>
            <div class="card-progress">
                <div class="progress-bar-sm">
                    <div class="progress-fill-sm" style="width: ${goal.progress}%"></div>
                </div>
                <span class="progress-text">${Math.round(goal.progress)}%</span>
            </div>
            <ul class="task-list">
                ${goal.tasks.map(task => `
                    <li class="task-item ${task.done ? 'done' : ''}" onclick="toggleTask(${goal.id}, ${task.id})">
                        <span class="checkbox"></span>
                        <span class="task-text">${task.text}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        goalsContainer.appendChild(card);
        // 新しく追加されたカードのみアニメーション
        if (goal.id > Date.now() - 1000) {
            gsap.from(card, { y: 20, opacity: 0, duration: 0.6, ease: 'power4.out' });
        }
    });
};

const updateTotalProgress = () => {
    if (goals.length === 0) {
        totalProgressFill.style.width = '0%';
        return;
    }
    const avgProgress = goals.reduce((acc, g) => acc + g.progress, 0) / goals.length;
    totalProgressFill.style.width = `${avgProgress}%`;
};
