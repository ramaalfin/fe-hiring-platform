# GetJob - Enterprise Hiring Platform (Frontend)

> A comprehensive, modern full-stack hiring platform frontend built with Next.js 14, React, and TypeScript. It features advanced interactions, secure authentication flows, a dynamic data approach, and touchless gesture interactions.

## 🚀 Key Features

*   **Magic Link Authentication:** Passwordless login and signup supporting frictionless user onboarding using one-time verification links.
*   **Role-Based Access Control (RBAC):** Distinct dashboards and routing experiences for `ADMIN` and `CANDIDATE` roles, deeply protected via Next.js middleware and JWT parsing mapping accurately to `app/(main)/admin` and `app/(main)/home`.
*   **Gesture-Based Form Submission:** Utilizing `@tensorflow-models/handpose` and `@mediapipe/hands`, candidates can capture document scans or selfies simply by performing specific hand poses (counting to 3) directly via their browser webcam.
*   **Dynamic Application Forms:** Forms scale based on role requirements. Forms process dynamic Zod validations leveraging the backend schemas using `buildSchema.ts`.
*   **Performance & Caching:** Leverages TanStack React Query (`@tanstack/react-query`) for optimized data-fetching, caching, and state synchronization with the REST API.
*   **Responsive UI:** Fully responsive design built out using Tailwind CSS, Shadcn UI components, Radix UI primitives, resulting in accessible, clean, and interactive interfaces.

## 🛠️ Tech Stack

*   **Framework:** Next.js 14.2 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, PostCSS, class-variance-authority, clsx
*   **UI Components:** Shadcn/UI, Radix UI (accessible primitives like Dialog, Dropdown, Checkbox), Lucide React
*   **State Management:** TanStack React Query (Server State), Zustand (Global Client State)
*   **Forms & Validation:** React Hook Form, Zod
*   **AI/Webcam Interaction:** TensorFlow.js (`@tensorflow/tfjs`), MediaPipe Hands, `react-webcam`
*   **Network/API:** Axios, JS Cookie, JWT Decode

## 📂 Project Structure

```text
fe-hiring-platform/
├── app/                  # Next.js App Router root directory
│   ├── (auth)/           # Route group for authentication pages (public)
│   │   ├── magic-login/  # Verification page for Magic Link login
│   │   ├── magic-signup/ # Verification page for Magic Link signup
│   │   ├── signup/       # Candidate user registration
│   │   └── page.tsx      # Main Login entrypoint (Password & Magic Link)
│   ├── (main)/           # Route group for authenticated application pages
│   │   ├── _components/  # Layout components like Header, Sidebar, and apply forms
│   │   ├── admin/        # Admin portal containing job creation, review, etc.
│   │   │   ├── _components/ # Admin-specific forms & components
│   │   │   ├── home/     # Admin dashboard summary
│   │   │   └── job-list/ # Detailed management of Jobs by Admin
│   │   ├── home/         # Candidate home/dashboard
│   │   ├── job-list/     # Candidate job discovery and application list
│   │   └── profile/      # User profile management
│   ├── apply-success/    # Post-application success feedback page
│   ├── check-email/      # Notification screen after Magic Link request
│   ├── globals.css       # Global Tailwind and base CSS
│   ├── layout.tsx        # Global Application Layout Context
│   └── middleware.ts     # Edge middleware for RBAC routing constraints
├── components/           # Reusable generic UI elements (Shadcn forms, Modals)
├── context/              # React Context Providers (Auth, Theme, Query)
├── hooks/                # Custom React Hooks (use-toast, use-mobile, use-debounce)
├── lib/                  # Library utilities
│   ├── api.ts            # Consolidates all Axios API fetch/mutation bindings
│   └── axios-client.ts   # Axios interceptor setup (Tokens configurations)
├── public/               # Static assets (images, flags, icons)
├── schemas/              # Zod validation schemas (e.g. dynamic profile/job requirements)
├── types/                # Core TypeScript Type Definitions
└── package.json          # Project configurations & dependency specifics
```

## 🌊 Application Flow

### 1. Authentication Flow
*   **Visiting Application**: The user encounters `middleware.ts`. If they are completely unauthenticated (`access_token` not in cookies), they are served pages within `app/(auth)`.
*   **Standard Login**: Submit forms mapped via `lib/api.ts` -> backend -> Sets authentication Cookies.
*   **Magic Link Flow**: The user enters an email -> Backend sends an Email. The user clicks the link -> The browser directs to `magic-login/verify?code=XXX`. The code gets submitted via `api.ts`, returning JWT tokens.
*   **RBAC Redirection**: Upon successful authentication, candidates are forwarded to `/home` and admins to `/admin/home`.

### 2. Administrator Flow
*   **Job Management**: In `/admin/job-list`, an admin can view applications, create jobs using `JobForm.tsx`, and modify criteria.
*   **Creating Needs**: Admins specify conditional form fields like `photoProfile`, `phoneNumber` to be "mandatory" or "optional" when creating job schema requirements.

### 3. Candidate Application Flow
*   **Finding Jobs**: Handled via `CandidateJobList` utilizing React Query.
*   **Applying**: Using `ApplyFormModal.tsx` containing the `ApplyForm.tsx`. Form dynamically renders based on Admin's criteria (e.g., if rendering the Date of Birth or specific documents is required).
*   **Gesture Interaction**: When image submissions are necessary, the Candidate opens `GestureCameraModal.tsx` which prompts `.estimateHands()` from TensorFlow. Recognizing 3 raised fingers programmatically snaps a photo capturing their gesture accurately inside the DOM via `canvas`.

## 🛠 Setup & Installation

### 1. Prerequisites
Ensure you have `Node.js` v18+ and `npm` installed.

### 2. Environment Variables
Create a `.env` file from the `.env.example`:
```bash
cp .env.example .env
```
Ensure `NEXT_PUBLIC_API_URL` points to the corresponding `be-hiring-platform` target (often `http://localhost:5001/api/v1`).

### 3. Install NPM Packages
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the application.

## 🤝 Integrations & APIs
*   **Axios Client**: Utilizes specific configurations mapped on `axios-client.ts`, specifically interceptors to route refresh-tokens (`x-skip-refresh` logic inside `/api.ts`).
*   **TanStack Query**: Every data endpoint maps through highly predictable query keys (`['jobs']`) giving immediate optimistic UI changes on actions. 

---
**Maintained by GetJob Team**
