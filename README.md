

# AI Vision Analyzer

### Professional Visual Data Analysis

**AI Vision Analyzer** is a high-performance web application designed to provide instant, professional-grade insights from visual data. Utilizing state-of-the-art vision models, it allows users to upload images and receive detailed, context-aware AI descriptions and analysis in seconds.

---

## 1. Project Overview

* **Purpose:** To bridge the gap between complex AI vision models and end-users through a minimalist, high-speed interface.
* **Target Audience:** Researchers, content creators, and developers needing rapid image metadata/descriptions.
* **Technologies Used:**
* **Frontend:** Next.js (Pages Router), Tailwind CSS, Framer Motion (for smooth transitions).
* **Authentication:** Clerk (with custom metadata for tier tracking).
* **Backend:** FastAPI / Python (deployed via Render/Railway or similar).
* **Payments:** Stripe Checkout integration.
* **Markdown:** React-Markdown with GFM support for clean analysis reports.



---

## 2. Features

* **Smart Image Upload:** Drag-and-drop interface with real-time format validation (JPG, PNG, WebP).
* **Neural Analysis:** Instant AI-generated descriptions powered by Vision Transformers.
* **Usage Tracking:** Custom middleware to track scan counts based on user tiers.
* **Membership Tiers:**
* **Standard (Free):** 1 scan limit per user.
* **Premium ($5/mo):** Unlimited scans, Pro Vision model, and priority access.


* **Data Portability:** Download analysis results as formatted `.txt` files.
* **Responsive Design:** Fully optimized for mobile, tablet, and ultra-wide desktops.
* **Dark Mode Aesthetic:** "Neural Vision" themed UI with backdrop blurs and indigo accents.

---

## 3. Setup Instructions

### Prerequisites

* Node.js (v18+)
* NPM or PNPM
* A Clerk account (for Auth)
* A Stripe account (for Payments)
* The Python backend repository running (FastAPI)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-vision-analyzer.git
cd ai-vision-analyzer

```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install

```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STRIPE_CHECKOUT_URL=your_stripe_payment_link

```

### Step 4: Run Locally

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the result.

---

## 4. API Documentation

### Base URL: `/api`

The application communicates with a Python-based FastAPI backend.

#### `POST /analyze`

* **Description:** Uploads an image for AI processing.
* **Auth Required:** Yes (`X-User-Id` and `X-User-Tier` headers).
* **Request Format:** `multipart/form-data`
* `file`: The image file (Max 5MB).


* **Response Format:**

```json
{
  "feedback": "# Analysis Summary\nThe image contains...",
  "status": "success"
}

```

---

## 5. Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel.
2. Add all environment variables from `.env.local` to the Vercel Dashboard.
3. Ensure the "Build Command" is `next build`.

### Required Vercel Variables

* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
* `CLERK_SECRET_KEY`
* `NEXT_PUBLIC_STRIPE_CHECKOUT_URL`

---

## 6. Live Demo

* **Application Link:** [https://ai-vision-analyzer.vercel.app](https://www.google.com/search?q=https://ai-vision-analyzer.vercel.app)
* **Test Credentials:** * *Create a free account using any email via Clerk's sign-up flow.*

---

## 7. Screenshots

### Landing Page
![Landing Page](./screenshots/imag1.png)
![Landing Page](./screenshots/image2.png)
![Landing Page](./screenshots/image.png)


### Analysis Workspace
![Analysis Report](./screenshots/analysis-result.png)
---

## 8. Known Limitations & Roadmap

* **Usage Tracking:** Currently utilizes Clerk's `unsafeMetadata`. In a production environment with high security requirements, this should be moved to a backend database (PostgreSQL/Supabase) to prevent client-side manipulation.
* **File Size:** Hard limit of 5MB per image due to serverless function constraints.
* **Not Yet Implemented:**
* Batch image processing (currently 1 image at a time).
* Cloud storage gallery for previous scans (currently download-only).



---

**Developed by Amel K Sunil** | 2026 Vision Intelligence.