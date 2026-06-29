# INVENTOR SYSTEM API WIRING v1.0

## 1. PURPOSE

This document defines the API layer that connects:
- Flutter App (ZO UI)
- Inventor Journey Engine
- AI Agent System
- Firebase Backend

It is the execution bridge between frontend and intelligence layers.

---

## 2. ARCHITECTURE OVERVIEW

Flow:

User → Flutter App → API Layer → Engine → AI Agents → Engine Response → App

---

## 3. BASE TECHNOLOGY

- Firebase Functions (Node.js)
- Firestore Database
- REST API endpoints
- JSON-based communication

---

## 4. CORE API ENDPOINTS

## 4.1 RUN ENGINE

POST /runEngine

### Request:
```json
{
  "projectId": "string",
  "idea": "string",
  "context": {}
}
```

### Flow:
1. Load project from Firestore
2. Run Inventor Engine
3. Store results
4. Return EngineResponse

### Response:
```json
{
  "stage": "",
  "readiness_score": 0,
  "status": "",
  "missing_elements": [],
  "risks": [],
  "next_action": "",
  "explanation": ""
}
```

---

## 4.2 RUN AI AGENTS

POST /runAgents

### Request:
```json
{
  "projectId": "string",
  "stage": "string",
  "idea": "string"
}
```

### Flow:
1. Identify relevant agents by stage
2. Execute agents in parallel
3. Collect responses
4. Return aggregated insights

### Response:
```json
[
  {
    "agent": "",
    "insight": "",
    "recommendation": "",
    "risk_flags": []
  }
]
```

---

## 4.3 GET PROJECT

GET /project/{id}

Returns full project state from Firestore.

---

## 4.4 UPDATE PROJECT

POST /project/update

Updates:
- stage
- readiness_score
- next_action
- history log

---

## 5. FIREBASE FUNCTION STRUCTURE

/functions

  /engine
    runEngine.js

  /agents
    runAgents.js

  /projects
    getProject.js
    updateProject.js

---

## 6. ENGINE WIRING LOGIC

runEngine():

1. Fetch project
2. Apply Stage Detection
3. Calculate Readiness Score
4. Run Risk Engine
5. Generate Next Action
6. Save to Firestore
7. Return response

---

## 7. AI AGENT WIRING LOGIC

runAgents():

1. Determine stage
2. Select agents:
   - IDEA
   - VALIDATION
   - IP
   - DESIGN
   - MANUFACTURING
3. Execute agents in parallel
4. Normalize JSON outputs
5. Return list

---

## 8. FIRESTORE STRUCTURE

projects/
  id
  idea
  stage
  readiness_score
  next_action
  risks
  history
  updated_at

---

## 9. RULES OF EXECUTION

- Engine is ALWAYS source of truth
- AI agents cannot override engine
- App cannot contain business logic
- All responses must be JSON
- All changes must be logged

---

## 10. SYSTEM GUARANTEE

If engine fails:
- default stage = IDEA
- readiness = 0
- next_action = "Define problem clearly"
