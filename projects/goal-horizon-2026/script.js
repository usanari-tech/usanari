import * as fb from './firebase-config.js';
import { drawMomentumChart } from './charts.js';

// --- State Management ---
// Last updated: 2026-01-18 17:10 (forced redeploy)
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentView = 'active'; // 'active' or 'completed'
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
let editingGoalId = null;
let currentUser = null;
let isLoading = true;
let sortBy = 'deadline'; // default sorting

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
        renderGoals();

        setTimeout(() => {
            if (window.gsap) {
                gsap.from('.glass-nav', { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
            }
            updateDashboard();
        }, 100);

        // UI Event Handlers
        if (addGoalBtn) {
            addGoalBtn.onclick = (e) => {
                e.preventDefault();
                openModal();
            };
        }
        if (closeModalBtn) closeModalBtn.onclick = closeModal;
        if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
        if (loginBtn) loginBtn.onclick = handleLogin;
        if (logoutBtn) logoutBtn.onclick = handleLogout;

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
                if (btn.dataset.value === 'custom' && dateInput) {
                    dateInput.classList.remove('hidden-date');
                } else if (dateInput) {
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
            console.warn("Cloud metadata sync failed:", e);
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
        showToast("ログインに失敗しました。", "error");
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
    const activeBtn = document.getElementById(`tab-${view}`);
    if (activeBtn) activeBtn.classList.add('active');
    document.body.setAttribute('data-view', view);
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'block';
    const missionControl = document.getElementById('mission-control');
    if (missionControl) missionControl.style.display = 'block';
    renderGoals();
    updateDashboard();
};

const openModal = (goalId = null) => {
    editingGoalId = goalId;
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-goal');
    const tasksInput = document.getElementById('goal-tasks');
    const categoryInput = document.getElementById('goal-category');
    const titleInput = document.getElementById('goal-title');

    if (editingGoalId) {
        const goal = goals.find(g => String(g.id) === String(editingGoalId));
        if (!goal) return;
        if (modalTitle) modalTitle.innerText = '目標の編集';
        if (submitBtn) submitBtn.innerText = '更新する';
        if (categoryInput) categoryInput.value = goal.category;
        if (titleInput) titleInput.value = goal.title;
        if (tasksInput) tasksInput.value = (goal.tasks || []).map(t => t.text).join('\n');
    } else {
        if (modalTitle) modalTitle.innerText = '目標の登録';
        if (submitBtn) submitBtn.innerText = '登録';
        if (goalForm) goalForm.reset();
    }
    if (modalOverlay) modalOverlay.style.display = 'flex';
    if (window.gsap) {
        gsap.fromTo('.modal-content', { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4 });
    }
};

const closeModal = () => {
    if (window.gsap) {
        gsap.to('.modal-content', { scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: () => { if (modalOverlay) modalOverlay.style.display = 'none'; } });
    } else if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
};

const showConfirm = (title, message, onConfirm) => {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    if (overlay) overlay.style.display = 'flex';
    const okBtn = document.getElementById('confirm-ok');
    if (okBtn) okBtn.onclick = (e) => { e.stopPropagation(); onConfirm(); if (overlay) overlay.style.display = 'none'; };
    const cancelBtn = document.getElementById('confirm-cancel');
    if (cancelBtn) cancelBtn.onclick = () => { if (overlay) overlay.style.display = 'none'; };
};

// --- Sorting Logic ---
const setSort = (type) => {
    sortBy = type;
    document.querySelectorAll('.btn-sort').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`sort-${type}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderGoals();
};

const sortGoals = (goalsArray) => {
    return [...goalsArray].sort((a, b) => {
        if (sortBy === 'deadline') {
            if (a.deadline === '未定') return 1;
            if (b.deadline === '未定') return -1;
            const dA = new Date(a.deadline.replace(/\./g, '/'));
            const dB = new Date(b.deadline.replace(/\./g, '/'));
            return dA - dB;
        } else if (sortBy === 'progress') {
            return b.progress - a.progress;
        }
        return 0;
    });
};

// --- Category Management ---
const updateCategoryDatalist = () => {
    if (categoryDatalist) categoryDatalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    if (categoryManagerList) {
        categoryManagerList.innerHTML = categories.map(c => `
            <div class="cat-chip" onclick="selectCategory('${c}')">
                <span>${c}</span><span class="delete-cat" onclick="event.stopPropagation(); deleteCategoryPrompt(event, '${c}')">&times;</span>
            </div>`).join('');
    }
};

const selectCategory = (cat) => {
    const input = document.getElementById('goal-category');
    if (input) {
        input.value = cat;
        input.focus();
    }
};

const deleteCategoryPrompt = (e, cat) => {
    showConfirm("カテゴリーの削除", `「${cat}」を削除しますか？`, () => {
        categories = categories.filter(c => c !== cat);
        saveGoals();
        updateCategoryDatalist();
    });
};

// --- Core Logic ---
if (goalForm) {
    goalForm.onsubmit = (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('form-error');
        if (errorEl) errorEl.classList.add('hidden');

        const titleValue = document.getElementById('goal-title')?.value.trim();
        const categoryValue = document.getElementById('goal-category')?.value.trim();
        const tasksValue = document.getElementById('goal-tasks')?.value;
        const deadlineBtn = document.querySelector('.preset-btn.active');

        if (!titleValue || !categoryValue || !tasksValue) {
            if (errorEl) { errorEl.innerText = '情報を入力してください。'; errorEl.classList.remove('hidden'); }
            return;
        }

        // New category addition
        if (!categories.includes(categoryValue)) {
            categories.push(categoryValue);
            updateCategoryDatalist();
        }

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
            } else if (val === 'this-year') {
                deadline = `${dNow.getFullYear()}.12.31`;
            } else if (val === 'custom' && dateInput?.value) {
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
                    .catch(e => console.error(e));
            }
        } else {
            const newGoal = { id: Date.now(), ...goalData };
            goals.push(newGoal);
            if (currentUser) {
                fb.setDoc(fb.doc(fb.collection(fb.db, 'users', currentUser.uid, 'goals'), String(newGoal.id)), newGoal)
                    .catch(e => console.error(e));
            }
            logActivity();
        }

        saveGoals();
        renderGoals();
        updateDashboard();
        closeModal();
        if (!editingGoalId && window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };
}

const toggleTask = (goalId, taskId) => {
    const goal = goals.find(g => String(g.id) === String(goalId));
    if (!goal) return;
    const task = goal.tasks.find(t => String(t.id) === String(taskId));
    if (!task) return;
    task.done = !task.done;
    const doneCount = goal.tasks.filter(t => t.done).length;
    goal.progress = Math.round((doneCount / goal.tasks.length) * 100);
    if (currentUser) {
        const gRef = fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(goalId));
        fb.updateDoc(gRef, { tasks: goal.tasks, progress: goal.progress }).catch(e => console.error(e));
    }
    saveGoals();
    renderGoals();
    updateDashboard();
};

const deleteGoal = (id) => {
    showConfirm("目標の削除", "削除しますか？", () => {
        goals = goals.filter(g => String(g.id) !== String(id));
        if (currentUser) {
            fb.deleteDoc(fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(id))).catch(e => console.error(e));
        }
        saveGoals();
        renderGoals();
        updateDashboard();
    });
};

// --- Rendering ---
const renderGoals = () => {
    if (!goalsContainer) return;
    goalsContainer.innerHTML = '';
    if (isLoading) {
        goalsContainer.innerHTML = Array(3).fill('<div class="skeleton-card"></div>').join('');
        return;
    }
    const filtered = goals.filter(g => currentView === 'active' ? g.progress < 100 : g.progress === 100);
    const sorted = sortGoals(filtered);

    if (sorted.length === 0) {
        goalsContainer.innerHTML = `<div class="empty-state"><p>${currentView === 'active' ? 'まだ目標がありません。＋ボタンから追加してください。' : '達成した目標はまだありません。'}</p></div>`;
        return;
    }

    const grouped = sorted.reduce((acc, g) => { (acc[g.category] = acc[g.category] || []).push(g); return acc; }, {});
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
                        <div class="goal-footer-info" style="margin-top: 0.8rem; font-size: 0.75rem; opacity: 0.6;">締切: ${g.deadline}</div>
                    </div>
                </div>`).join('')}</div>`;
        goalsContainer.appendChild(stack);
    });
};

// --- Dashboard Logic ---
const updateDashboard = () => {
    const total = goals.length;
    const active = goals.filter(g => g.progress < 100).length;
    const achieved = goals.filter(g => g.progress === 100).length;

    animateValue('stat-total', total);
    animateValue('stat-active', active);
    animateValue('stat-completed', achieved);
    animateValue('gallery-count', achieved);

    updateVisionBridge();
    renderConfidenceGallery();
    if (typeof drawMomentumChart === 'function') {
        drawMomentumChart(activityLog);
    }
};

const animateValue = (id, endValue) => {
    const el = document.getElementById(id);
    if (!el) return;
    const startValue = parseInt(el.innerText) || 0;
    const obj = { val: startValue };
    if (window.gsap) {
        gsap.to(obj, {
            val: endValue,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => { el.innerText = Math.round(obj.val); }
        });
    } else {
        el.innerText = endValue;
    }
};

const updateVisionBridge = () => {
    const bridgeTitle = document.getElementById('next-task-title');
    const bridgeGoal = document.getElementById('next-task-goal');
    const bridgeDeadline = document.getElementById('next-task-deadline');
    const bridgeProgressFill = document.getElementById('bridge-progress-fill');
    const bridgeProgressText = document.getElementById('bridge-progress-text');
    const aiMessage = document.getElementById('ai-bridge-message');
    if (!bridgeTitle) return;

    const activeGoals = goals.filter(g => g.progress < 100);
    if (activeGoals.length === 0) {
        bridgeTitle.innerText = "すべての目標を達成しました！";
        if (bridgeGoal) bridgeGoal.innerText = "次は何に挑戦しますか？";
        if (bridgeDeadline) bridgeDeadline.innerText = "Legendary Status";
        if (bridgeProgressFill) bridgeProgressFill.style.width = '100%';
        if (bridgeProgressText) bridgeProgressText.innerText = '100%';
        return;
    }

    // Sort active goals by deadline
    const sortedActive = [...activeGoals].sort((a, b) => {
        if (a.deadline === '未定') return 1;
        if (b.deadline === '未定') return -1;
        return new Date(a.deadline.replace(/\./g, '/')) - new Date(b.deadline.replace(/\./g, '/'));
    });

    const nextGoal = sortedActive[0];
    const nextTask = nextGoal.tasks.find(t => !t.done) || nextGoal.tasks[0];
    bridgeTitle.innerText = nextTask.text;
    if (bridgeGoal) bridgeGoal.innerText = `Goal: ${nextGoal.title}`;
    if (bridgeDeadline) bridgeDeadline.innerText = `Due: ${nextGoal.deadline}`;
    if (bridgeProgressFill) bridgeProgressFill.style.width = `${nextGoal.progress}%`;
    if (bridgeProgressText) bridgeProgressText.innerText = `${nextGoal.progress}%`;
    if (aiMessage) aiMessage.innerText = "その調子です！一歩ずつ積み上げましょう。";
};

const renderConfidenceGallery = () => {
    const gallery = document.getElementById('confidence-gallery');
    if (!gallery) return;
    const completed = goals.filter(g => g.progress === 100);
    if (completed.length === 0) {
        gallery.innerHTML = '<div class="gallery-empty"><p>達成した目標がここに輝きます</p></div>';
        return;
    }
    gallery.innerHTML = completed.map(g => `
        <div class="trophy-card glass">
            <div class="trophy-icon">🏆</div>
            <div class="trophy-info">
                <div class="trophy-title">${g.title}</div>
                <div class="trophy-date">${g.category}</div>
            </div>
        </div>
    `).join('');
};

const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.log(`Toast (${type}): ${message}`);
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerText = message;
    container.appendChild(toast);
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
window.setSort = setSort;
window.selectCategory = selectCategory;
window.deleteCategoryPrompt = deleteCategoryPrompt;
