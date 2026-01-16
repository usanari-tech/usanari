/**
 * Goal Horizon 2026 - Charts Module
 * Handles drawing the Action Momentum Chart using Canvas API.
 */

export const drawMomentumChart = (activityLog) => {
    const canvas = document.getElementById('momentum-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    // Resize canvas to match display size
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    const counts = dates.map(d => activityLog[d] || 0);
    const maxCount = Math.max(...counts, 1);
    const avgCount = (counts.reduce((a, b) => a + b, 0) / 7).toFixed(1);

    // Update Text Stats
    const statAvgEl = document.getElementById('stat-avg');
    const statMaxEl = document.getElementById('stat-max');
    const scoreEl = document.getElementById('momentum-score');
    const statusEl = document.getElementById('momentum-status');

    if (statAvgEl) statAvgEl.innerText = avgCount;
    if (statMaxEl) statMaxEl.innerText = maxCount;
    if (scoreEl) scoreEl.innerText = Math.round(avgCount * 10);

    if (statusEl) {
        if (avgCount > 3) statusEl.innerText = "🌪️ 圧倒的な推進力";
        else if (avgCount > 1) statusEl.innerText = "🔥 燃え上がる勢い";
        else if (avgCount > 0) statusEl.innerText = "✨ 着実な一歩";
        else statusEl.innerText = "🌱 準備期間";
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)'); // Noble Gold
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

    // Draw Area
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    counts.forEach((count, i) => {
        const x = padding + (i * (chartWidth / (counts.length - 1)));
        const y = padding + (chartHeight - (count / maxCount) * chartHeight);
        ctx.lineTo(x, y);
    });

    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    counts.forEach((count, i) => {
        const x = padding + (i * (chartWidth / (counts.length - 1)));
        const y = padding + (chartHeight - (count / maxCount) * chartHeight);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw Points
    counts.forEach((count, i) => {
        const x = padding + (i * (chartWidth / (counts.length - 1)));
        const y = padding + (chartHeight - (count / maxCount) * chartHeight);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
};
