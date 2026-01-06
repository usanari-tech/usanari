// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
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
const momentumFlow = document.getElementById('momentum-flow');
const momentumTooltip = document.getElementById('momentum-tooltip');
const categoryStatsContainer = document.getElementById('category-stats');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    sanitizeData();
    updateCategoryDatalist();
    renderStats(); // Calls renderMomentumFlow and renderCategoryStats
    renderGoals();

    // Initial GSAP animations
    gsap.from('.glass-nav', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.mission-control', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power4.out' });
    gsap.from('.analytics-card', { y: 20, opacity: 0, duration: 0.8, delay: 0.4, stagger: 0.2, ease: 'power4.out' });
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
            <div class="cat-chip">
                <span>${cat}</span>
                <span class="cat-chip-delete" onclick="deleteCategory('${cat}')">&times;</span>
            </div>
        `).join('');
    }

    // Refresh stats to reflect any category changes
    renderCategoryStats();
};

const deleteCategory = (catName) => {
    // Check if any goals are using this category
    const goalsInCat = goals.filter(g => g.category === catName);
    const message = goalsInCat.length > 0
        ? `このカテゴリーに関連する目標が ${goalsInCat.length} 件あります。カテゴリーのリストから削除してもよろしいですか？（既存の目標は消えません）`
        : `カテゴリー「${catName}」を削除してもよろしいですか？`;

    if (confirm(message)) {
        categories = categories.filter(c => c !== catName);
        saveGoals();
        updateCategoryDatalist();
    }
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
    renderMomentumFlow(); // Immediate update
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
        deadline = `${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;
    } else if (selectedDeadlineBtn.dataset.value === 'this-month') {
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        deadline = `${lastDay.getFullYear()}.${lastDay.getMonth() + 1}.${lastDay.getDate()}`;
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
    logActivity(); // Creating a goal counts as activity
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
    renderStats(); // Updates mission control and charts
    renderGoals();

    if (goal.progress === 100) {
        confetti({ particleCount: 50, scalar: 0.7 });
    }
};

const deleteGoal = (id) => {
    if (confirm('この目標を削除してもよろしいですか？')) {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        renderStats();
        renderGoals();
    }
};

// --- Rendering & Logic ---

const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
};

const renderMomentumFlow = () => {
    if (!momentumFlow) return;

    momentumFlow.innerHTML = '';

    // 1. Generate last 28 days
    const days = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            count: activityLog[dateStr] || 0,
            dayName: getDayName(dateStr)
        });
    }

    // 2. Scoring Algorithm (Weighted)
    let totalScore = 0;
    let rankPoints = 0;

    days.forEach((day, index) => {
        // Weight: Recent days have higher impact. Index 27 is today (weight 1.0)
        // Linear weight from 0.4 to 1.0
        const weight = 0.4 + (0.6 * (index / 27));
        const dailyScore = day.count * weight;
        totalScore += dailyScore;
        rankPoints += day.count * 10; // Simple points for rank
    });

    // Display Score
    const finalScore = totalScore.toFixed(1);
    const scoreDisplay = document.getElementById('momentum-score-display');
    if (scoreDisplay) scoreDisplay.innerText = finalScore;

    // 3. Render Bars
    // Determine max for scaling
    const maxCount = Math.max(...days.map(d => d.count), 1); // Avoid div by zero

    days.forEach((day, index) => {
        const bar = document.createElement('div');
        bar.className = 'momentum-bar';
        if (day.count > 0) bar.classList.add('active');

        // Height based on count relative to max (min height 10%)
        const heightPercent = day.count === 0 ? 5 : 10 + ((day.count / maxCount) * 90);
        bar.style.height = `${heightPercent}%`;

        // Animation delay
        bar.style.transitionDelay = `${index * 20}ms`;

        // Tooltip Events
        bar.addEventListener('mouseenter', (e) => {
            const rect = bar.getBoundingClientRect();
            momentumTooltip.innerHTML = `
                <span class="tooltip-date">${day.date} (${day.dayName})</span>
                <span style="font-size:1.1em">⚡ ${day.count} Actions</span>
                <div style="font-size:0.8em; margin-top:4px; color:#3b82f6">
                    ${day.count > 0 ? "Good Step!" : "No Activity"}
                </div>
            `;
            momentumTooltip.classList.remove('hidden');
            momentumTooltip.classList.add('visible');

            // Position
            const tooltipX = rect.left + (rect.width / 2) - (momentumTooltip.offsetWidth / 2);
            const tooltipY = rect.top - momentumTooltip.offsetHeight - 10;

            momentumTooltip.style.left = `${tooltipX}px`;
            momentumTooltip.style.top = `${window.scrollY + tooltipY}px`; // Absolute to page
        });

        bar.addEventListener('mouseleave', () => {
            momentumTooltip.classList.remove('visible');
            setTimeout(() => momentumTooltip.classList.add('hidden'), 200);
        });

        momentumFlow.appendChild(bar);
    });

    // 4. Update Footer Stats
    const totalActions = days.reduce((sum, d) => sum + d.count, 0);
    const bestDay = Math.max(...days.map(d => d.count));
    const activeDays = days.filter(d => d.count > 0).length;
    const activeRate = Math.round((activeDays / 28) * 100);

    document.getElementById('mom-total').innerText = totalActions;
    document.getElementById('mom-max').innerText = bestDay;
    document.getElementById('mom-rate').innerText = `${activeRate}%`;

    // 5. Rank Progress
    // Simple logic: Next rank at next multiple of 50 actions?
    // Let's use points. 
    // Rank logic: 0-100 (Starter), 100-300 (Builder), 300+ (Flow) based on Monthly Vol
    const progressFill = document.getElementById('rank-progress-bar');
    const nextRankName = document.getElementById('next-rank-name');
    const nextRankPoints = document.getElementById('next-rank-points');

    let progress = 0;
    if (totalActions < 50) {
        progress = (totalActions / 50) * 100;
        nextRankName.innerText = "Next: Builder";
        nextRankPoints.innerText = `+${50 - totalActions}`;
    } else if (totalActions < 150) {
        progress = ((totalActions - 50) / 100) * 100;
        nextRankName.innerText = "Next: Flow Master";
        nextRankPoints.innerText = `+${150 - totalActions}`;
    } else {
        progress = 100;
        nextRankName.innerText = "Max Rank Reached";
        nextRankPoints.innerText = "";
    }

    if (progressFill) progressFill.style.width = `${progress}%`;
};

const renderCategoryStats = () => {
    if (!categoryStatsContainer) return;
    categoryStatsContainer.innerHTML = '';

    // Calculate stats per category
    const stats = {};
    goals.forEach(g => {
        if (!stats[g.category]) stats[g.category] = { total: 0, done: 0 };
        const total = g.tasks.length;
        const done = g.tasks.filter(t => t.done).length;
        stats[g.category].total += total;
        stats[g.category].done += done;
    });

    Object.entries(stats).forEach(([cat, data]) => {
        const percentage = data.total === 0 ? 0 : Math.round((data.done / data.total) * 100);

        const item = document.createElement('div');
        item.className = 'cat-stat-item';
        item.innerHTML = `
            <div class="cat-header">
                <span>${cat}</span>
                <span>${percentage}%</span>
            </div>
            <div class="cat-bar-bg">
                <div class="cat-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        categoryStatsContainer.appendChild(item);
    });
};

const renderStats = () => {
    const totalTasks = goals.reduce((acc, g) => acc + g.tasks.length, 0);
    const completedTasks = goals.reduce((acc, g) => acc + g.tasks.filter(t => t.done).length, 0);
    const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Mission Control Updates
    document.getElementById('overall-progress-text').innerText = `${overallProgress}%`;
    document.getElementById('pending-tasks-count').innerText = totalTasks - completedTasks;

    // Status Text logic
    const statusText = document.getElementById('current-status-text');
    if (overallProgress === 0) statusText.innerText = "Starting";
    else if (overallProgress < 30) statusText.innerText = "Warming Up";
    else if (overallProgress < 60) statusText.innerText = "Climbing";
    else if (overallProgress < 90) statusText.innerText = "Cruising";
    else statusText.innerText = "Peak Performance";

    // Energy Bar (Total Progress visual)
    const energyFill = document.getElementById('total-progress');
    if (energyFill) energyFill.style.width = `${overallProgress}%`;

    // Render Sub-components
    renderMomentumFlow();
    renderCategoryStats();
};

const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '未定') return '未定';
    // Handle 'YYYY.MM.DD' format or standard Date string
    const d = new Date(dateStr.replace(/\./g, '/')); // Replace dots for Safari/Legacy safety
    if (isNaN(d.getTime())) return dateStr;

    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
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
                ${categoryGoals.map((goal, idx) => {
            const formattedDeadline = goal.deadline === '未定' ? '未定' : formatDate(goal.deadline);
            return `
                    <div class="goal-card-wrapper" data-goal-id="${goal.id}" style="z-index: ${30 - idx}; transform: translateY(${-idx * 40}px)">
                        <div class="goal-card" onclick="toggleCategoryStack(this)">
                            <div class="goal-header">
                                <div style="flex:1">
                                    <h4>${goal.title}</h4>
                                    <span class="deadline-tag ${goal.deadline.includes('今日') ? 'deadline-urgent' : ''}">${formattedDeadline}</span>
                                </div>
                                <button class="btn-delete-goal" onclick="event.stopPropagation(); deleteGoal(${goal.id})">&times;</button>
                            </div>
                            <!-- Task Details -->
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
                `}).join('')}
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
        // Collapse to card stack (Upward offset: -40px)
        stack.classList.remove('is-expanded');
        wrappers.forEach((tr, i) => {
            gsap.to(tr, { y: -i * 40, duration: 0.6, ease: 'expo.out' });
        });
    } else {
        // Expand to vertical list
        stack.classList.add('is-expanded');
        gsap.to(wrappers, { y: 0, duration: 0.6, ease: 'expo.out' });
    }
};
