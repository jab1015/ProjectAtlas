# INVENTOR JOURNEY — ZO BUILD PACK v1.0

---

# 0. PURPOSE

This document is the **MASTER IMPLEMENTATION GUIDE** for the Inventor Journey System.

It combines:
- System Specification
- Engine Logic
- AI Agent System
- API Wiring
into ONE buildable blueprint for ZO.

---

# 1. SYSTEM ARCHITECTURE

## Flow

User → Flutter App (ZO) → API Layer → Engine → AI Agents → Engine Response → App UI

---

## Layers

### 1. ENGINE (Source of Truth)
- Stage detection
- Readiness scoring
- Risk evaluation
- Next action generation

### 2. AI TEAM (Intelligence Layer)
- Idea Agent
- Validation Agent
- IP Agent
- Design Agent
- Manufacturing Agent

### 3. APPLICATION (ZO BUILDS THIS)
- UI only
- No business logic
- Displays engine + agent outputs

---

# 2. CORE DATA MODEL

```json
Project {
  id,
  idea,
  stage,
  readiness_score,
  missing_elements,
  risks,
  next_action,
  history
}
```

---

# 3. ENGINE SPECIFICATION

## Stage Logic

IF no problem → IDEA  
IF no validation → VALIDATION  
IF no market data → RESEARCH  
IF no IP → IP  
IF no design → DESIGN  
IF no prototype → PROTOTYPE  
IF no manufacturing → MANUFACTURING  
IF no funding → FUNDING  
IF no branding → BRANDING  
IF no marketing → MARKETING  
IF no sales → SALES  
ELSE → GROWTH  

---

## Readiness Score

0–100 scale:

<50 = NOT READY  
50–79 = PARTIAL  
80+ = READY  

---

## Next Action Rule

Always output ONE action:

- specific
- executable
- removes biggest blocker

---

## Risk Engine

Detect:
- IP risk
- Market risk
- Feasibility risk
- Cost risk

---

# 4. AI TEAM SYSTEM

## Idea Agent
- refine concept
- clarify problem

## Validation Agent
- demand signals
- competitors

## IP Agent
- patent risk
- protection strategy

## Design Agent
- system design
- manufacturability

## Manufacturing Agent
- production path
- cost structure

---

# 5. API LAYER

## Endpoints

### POST /runEngine
Runs core engine logic

### POST /runAgents
Runs AI agents based on stage

### GET /project/:id
Fetch project

### POST /project/update
Update project state

---

## Engine Flow

1. Load project
2. Run stage detection
3. Run scoring
4. Run risk engine
5. Generate next action
6. Save result
7. Return JSON

---

## Agent Flow

1. Detect stage
2. Select agents
3. Run in parallel
4. Normalize outputs
5. Return insights

---

# 6. FIREBASE STRUCTURE

/projects
  id
  idea
  stage
  readiness_score
  next_action
  risks
  history

---

# 7. RULES

- Engine is SINGLE source of truth
- AI cannot override engine
- App has NO logic
- Everything is JSON-based
- All decisions are server-side

---

# 8. ZO IMPLEMENTATION RULES

ZO must:

- ONLY build UI
- Call APIs only
- Never implement business logic
- Treat engine as authoritative system

---

# 9. DEPLOYMENT FLOW

GitHub → Firebase Functions → API → Flutter App

---

# 10. FINAL PRINCIPLE

ENGINE = TRUTH  
AI TEAM = INTELLIGENCE  
APP = INTERFACE  
