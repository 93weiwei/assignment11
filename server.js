require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 預設開關 (目前全關)
let featureFlags = { shortLogin: false, quickReport: false };

// API 路由
app.get('/api/features', (req, res) => res.json(featureFlags));
app.post('/api/features', (req, res) => {
    featureFlags = req.body;
    res.json(featureFlags);
});

// 模擬登入 API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // 簡單驗證
    if (email === "test@example.com" && password === "password123") {
        const secret = process.env.API_SECRET || "unsafe";
        res.json({ success: true, token: "mock-jwt-" + secret, user: { email } });
    } else {
        res.status(401).json({ success: false, message: "Login Failed" });
    }
});

// 模擬回報 API
app.post('/api/report', (req, res) => {
    // 安全性檢查 (A&A)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer mock-jwt")) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    console.log("Report received for post:", req.body.postId);
    res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));