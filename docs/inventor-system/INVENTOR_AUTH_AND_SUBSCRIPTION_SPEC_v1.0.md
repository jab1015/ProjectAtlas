# INVENTOR AUTHENTICATION & SUBSCRIPTION SPECIFICATION v1.1

## Purpose

This specification defines authentication, authorization, subscriptions, billing, and feature access for the Inventor Journey platform.

**Business Principle:** Users pay to advance their invention through the Inventor Journey—not simply to create additional projects.

---

## Authentication

Supported providers:

- Email & Password
- Google Sign-In
- Apple Sign-In
- Password Reset
- Email Verification

---

## Subscription Tiers

### Explorer (Free)

Designed to let an inventor validate one invention.

Features:

- 1 active invention
- Idea stage
- Validation stage
- Basic Research tools
- Limited monthly AI credits
- Basic document storage
- Basic PDF export

Locked until upgrade:

- IP Protection
- Design
- Prototype Planning
- Manufacturing
- Funding
- Branding
- Marketing
- Sales
- Growth

---

### Inventor Pro

Includes everything in Explorer plus:

- Unlimited inventions
- Full Inventor Journey
- All AI Agents
- IP guidance
- Design workspace
- Prototype planning
- Manufacturing planning
- Funding preparation
- Branding
- Marketing
- Sales
- Growth
- Advanced exports
- Priority support

---

### Enterprise

Includes everything in Inventor Pro plus:

- Team workspaces
- Shared inventions
- Organization billing
- Administrative controls
- API access
- Enterprise support

---

## Feature Gating

Explorer:
- Idea
- Validation
- Basic Research

Inventor Pro:
- IP
- Design
- Prototype
- Manufacturing
- Funding
- Branding
- Marketing
- Sales
- Growth

Permissions are enforced by the backend only.

---

## Upgrade Trigger

After Validation is completed:

'Congratulations! Your invention is ready for IP Protection, Design, and Prototype Planning. Upgrade to Inventor Pro to continue your Inventor Journey.'

---

## Billing

- Stripe (Web)
- Apple In-App Purchase (iOS)
- Google Play Billing (Android)

Backend stores the authoritative subscription status.

---

## Security

- Authentication required
- Users only access their own inventions
- Backend authorizes premium features
- Firestore Security Rules mirror backend authorization

---

## Principles

- Engine = source of truth
- Backend = permission authority
- Users pay for progression, not project quantity
