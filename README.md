# Waterproofing Activity Management System

**A role-based digital quality control platform for waterproofing inspections in real estate construction**

---

## 📌 The Problem

Waterproofing failures are among the **most common and costly post-handover defect claims** in residential construction. The root cause is almost always the same:

> Stages were skipped. Approvals were verbal. Photos were never taken. There is no paper trail when accountability is needed.

**QualityTrack WP makes stage-skipping impossible, approvals unambiguous, and the audit trail automatic.**

---

## 🎯 What This Demo Shows

This is a fully interactive browser-based demo that simulates the real-time experience of the QualityTrack WP application. No backend, no login, no installation — just open and explore.

Select your role on the cover page and the system adapts entirely to what you need to see:

<table>
<tr>
<td width="25%" align="center"><b>📊<br>Project Director</b></td>
<td>Live operations dashboard — 18 active activities across projects, stage pipeline, pending QC decisions, overdue alerts, and recent approvals. Understand the health of all waterproofing operations in under 60 seconds.</td>
</tr>
<tr>
<td align="center"><b>🔍<br>QC Inspector</b></td>
<td>Pending review panel listing submitted stages with a direct "Review Now" jump. Open any stage, review all 37 checklist items, then Approve or Reject with mandatory comments. The next stage unlocks automatically on approval.</td>
</tr>
<tr>
<td align="center"><b>🏗️<br>Site Engineer</b></td>
<td>Choose your team and stage — only your checklist appears. Master data is pre-populated. Answer each item YES / NO / N/A, add comments, attach photos. Submit for QC when complete.</td>
</tr>
<tr>
<td align="center"><b>📋<br>Full Specification</b></td>
<td>Complete technical documentation — 11 sections covering architecture, role matrix, validation logic, traceability matrix, glossary, and all 5 stage checklists. Built for developers and admin teams.</td>
</tr>
</table>

---

## ⚙️ The 5-Stage Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Activity Created by Civil RCC                │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
          ┌────────────────────────────────────────┐
          │  Stage 1 — RCC Structural Readiness    │  13 items
          │  Filled by: Civil Finish Team          │
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 2 — MEP Core Cut & Installation │  6 items
          │  Filled by: MEP Team                   │
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 3 — Surface Prep & Pre-Ponding  │  7 items
          │  Filled by: WP Team                    │
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 4 — WP Coating Application      │  8 items
          │  Filled by: WP Applicator              │
          └──────────────────┬─────────────────────┘
                             │ QC Approval ✓
                             ▼
          ┌────────────────────────────────────────┐
          │  Stage 5 — Protection Screed & Final   │  3 items
          │  Filled by: Civil Finish Team          │
          └──────────────────┬─────────────────────┘
                             │ Final QC Approval ✓
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Activity Closed — Consolidated Record Generated       │
└─────────────────────────────────────────────────────────────────┘
```

> **37 checklist items across 5 stages. Every stage gated by QC approval. Zero stage-skipping possible.**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔒 **Sequential Locking** | Stages 2–5 are locked until the prior stage is QC-approved. Enforced by the system, not by supervision. |
| 👥 **Role-Based Views** | Each role sees only what is relevant — directors see dashboards, engineers see their checklist. |
| ✅ **Validation Gate** | Submit button stays disabled until all items are answered, NO items have comments, and assignee is selected. |
| 📸 **Photo Evidence** | Every checklist item requires a photo on YES/NO responses. N/A items require justification comments. |
| 📊 **Live Completion Counter** | Real-time progress bar per stage showing items filled vs pending. |
| 💾 **Auto-Save Draft** | Responses auto-save every 1.5 seconds. Toast notification confirms each save. |
| 🔄 **QC Approve / Reject Modal** | Full QC review simulation — inspector name, comments, decision — with locked stage state on approval. |
| 📋 **Consolidated Record** | Final output aggregates all 5 stages, all teams, all QC decisions into one traceability record. |
| 📱 **Mobile Responsive** | Checklist tables reflow to card layout on small screens for field use on tablets and phones. |

---

## 🛠️ Tech Stack

```
Frontend    →  HTML5 · CSS3 · Vanilla JavaScript (zero dependencies)
Fonts       →  Google Fonts — Spectral · Barlow · JetBrains Mono
Hosting     →  GitHub Pages (static, no server required)
Lead Capture→  Google Forms
```

> **Production stack (planned):** Python · FastAPI · PostgreSQL · React · S3 · Celery · Redis

---

---

## 🗺️ Roadmap — Production Modules

- [ ] Super Admin Login & Multi-tenant Authentication
- [ ] Role-Based Access Control (RBAC) with granular permissions
- [ ] Admin & Project Manager Control Panels
- [ ] Photo upload with GPS geolocation tagging
- [ ] Non-Conformance Report (NCR) tracking and closure workflow
- [ ] Material register — batch numbers, DFT records, TDS references
- [ ] PDF export — consolidated quality record per activity
- [ ] Real-time push notifications on stage transitions
- [ ] Offline / PWA mode for poor-connectivity field use
- [ ] Multi-project analytics dashboard
- [ ] Activity ID auto-generation per project hierarchy

---

© 2026 Auro Group
