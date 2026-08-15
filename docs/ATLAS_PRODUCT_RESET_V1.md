# Atlas Product Reset v1

**Status:** Authoritative build baseline  
**Product:** Atlas — the autonomous operating system for inventors  
**Initial release:** Idea to Feasibility and IP Readiness

## 1. Product promise

Atlas helps inventors move an idea toward market readiness by completing as much research, analysis, design preparation, documentation, and planning as reasonably possible.

Atlas does not promise that an invention will receive a patent, avoid infringement, comply with every applicable requirement, obtain financing, reach manufacturing, or succeed in the market. Atlas improves the inventor's ability to make informed decisions and gives qualified professionals organized, review-ready work.

> The inventor supplies the vision. Atlas does the preparatory work, documents its reasoning, requests approval for consequential actions, and involves qualified professionals when their judgment or authority is required.

## 2. Initial customer

The first customer is a United States-based independent inventor developing a non-safety-critical physical consumer product. The inventor may have only a written idea, sketch, photo, or early prototype and needs to determine whether further investment is justified.

The initial release does not support final engineering or regulatory conclusions for medical devices, drugs, food products, weapons, children's safety products, load-bearing products, life-safety equipment, hazardous materials, or other high-risk categories. Atlas may identify these categories and route the inventor to qualified help.

## 3. First paid outcome

Atlas produces an **Invention Feasibility and Development Package** containing:

1. Invention Brief
2. Assumption and Unknowns Register
3. Product Competitor Report
4. Preliminary Prior-Art Landscape
5. Feature-to-Prior-Art Comparison
6. Potentially Distinguishing Features and Alternative Embodiments
7. Technical Feasibility Assessment
8. Initial Product Requirements
9. Product Design Directions and Concept Images
10. Materials and Manufacturing Assessment
11. Preliminary Bill of Materials and Cost Range
12. Regulatory-Readiness Screening
13. Development Risks, Costs, and Dependencies
14. Recommended Next Actions
15. Patent-Professional and Engineering Handoff Briefs

The package ends with one transparent recommendation:

- Proceed
- Proceed after specified changes
- Pause pending evidence or professional review
- Do not invest further yet

Every recommendation includes sources, assumptions, uncertainty, missing information, and the reasoning that produced it.

## 4. Autonomy and authority

### Atlas may perform autonomously

- Analyze inventor-provided information
- Ask focused questions when a material fact cannot be inferred
- Search approved public and licensed sources
- Generate, refresh, and compare research
- Draft reports, specifications, plans, and professional handoff packages
- Generate product concepts and preliminary design artifacts
- Maintain evidence, decisions, dependencies, and status
- Recommend the next best action
- Re-run affected internal work when an approved decision changes

### Inventor approval is required

- Accepting a consequential product or business decision
- Sharing confidential information outside the inventor's workspace
- Contacting a professional, manufacturer, investor, lender, grant body, or other third party
- Publishing, marketing, crowdfunding, selling, or publicly demonstrating an invention
- Purchasing a service or incurring a fee
- Submitting a filing, application, certification, or legal document
- Representing an output as approved or ready for external use

### Qualified professional review is required

- Patentability, validity, infringement, freedom-to-operate, and design-around legal opinions
- Patent or trademark prosecution and representation
- Final contracts, assignments, licenses, NDAs, and other legal instruments
- Safety-critical or production-release engineering
- Final material, tolerance, structural, electrical, chemical, or thermal decisions where failure could cause harm
- Regulatory, certification, labeling, testing, tax, securities, lending, or investment conclusions

Atlas prepares the work for review; it does not impersonate or replace the reviewer.

## 5. Output trust states

Every material output has one of these states:

- **Atlas Draft:** Generated and incomplete or not yet checked
- **Evidence Checked:** Sources and internal consistency checks completed
- **Inventor Approved:** Underlying inventor decisions confirmed
- **Professional Review Required:** Use is blocked pending qualified review
- **Professionally Reviewed:** Reviewed by a named professional with date and scope
- **Ready for Authorized Use:** All required approvals recorded

An output must also display its source coverage, search date, assumptions, confidence, limitations, missing information, revision, and affected downstream artifacts.

## 6. Core product model

The application is built around a persistent **Invention Record**, not around chat history.

The record contains:

- Inventor statements and uploaded evidence
- Structured problem, solution, users, features, mechanisms, and embodiments
- Assumptions, unknowns, constraints, and risks
- Research queries, sources, excerpts, and coverage
- Findings and confidence assessments
- Decisions, alternatives, approvals, and rationale
- Work items, dependencies, attempts, costs, and status
- Generated deliverables and revision history
- Required professional reviews and their scope

Chat reads from and proposes changes to this record. No chat response silently changes an approved fact or decision.

## 7. Core runtime services

1. **Invention Record Service** — authoritative structured memory
2. **Orchestration Engine** — determines and schedules useful work
3. **Evidence Ledger** — connects claims to traceable support
4. **Decision Ledger** — preserves alternatives, recommendations, and approvals
5. **Dependency Engine** — marks downstream work stale after changes
6. **Approval Service** — blocks consequential actions without authorization
7. **Professional Review Service** — manages reviewer scope and status
8. **Deliverable Service** — versions, checks, and exports completed work
9. **Usage and Cost Service** — budgets expensive operations and prevents runaway jobs
10. **Status Briefing Service** — explains completed work, discoveries, decisions, and next work

## 8. Inventor experience

The primary interface answers four questions:

1. What did Atlas complete?
2. What did Atlas discover?
3. What decision or action requires the inventor?
4. What will Atlas do next?

Primary navigation for the initial release:

- Home
- My Inventions
- Work Review
- Documents
- Ask Atlas
- Account

Internal agents, prompts, model names, queues, readiness algorithms, and provider mechanics are not exposed as primary product concepts.

## 9. Research integrity

Atlas must:

- Separate sourced facts, inventor statements, estimates, and AI inferences
- Preserve exact source URLs or identifiers and access dates
- Record patent jurisdictions, collections, classifications, queries, and search dates
- Use more than one search method for material prior-art conclusions
- Never convert an incomplete search into a claim of patentability or freedom to operate
- Mark stale research when time-sensitive sources or product decisions change
- Treat retrieved documents and websites as untrusted data, never as system instructions

## 10. Product design maturity

Design artifacts use explicit maturity labels:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

The initial release may generate concept visualizations and product design directions. Parametric STEP/STL generation is introduced only for explicitly supported product categories after evaluation by qualified design and engineering reviewers.

## 11. Pricing principle

Customers pay for progress and completed outcomes, not an arbitrary number of chat messages. Ordinary chat may be generous, but research, image generation, CAD, large document generation, and professional services are metered or packaged.

No plan offers unlimited expensive autonomous operations.

Initial pricing to validate with pilots:

- Explore: free, one limited invention preview
- Validation Package: one-time purchase
- Builder: ongoing invention workspace and standard deliverables
- Pro: deeper research, design preparation, exports, and professional collaboration
- Professional services: separately authorized and priced

Prices remain hypotheses until pilot usage costs and willingness-to-pay are measured.

## 12. Success measures

The initial release succeeds when it demonstrates:

- Reduced inventor hours per completed package
- Reviewable and traceable research conclusions
- High professional acceptance of handoff packages
- Low unsupported-claim and missed-citation rates
- Clear identification of uncertainty and escalation needs
- Measurable professional review time saved
- Customers willing to pay for the completed outcome
- Responsible stop or pause recommendations for weak opportunities

## 13. Repository migration direction

### Preserve and adapt

- Next.js application foundation
- Convex backend and authentication
- Existing invention and stage concepts
- Validation research orchestration patterns
- Journey and readiness logic where compatible
- Existing regression-test practices
- Automation constitution principles

### Consolidate

- Overlapping product, journey, agent, workflow, and stage specifications
- Subscription tier names and entitlements
- Research result models and status fields
- Document and deliverable definitions
- Multiple interpretations of current product scope

### Retire after dependency analysis

- Legacy digital-download storefront domains and screens
- Store products, purchases, categories, testimonials, and download flows that do not serve Atlas
- Schema aliases and compatibility fields after data migration
- UI or documentation that presents unavailable later stages as currently operational

Nothing is deleted until references, stored data, and migration requirements are verified.

## 14. Delivery sequence

1. Baseline and repository audit
2. Canonical domain model and migrations
3. Invention Record, evidence, decisions, approvals, and work queue
4. Conversational intake and daily status briefing
5. Autonomous feasibility research workflow
6. Versioned deliverables and professional handoff packages
7. Usage controls, security hardening, and subscriptions
8. Representative-case evaluation and professional review
9. Controlled paid pilot
10. CAD category pilot and later journey expansion

## 15. Non-negotiable rule

Atlas may be proactive, persistent, and highly autonomous, but it must never hide uncertainty, fabricate completion, make an unauthorized external commitment, or represent unreviewed specialist work as professionally approved.

