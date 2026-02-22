(function () {
    'use strict';

    // === Constants ===
    const CATEGORY_LABELS = {
        stock: '株式',
        bond: '債券',
        cash: '現金・預金',
        realestate: '不動産',
        crypto: '暗号資産',
        fund: '投資信託',
        other: 'その他',
    };

    const CATEGORY_COLORS = {
        stock: '#3b82f6',
        bond: '#f59e0b',
        cash: '#10b981',
        realestate: '#ec4899',
        crypto: '#8b5cf6',
        fund: '#6366f1',
        other: '#94a3b8',
    };

    const STORAGE_KEYS = {
        assets: 'asset-manager-assets',
        history: 'asset-manager-history',
    };

    // === State ===
    let assets = loadFromStorage(STORAGE_KEYS.assets) || [];
    let history = loadFromStorage(STORAGE_KEYS.history) || [];
    let deleteTargetId = null;
    let allocationChart = null;
    let categoryBarChart = null;
    let historyChart = null;

    // === Storage ===
    function loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    function saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function saveAssets() {
        saveToStorage(STORAGE_KEYS.assets, assets);
    }

    function saveHistory() {
        saveToStorage(STORAGE_KEYS.history, history);
    }

    // === Utility ===
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function formatCurrency(value) {
        return '¥' + Number(value).toLocaleString('ja-JP');
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === Navigation ===
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var view = btn.dataset.view;
            document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
            document.getElementById('view-' + view).classList.add('active');

            if (view === 'dashboard') updateDashboard();
            if (view === 'history') updateHistoryView();
        });
    });

    // === Dashboard ===
    function getTotalValue() {
        return assets.reduce(function (sum, a) { return sum + Number(a.value); }, 0);
    }

    function getCategoryTotals() {
        var totals = {};
        assets.forEach(function (a) {
            totals[a.category] = (totals[a.category] || 0) + Number(a.value);
        });
        return totals;
    }

    function updateDashboard() {
        var total = getTotalValue();
        document.getElementById('total-assets').textContent = formatCurrency(total);
        document.getElementById('asset-count').textContent = assets.length;

        // Monthly change
        var changeEl = document.getElementById('monthly-change');
        if (history.length >= 2) {
            var prev = history[history.length - 2].total;
            var diff = total - prev;
            var pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : 0;
            var sign = diff >= 0 ? '+' : '';
            changeEl.textContent = sign + formatCurrency(diff) + ' (' + sign + pct + '%)';
            changeEl.className = 'card-value ' + (diff >= 0 ? 'change-positive' : 'change-negative');
        } else {
            changeEl.textContent = '-';
            changeEl.className = 'card-value';
        }

        updateAllocationChart();
        updateCategoryBarChart();
    }

    function updateAllocationChart() {
        var totals = getCategoryTotals();
        var categories = Object.keys(totals);

        if (categories.length === 0) {
            if (allocationChart) { allocationChart.destroy(); allocationChart = null; }
            return;
        }

        var labels = categories.map(function (c) { return CATEGORY_LABELS[c] || c; });
        var data = categories.map(function (c) { return totals[c]; });
        var colors = categories.map(function (c) { return CATEGORY_COLORS[c] || '#94a3b8'; });

        var ctx = document.getElementById('allocation-chart').getContext('2d');
        if (allocationChart) allocationChart.destroy();

        allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                var pct = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + formatCurrency(context.parsed) + ' (' + pct + '%)';
                            },
                        },
                    },
                },
            },
        });
    }

    function updateCategoryBarChart() {
        var totals = getCategoryTotals();
        var categories = Object.keys(totals);

        if (categories.length === 0) {
            if (categoryBarChart) { categoryBarChart.destroy(); categoryBarChart = null; }
            return;
        }

        var labels = categories.map(function (c) { return CATEGORY_LABELS[c] || c; });
        var data = categories.map(function (c) { return totals[c]; });
        var colors = categories.map(function (c) { return CATEGORY_COLORS[c] || '#94a3b8'; });

        var ctx = document.getElementById('category-bar-chart').getContext('2d');
        if (categoryBarChart) categoryBarChart.destroy();

        categoryBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '評価額',
                    data: data,
                    backgroundColor: colors,
                    borderRadius: 4,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return formatCurrency(context.parsed.y);
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                if (value >= 100000000) return (value / 100000000) + '億';
                                if (value >= 10000) return (value / 10000) + '万';
                                return value;
                            },
                        },
                    },
                },
            },
        });
    }

    // === Asset List ===
    function renderAssets() {
        var container = document.getElementById('assets-list');
        var filterCat = document.getElementById('filter-category').value;
        var sortBy = document.getElementById('sort-by').value;

        var filtered = assets.filter(function (a) {
            return filterCat === 'all' || a.category === filterCat;
        });

        filtered.sort(function (a, b) {
            switch (sortBy) {
                case 'value-desc': return Number(b.value) - Number(a.value);
                case 'value-asc': return Number(a.value) - Number(b.value);
                case 'name-asc': return a.name.localeCompare(b.name, 'ja');
                case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
                default: return 0;
            }
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-message">該当する資産がありません。</p>';
            return;
        }

        container.innerHTML = filtered.map(function (asset) {
            var gain = '';
            if (asset.cost && Number(asset.cost) > 0) {
                var diff = Number(asset.value) - Number(asset.cost);
                var pct = ((diff / Number(asset.cost)) * 100).toFixed(1);
                var sign = diff >= 0 ? '+' : '';
                var cls = diff >= 0 ? 'change-positive' : 'change-negative';
                gain = '<div class="asset-gain ' + cls + '">' + sign + formatCurrency(diff) + ' (' + sign + pct + '%)</div>';
            }

            var noteHtml = asset.note ? '<div class="asset-note">' + escapeHtml(asset.note) + '</div>' : '';

            return '<div class="asset-item" data-id="' + asset.id + '">'
                + '<span class="asset-category-badge badge-' + asset.category + '">' + escapeHtml(CATEGORY_LABELS[asset.category] || asset.category) + '</span>'
                + '<div class="asset-info"><div class="asset-name">' + escapeHtml(asset.name) + '</div>' + noteHtml + '</div>'
                + '<div class="asset-value-col"><div class="asset-current-value">' + formatCurrency(asset.value) + '</div>' + gain + '</div>'
                + '<div class="asset-actions">'
                + '<button class="btn-icon edit" title="編集" data-id="' + asset.id + '">&#9998;</button>'
                + '<button class="btn-icon delete" title="削除" data-id="' + asset.id + '">&#128465;</button>'
                + '</div></div>';
        }).join('');

        // Attach event listeners
        container.querySelectorAll('.btn-icon.edit').forEach(function (btn) {
            btn.addEventListener('click', function () { openEditModal(btn.dataset.id); });
        });
        container.querySelectorAll('.btn-icon.delete').forEach(function (btn) {
            btn.addEventListener('click', function () { openDeleteConfirm(btn.dataset.id); });
        });
    }

    document.getElementById('filter-category').addEventListener('change', renderAssets);
    document.getElementById('sort-by').addEventListener('change', renderAssets);

    // === Modal: Add/Edit ===
    var modalOverlay = document.getElementById('modal-overlay');
    var assetForm = document.getElementById('asset-form');

    document.getElementById('btn-add-asset').addEventListener('click', function () {
        openAddModal();
    });

    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel').addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    function openAddModal() {
        document.getElementById('modal-title').textContent = '資産を追加';
        assetForm.reset();
        document.getElementById('asset-id').value = '';
        modalOverlay.classList.remove('hidden');
    }

    function openEditModal(id) {
        var asset = assets.find(function (a) { return a.id === id; });
        if (!asset) return;

        document.getElementById('modal-title').textContent = '資産を編集';
        document.getElementById('asset-id').value = asset.id;
        document.getElementById('asset-name').value = asset.name;
        document.getElementById('asset-category').value = asset.category;
        document.getElementById('asset-value').value = asset.value;
        document.getElementById('asset-cost').value = asset.cost || '';
        document.getElementById('asset-note').value = asset.note || '';
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
    }

    assetForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var id = document.getElementById('asset-id').value;
        var name = document.getElementById('asset-name').value.trim();
        var category = document.getElementById('asset-category').value;
        var value = document.getElementById('asset-value').value;
        var cost = document.getElementById('asset-cost').value;
        var note = document.getElementById('asset-note').value.trim();

        if (id) {
            // Edit existing
            var asset = assets.find(function (a) { return a.id === id; });
            if (asset) {
                asset.name = name;
                asset.category = category;
                asset.value = value;
                asset.cost = cost;
                asset.note = note;
                asset.updatedAt = new Date().toISOString();
            }
        } else {
            // Add new
            assets.push({
                id: generateId(),
                name: name,
                category: category,
                value: value,
                cost: cost,
                note: note,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        saveAssets();
        closeModal();
        renderAssets();
        updateDashboard();
    });

    // === Modal: Delete ===
    var deleteOverlay = document.getElementById('delete-overlay');

    function openDeleteConfirm(id) {
        deleteTargetId = id;
        var asset = assets.find(function (a) { return a.id === id; });
        if (asset) {
            document.getElementById('delete-message').textContent =
                '「' + asset.name + '」を削除しますか？この操作は取り消せません。';
        }
        deleteOverlay.classList.remove('hidden');
    }

    document.getElementById('btn-delete-cancel').addEventListener('click', function () {
        deleteOverlay.classList.add('hidden');
        deleteTargetId = null;
    });

    document.getElementById('btn-delete-confirm').addEventListener('click', function () {
        if (deleteTargetId) {
            assets = assets.filter(function (a) { return a.id !== deleteTargetId; });
            saveAssets();
            renderAssets();
            updateDashboard();
        }
        deleteOverlay.classList.add('hidden');
        deleteTargetId = null;
    });

    deleteOverlay.addEventListener('click', function (e) {
        if (e.target === deleteOverlay) {
            deleteOverlay.classList.add('hidden');
            deleteTargetId = null;
        }
    });

    // === History / Snapshots ===
    document.getElementById('btn-snapshot').addEventListener('click', function () {
        var total = getTotalValue();
        var today = new Date().toISOString().slice(0, 10);

        // Check if today's snapshot already exists
        var existing = history.find(function (h) { return h.date === today; });
        if (existing) {
            existing.total = total;
            existing.breakdown = getCategoryTotals();
        } else {
            history.push({
                date: today,
                total: total,
                breakdown: getCategoryTotals(),
            });
        }

        // Keep history sorted
        history.sort(function (a, b) { return a.date.localeCompare(b.date); });

        saveHistory();
        updateHistoryView();
        updateDashboard();
    });

    function updateHistoryView() {
        updateHistoryChart();
        renderHistoryList();
    }

    function updateHistoryChart() {
        var ctx = document.getElementById('history-chart').getContext('2d');

        if (history.length === 0) {
            if (historyChart) { historyChart.destroy(); historyChart = null; }
            return;
        }

        var labels = history.map(function (h) { return h.date; });
        var data = history.map(function (h) { return h.total; });

        if (historyChart) historyChart.destroy();

        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '総資産額',
                    data: data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return formatCurrency(context.parsed.y);
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                if (value >= 100000000) return (value / 100000000) + '億';
                                if (value >= 10000) return (value / 10000) + '万';
                                return value;
                            },
                        },
                    },
                },
            },
        });
    }

    function renderHistoryList() {
        var container = document.getElementById('history-list');

        if (history.length === 0) {
            container.innerHTML = '<p class="empty-message">まだ記録がありません。「現在の資産を記録」ボタンで資産のスナップショットを保存してください。</p>';
            return;
        }

        // Show in reverse chronological order
        var sorted = history.slice().reverse();
        container.innerHTML = sorted.map(function (h) {
            return '<div class="history-item">'
                + '<span class="history-date">' + formatDate(h.date) + '</span>'
                + '<span class="history-value">' + formatCurrency(h.total) + '</span>'
                + '</div>';
        }).join('');
    }

    // === Keyboard shortcut ===
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            deleteOverlay.classList.add('hidden');
            deleteTargetId = null;
        }
    });

    // === Init ===
    renderAssets();
    updateDashboard();
})();
