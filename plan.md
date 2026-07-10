PHASE 1 — Project Foundation
Goal

Create the base application.

Tasks
Create React + Vite project
Configure Tailwind
Setup folder structure
Create routing
Create layouts
Navbar
Footer
Theme
Responsive design
Global components
Loading screen
Error page (404)
Pages
Home

Admin Dashboard

404

No Firebase yet.

PHASE 2 — Firebase Integration
Goal

Connect the project with Firebase.

Tasks
Setup Firebase
Firestore
Storage
Environment variables
Firebase helper functions

Create

firebase.ts

storage.ts

firestore.ts

No UI changes.

PHASE 3 — Admin Dashboard Layout
Goal

Create the admin panel UI.

Pages
Dashboard

Create Event

Manage Events

Running Events

Needs Finalization

Past Events Manager
Dashboard Cards
Total Events

Coming Soon

Registration Open

Running

Needs Finalization

Past Events

Dummy data only.

PHASE 4 — Firestore Event Model
Goal

Create the backend structure.

Create Firestore collection

events

Implement

Create Event

Update Event

Delete Event

Read Event

List Events

No fancy UI.

Just CRUD.

PHASE 5 — Create Event Page

Build the entire Create Event form.

Sections

Basic Information

Title

Short Description

Description

Speaker

Category

Venue

Mode

Dates

Coming Soon Date

Registration Open

Registration Close

Event Start

Event End

Registration

Registration Link

Maximum Participants

Certificate Available

Images

Card Image (4:3)

Wide Image (16:9)

Store

Firestore

Firebase Storage

PHASE 6 — Manage Events

Create

All Events Table

Features

Search

Filters

Edit

Delete

View

Realtime Firestore.

PHASE 7 — Home Page Dynamic Sections

Build

Coming Soon

Registration Open

Running

Past Events

Read directly from Firestore.

Status calculated automatically.

No manual status field.

PHASE 8 — Coming Soon Section

Display

Sticky Notes

Each note

Event Name

Speaker

Date

Coming Soon

No images.

Click

Popup

Title

Description

Speaker

Registration Opens

Date

PHASE 9 — Registration Open

Cards

4:3 image

Title

Speaker

Venue

Date

Register

Event page

16:9 hero

Description

Venue

Register

Share

PHASE 10 — Running Events

Cards

Wide Image

LIVE

Title

Started

Venue

Details page

Wide Hero

Description

Resources

Meeting Link

Speaker

PHASE 11 — Needs Finalization

Admin page

Upload

Banner Image

Gallery

Participants

Highlights

Drive Link

Recording

Button

Publish Past Event

PHASE 12 — Past Events

Cards

Banner

Participants

Title

Date

Details

Banner

Gallery

Highlights

Recording

Drive

Participants

PHASE 13 — Dashboard Statistics

Dashboard should calculate

Total Events

Upcoming

Running

Past

Participants

Average Attendance

Realtime.

PHASE 14 — Image Upload System

Upload

Card

Wide

Banner

Gallery

Validation

4:3

16:9

Banner

Compression

Preview

Progress

PHASE 15 — Polish

Animations

Loading

Skeletons

Empty States

404

Responsive fixes

Performance

Accessibility

Code cleanup

Folder Structure
src/
│
├── components/
│   ├── common/
│   ├── events/
│   ├── admin/
│   ├── layout/
│   └── ui/
│
├── pages/
│   ├── Home/
│   ├── Admin/
│   ├── Event/
│   └── NotFound/
│
├── hooks/
│
├── services/
│   ├── firebase.ts
│   ├── firestore.ts
│   └── storage.ts
│
├── context/
│
├── types/
│
├── utils/
│
├── assets/
│
└── styles/
