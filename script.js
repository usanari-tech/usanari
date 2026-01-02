// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];

// --- DOM Elements ---
const goalsContainer = document.getElementById('goals-container');
const goalForm = document.getElementById('goal-form');
const addGoalBtn = document.getElementById('add-goal-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.querySelector('.close-modal');
const categoryDatalist = document.getElementById('category-options');
const deadlinePresets = document.querySelectorAll('.preset-btn');
const dateInput = document.getElementById('goal-deadline');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryDatalist();
    renderStats();
    renderGoals();

    // Initial GSAP animations
    gsap.from('.glass-nav', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.stat-card', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power4.out' });
});

// --- Category persistence ---
const updateCategoryDatalist = () => {
    categoryDatalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
};

// --- Modal Control ---
const openModal = () => {
    modalOverlay.style.display = 'flex';
    gsap.fromTo('.modal-content',
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power4.out' }
    );
};

const closeModal = () => {
    gsap.to('.modal-content', {
        scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: () => {
            modalOverlay.style.display = 'none';
        }
    });
};

addGoalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// --- Deadline logic ---
deadlinePresets.forEach(btn => {
    btn.addEventListener('click', () => {
        deadlinePresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.value === 'custom') {
            dateInput.classList.remove('hidden-date');
        } else {
            dateInput.classList.add('hidden-date');
        }
    });
});

// --- Core Actions ---
const saveGoals = () => {
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('categories', JSON.stringify(categories));
};

goalForm.onsubmit = (e) => {
    e.preventDefault();

    const category = document.getElementById('goal-category').value.trim();
    const title = document.getElementById('goal-title').value;
    const tasksInput = document.getElementById('goal-tasks').value;
    const selectedDeadlineBtn = document.querySelector('.preset-btn.active');

    // Save new category
    if (category && !categories.includes(category)) {
        categories.push(category);
        updateCategoryDatalist();
    }

    // Process tasks
    const taskLines = tasksInput.split('\n').filter(line => line.trim() !== '');
    const tasks = taskLines.map((text, index) => ({
        id: Date.now() + index,
        text: text.trim(),
        done: false
    }));

    // Process deadline
    let deadline = '未定';
    const now = new Date();
    if (selectedDeadlineBtn.dataset.value === 'this-week') {
        const sunday = new Date(now.setDate(now.getDate() + (7 - now.getDay())));
        deadline = `${sunday.getMonth() + 1}/${sunday.getDate()}`;
    } else if (selectedDeadlineBtn.dataset.value === 'this-month') {
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        deadline = `${lastDay.getMonth() + 1}/${lastDay.getDate()}`;
    }

    const newGoal = {
        id: Date.now(),
        title,
        category,
        tasks,
        deadline,
        progress: 0
    };

    goals.push(newGoal);
    saveGoals();
    renderStats();
    renderGoals();

    goalForm.reset();
    closeModal();
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#6366f1']
    });
};

const toggleTask = (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    const task = goal.tasks.find(t => t.id === taskId);
    task.done = !task.done;

    // Update progress
    const doneCount = goal.tasks.filter(t => t.done).length;
    goal.progress = Math.round((doneCount / goal.tasks.length) * 100);

    saveGoals();
    renderStats();
    renderGoals();

    if (goal.progress === 100) {
        confetti({ particleCount: 50, scalar: 0.7 });
    }
};

// --- Rendering ---
const renderStats = () => {
    const totalTasks = goals.reduce((acc, g) => acc + g.tasks.length, 0);
    const completedTasks = goals.reduce((acc, g) => acc + g.tasks.filter(t => t.done).length, 0);
    const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById('overall-progress-text').innerText = `${overallProgress}%`;
    document.getElementById('pending-tasks-count').innerText = totalTasks - completedTasks;

    // Simple visual update for deadline
    const deadlines = goals.filter(g => g.deadline !== '未定').map(g => g.deadline);
    document.getElementById('upcoming-deadline-text').innerText = deadlines.length > 0 ? deadlines[0] : 'なし';
};

const renderGoals = () => {
    goalsContainer.innerHTML = '';

    if (goals.length === 0) {
        goalsContainer.innerHTML = '<div class="empty-state">新しい目標を登録して、2026年をデザインしましょう。</div>';
        return;
    }

    // Grouping by category
    const grouped = goals.reduce((acc, goal) => {
        if (!acc[goal.category]) acc[goal.category] = [];
        acc[goal.category].push(goal);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([category, categoryGoals]) => {
        const stackElement = document.createElement('div');
        stackElement.className = 'category-stack';

        stackElement.innerHTML = `
            <div class="category-header">
                <div class="category-label">${category}</div>
                <div class="stack-count">${categoryGoals.length}</div>
            </div>
            <div class="stack-content">
                ${categoryGoals.map((goal, idx) => `
                    <div class="goal-card-wrapper" data-goal-id="${goal.id}" style="z-index: ${20 - idx}; transform: translateY(${idx * 80}px)">
                        <div class="goal-card" onclick="toggleCategoryStack(this)">
                            <div class="goal-header">
                                <h4>${goal.title}</h4>
                                <span class="deadline-tag ${goal.deadline.includes('今日') ? 'deadline-urgent' : ''}">${goal.deadline}</span>
                            </div>
                            <!-- Details appear when stack expands -->
                            <div class="card-content-expand">
                                <div class="progress-mini-bar">
                                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                                </div>
                                <div class="task-mini-list">
                                    ${goal.tasks.map(task => `
                                        <div class="task-mini-item ${task.done ? 'done' : ''}" onclick="event.stopPropagation(); toggleTask(${goal.id}, ${task.id})">
                                            <div class="mini-checkbox"></div>
                                            <span class="mini-task-text">${task.text}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        goalsContainer.appendChild(stackElement);
    });
};

const toggleCategoryStack = (cardEl) => {
    const stack = cardEl.closest('.category-stack');
    const isExpanded = stack.classList.contains('is-expanded');
    const wrappers = stack.querySelectorAll('.goal-card-wrapper');

    if (isExpanded) {
        stack.classList.remove('is-expanded');
        wrappers.forEach((tr, i) => {
            gsap.to(tr, { y: i * 80, duration: 0.6, ease: 'expo.out' });
        });
    } else {
        stack.classList.add('is-expanded');
        gsap.to(wrappers, {
            y: 0,
            duration: 0.6,
            ease: 'expo.out'
        });
    }
};
