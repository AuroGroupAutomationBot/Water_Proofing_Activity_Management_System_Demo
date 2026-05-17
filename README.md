<div align="center">

<img src="https://img.shields.io/badge/QualityTrack-WP-b45309?style=for-the-badge&logoColor=white" alt="QualityTrack WP"/>

# Waterproofing Activity Management System

**Enterprise digital quality control platform for waterproofing inspections in real estate construction — Multi-project portfolio management with role-based 5-stage gate process**

![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![HTML](https://img.shields.io/badge/Built_with-HTML%20%7C%20CSS%20%7C%20JS-f59e0b?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-16a34a?style=flat-square)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Tablet%20%7C%20Desktop-5b9ef5?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-16a34a?style=flat-square)

</div>

---

## 📌 The Problem

Waterproofing failures are among the **most common and costly post-handover defect claims** in residential construction. The root cause is almost always the same:

> Stages were skipped. Approvals were verbal. Photos were never taken. There is no paper trail when accountability is needed.

**QualityTrack WP makes stage-skipping impossible, approvals unambiguous, and the audit trail automatic.**

---

## 🎯 What This Demo Shows

This is a fully interactive, zero-dependency browser-based demo that simulates the complete lifecycle of a waterproofing quality control activity across multiple projects, towers, and roles. No backend, no login, no installation — just open and explore.

Select your role on the cover page and the system adapts entirely to what you need to see:

<table>
<tr>
<td width="25%" align="center"><b>🏗️<br>Civil RCC Engineer</b></td>
<td>Creates the activity with 9-field cascading master data form (Project → Tower → Floor → Flat). Fills Stage 1 RCC Structural Readiness checklist with location-wise responses and mandatory photo evidence.</td>
</tr>
<tr>
<td align="center"><b>🧑‍🔧<br>Civil Finish Team</b></td>
<td>Reviews Stage 1 submissions with independent YES/NO site inspection. Fills Stages 3, 4 & 5 checklists — Surface Preparation, Waterproofing Coating, and Protection Screed.</td>
</tr>
<tr>
<td align="center"><b>🔧<br>MEP Team</b></td>
<td>Fills Stage 2 — MEP Core Cut & Installation checklist. 6 items covering core cutting, pipe routing, water testing, and conduit installation.</td>
</tr>
<tr>
<td align="center"><b>🔍<br>QC Inspector</b></td>
<td>Reviews all 5 stages with location-wise inspection. Issues approvals or rejections with mandatory comments. Raises Non-Conformance Reports (NCRs) with full freeze and escalation workflow.</td>
</tr>
<tr>
<td align="center"><b>👑<br>Project Quality Head</b></td>
<td>Approves or rejects NCR submissions from QC Engineer. NCR approval triggers immediate activity freeze and 10-minute escalation timer.</td>
</tr>
<tr>
<td align="center"><b>📊<br>Project / Tower Manager</b></td>
<td>Executive Dashboard with real-time KPIs — quality score donut chart, monthly trend bar charts, project health cards, NCR risk watch, activity pipeline table, and timeline.</td>
</tr>
<tr>
<td align="center"><b>🏢<br>Senior Management</b></td>
<td>Read-only portfolio visibility across all projects, towers, and activities. Same Executive Dashboard for leadership review and stakeholder reporting.</td>
</tr>
</table>

---

## ⚙️ The 5-Stage Gate Process

```
┌─────────────────────────────────────────────────────────────────┐
│        Activity Created by Civil RCC Engineer (9-field MD)       │
│     Project · Tower · Floor · Flat · TIC · Civil · MEP · Mgr    │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
          ┌────────────────────────────────────────┐
          │  Stage 1 — RCC Structural Readiness    │  13 items
          │  Filled by: Civil RCC Engineer         │  6 locations
          │  Reviewed by: Civil Finish Team → QC   │
          └──────────────────┬─────────────────────┘
                             │ CF Review ✓ → QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 2 — MEP Core Cut & Installation │  6 items
          │  Filled by: MEP Team                   │  6 locations
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 3 — Surface Prep & Pre-Ponding  │  7 items
          │  Filled by: Civil Finish Team          │  7 locations
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 4 — WP Coating Application      │  8 items
          │  Filled by: Civil Finish Team          │  7 locations
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 5 — Protection Screed & Final   │  3 items
          │  Filled by: Civil Finish Team          │  7 locations
          └──────────────────┬─────────────────────┘
                             │ Final QC Approval ✓
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│    Activity Closed — Consolidated Record Auto-Generated          │
│    All stage data, QC decisions, photos permanently archived     │
└─────────────────────────────────────────────────────────────────┘
```

> **37 checklist items across 5 stages. Every stage gated by QC approval. Zero stage-skipping possible.**

---

## 🔥 NCR & Freeze System

The platform includes a full **Non-Conformance Report (NCR)** lifecycle:

```
QC raises NCR → Quality Head reviews → Approve: Activity FROZEN + 10-min timer
                                     → Reject: Work continues

    ┌─────────────────────────────────────────┐
    │         NCR Approved — FROZEN           │
    │  All stage progression halted            │
    │  10-minute escalation timer starts       │
    │  Responsible party must submit           │
    │  compliance with corrective actions      │
    └────────────────────┬────────────────────┘
                         ▼
              QC reviews compliance
              ├─ Accept → Activity UNFROZEN
              └─ Reject → Escalation triggered
```

> NCR events automatically propagate to the Executive Dashboard — frozen status, NCR count, and timeline all update in real-time.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔒 **Sequential Stage Locking** | Stages 2–5 are locked until the prior stage is QC-approved. Enforced by the system, not by supervision. |
| 👥 **7 Role-Based Views** | Civil RCC, Civil Finish, MEP, QC Inspector, Quality Head, Project Manager, and Senior Management — each sees only what is relevant. |
| 📋 **9-Field Cascading Master Data** | Project → Tower → TIC → Floor → Flat → Civil → MEP → Manager — all fields cascade and lock on submission. |
| 🗺️ **Multi-Location Checklists** | Each stage has location-specific tabs (Hall, Kitchen, Bathrooms, Balcony, etc.) with independent responses per location. |
| ✅ **Submission Gate Validation** | Submit button disabled until all items across all locations are answered and all location photos captured. |
| 📸 **Mandatory Photo Evidence** | Location-level photo capture required before submission. Photos archived in consolidated record. |
| ⚠️ **NCR & Freeze Workflow** | QC raises NCR → QH approves → Activity frozen → 10-min escalation timer → Compliance submission → QC review. |
| 📊 **Executive Dashboard** | Real-time KPIs, quality score donut chart, monthly trend bars, project health cards, NCR risk watch, and activity pipeline. |
| 🔄 **Live Dashboard Sync** | All stage approvals, NCR events, and status changes automatically propagate to the Executive Dashboard via `syncPortfolio()`. |
| 📱 **Fully Responsive** | Mobile hamburger menu with slide-in sidebar, tablet-optimized layouts, and desktop full-width views. Works on any device. |
| 🖨️ **Print / PDF Ready** | Consolidated Activity Record includes print-optimized CSS for generating PDF documentation. |
| 📋 **Consolidated Record** | Auto-generated on activity closure — all locations, all stages, all QC decisions, DRG references, and photo evidence archived. |
| 🏢 **Multi-Project Portfolio** | 3 projects (Skyline Residency Phase II, Metro Heights Phase I, Greenview Apartments) with 12 demo activities across multiple towers. |

---

## 🏢 Demo Data — Multi-Project Portfolio

| Project | Towers | Activities | Status |
|---|---|---|---|
| Skyline Residency Phase II | Tower A, Tower B, Tower C | 6 | 3 Closed · 2 Active · 1 Frozen |
| Metro Heights Phase I | Tower 1, Tower 2 | 3 | 1 Closed · 2 Active |
| Greenview Apartments | Block A, Block B | 3 | 1 Closed · 1 Active · 1 Frozen |

> 12 pre-loaded activities across 3 projects, 7 towers, with realistic stage progression and NCR data.

---

## 🛠️ Tech Stack

```
Frontend    →  HTML5 · CSS3 · Vanilla JavaScript (zero dependencies)
Architecture→  Single-file SPA with paint()-driven UI rendering
State       →  Client-side global state object (V) with real-time sync
Fonts       →  System fonts + CSS custom properties design system
Hosting     →  GitHub Pages (static, no server required)
Lead Capture→  Google Forms
```

> **Production stack (planned):** Python · FastAPI · PostgreSQL · React · S3 · Celery · Redis

---

## 🚀 Getting Started

**Run locally — no build step, no dependencies:**

```bash
# Clone the repository
git clone <your-repo-url>
cd Waterproofing-Activity-Management-System-Demo

# No build step. No npm install. No dependencies.
# Just open index.html in any browser.
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

> Works on any device — desktop, tablet, or mobile. No internet required after download.

---

## 📁 Project Structure

```
Waterproofing-Activity-Management-System-Demo/
├── index.html           ← Complete self-contained application (~2000 lines)
├── README.md            ← This file
├── CODE_OF_CONDUCT.md   ← Community standards
├── CONTRIBUTING.md      ← How to contribute
└── LICENSE              ← MIT License
```

---

## 🗺️ Roadmap — Production Modules

- [x] 5-Stage sequential gate process with QC approvals
- [x] 7-role RBAC with role-specific views
- [x] NCR raise → QH review → freeze → compliance → unfreeze workflow
- [x] Executive Dashboard with KPIs, charts, and project health cards
- [x] Multi-project portfolio with tower-level tracking
- [x] Cascading master data (Project → Tower → Floor → Flat)
- [x] Mobile responsive with hamburger menu navigation
- [x] Consolidated Activity Record with print/PDF support
- [ ] Super Admin Login & Multi-tenant Authentication
- [ ] Role-Based Access Control (RBAC) with granular permissions
- [ ] Admin & Project Manager Control Panels
- [ ] Photo upload with GPS geolocation tagging
- [ ] Material register — batch numbers, DFT records, TDS references
- [ ] PDF export — consolidated quality record per activity
- [ ] Real-time push notifications on stage transitions
- [ ] Offline / PWA mode for poor-connectivity field use
- [ ] Activity ID auto-generation per project hierarchy

---

## 📬 Contact

If you are a real estate developer, construction company, or project management firm interested in deploying QualityTrack WP for your projects — reach out for a live walkthrough.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full terms.

---

<div align="center">

Made with ❤️ for the Indian real estate and construction industry

</div>
