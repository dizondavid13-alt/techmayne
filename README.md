# TechMayne

> Automated chatbot for photographer websites - Qualify leads, answer questions, and book clients automatically.

## Overview

TechMayne is a plug-and-play chatbot designed specifically for wedding and event photographers. The chatbot integrates seamlessly into photographer websites to answer common questions, qualify leads, and route visitors to booking—all with minimal setup and ongoing maintenance.

## Purpose

- **Answer common questions instantly** using photographer-specific knowledge
- **Qualify leads with minimal friction** by collecting event details and contact info
- **Route visitors** to booking links or inquiry handoff
- **Deliver clean, structured leads** to photographers automatically via email

## Target Users

**Primary (Clients)**
- Wedding photographers
- Engagement / elopement photographers
- Solo operators or small studios
- Website platforms: Squarespace, Showit, Wix, WordPress

**Secondary**
- Couples and event planners visiting photographer websites

## Key Features (MVP)

- **Website Chat Widget** - Lightweight JavaScript embed via single `<script>` tag
- **Photographer-Specific Bot Flow** - Pre-built conversation flow for lead qualification
- **Scripted FAQ Responses** - Button-based navigation and keyword matching for common questions
- **Lead Qualification** - Captures event date, location, coverage needs, and contact info
- **Booking Link Routing** - Integrates with Calendly, Acuity, etc.
- **Email Notifications** - Instant lead delivery to photographers
- **15-Minute Setup** - From signup to live chatbot in under 15 minutes

## Tech Stack

**Backend**
- Node.js / Express API
- Supabase (Postgres + Storage + Auth)
- Email Service (Resend / SendGrid)

**Frontend**
- Lightweight JavaScript widget
- Mobile and desktop responsive
- Works across all major website platforms

**Bot Architecture**
- Multi-tenant SaaS
- Single shared bot script with client-specific configuration
- Version-controlled bot flows

## Bot Logic Approach: Scripted Flow (Zero AI Costs)

**Cost-Effective MVP Strategy:**
Instead of using OpenAI API or similar AI services that incur per-usage costs, TechMayne uses a deterministic, scripted bot flow:

- **Predefined conversation paths** - Flowchart-style navigation
- **Button-based interactions** - Multiple choice options instead of free text
- **Text input only for contact collection** - Name, email, date, location
- **Keyword matching for FAQ routing** - Simple pattern matching for common questions
- **No AI API calls** - Zero variable costs per conversation

This approach ensures:
- Predictable operating costs
- Fast, reliable responses
- Complete control over conversation quality
- Ability to support 20-50+ clients without scaling costs

## Installation (For Photographer Clients)

```html
<script
  src="https://cdn.yourdomain.com/photobot.js"
  data-client-id="YOUR_CLIENT_ID"
></script>
```

Compatible with:
- Squarespace
- Wix
- Showit
- WordPress

## Project Status

**Current Phase:** MVP Development

**MVP Success Criteria:**
- ✅ Photographer can go live in under 15 minutes
- ✅ Bot captures qualified leads with date/location/coverage
- ✅ Leads delivered automatically via email
- ✅ No per-client bot scripting required
- ✅ Support 20-50 clients with minimal intervention

## Roadmap

**V1.5**
- SMS notifications
- Zapier/Make webhooks
- Manual "sync now" button

**V2**
- Client dashboard
- Multiple services (photo/video)
- Studio routing
- Analytics
- CRM integrations

## Business Model

- Subscription-based SaaS
- Optional setup/install services
- Minimal ongoing effort per client after installation

## License

Proprietary

---

**Built for photographers who want to capture more leads while they're out capturing moments.**
