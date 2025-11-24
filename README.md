# Assignment11
Team-Based DevSecOps Feature Experimentation (HDD + Feature Toggling)

# DevSecOps Feature Toggle Demo

This repository is used for **Assignment 11 – Team-Based DevSecOps Feature Experimentation**.  
It demonstrates two experimental features using **feature toggles** and applies basic **DevSecOps and security design** principles.

---

## 👥 Team Members
- 93weiwei — Project Manager  
- jimmy0904229 — Developer  
- zyuxua — Designer  
- haolillian — Tester  

---

## 🔧 Features in This Project

### 1. Shortened Login Flow (Feature Toggle: `shortLogin`)
- **OFF** → Two-step login (email page → password page)  
- **ON** → One-page login (email + password together)

### 2. Quick Report Button (Feature Toggle: `quickReport`)
- **OFF** → Posts do NOT show a report button  
- **ON** → A 🚩 Report button appears beside posts

These toggles are controlled inside `toggle.js`.

---

## 🔒 Security Design (Summarized)
This project applies several DevSecOps practices:

### 1. Authentication & Authorization (A&A)
- Features assume users must be authenticated to access toggle-enabled flows.
- Access boundaries ensure toggles cannot bypass login.

### 2. Software Composition Analysis (SCA)
- GitHub **Dependabot** is enabled.
- Any high-risk dependency must be patched before merge.

### 3. Secret Management
- No secrets are hardcoded.
- All API keys (if needed) must be stored in **GitHub Secrets**.

---

