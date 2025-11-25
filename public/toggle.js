// public/toggle.js
let featureFlags = {};
let currentUserToken = null;

async function init() {
    // 1. 從後端取得開關狀態
    const res = await fetch('/api/features');
    featureFlags = await res.json();

    // 更新 Admin Console 的勾選狀態
    const tShort = document.getElementById('toggle-short');
    const tReport = document.getElementById('toggle-report');
    if(tShort) tShort.checked = featureFlags.shortLogin;
    if(tReport) tReport.checked = featureFlags.quickReport;

    renderUI();
}

function renderUI() {
    renderLogin();
    renderFeed();
}

// === 功能一：登入切換 ===
function renderLogin() {
    const container = document.getElementById('login-container');
    if (currentUserToken) {
        container.innerHTML = `<p>✅ Logged in</p><button onclick="currentUserToken=null;renderUI()">Logout</button>`;
        return;
    }

    if (featureFlags.shortLogin) {
        // 新版：一頁式
        container.innerHTML = `
            <h4>🚀 New Short Login</h4>
            <input type="text" id="email" value="test@example.com">
            <input type="password" id="password" value="password123">
            <button onclick="doLogin()">Login</button>
        `;
    } else {
        // 舊版：兩步式
        container.innerHTML = `
            <h4>👴 Legacy Login</h4>
            <div id="step1">
                <input type="text" id="email" value="test@example.com">
                <button onclick="document.getElementById('step1').classList.add('hidden');document.getElementById('step2').classList.remove('hidden')">Next</button>
            </div>
            <div id="step2" class="hidden">
                <input type="password" id="password" value="password123">
                <button onclick="doLogin()">Login</button>
            </div>
        `;
    }
}

async function doLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if(data.success) {
        currentUserToken = data.token;
        alert("Login Success!");
        renderUI();
    } else {
        alert("Failed");
    }
}

// === 功能二：回報按鈕與安全檢查 ===
function renderFeed() {
    const container = document.getElementById('feed-container');
    const posts = [{id:1, text:"Nice weather"}, {id:2, text:"Spam AD"}];

    let html = '';
    posts.forEach(post => {
        let btn = '';
        // HDD: Toggle 檢查
        // Security: 只有登入後才顯示按鈕 (Access Boundary)
        if (featureFlags.quickReport && currentUserToken) {
            btn = `<button class="btn-danger" onclick="doReport(${post.id})">🚩 Report</button>`;
        } else if (currentUserToken) {
            btn = `<small style="color:gray">... More</small>`;
        }
        html += `<div style="border-bottom:1px solid #eee; padding:10px; display:flex; justify-content:space-between;">
                    <span>${post.text}</span> ${btn}
                 </div>`;
    });
    container.innerHTML = html;
}

async function doReport(id) {
    if(!confirm("Confirm report?")) return;

    const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentUserToken // Token Injection
        },
        body: JSON.stringify({postId: id})
    });

    if(res.status === 403) {
        alert("Security Alert: Unauthorized Access Blocked!");
    } else {
        alert("Report Submitted Successfully.");
    }
}

// === Admin 更新後端 ===
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