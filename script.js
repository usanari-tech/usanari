// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentView = 'active'; // 'active' or 'completed'
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
let editingGoalId = null;

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
    try {
        sanitizeData();
        updateCategoryDatalist();
        renderGoals();

        // Initial UI state for dashboard (hidden on active view)
        const dashboardElements = document.querySelectorAll('.mission-control, .dashboard-section');
        dashboardElements.forEach(el => el.style.display = 'none');

        // Initial GSAP animations - Delayed slightly for stability
        setTimeout(() => {
            gsap.from('.glass-nav', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
        }, 100);
    } catch (error) {
        console.error("Initialization Failed:", error);
    }
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

    // Toggle Dashboard Visibility based on View
    const dashboardElements = document.querySelectorAll('.mission-control, .dashboard-section');
    if (view === 'completed') {
        dashboardElements.forEach(el => {
            el.style.display = 'block';
            gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        });
        updateDashboard();
    } else {
        dashboardElements.forEach(el => {
            el.style.display = 'none';
        });
    }

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
const openModal = (goalId = null) => {
    editingGoalId = goalId;
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('btn-submit');

    if (editingGoalId) {
        // Edit Mode
        const goal = goals.find(g => String(g.id) === String(editingGoalId));
        if (!goal) return;

        modalTitle.innerText = '目標の編集';
        submitBtn.innerText = '更新する';

        document.getElementById('goal-category').value = goal.category;
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-tasks').value = goal.tasks.map(t => t.text).join('\n');

        // Handle Deadline restoration
        deadlinePresets.forEach(b => b.classList.remove('active'));
        dateInput.classList.add('hidden-date'); // Reset default

        if (goal.deadline === '未定') {
            document.querySelector('[data-value="none"]').classList.add('active');
        } else {
            // Smart preset matching
            let matched = false;
            const now = new Date();

            // This Week
            const sun = new Date(new Date().setDate(now.getDate() + (7 - now.getDay())));
            const thisWeekStr = `${sun.getFullYear()}.${sun.getMonth() + 1}.${sun.getDate()}`;

            // This Month
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const thisMonthStr = `${lastDay.getFullYear()}.${lastDay.getMonth() + 1}.${lastDay.getDate()}`;

            // This Year
            const thisYearStr = `${now.getFullYear()}.12.31`;

            if (goal.deadline === thisWeekStr) {
                document.querySelector('[data-value="this-week"]').classList.add('active');
                matched = true;
            } else if (goal.deadline === thisMonthStr) {
                document.querySelector('[data-value="this-month"]').classList.add('active');
                matched = true;
            } else if (goal.deadline === thisYearStr) {
                document.querySelector('[data-value="this-year"]').classList.add('active');
                matched = true;
            }

            if (!matched && goal.deadline.includes('.')) {
                // Custom Date handling
                const customBtn = Array.from(deadlinePresets).find(b => b.dataset.value === 'custom');
                if (customBtn) customBtn.classList.add('active');
                dateInput.classList.remove('hidden-date');

                // Format YYYY.MM.DD to YYYY-MM-DD for input[type=date]
                const [y, m, d] = goal.deadline.split('.');
                dateInput.value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
        }
    } else {
        // Add Mode
        modalTitle.innerText = '目標の登録';
        submitBtn.innerText = '登録';
        goalForm.reset();
        deadlinePresets.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-value="none"]').classList.add('active');
        dateInput.classList.add('hidden-date');
    }

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

addGoalBtn.addEventListener('click', () => openModal());
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

    // 期限の計算（共通ロジック）
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

    if (editingGoalId) {
        // UPDATE MODE
        const goalIndex = goals.findIndex(g => String(g.id) === String(editingGoalId));
        if (goalIndex === -1) return;

        const existingGoal = goals[goalIndex];

        // タスクのリマップ（同じ文言なら完了状態を引き継ぐ、新しいものは新規）
        const updatedTasks = taskLines.map((text, index) => {
            const trimmed = text.trim();
            const existingTask = existingGoal.tasks.find(t => t.text === trimmed);
            return {
                id: existingTask ? existingTask.id : Date.now() + index,
                text: trimmed,
                done: existingTask ? existingTask.done : false
            };
        });

        goals[goalIndex] = {
            ...existingGoal,
            title,
            category,
            deadline,
            tasks: updatedTasks
        };

        // 再計算
        const doneCount = updatedTasks.filter(t => t.done).length;
        goals[goalIndex].progress = Math.round((doneCount / updatedTasks.length) * 100);

    } else {
        // CREATE MODE
        const tasks = taskLines.map((text, index) => ({
            id: Date.now() + index,
            text: text.trim(),
            done: false
        }));

        const newGoal = {
            id: Date.now(),
            title,
            category,
            tasks,
            deadline,
            progress: 0
        };
        goals.push(newGoal);
        logActivity();
    }

    saveGoals();
    renderGoals();
    updateDashboard();

    // フォームリセット
    goalForm.reset();
    closeModal();

    if (!editingGoalId) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4488ff', '#5d5afe']
        });
    }
};

const toggleTask = (goalId, taskId) => {
    const goal = goals.find(g => String(g.id) === String(goalId));
    const task = goal.tasks.find(t => String(t.id) === String(taskId));

    // Allow toggle
    task.done = !task.done;

    // Update progress
    const doneCount = goal.tasks.filter(t => t.done).length;
    goal.progress = Math.round((doneCount / goal.tasks.length) * 100);

    // Verify completion
    if (task.done) {
        logActivity();
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        task.completedAt = `${yy}.${mm}.${dd}`;
    } else {
        delete task.completedAt;
    }

    saveGoals();
    renderGoals();
    updateDashboard();

    if (goal.progress === 100) {
        confetti({ particleCount: 50, scalar: 0.7 });
    }
};

const deleteGoal = (id) => {
    showConfirm("目標の削除", "この目標を削除してもよろしいですか？この操作は取り消せません。", () => {
        goals = goals.filter(g => String(g.id) !== String(id));
        saveGoals();
        renderGoals();
        updateDashboard();
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
                        <div class="goal-card" onclick="openModal('${goal.id}')">
                            <div class="goal-header">
                                <div class="goal-title-area">
                                    <h4>${goal.title}</h4>
                                    <span class="deadline-tag ${goal.deadline.includes('今日') ? 'deadline-urgent' : ''}">${formattedDeadline}</span>
                                </div>
                                <button class="btn-delete-goal" onclick="event.stopPropagation(); deleteGoal('${goal.id}')" title="目標を削除">&times;</button>
                            </div>
                            
                            <div class="progress-mini-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%"></div>
                            </div>
 
                            <div class="card-content-expand">
                                <div class="task-mini-list">
                                    ${goal.tasks.map(task => `
                                        <div class="task-mini-item ${task.done ? 'done' : ''}" onclick="event.stopPropagation(); toggleTask('${goal.id}', '${task.id}')">
                                            <div class="mini-checkbox"></div>
                                            <span class="mini-task-text">${task.text}</span>
                                            ${task.completedAt ? `<span class="task-date">${task.completedAt}</span>` : ''}
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

// --- Dashboard & Analytics Logic ---
const updateDashboard = () => {
    // 1. Basic Stats
    const total = goals.length;
    const active = goals.filter(g => g.progress < 100).length;
    const achieved = goals.filter(g => g.progress === 100).length;

    const statTotalEl = document.getElementById('stat-total');
    const statActiveEl = document.getElementById('stat-active');
    const statCompletedEl = document.getElementById('stat-completed');

    if (statTotalEl) statTotalEl.innerText = total;
    if (statActiveEl) statActiveEl.innerText = active;
    if (statCompletedEl) statCompletedEl.innerText = achieved;

    // 2. Daily Momentum (Energy)
    // Based on activities today in activityLog
    const today = new Date().toISOString().split('T')[0];
    const todayCount = activityLog[today] || 0;
    const energyFill = document.getElementById('energy-fill');
    if (energyFill) {
        // Assume 5 activities as 100% for the daily goal
        const energyPercent = Math.min((todayCount / 5) * 100, 100);
        gsap.to(energyFill, { width: `${energyPercent}%`, duration: 1, ease: 'power2.out' });
    }

    // 3. Action Momentum Chart (Past 7 Days)
    const momentumFlow = document.getElementById('momentum-flow');
    if (momentumFlow) {
        momentumFlow.innerHTML = '';
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const counts = dates.map(d => activityLog[d] || 0);
        const maxCount = Math.max(...counts, 1);
        const avg = (counts.reduce((a, b) => a + b, 0) / 7).toFixed(1);

        dates.forEach((date, i) => {
            const bar = document.createElement('div');
            bar.className = 'momentum-bar';
            if (i === 6) bar.classList.add('active'); // Today
            const height = (counts[i] / maxCount) * 100;

            bar.style.height = '0%';
            momentumFlow.appendChild(bar);
            gsap.to(bar, { height: `${Math.max(height, 5)}%`, duration: 0.8, delay: i * 0.05, ease: 'back.out(1.5)' });
        });

        document.getElementById('momentum-score').innerText = todayCount;
        document.getElementById('stat-avg').innerText = avg;
        document.getElementById('stat-max').innerText = Math.max(...counts);
    }

    // 4. Category Balance
    const catContainer = document.getElementById('cat-balance-container');
    if (catContainer) {
        catContainer.innerHTML = '';
        const catStats = {};
        categories.forEach(cat => catStats[cat] = 0);
        goals.forEach(g => {
            if (catStats[g.category] !== undefined) {
                catStats[g.category] += g.progress / (goals.filter(goal => goal.category === g.category).length || 1);
            }
        });

        Object.entries(catStats).forEach(([cat, progress]) => {
            const item = document.createElement('div');
            item.className = 'cat-stat-item';
            const roundedProgress = Math.round(progress);
            item.innerHTML = `
                <div class="cat-header">
                    <span>${cat}</span>
                    <span>${roundedProgress}%</span>
                </div>
                <div class="cat-bar-bg">
                    <div class="cat-bar-fill" style="width: 0%"></div>
                </div>
            `;
            catContainer.appendChild(item);
            const fill = item.querySelector('.cat-bar-fill');
            gsap.to(fill, { width: `${roundedProgress}%`, duration: 1, ease: 'power2.out' });
        });
    }
};
