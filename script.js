import * as fb from './firebase-config.js';

// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentView = 'active'; // 'active' or 'completed'
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
let editingGoalId = null;
let currentUser = null;
let isLoading = true;

// --- DOM Elements ---
const goalsContainer = document.getElementById('goals-container');
const goalForm = document.getElementById('goal-form');
const addGoalBtn = document.getElementById('add-goal-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.querySelector('.close-modal');
const categoryDatalist = document.getElementById('category-options');
const deadlinePresets = document.querySelectorAll('.preset-btn');
const dateInput = document.getElementById('goal-deadline');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userNameEl = document.getElementById('user-name');
const categoryManagerList = document.getElementById('category-manager-list');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.protocol === 'file:') {
        setTimeout(() => showToast("ローカル環境で実行中です。クラウド同期にはサーバー起動が必要です。", "error"), 1000);
    }
    try {
        sanitizeData();
        updateCategoryDatalist();

        const dashboardElements = document.querySelectorAll('.mission-control, .dashboard-section');
        dashboardElements.forEach(el => el.style.display = 'none');

        renderGoals();

        setTimeout(() => {
            gsap.from('.glass-nav', { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
        }, 100);

        if (addGoalBtn) addGoalBtn.onclick = () => openModal();
        if (closeModalBtn) closeModalBtn.onclick = closeModal;
        if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
        if (loginBtn) loginBtn.onclick = handleLogin;
        if (logoutBtn) logoutBtn.onclick = handleLogout;

        // --- Service Worker Registration ---
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(reg => console.log('SW registered:', reg))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }

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

    } catch (error) {
        console.error("Initialization Failed:", error);
    }
});

// --- Data & Sync Logic ---
const sanitizeData = () => {
    let changed = false;
    goals.forEach(g => {
        if (!g.tasks) g.tasks = [];
        if (typeof g.progress !== 'number') g.progress = 0;
        if (!g.deadline || g.deadline.includes('NaN')) {
            g.deadline = '未定';
            changed = true;
        }
    });
    if (changed) saveGoals();
};

const saveGoals = async () => {
    // Always save to localStorage as a cache/fallback
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('activityLog', JSON.stringify(activityLog));

    if (currentUser) {
        try {
            const userDocRef = fb.doc(fb.db, 'users', currentUser.uid);
            await fb.setDoc(userDocRef, {
                categories,
                activityLog,
                lastSync: fb.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn("Cloud metadata sync failed (local updated):", e);
        }
    }
};

const logActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    activityLog[today] = (activityLog[today] || 0) + 1;
    saveGoals();
};

// --- Firebase Auth ---
const handleLogin = async () => {
    try {
        await fb.signInWithPopup(fb.auth, fb.provider);
    } catch (error) {
        console.error("Login failed:", error);
        showToast("ログインに失敗しました。接続状況を確認してみてくださいね。", "error");
    }
};

const handleLogout = async () => {
    try {
        await fb.signOut(fb.auth);
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

fb.onAuthStateChanged(fb.auth, async (user) => {
    if (user) {
        currentUser = user;
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.photoURL || '';
        if (userNameEl) userNameEl.innerText = user.displayName || 'User';
        isLoading = true;
        renderGoals();
        await setupUserCloudData(user.uid);
        isLoading = false;
        renderGoals();
        updateDashboard();
    } else {
        currentUser = null;
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';

        goals = JSON.parse(localStorage.getItem('goals')) || [];
        categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
        activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
        isLoading = false;
        renderGoals();
        updateDashboard();
    }
});

const setupUserCloudData = async (uid) => {
    try {
        const userDocRef = fb.doc(fb.db, 'users', uid);
        const userDoc = await fb.getDoc(userDocRef);

        if (!userDoc.exists()) {
            const localGoals = JSON.parse(localStorage.getItem('goals')) || [];
            if (localGoals.length > 0) {
                showConfirm("データの同期", "ローカルの目標をクラウドに同期しますか？", async () => {
                    await migrateToCloud(uid);
                });
            } else {
                await fb.setDoc(userDocRef, { categories, activityLog, lastSync: fb.serverTimestamp() });
            }
        } else {
            const data = userDoc.data();
            categories = data.categories || categories;
            activityLog = data.activityLog || {};
            const q = fb.query(fb.collection(fb.db, 'users', uid, 'goals'));
            const goalsSnapshot = await fb.getDocs(q);
            goals = goalsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            // Resolve potential ID mismatch (Firestore doc.id vs inner .id)
            goals.forEach(g => { if (!g.id) g.id = Date.now(); });

            renderGoals();
            updateDashboard();
        }
    } catch (e) {
        console.error("Initial Cloud load failed:", e);
    }
};

const migrateToCloud = async (uid) => {
    try {
        const userDocRef = fb.doc(fb.db, 'users', uid);
        await fb.setDoc(userDocRef, { categories, activityLog, lastSync: fb.serverTimestamp() });
        for (const g of goals) {
            await fb.setDoc(fb.doc(fb.collection(fb.db, 'users', uid, 'goals'), String(g.id)), g);
        }
        await setupUserCloudData(uid);
    } catch (e) {
        console.error("Migration failed:", e);
    }
};

// --- UI Actions ---
const switchTab = (view) => {
    closeModal();
    if (currentView === view) return;
    currentView = view;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${view}`).classList.add('active');
    const dbEls = document.querySelectorAll('.mission-control, .dashboard-section');
    if (view === 'completed') {
        dbEls.forEach(el => { el.style.display = 'block'; gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 }); });
        updateDashboard();
    } else {
        dbEls.forEach(el => el.style.display = 'none');
    }
    renderGoals();
};

const openModal = (goalId = null) => {
    editingGoalId = goalId;
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('btn-submit');
    const tasksInput = document.getElementById('goal-tasks');
    const categoryInput = document.getElementById('goal-category');
    const titleInput = document.getElementById('goal-title');

    if (editingGoalId) {
        const goal = goals.find(g => String(g.id) === String(editingGoalId));
        if (!goal) return;
        modalTitle.innerText = '目標の編集';
        submitBtn.innerText = '更新する';
        categoryInput.value = goal.category;
        titleInput.value = goal.title;
        tasksInput.value = (goal.tasks || []).map(t => t.text).join('\n');
    } else {
        modalTitle.innerText = '目標の登録';
        submitBtn.innerText = '登録';
        goalForm.reset();
    }
    modalOverlay.style.display = 'flex';
    gsap.fromTo('.modal-content', { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4 });
};

const closeModal = () => {
    gsap.to('.modal-content', { scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: () => { modalOverlay.style.display = 'none'; } });
};

const showConfirm = (title, message, onConfirm) => {
    const overlay = document.getElementById('confirm-overlay');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    overlay.style.display = 'flex';
    document.getElementById('confirm-ok').onclick = (e) => { e.stopPropagation(); onConfirm(); overlay.style.display = 'none'; };
    document.getElementById('confirm-cancel').onclick = () => overlay.style.display = 'none';
};

// --- Core Logic (Optimistic Updates) ---
goalForm.onsubmit = (e) => {
    e.preventDefault();
    const titleValue = document.getElementById('goal-title').value.trim();
    const categoryValue = document.getElementById('goal-category').value.trim();
    const tasksValue = document.getElementById('goal-tasks').value;
    const deadlineBtn = document.querySelector('.preset-btn.active');

    if (!titleValue || !categoryValue) return showToast('目標の名前とカテゴリーを入力しましょう！', 'error');

    if (!categories.includes(categoryValue)) { categories.push(categoryValue); updateCategoryDatalist(); }

    const taskLines = tasksValue.split('\n').filter(l => l.trim() !== '');
    let deadline = '未定';
    if (deadlineBtn) {
        const val = deadlineBtn.dataset.value;
        const dNow = new Date();
        if (val === 'this-week') {
            const tempDate = new Date();
            const sunday = new Date(tempDate.setDate(tempDate.getDate() + (7 - tempDate.getDay())));
            deadline = `${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;
        } else if (val === 'this-month') {
            const lastDay = new Date(dNow.getFullYear(), dNow.getMonth() + 1, 0);
            deadline = `${lastDay.getFullYear()}.${lastDay.getMonth() + 1}.${lastDay.getDate()}`;
        } else if (val === 'this-year') { deadline = `${dNow.getFullYear()}.12.31`; }
        else if (val === 'custom' && dateInput.value) {
            const dInput = new Date(dateInput.value);
            deadline = `${dInput.getFullYear()}.${dInput.getMonth() + 1}.${dInput.getDate()}`;
        }
    }

    let updatedTasks = [];
    if (editingGoalId) {
        const existing = goals.find(g => String(g.id) === String(editingGoalId));
        updatedTasks = taskLines.map((text, i) => {
            const trimmed = text.trim();
            const existingTask = (existing?.tasks || []).find(t => t.text === trimmed);
            return { id: existingTask?.id || Date.now() + i, text: trimmed, done: existingTask?.done || false };
        });
    } else {
        updatedTasks = taskLines.map((text, i) => ({ id: Date.now() + i, text: text.trim(), done: false }));
    }

    const doneCount = updatedTasks.filter(t => t.done).length;
    const progress = updatedTasks.length > 0 ? Math.round((doneCount / updatedTasks.length) * 100) : 0;
    const goalData = { title: titleValue, category: categoryValue, deadline, tasks: updatedTasks, progress };

    if (editingGoalId) {
        const idx = goals.findIndex(g => String(g.id) === String(editingGoalId));
        goals[idx] = { ...goals[idx], ...goalData };
        if (currentUser) {
            fb.setDoc(fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(editingGoalId)), goals[idx])
                .catch(err => console.error("Cloud update failed (API may be disabled):", err));
        }
    } else {
        const newGoal = { id: Date.now(), ...goalData };
        goals.push(newGoal);
        if (currentUser) {
            fb.setDoc(fb.doc(fb.collection(fb.db, 'users', currentUser.uid, 'goals'), String(newGoal.id)), newGoal)
                .catch(err => console.error("Cloud save failed (API may be disabled):", err));
        }
        logActivity();
    }

    saveGoals();
    renderGoals();
    updateDashboard();
    closeModal();
    if (!editingGoalId) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};

const toggleTask = (goalId, taskId) => {
    const goal = goals.find(g => String(g.id) === String(goalId));
    if (!goal) return;
    const task = goal.tasks.find(t => String(t.id) === String(taskId));
    if (!task) return;
    task.done = !task.done;
    const doneCount = goal.tasks.filter(t => t.done).length;
    goal.progress = Math.round((doneCount / goal.tasks.length) * 100);

    if (task.done) {
        task.completedAt = new Date().toISOString().split('T')[0];
        logActivity();
    } else {
        delete task.completedAt;
    }

    if (currentUser) {
        const gRef = fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(goalId));
        fb.updateDoc(gRef, { tasks: goal.tasks, progress: goal.progress })
            .catch(err => console.error("Cloud toggle failed:", err));
    }
    saveGoals();
    renderGoals();
    updateDashboard();
    if (goal.progress === 100 && task.done) {
        // Standard Confetti
        confetti({ particleCount: 50 });

        // Premium Achievement Placeholder (Future: Trigger if user is Premium)
        if (currentUser && currentUser.isPremium) {
            triggerPremiumAchievement();
        }
    }
};

const triggerPremiumAchievement = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
};

const deleteGoal = (id) => {
    showConfirm("目標の削除", "この目標を削除しますか？", () => {
        const goalIdStr = String(id);
        goals = goals.filter(g => String(g.id) !== goalIdStr);
        if (currentUser) {
            fb.deleteDoc(fb.doc(fb.db, 'users', currentUser.uid, 'goals', goalIdStr))
                .catch(err => console.error("Cloud delete failed:", err));
        }
        saveGoals();
        renderGoals();
        updateDashboard();
    });
};

// --- Rendering ---
const renderGoals = () => {
    goalsContainer.innerHTML = '';
    if (isLoading) {
        goalsContainer.innerHTML = Array(3).fill('<div class="skeleton-card"></div>').join('');
        return;
    }
    const filtered = goals.filter(g => currentView === 'completed' ? g.progress === 100 : g.progress < 100);
    if (filtered.length === 0) {
        goalsContainer.innerHTML = `<div class="empty-state"><p>${currentView === 'completed' ? '達成された目標はありません。' : '2026年の挑戦を始めましょう。'}</p></div>`;
        return;
    }
    const grouped = filtered.reduce((acc, g) => { (acc[g.category] = acc[g.category] || []).push(g); return acc; }, {});
    Object.entries(grouped).forEach(([cat, catGoals]) => {
        const stack = document.createElement('div');
        stack.className = 'category-stack';
        stack.innerHTML = `<div class="category-header"><div class="category-label">${cat}</div><div class="stack-count">${catGoals.length}</div></div>
            <div class="stack-content">${catGoals.map(g => `
                <div class="goal-card-wrapper">
                    <div class="goal-card" onclick="openModal('${g.id}')">
                        <div class="goal-header"><h4>${g.title}</h4><button class="btn-delete-goal" onclick="event.stopPropagation(); deleteGoal('${g.id}')">&times;</button></div>
                        <div class="progress-mini-bar"><div class="progress-fill" style="width: ${g.progress}%"></div></div>
                        <div class="task-mini-list" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem;">${(g.tasks || []).map(t => `
                            <div class="task-mini-item ${t.done ? 'done' : ''}" onclick="event.stopPropagation(); toggleTask('${g.id}', '${t.id}')" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.4rem 0;">
                                <div class="mini-checkbox"></div><span class="mini-task-text" style="font-size: 0.85rem; line-height: 1.4;">${t.text}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                </div>`).join('')}</div>`;
        goalsContainer.appendChild(stack);
    });
};

const updateDashboard = () => {
    const total = goals.length;
    const active = goals.filter(g => g.progress < 100).length;
    const achieved = goals.filter(g => g.progress === 100).length;
    const sTotal = document.getElementById('stat-total'); if (sTotal) sTotal.innerText = total;
    const sActive = document.getElementById('stat-active'); if (sActive) sActive.innerText = active;
    const sDone = document.getElementById('stat-completed'); if (sDone) sDone.innerText = achieved;
    const mFlow = document.getElementById('momentum-flow');
    if (mFlow) {
        mFlow.innerHTML = '';
        const dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const counts = dates.map(d => activityLog[d] || 0);
        const mx = Math.max(...counts, 1);
        dates.forEach((d, i) => {
            const bar = document.createElement('div');
            bar.className = 'momentum-bar' + (i === 6 ? ' active' : '');
            mFlow.appendChild(bar);
            gsap.to(bar, { height: `${(counts[i] / mx) * 100}%`, duration: 0.5, delay: i * 0.05 });
        });
    }
};

const updateCategoryDatalist = () => {
    if (categoryDatalist) categoryDatalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    if (categoryManagerList) {
        categoryManagerList.innerHTML = categories.map(c => `
            <div class="cat-chip" onclick="selectCategory('${c}')">
                <span>${c}</span><span onclick="event.stopPropagation(); deleteCategoryPrompt(event, '${c}')">&times;</span>
            </div>`).join('');
    }
};

const selectCategory = (cat) => { const input = document.getElementById('goal-category'); if (input) { input.value = cat; input.focus(); } };
const deleteCategoryPrompt = (e, cat) => {
    showConfirm("カテゴリーの削除", `「${cat}」を削除しますか？`, () => {
        categories = categories.filter(c => c !== cat);
        saveGoals();
        updateCategoryDatalist();
    });
};

const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

// --- Exports ---
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleTask = toggleTask;
window.deleteGoal = deleteGoal;
window.selectCategory = selectCategory;
window.deleteCategoryPrompt = deleteCategoryPrompt;
