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
            <div class="cat-chip" onclick="selectCategory('${cat}')">
                <span>${cat}</span>
                <span class="cat-chip-delete" onclick="event.stopPropagation(); deleteCategoryPrompt(event, '${cat}')">&times;</span>
            </div>
        `).join('');
    }

    // Refresh stats to reflect any category changes
    renderCategoryStats();
};

const selectCategory = (catName) => {
    const categoryInput = document.getElementById('goal-category');
    if (categoryInput) {
        categoryInput.value = catName;
        // ちょっとした視覚フィードバック（フォーカス）
        categoryInput.focus();

        // GSAPで少し揺らすなど演出しても良いが、まずは確実に機能させる
        gsap.fromTo(categoryInput,
            { x: -2 },
            { x: 0, duration: 0.1, repeat: 3, yoyo: true }
        );
    }
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
    renderMomentumFlow(); // Immediate update
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
    renderStats();
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
    renderStats(); // Updates mission control and charts
    renderGoals();

    if (goal.progress === 100) {
        confetti({ particleCount: 50, scalar: 0.7 });
    }
};

const deleteGoal = (id) => {
    showConfirm("目標の削除", "この目標を削除してもよろしいですか？この操作は取り消せません。", () => {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        renderStats();
        renderGoals();
    });
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
    const finalScore = parseFloat(totalScore.toFixed(1));
    const scoreDisplay = document.getElementById('momentum-score-display');
    if (scoreDisplay) scoreDisplay.innerText = finalScore;

    // 4. Update Momentum Message (Psychological Pulse)
    const momentumMsg = document.getElementById('momentum-msg');
    const rankProgress = document.getElementById('rank-progress-bar');

    const momentumLabels = {
        high: ["覚醒の兆し", "ゾーンに到達", "フロー状態：極", "圧倒的推進力", "未来を切り拓く力"],
        mid: ["リズムを構築中", "着実な前進", "安定した脈動", "上昇気流", "良い兆候"],
        low: ["静かなる準備", "再集中の時間", "一歩ずつ", "内なる火を灯せ", "リズムを整えよう"]
    };

    let label = "リズムを解析中...";
    let labelColor = "#94a3b8";
    if (finalScore >= 15) {
        label = momentumLabels.high[Math.floor(Math.random() * momentumLabels.high.length)];
        labelColor = "var(--accent-blue)";
    } else if (finalScore >= 5) {
        label = momentumLabels.mid[Math.floor(Math.random() * momentumLabels.mid.length)];
        labelColor = "#64748b";
    } else {
        label = momentumLabels.low[Math.floor(Math.random() * momentumLabels.low.length)];
    }

    if (momentumMsg) {
        momentumMsg.innerText = label;
        momentumMsg.style.color = labelColor;
    }

    // Update Rank Progress Bar (Max assumed 25 points based on 28-day window)
    if (rankProgress) {
        const progressPercent = Math.min((finalScore / 25) * 100, 100);
        rankProgress.style.width = `${progressPercent}%`;
    }

    // 5. Render Bars
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
        goalsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔭</div>
                <p>2026年の軌道がまだ設定されていません。<br>「新しい目標を追加」から始めましょう。</p>
            </div>
        `;
        return;
    }

    // カテゴリーごとのグループ化
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
