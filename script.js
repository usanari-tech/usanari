import * as fb from './firebase-config.js';

// --- State Management ---
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let currentView = 'active'; // 'active' or 'completed'
let categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
let editingGoalId = null;
let currentUser = null;

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
    // Protocol Check (Inform user that Firebase modules need a server)
    if (window.location.protocol === 'file:') {
        alert("⚠️ ローカルファイル (file://) として開かれています。Firebase (Googleログイン) を動作させるには、VSCode Live Serverなどのローカルサーバーを使用するか、GitHub Pagesにデプロイする必要があります。");
    }
    try {
        sanitizeData();
        updateCategoryDatalist();

        // Ensure Dashboard is hidden on 'Active' view initially
        const dashboardElements = document.querySelectorAll('.mission-control, .dashboard-section');
        dashboardElements.forEach(el => el.style.display = 'none');

        renderGoals();

        // Initial GSAP animations
        setTimeout(() => {
            gsap.from('.glass-nav', { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
        }, 100);

        // Attach static event listeners
        if (addGoalBtn) addGoalBtn.onclick = () => openModal();
        if (closeModalBtn) closeModalBtn.onclick = closeModal;
        if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
        if (loginBtn) loginBtn.onclick = handleLogin;
        if (logoutBtn) logoutBtn.onclick = handleLogout;

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
        if (g.deadline === 'NaN.NaN.NaN' || g.deadline === 'undefined' || !g.deadline) {
            g.deadline = '未定';
            changed = true;
        }
    });
    if (changed) saveGoals();
};

const saveGoals = async () => {
    if (currentUser) {
        try {
            const userDocRef = fb.doc(fb.db, 'users', currentUser.uid);
            await fb.setDoc(userDocRef, {
                categories: categories,
                activityLog: activityLog,
                lastSync: fb.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Cloud metadata sync failed", e);
        }
    } else {
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
    }
};

const logActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    activityLog[today] = (activityLog[today] || 0) + 1;
    saveGoals();
};

// --- Firebase Actions ---
const handleLogin = async () => {
    try {
        await fb.signInWithPopup(fb.auth, fb.provider);
    } catch (error) {
        console.error("Login failed:", error);
        if (error.code === 'auth/invalid-api-key' || error.message.includes('PLACEHOLDER')) {
            alert("Firebaseの設定が完了していません。設定情報を確認してください。");
        } else {
            alert("ログインに失敗しました: " + error.message);
        }
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
        await setupUserCloudData(user.uid);
    } else {
        currentUser = null;
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';

        goals = JSON.parse(localStorage.getItem('goals')) || [];
        categories = JSON.parse(localStorage.getItem('categories')) || ['学習・スキル', '健康・習慣', '仕事・キャリア', 'マインドセット'];
        activityLog = JSON.parse(localStorage.getItem('activityLog')) || {};
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
                showConfirm("データの同期", "ローカルに保存されている目標をクラウドに同期しますか？", async () => {
                    await migrateToCloud(uid);
                });
            } else {
                await fb.setDoc(userDocRef, {
                    categories: categories,
                    activityLog: activityLog,
                    lastSync: fb.serverTimestamp()
                });
            }
        } else {
            const data = userDoc.data();
            categories = data.categories || categories;
            activityLog = data.activityLog || {};
            const goalsSnapshot = await fb.getDocs(fb.collection(fb.db, 'users', uid, 'goals'));
            goals = goalsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            renderGoals();
            updateDashboard();
        }
    } catch (e) {
        console.error("Cloud data fetch failed", e);
    }
};

const migrateToCloud = async (uid) => {
    try {
        const userDocRef = fb.doc(fb.db, 'users', uid);
        await fb.setDoc(userDocRef, {
            categories: categories,
            activityLog: activityLog,
            lastSync: fb.serverTimestamp()
        });
        for (const g of goals) {
            const gRef = fb.doc(fb.collection(fb.db, 'users', uid, 'goals'), String(g.id));
            await fb.setDoc(gRef, g);
        }
        await setupUserCloudData(uid);
    } catch (e) {
        console.error("Migration failed", e);
    }
};

// --- UI Components ---
const switchTab = (view) => {
    if (currentView === view) return;
    currentView = view;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${view}`).classList.add('active');

    const dashboardElements = document.querySelectorAll('.mission-control, .dashboard-section');
    if (view === 'completed') {
        dashboardElements.forEach(el => {
            el.style.display = 'block';
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        });
        updateDashboard();
    } else {
        dashboardElements.forEach(el => el.style.display = 'none');
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
    gsap.to('.modal-content', {
        scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: () => {
            modalOverlay.style.display = 'none';
        }
    });
};

const showConfirm = (title, message, onConfirm) => {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    titleEl.innerText = title;
    msgEl.innerText = message;
    overlay.style.display = 'flex';

    okBtn.onclick = (e) => { e.stopPropagation(); onConfirm(); overlay.style.display = 'none'; };
    cancelBtn.onclick = () => overlay.style.display = 'none';
};

// --- Goal Actions ---
goalForm.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('goal-title').value.trim();
    const category = document.getElementById('goal-category').value.trim();
    const tasksRaw = document.getElementById('goal-tasks').value;
    const selectedDeadlineBtn = document.querySelector('.preset-btn.active');

    if (!title || !category) return alert('目標名とカテゴリーを入力してください。');

    if (!categories.includes(category)) {
        categories.push(category);
        updateCategoryDatalist();
    }

    const taskLines = tasksRaw.split('\n').filter(line => line.trim() !== '');
    let deadline = '未定';
    // (Simplified deadline logic for brevity in refactor)
    if (selectedDeadlineBtn) {
        const val = selectedDeadlineBtn.dataset.value;
        const now = new Date();
        if (val === 'this-week') {
            const sunday = new Date(now.setDate(now.getDate() + (7 - now.getDay())));
            deadline = `${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;
        } else if (val === 'this-month') {
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            deadline = `${lastDay.getFullYear()}.${lastDay.getMonth() + 1}.${lastDay.getDate()}`;
        } else if (val === 'this-year') {
            deadline = `${now.getFullYear()}.12.31`;
        } else if (val === 'custom' && dateInput.value) {
            const d = new Date(dateInput.value);
            deadline = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
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
    const goalData = { title, category, deadline, tasks: updatedTasks, progress };

    if (editingGoalId) {
        const idx = goals.findIndex(g => String(g.id) === String(editingGoalId));
        goals[idx] = { ...goals[idx], ...goalData };
        if (currentUser) await fb.setDoc(fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(editingGoalId)), goals[idx]);
    } else {
        const newGoal = { id: Date.now(), ...goalData };
        goals.push(newGoal);
        if (currentUser) await fb.setDoc(fb.doc(fb.collection(fb.db, 'users', currentUser.uid, 'goals'), String(newGoal.id)), newGoal);
        logActivity();
    }

    saveGoals();
    renderGoals();
    updateDashboard();
    closeModal();
    if (!editingGoalId) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};

const toggleTask = async (goalId, taskId) => {
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
        await fb.updateDoc(gRef, { tasks: goal.tasks, progress: goal.progress });
    }
    saveGoals();
    renderGoals();
    updateDashboard();
    if (goal.progress === 100 && task.done) confetti({ particleCount: 50 });
};

const deleteGoal = async (id) => {
    showConfirm("目標の削除", "この目標を削除しますか？", async () => {
        goals = goals.filter(g => String(g.id) !== String(id));
        if (currentUser) await fb.deleteDoc(fb.doc(fb.db, 'users', currentUser.uid, 'goals', String(id)));
        saveGoals();
        renderGoals();
        updateDashboard();
    });
};

// --- Rendering ---
const renderGoals = () => {
    goalsContainer.innerHTML = '';
    const filtered = goals.filter(g => currentView === 'completed' ? g.progress === 100 : g.progress < 100);

    if (filtered.length === 0) {
        goalsContainer.innerHTML = `<div class="empty-state"><p>${currentView === 'completed' ? '達成された目標はありません。' : '目標を設定しましょう。'}</p></div>`;
        return;
    }

    const grouped = filtered.reduce((acc, g) => { (acc[g.category] = acc[g.category] || []).push(g); return acc; }, {});
    Object.entries(grouped).forEach(([cat, catGoals]) => {
        const stack = document.createElement('div');
        stack.className = 'category-stack';
        stack.innerHTML = `
            <div class="category-header"><div class="category-label">${cat}</div><div class="stack-count">${catGoals.length}</div></div>
            <div class="stack-content">${catGoals.map(g => `
                <div class="goal-card" onclick="openModal('${g.id}')">
                    <div class="goal-header">
                        <h4>${g.title}</h4>
                        <button class="btn-delete-goal" onclick="event.stopPropagation(); deleteGoal('${g.id}')">&times;</button>
                    </div>
                    <div class="progress-mini-bar"><div class="progress-fill" style="width: ${g.progress}%"></div></div>
                    <div class="task-mini-list">${(g.tasks || []).map(t => `
                        <div class="task-mini-item ${t.done ? 'done' : ''}" onclick="event.stopPropagation(); toggleTask('${g.id}', '${t.id}')">
                            <div class="mini-checkbox"></div><span class="mini-task-text">${t.text}</span>
                        </div>`).join('')}
                    </div>
                </div>`).join('')}
            </div>`;
        goalsContainer.appendChild(stack);
    });
};

const updateDashboard = () => {
    const total = goals.length;
    const active = goals.filter(g => g.progress < 100).length;
    const achieved = goals.filter(g => g.progress === 100).length;
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
    if (document.getElementById('stat-active')) document.getElementById('stat-active').innerText = active;
    if (document.getElementById('stat-completed')) document.getElementById('stat-completed').innerText = achieved;

    const momentumFlow = document.getElementById('momentum-flow');
    if (momentumFlow) {
        momentumFlow.innerHTML = '';
        const dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const counts = dates.map(d => activityLog[d] || 0);
        const max = Math.max(...counts, 1);
        dates.forEach((d, i) => {
            const bar = document.createElement('div');
            bar.className = 'momentum-bar' + (i === 6 ? ' active' : '');
            momentumFlow.appendChild(bar);
            gsap.to(bar, { height: `${(counts[i] / max) * 100}%`, duration: 0.5, delay: i * 0.05 });
        });
    }
};

const updateCategoryDatalist = () => {
    if (categoryDatalist) categoryDatalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    if (categoryManagerList) {
        categoryManagerList.innerHTML = categories.map(c => `
            <div class="cat-chip" onclick="selectCategory('${c}')">
                <span>${c}</span>
                <span onclick="event.stopPropagation(); deleteCategoryPrompt(event, '${c}')">&times;</span>
            </div>`).join('');
    }
};

const selectCategory = (cat) => {
    const input = document.getElementById('goal-category');
    if (input) { input.value = cat; input.focus(); }
};

const deleteCategoryPrompt = (e, cat) => {
    showConfirm("カテゴリーの削除", `「${cat}」を削除しますか？`, () => {
        categories = categories.filter(c => c !== cat);
        saveGoals();
        updateCategoryDatalist();
    });
};

// --- Exports to Window (for HTML onclick) ---
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleTask = toggleTask;
window.deleteGoal = deleteGoal;
window.selectCategory = selectCategory;
window.deleteCategoryPrompt = deleteCategoryPrompt;
