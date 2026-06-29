# INVENTOR AUTHENTICATION & SUBSCRIPTION SPECIFICATION v1.0

## 1. PURPOSE

This document defines authentication, user management, authorization, subscriptions, billing, and feature access for the Inventor Journey platform.

It is the authoritative specification for identity and monetization.

---

## 2. AUTHENTICATION

Supported providers:
- Email & Password
- Google Sign-In
- Apple Sign-In (iOS)
- Password Reset
- Email Verification

Every user must authenticate before creating or accessing projects.

---

## 3. USER PROFILE

```json
{
  "uid": "",
  "displayName": "",
  "email": "",
  "photoUrl": "",
  "subscriptionTier": "FREE | PRO | ENTERPRISE",
  "createdAt": "",
  "lastLogin": "",
  "settings": {}
}
```

---

## 4. SUBSCRIPTION TIERS

### FREE
- 1 active project
- Basic Engine
- Limited AI usage
- Limited storage

### PRO
- Unlimited projects
- Full Engine
- All AI Agents
- Advanced exports
- Priority support

### ENTERPRISE
- Team workspaces
- Shared projects
- Admin controls
- API access

---

## 5. FEATURE GATING

The backend determines feature availability.
Do not enforce permissions only in the frontend.

---

## 6. BILLING

Recommended:
- Stripe (Web)
- Apple In-App Purchase (iOS)
- Google Play Billing (Android)

The backend stores the authoritative subscription status.

---

## 7. FIRESTORE STRUCTURE

users/
- uid
- displayName
- email
- subscriptionTier
- settings

subscriptions/
- uid
- provider
- status
- plan

projects/
- ownerUid
- stage
- readinessScore

---

## 8. SECURITY

- Users access only their own projects.
- All writes require authentication.
- Authorization is enforced server-side.
- Firestore Security Rules must mirror backend rules.

---

## 9. USER LIFECYCLE

Visitor
→ Sign Up
→ Email Verification
→ Free
→ Upgrade (optional)
→ Active Subscriber

---

## 10. IMPLEMENTATION

- Firebase Authentication
- Firestore Security Rules
- Backend authorization
- Audit authentication and billing events

---

## 11. PRINCIPLES

- Identity is required.
- Backend is the source of truth.
- Subscription controls features.
- UI reflects backend decisions.
