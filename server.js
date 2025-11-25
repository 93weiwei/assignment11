require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ==========================================
// 1. Feature Flags (HDD 核心)
// ==========================================
// 預設關閉 (Legacy Mode)
let featureFlags = {
    shortLogin: false,
    quickReport: false
};

// ==========================================
// 2. Secret Management (安全性)
// ==========================================
const API_SECRET = process.env.API_SECRET || "unsafe_default_secret";

// ==========================================
// 3. APIs
// ==========================================

// 取得目前開關狀態
app.get('/api/features', (req, res) => {
    res.json(featureFlags);
});

// Admin 更新開關 (Demo 用)
app.post('/api/features', (req, res) => {
    featureFlags = req.body;
    console.log("🔧 Feature Flags Updated:", featureFlags);
    res.json(featureFlags);
});

// 模擬登入 (回傳 Token)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // 簡單模擬驗證
    if (email === "test@example.com" && password === "password123") {
        // 登入成功，簽發一個帶有 Secret 的假 Token
        const token = `mock-token-${API_SECRET}-${Date.now()}`;
        res.json({ 
            success: true, 
            token: token,
            user: { email, name: "Admin User" }
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// 提交回報 (Security Check Point!)
app.post('/api/report', (req, res) => {
    const authHeader = req.headers.authorization;

    // A&A Check: 即使前端按鈕被駭客強制開啟，後端仍檢查是否有 Token
    if (!authHeader || !authHeader.startsWith("Bearer mock-token")) {
        console.log("⚠️ Unauthorized report attempt blocked!");
        return res.status(403).json({ success: false, message: "Unauthorized! Please login." });
    }

    console.log(`✅ Report received for Post ID: ${req.body.postId}`);
    res.json({ success: true, message: "Report submitted successfully." });
});

// 啟動 Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔒 Secret Key Loaded: ${process.env.API_SECRET ? 'YES' : 'NO'}`);
});