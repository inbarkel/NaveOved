# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Residents of Moshav Neve Oved (Poria, Jordan Valley Regional Council): families, parents of children under 18, older residents, local business owners. They open the app on a phone, often in short moments (is the gate working, when is trash pickup, what is on this week). A second group is the village committee (ועד), who publish announcements, manage activities and clubs, approve new residents, and answer requests.

Separate audience for this redesign: visitors of the portfolio at bizfix.co.il, mainly village committees and regional councils looking for a community app of their own, and small business owners judging the builder's craft.

## Product Purpose
Replace the WhatsApp chaos the committee uses today (announcements that scroll away, activities cancelled without clear notice, no way to tell who registered). One place where the committee posts, residents register for activities and clubs, vote on ideas, find phone numbers, report problems and send requests to the committee.

Success: a resident finds what they need in seconds; the committee posts once and everyone sees it.

The app was built as a real product but the moshav did not buy it. It now serves as a portfolio case study for bizfix.co.il, shown with demo data.

## Positioning
Built around one village's actual routines (trash schedule, gate, local clubs, resident-to-resident marketplace) rather than a generic council template. The committee has a real admin panel inside the same app, with role-based access enforced in the database.

## Operating Context
Hebrew only, right-to-left. Phone-first, also used on desktop. Residents log in by phone number. Roles: resident, committee, super_admin (invitation list by phone number). New residents wait for committee approval. Registration to activities can include the resident's own children (dependents under 18).

## Capabilities and Constraints
- Next.js App Router, TypeScript, Tailwind, Supabase (Postgres, Auth, Realtime, RLS), deployed on Vercel. All existing functionality must keep working through the redesign.
- Screens: home feed with urgent announcements, quick actions, trash schedule; town board; activities and clubs with detail pages and registration; community (businesses, second-hand, lost and found, rentals, ideas and voting, gallery); more (phone numbers, gate, map, info, new residents, requests to committee, settings, about, privacy, terms, accessibility); admin panel; login and onboarding.
- Accessibility panel exists (large text, high contrast). Keep both working with any new tokens.
- Light and dark themes exist.
- Payments and push notifications run in demo mode.

## Brand Commitments
- Name stays "פוריה נווה עובד" and the moshav logo stays (public/images/logo.png, banner.jpg).
- Typeface must be Heebo (user requirement). All headings and body.
- Copy must read like a person wrote it, not like generated text. Run the humanizer skill on new Hebrew copy.
- Footer credit: © ענבר קלר.

## Evidence on Hand
Working app with demo data (announcements, activities, clubs, contacts, community items). Real banner photo of the valley. No real testimonials or customer numbers; do not invent any.

## Product Principles
1. Residents come first: the thing they came for is one tap away.
2. The committee's tools look as considered as the resident's screens.
3. Calm and clear beats clever: plain Hebrew labels, honest statuses.
4. Works for a 70-year-old on a small phone and impresses a council evaluating vendors.

## Accessibility & Inclusion
Older residents are real users. Large touch targets, strong contrast, readable Hebrew sizes, existing accessibility panel preserved.
