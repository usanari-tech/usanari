// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentView = 'active'; // 'active' or 'completed'
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};

// --- DOM Elements ---
const goalsContainer = document.getElementById('goals-container');
const goalForm = document.getElementById('goal-form');
const addGoalBtn = document.getElementById('add-goal-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.querySelector('.close-modal');
const categoryDatalist = document.getElementById('category-options');
const deadlinePresets = document.querySelectorAll('.preset-btn');
const dateInput = document.getElementById('goal-deadline');

const categoryManagerList = document.getElementById('category-manager-list');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    sanitizeData();
    updateCategoryDatalist();
    renderGoals();

    // Initial GSAP animations
    gsap.from('.glass-nav', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
});

// --- Data Sanitization ---
const sanitizeData = () => {
    let changed = false;
    goals.forEach(g => {
        if (!g.tasks) g.tasks = [];
        if (typeof g.progress !== 'number') g.progress = 0;
        // Fix deadline format if it's strictly "NaN.NaN.NaN" or similar
        if (g.deadline === 'NaN.NaN.NaN' || g.deadline === 'undefined') {
            g.deadline = '未定';
            changed = true;
        }
    });
    if (changed) saveGoals();
};

// --- Category persistence ---
const updateCategoryDatalist = () => {
    // Update Datalist
    categoryDatalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');

    // Update Chips in Modal
    if (categoryManagerList) {
        categoryManagerList.innerHTML = categories.map(cat => `
            <div class="cat-chip" onclick="selectCategory('${cat}')">
                <span>${cat}</span>
                <span class="cat-chip-delete" onclick="event.stopPropagation(); deleteCategoryPrompt(event, '${cat}')">&times;</span>
            </div>
        `).join('');
    }
};

const selectCategory = (catName) => {
    const categoryInput = document.getElementById('goal-category');
    if (categoryInput) {
        categoryInput.value = catName;
        categoryInput.focus();
        gsap.fromTo(categoryInput, { x: -2 }, { x: 0, duration: 0.1, repeat: 3, yoyo: true });
    }
};

const switchTab = (view) => {
    if (currentView === view) return;
    currentView = view;

    // Update Tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${view}`).classList.add('active');

    // Re-render
    renderGoals();
};

const showConfirm = (title, message, onConfirm) => {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    if (!overlay || !titleEl || !msgEl || !okBtn || !cancelBtn) return;

    titleEl.innerText = title;
    msgEl.innerText = message;

    overlay.style.display = 'flex';

    gsap.fromTo('.confirm-card',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );

    const handleClose = () => {
        gsap.to('.confirm-card', {
            scale: 0.8, opacity: 0, duration: 0.2,
            onComplete: () => {
                overlay.style.display = 'none';
            }
        });
    };

    okBtn.onclick = (e) => {
        e.stopPropagation();
        onConfirm();
        handleClose();
    };

    cancelBtn.onclick = (e) => {
        e.stopPropagation();
        handleClose();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) handleClose();
    };
};

const deleteCategoryPrompt = (event, catName) => {
    const message = `カテゴリー「${catName}」を削除してもよろしいですか？`;

    showConfirm("カテゴリーの削除", message, () => {
        const chip = event.target.closest('.cat-chip');
        if (chip) {
            gsap.to(chip, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    categories = categories.filter(c => c !== catName);
                    saveGoals();
                    updateCategoryDatalist();
                }
            });
        } else {
            categories = categories.filter(c => c !== catName);
            saveGoals();
            updateCategoryDatalist();
        }
    });
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

const logActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    activityLog[today] = (activityLog[today] || 0) + 1;
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
};

goalForm.onsubmit = (e) => {
    e.preventDefault();

    const categoryInput = document.getElementById('goal-category');
    const titleInput = document.getElementById('goal-title');
    const tasksInput = document.getElementById('goal-tasks');
    const selectedDeadlineBtn = document.querySelector('.preset-btn.active');

    const category = categoryInput.value.trim();
    const title = titleInput.value.trim();
    const tasksRaw = tasksInput.value;

    // 基本バリデーション
    if (!title) {
        alert('目標の名前を入力してください。');
        return;
    }
    if (!category) {
        alert('カテゴリーを選択または入力してください。');
        return;
    }

    // カテゴリーの自動登録
    if (!categories.includes(category)) {
        categories.push(category);
        updateCategoryDatalist();
    }

    // タスクのパース
    const taskLines = tasksRaw.split('\n').filter(line => line.trim() !== '');
    const tasks = taskLines.map((text, index) => ({
        id: Date.now() + index, // より堅牢なID生成が必要な場合は後で検討
        text: text.trim(),
        done: false
    }));

    // 期限の計算（従来のロジックを継承）
    let deadline = '未定';
    const now = new Date();
    if (selectedDeadlineBtn.dataset.value === 'this-week') {
        const sunday = new Date(now.setDate(now.getDate() + (7 - now.getDay())));
        deadline = `${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;
    } else if (selectedDeadlineBtn.dataset.value === 'this-month') {
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        deadline = `${lastDay.getFullYear()}.${lastDay.getMonth() + 1}.${lastDay.getDate()}`;
    } else if (selectedDeadlineBtn.dataset.value === 'this-year') {
        deadline = `${now.getFullYear()}.12.31`;
    } else if (selectedDeadlineBtn.dataset.value === 'custom' && dateInput.value) {
        const d = new Date(dateInput.value);
        deadline = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
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
    logActivity();
    renderGoals();

    // フォームリセット
    goalForm.reset();
    deadlinePresets.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-value="none"]').classList.add('active');
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

    // Allow toggle
    task.done = !task.done;

    // Update progress
    const doneCount = goal.tasks.filter(t => t.done).length;
    goal.progress = Math.round((doneCount / goal.tasks.length) * 100);

    // Verify completion
    if (task.done) {
        logActivity();
    }

    saveGoals();
    renderGoals();

    if (goal.progress === 100) {
        confetti({ particleCount: 50, scalar: 0.7 });
    }
};

const deleteGoal = (id) => {
    showConfirm("目標の削除", "この目標を削除してもよろしいですか？この操作は取り消せません。", () => {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        renderGoals();
    });
};

// --- Rendering & Logic ---





const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '未定') return '未定';
    // Handle 'YYYY.MM.DD' format or standard Date string
    const d = new Date(dateStr.replace(/\./g, '/')); // Replace dots for Safari/Legacy safety
    if (isNaN(d.getTime())) return dateStr;

    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

const renderGoals = () => {
    goalsContainer.innerHTML = '';

    const filteredGoals = goals.filter(goal => {
        if (currentView === 'completed') return goal.progress === 100;
        return goal.progress < 100;
    });

    if (filteredGoals.length === 0) {
        const message = currentView === 'completed'
            ? '達成された目標はまだありません。'
            : '2026年の軌道がまだ設定されていません。<br>「新しい目標を追加」から始めましょう。';
        goalsContainer.innerHTML = `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
        return;
    }

    // カテゴリーごとのグループ化
    const grouped = filteredGoals.reduce((acc, goal) => {
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
                ${categoryGoals.map((goal) => {
            const formattedDeadline = goal.deadline === '未定' ? '未定' : formatDate(goal.deadline);
            return `
                    <div class="goal-card-wrapper" data-goal-id="${goal.id}">
                        <div class="goal-card">
                            <div class="goal-header">
                                <div class="goal-title-area">
                                    <h4>${goal.title}</h4>
                                    <span class="deadline-tag ${goal.deadline.includes('今日') ? 'deadline-urgent' : ''}">${formattedDeadline}</span>
                                </div>
                                <button class="btn-delete-goal" onclick="event.stopPropagation(); deleteGoal(${goal.id})" title="目標を削除">&times;</button>
                            </div>
                            
                            <div class="progress-mini-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%"></div>
                            </div>

                            <div class="card-content-expand">
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
                `}).join('')}
            </div>
        `;
        goalsContainer.appendChild(stackElement);
    });
};

const toggleGoalExpand = (cardElement) => {
    const wrapper = cardElement.closest('.goal-card-wrapper');
    wrapper.classList.toggle('is-focused');
};
