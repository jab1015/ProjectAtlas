# INVENTOR JOURNEY SYSTEM SPECIFICATION (v1.0)

## 1. SYSTEM OVERVIEW

The Inventor Journey System is a structured invention operating system that transforms ideas into validated, manufacturable, and commercialized products.

It consists of three core layers:

### 1. ENGINE (Decision Layer)
Responsible for:
- Determining stage of invention
- Evaluating readiness
- Generating next best action
- Detecting risks

### 2. AI TEAM (Reasoning Layer)
Responsible for:
- Domain-specific analysis
- Validation of assumptions
- Design and manufacturing insight
- Intellectual property guidance

### 3. APPLICATION (UI Layer - ZO BUILT)
Responsible for:
- Displaying project state
- User interaction
- Data input/output
- Visualization of journey progress

---

## 2. CORE DATA MODEL

### Project Schema

```json
Project {
  id: string,
  idea: string,
  stage: "IDEA | VALIDATION | RESEARCH | IP | DESIGN | PROTOTYPE | MANUFACTURING | FUNDING | BRANDING | MARKETING | SALES | GROWTH",
  readiness_score: number,
  missing_elements: string[],
  risks: string[],
  next_action: string,
  history: object[]
}
```

---

## 3. INVENTOR JOURNEY ENGINE SPECIFICATION

### 3.1 Stage Detection Rules

IF no validated problem → IDEA  
IF no customer evidence → VALIDATION  
IF no market data → RESEARCH  
IF no IP strategy → IP  
IF no design specs → DESIGN  
IF no prototype → PROTOTYPE  
IF no manufacturing plan → MANUFACTURING  
IF no funding plan → FUNDING  
IF no brand identity → BRANDING  
IF no marketing plan → MARKETING  
IF no sales system → SALES  
ELSE → GROWTH  

---

### 3.2 Readiness Scoring Model

< 50 = NOT READY  
50–79 = PARTIAL  
80+ = READY  

---

### 3.3 Next Action Generator

NEXT ACTION:
One high-impact step that moves the project forward.

Rules:
- no multi-step plans
- must be specific
- must remove uncertainty

---

### 3.4 Risk Engine

Detect:
- IP Risk
- Market Risk
- Feasibility Risk
- Cost Risk

---

## 4. AI TEAM SPECIFICATION

### IDEA AGENT
- refines concept
- clarifies problem

### VALIDATION AGENT
- market demand signals
- competitor awareness

### IP AGENT
- patent risk
- protection strategy

### DESIGN AGENT
- structure guidance
- manufacturability

### MANUFACTURING AGENT
- production path
- cost logic

---

## 5. ENGINE OUTPUT CONTRACT

{
  "stage": "",
  "readiness_score": 0,
  "status": "READY | PARTIAL | NOT READY",
  "missing_elements": [],
  "risks": [],
  "next_action": "",
  "explanation": ""
}

---

## 6. SYSTEM FLOW

User → App → Engine → AI Team → Output

---

## 7. IMPLEMENTATION RULES

- Engine = backend only
- AI = modular services
- App = UI only
- No business logic in frontend

---

## FINAL PRINCIPLE

ENGINE = TRUTH  
AI TEAM = INTELLIGENCE  
APP = INTERFACE
