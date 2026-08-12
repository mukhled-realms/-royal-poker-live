// ============================================================
//  app.js – Royal Poker Live Single Page Application (SPA)
// ============================================================

// ============================================================
//  STATE (البيانات المشتركة بين جميع الصفحات)
// ============================================================
const state = {
    currentUser: {
        name: 'Victor Kane',
        id: '#VK-0042',
        level: 7,
        xp: 680,
        xpMax: 1000,
        chips: 12500,
        gems: 280,
        handsPlayed: 1247,
        winRate: 62,
        biggestWin: 8450,
        vip: true,
        avatar: '👑',
    },
    currentPage: 'index',
    isLoggedIn: true,
    table: {
        players: [
            { name: 'Victor Kane', chips: 10000, avatar: '👑', active: true },
            { name: 'Lucius Drake', chips: 10000, avatar: '🐺', active: false },
            { name: 'Isabelle Rose', chips: 10000, avatar: '🌹', active: false },
            { name: 'Damien Wolf', chips: 10000, avatar: '⚡', active: false },
            { name: 'Elena Stone', chips: 10000, avatar: '💎', active: false },
            { name: 'Jack Sparrow', chips: 10000, avatar: '🏴', active: false },
        ],
        pot: 2400,
        dealer: 0,
    },
    shop: {
        items: [
            { id: 1, name: 'Gold Deck', icon: '🃏', price: 250, currency: 'chips', badge: '🔥 Popular' },
            { id: 2, name: 'Royal Throne', icon: '👑', price: 120, currency: 'gems', badge: '✨ Limited' },
            { id: 3, name: 'Dark Knight', icon: '♠️', price: 400, currency: 'chips', badge: '⭐ Legendary' },
            { id: 4, name: 'The Magician', icon: '🎩', price: 80, currency: 'gems', badge: '🎁 New' },
        ],
        featured: { name: 'Whale Pack', chips: 500, gems: 100, price: 4.99, discount: 40 },
    },
};

// ============================================================
//  HELPER FUNCTIONS
// ============================================================

function updateUserDisplay() {
    const user = state.currentUser;
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-chips').forEach(el => el.textContent = user.chips.toLocaleString());
    document.querySelectorAll('.user-gems').forEach(el => el.textContent = user.gems);
    document.querySelectorAll('.user-level').forEach(el => el.textContent = user.level);
    document.querySelectorAll('.user-avatar').forEach(el => el.textContent = user.avatar);
    document.querySelectorAll('.user-id').forEach(el => el.textContent = user.id);
    document.querySelectorAll('.user-vip').forEach(el => el.style.display = user.vip ? 'inline' : 'none');
    document.querySelectorAll('.xp-bar').forEach(el => {
        const pct = Math.min(100, (user.xp / user.xpMax) * 100);
        el.style.width = pct + '%';
    });
    document.querySelectorAll('.xp-text').forEach(el => el.textContent = `${user.xp} / ${user.xpMax} XP`);
}

function updateTableDisplay() {
    const table = state.table;
    document.querySelectorAll('.pot-display').forEach(el => el.textContent = table.pot.toLocaleString());
    document.querySelectorAll('.player-count').forEach(el => el.textContent = `${table.players.length}/10`);
    // لاعبين الطاولة
    document.querySelectorAll('.table-players').forEach(container => {
        container.innerHTML = table.players.map(p => `
            <div class="player-row">
                <span class="text-white text-sm font-medium">${p.avatar} ${p.name}</span>
                <span class="text-gold-text text-sm">${p.chips.toLocaleString()}</span>
            </div>
        `).join('');
    });
}

function updateShopDisplay() {
    const shop = state.shop;
    document.querySelectorAll('.shop-featured').forEach(el => {
        el.innerHTML = `
            <div class="bg-gradient-to-r from-[#1a1040] to-[#2a1d5a] border border-[#fbbf24] rounded-2xl p-3 flex justify-between items-center">
                <div>
                    <span class="text-white font-bold text-sm">🔥 ${shop.featured.name}</span>
                    <div class="text-gold-text text-xs">${shop.featured.chips} 🪙 + ${shop.featured.gems} 💎</div>
                    <div class="text-gray-400 text-[10px]">$${shop.featured.price} — Save ${shop.featured.discount}%</div>
                </div>
                <button class="btn-gold text-xs py-1 px-4" onclick="buyFeatured()">Buy</button>
            </div>
        `;
    });
    document.querySelectorAll('.shop-items').forEach(container => {
        container.innerHTML = shop.items.map(item => `
            <div class="shop-card">
                <div class="icon">${item.icon}</div>
                <div class="name">${item.name}</div>
                <div class="price">${item.currency === 'chips' ? '🪙' : '💎'} ${item.price}</div>
                <span class="badge">${item.badge}</span>
                <button class="btn-gold text-xs py-1 mt-2" onclick="buyItem(${item.id})">Buy</button>
            </div>
        `).join('');
    });
}

function buyItem(id) {
    const item = state.shop.items.find(i => i.id === id);
    if (!item) return;
    const user = state.currentUser;
    const currency = item.currency === 'chips' ? 'chips' : 'gems';
    if (user[currency] < item.price) {
        alert(`❌ Not enough ${currency}! You have ${user[currency]}.`);
        return;
    }
    if (confirm(`Buy ${item.name} for ${item.price} ${currency}?`)) {
        user[currency] -= item.price;
        updateUserDisplay();
        updateShopDisplay();
        alert(`✅ You bought ${item.name}!`);
    }
}

function buyFeatured() {
    const user = state.currentUser;
    if (confirm(`Buy Whale Pack for $${state.shop.featured.price}? (demo only)`)) {
        user.chips += state.shop.featured.chips;
        user.gems += state.shop.featured.gems;
        updateUserDisplay();
        alert(`✅ You got ${state.shop.featured.chips} chips + ${state.shop.featured.gems} gems!`);
    }
}

// ============================================================
//  ROUTER – تحميل الصفحات ديناميكياً
// ============================================================

const pages = {};

async function loadPage(name) {
    try {
        const res = await fetch(`${name}.html`);
        const html = await res.text();
        const container = document.getElementById('app');
        container.innerHTML = html;
        state.currentPage = name;
        // تحديث البيانات بعد تحميل الصفحة
        setTimeout(() => {
            updateUserDisplay();
            updateTableDisplay();
            updateShopDisplay();
            bindEvents();
        }, 50);
        window.scrollTo(0, 0);
    } catch (err) {
        console.error('Error loading page:', err);
        document.getElementById('app').innerHTML = `<div class="text-center text-red-400 p-8">❌ Failed to load ${name}.html</div>`;
    }
}

function navigateTo(page) {
    if (page === state.currentPage) return;
    loadPage(page);
}

// ============================================================
//  BIND EVENTS (ربط الأزرار)
// ============================================================

function bindEvents() {
    // أزرار التنقل من أي صفحة
    document.querySelectorAll('[data-nav]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const page = el.dataset.nav;
            navigateTo(page);
        });
    });

    // زر Ask Me
    document.querySelectorAll('.ask-me-btn').forEach(el => {
        el.addEventListener('click', () => {
            alert('❓ Ask Me: How can I help you?\n\nQuick Help:\n- How to play?\n- How to buy chips?\n- How to invite friends?');
        });
    });

    // زر Sit Down (في اللوبي)
    document.querySelectorAll('.sit-down-btn').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo('table');
        });
    });

    // أزرار العودة
    document.querySelectorAll('.back-btn').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo('index');
        });
    });

    // أزرار تسجيل الدخول والتسجيل
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.querySelector('#login-email')?.value;
            const pass = document.querySelector('#login-password')?.value;
            if (email && pass) {
                alert('✅ Logged in as ' + state.currentUser.name);
                navigateTo('index');
            } else {
                alert('⚠️ Please fill in all fields.');
            }
        });
    }

    const signupBtn = document.querySelector('#signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            const name = document.querySelector('#signup-name')?.value;
            const email = document.querySelector('#signup-email')?.value;
            const pass = document.querySelector('#signup-password')?.value;
            const confirm = document.querySelector('#signup-confirm')?.value;
            if (name && email && pass && pass === confirm) {
                state.currentUser.name = name;
                alert('✅ Account created! Welcome ' + name);
                navigateTo('index');
            } else {
                alert('⚠️ Please fill in all fields correctly.');
            }
        });
    }

    // تبديل بين تسجيل الدخول والتسجيل
    const showSignup = document.querySelector('#show-signup');
    if (showSignup) {
        showSignup.addEventListener('click', () => {
            document.querySelector('#login-form').classList.add('hidden-form');
            document.querySelector('#signup-form').classList.remove('hidden-form');
        });
    }
    const showLogin = document.querySelector('#show-login');
    if (showLogin) {
        showLogin.addEventListener('click', () => {
            document.querySelector('#signup-form').classList.add('hidden-form');
            document.querySelector('#login-form').classList.remove('hidden-form');
        });
    }
}

// ============================================================
//  EXPOSE GLOBALLY (للاستخدام من الأزرار المباشرة)
// ============================================================
window.navigateTo = navigateTo;
window.buyItem = buyItem;
window.buyFeatured = buyFeatured;
window.state = state;

// ============================================================
//  INIT – تحميل الصفحة الأولى
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
    loadPage('auth');
});
