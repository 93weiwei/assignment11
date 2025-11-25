// 全局狀態
let featureFlags = {};
let currentUserToken = null;

// 初始化
async function init() {
    try {
        const res = await fetch('/api/features');
        featureFlags = await res.json();
        
        // 同步 Admin Console
        const tShort = document.getElementById('toggle-short');
        const tReport = document.getElementById('toggle-report');
        if(tShort) tShort.checked = featureFlags.shortLogin;
        if(tReport) tReport.checked = featureFlags.quickReport;

        renderUI();
    } catch (e) {
        console.error("Backend offline");
    }
}

function renderUI() {
    renderLoginFlow();
    renderFeedFlow();
}

// ==========================================
// 1. 登入邏輯 (配合 Designer Wireframe)
// ==========================================
function renderLoginFlow() {
    const container = document.getElementById('login-container');

    // 狀態：已登入
    if (currentUserToken) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:48px;">👤</div>
                <h3>Welcome Back!</h3>
                <p style="color:#65676b; font-size:13px;">You are securely logged in.</p>
                <button class="btn btn-secondary" onclick="logout()">Log Out</button>
            </div>
        `;
        return;
    }

    // 狀態：未登入 (檢查 Feature Flag)
    if (featureFlags.shortLogin) {
        // === Toggle ON: 新版一頁式 (All-in-one) ===
        container.innerHTML = `
            <h4>✨ New Simplified Login</h4>
            <label>Email Address</label>
            <input type="text" id="email" value="test@example.com">
            
            <label>Password</label>
            <input type="password" id="password" value="password123">
            
            <button class="btn btn-primary" onclick="doLogin()">Log In</button>
        `;
    } else {
        // === Toggle OFF: 舊版兩步式 (Step-by-step) ===
        container.innerHTML = `
            <h4>🔒 Standard Login</h4>
            
            <div id="step1">
                <label>Email Address</label>
                <input type="text" id="email-step1" value="test@example.com">
                <button class="btn btn-primary" onclick="goToStep2()">Next</button>
            </div>

            <div id="step2" class="hidden">
                <label>Password</label>
                <input type="password" id="password" value="password123">
                <button class="btn btn-primary" onclick="doLogin()">Log In</button>
                <div style="text-align:center; margin-top:15px;">
                    <a href="#" onclick="backToStep1()" style="color:#1877f2; font-size:13px; text-decoration:none;">← Back to Email</a>
                </div>
            </div>
        `;
    }
}

// 舊版流程控制
function goToStep2() {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
}
function backToStep1() {
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');
}

// 執行登入 API
async function doLogin() {
    // 判斷當前是哪個版本的 Email 輸入框
    let emailVal;
    if (document.getElementById('email')) {
        emailVal = document.getElementById('email').value; // 新版
    } else {
        emailVal = document.getElementById('email-step1').value; // 舊版
    }
    
    const passwordVal = document.getElementById('password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailVal, password: passwordVal })
        });
        const data = await res.json();

        if (data.success) {
            currentUserToken = data.token;
            alert("✅ Login Successful!\nToken: " + data.token.substring(0, 20) + "...");
            renderUI();
        } else {
            alert("❌ Login Failed: " + data.message);
        }
    } catch (e) { console.error(e); }
}

function logout() {
    currentUserToken = null;
    renderUI();
}

// ==========================================
// 2. 貼文邏輯 (Security & Design)
// ==========================================
function renderFeedFlow() {
    const container = document.getElementById('feed-container');
    const posts = [
        { id: 1, user: "Alice", text: "What a beautiful day! ☀️" },
        { id: 2, user: "SpamBot", text: "Click here for FREE iPhone! 🎁" }
    ];

    let html = '';
    posts.forEach(post => {
        let actionButton = '';

        // Security Check: 登入後才能看到操作按鈕
        if (currentUserToken) {
            if (featureFlags.quickReport) {
                // === Toggle ON: 快速回報按鈕 (Red Button) ===
                actionButton = `
                    <button class="btn-report" onclick="doReport(${post.id})">
                        🚩 Report
                    </button>
                `;
            } else {
                // === Toggle OFF: 舊版選單 (Ellipsis) ===
                actionButton = `<span style="color:#aaa; font-size:20px; cursor:pointer;" onclick="alert('Old menu clicked')">•••</span>`;
            }
        } else {
            actionButton = `<small style="color:#ccc;">Login to act</small>`;
        }

        html += `
            <div class="post-item">
                <div class="user-info">
                    <div class="avatar"></div>
                    <div class="user-text">
                        <b>${post.user}</b>
                        <span>${post.text}</span>
                    </div>
                </div>
                <div>${actionButton}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 執行回報 API (Security Check)
async function doReport(postId) {
    // PM 要求：確認視窗
    if (!confirm("Are you sure you want to report this post?")) return;

    const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentUserToken // 帶上 Token
        },
        body: JSON.stringify({ postId })
    });

    if (res.status === 403) {
        alert("⛔ Security Alert: Unauthorized access blocked by backend!");
    } else {
        alert("✅ Report received by backend security team.");
    }
}

// Admin 更新
async function updateBackendFlags() {
    const shortLogin = document.getElementById('toggle-short').checked;
    const quickReport = document.getElementById('toggle-report').checked;
    await fetch('/api/features', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({shortLogin, quickReport})
    });
    featureFlags = {shortLogin, quickReport};
    renderUI();
}

document.addEventListener('DOMContentLoaded', init);