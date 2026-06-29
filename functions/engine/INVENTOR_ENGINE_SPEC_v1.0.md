# INVENTOR ENGINE SPECIFICATION v1.0

## 1. PURPOSE

The Inventor Journey Engine is the decision layer of the Inventor System.
It converts raw invention ideas into structured outputs:

- Stage classification
- Readiness scoring
- Risk detection
- Next actionable step

It is the single source of truth for invention progression.

---

## 2. INPUT CONTRACT

```json
{
  "projectId": "string",
  "idea": "string",
  "context": {}
}
```

---

## 3. OUTPUT CONTRACT

```json
{
  "stage": "IDEA | VALIDATION | RESEARCH | IP | DESIGN | PROTOTYPE | MANUFACTURING | FUNDING | BRANDING | MARKETING | SALES | GROWTH",
  "readiness_score": 0,
  "status": "READY | PARTIAL | NOT READY",
  "missing_elements": [],
  "risks": [],
  "next_action": "",
  "explanation": ""
}
```

---

## 4. ENGINE MODULES

### 4.1 Stage Detection Engine

Rules:

IF no problem validation → IDEA  
IF no user evidence → VALIDATION  
IF no market data → RESEARCH  
IF no IP protection → IP  
IF no design spec → DESIGN  
IF no prototype → PROTOTYPE  
IF no production plan → MANUFACTURING  
IF no funding strategy → FUNDING  
IF no brand identity → BRANDING  
IF no marketing plan → MARKETING  
IF no sales system → SALES  
ELSE → GROWTH  

---

### 4.2 Readiness Scoring Engine

Score range: 0–100

Formula:

- Problem clarity: 20
- Market validation: 20
- Solution definition: 20
- Execution readiness: 20
- Resource feasibility: 20

Rules:

<50 = NOT READY  
50–79 = PARTIAL  
80+ = READY  

---

### 4.3 Next Action Engine

Output MUST be:

ONE actionable step that removes the biggest blocker.

Rules:
- no multi-step plans
- no vague advice
- must be executable immediately

Format:

NEXT ACTION:
<action>

---

### 4.4 Risk Engine

Detect:

- IP risk (existing similar inventions)
- Market risk (no demand)
- Feasibility risk (too complex)
- Cost risk (too expensive)

Each risk includes severity: LOW | MEDIUM | HIGH

---

## 5. ENGINE FUNCTION (ZO IMPLEMENTATION)

### runEngine()

Flow:

1. Load project
2. Apply stage detection rules
3. Calculate readiness score
4. Detect risks
5. Generate next action
6. Return structured response
7. Save to database

---

## 6. DATABASE (FIREBASE)

Collection: projects

Fields:
- id
- idea
- stage
- readiness_score
- next_action
- risks
- history
- updated_at

---

## 7. ERROR HANDLING

If missing data:
- default stage = IDEA
- readiness = 0
- next_action = "Define problem clearly"

---

## 8. VERSION RULES

v1.0 = deterministic rule-based engine  
v1.1 = AI-assisted scoring  
v2.0 = hybrid predictive engine  

---

## 9. CORE PRINCIPLE

The Engine is the ONLY authority on invention state.

UI cannot override it.
AI agents cannot override it.
