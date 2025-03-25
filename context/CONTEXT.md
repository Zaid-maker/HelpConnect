# App Blueprint: HelpConnect - Social Support Network

## 1. Project Breakdown

**App Name:** HelpConnect  
**Platform:** Web application (responsive design)  
**Summary:** HelpConnect is a social media platform designed to connect people in need with those who can offer assistance. The app facilitates community support by enabling users to post requests for help (from simple favors to urgent needs) and allows others to respond with offers of assistance. The vision is to create a supportive digital community where people can both give and receive help in a structured, safe environment.  

**Primary Use Case:**  

- A user facing temporary hardship posts a request for help (e.g., "Need someone to walk my dog while I'm recovering from surgery")  
- Community members see the post and can offer assistance  
- The requester selects a helper and they coordinate through the platform  

**Authentication Requirements:**  

- Email/password authentication via Supabase Auth  
- Optional OAuth providers (Google, GitHub)  
- User profiles with verification badges for trusted helpers  
- Rating system for reputation management  

## 2. Tech Stack Overview

**Frontend Framework:**  

- React 19 with Next.js 15 (App Router)  
- TypeScript for type safety  

**UI Components:**  

- Tailwind CSS for utility-first styling  
- ShadCN UI component library for accessible, pre-built components  

**Backend Services:**  

- Supabase for:  
  - PostgreSQL database (user profiles, help requests, messages)  
  - Real-time subscriptions for instant updates  
  - Authentication and authorization  
  - Storage for user avatars and post images  

**Deployment:**  

- Vercel for CI/CD and hosting  

## 3. Core Features

1. **Help Request System:**  
   - Form to create help requests with title, description, category, urgency level  
   - Location-based filtering (using Supabase PostGIS extension)  
   - Request status tracking (open, in-progress, completed)  

2. **Community Interaction:**  
   - Commenting on requests  
   - Private messaging between users  
   - Upvoting helpful community members  

3. **User Profiles:**  
   - Verification system (email, phone, document upload)  
   - Skill tags (e.g., "first aid certified", "handyman")  
   - Rating and review system  

4. **Real-time Notifications:**  
   - Web push notifications for new messages and request updates  
   - In-app notification center  

5. **Safety Features:**  
   - Report/flag system for inappropriate content  
   - Optional location masking for sensitive requests  

## 4. User Flow

1. **Onboarding:**  
   - New user signs up via email or OAuth  
   - Completes profile setup (bio, skills, location)  
   - Views brief tutorial on platform use  

2. **Requesting Help:**  
   - User clicks "Ask for Help"  
   - Fills out request form with details  
   - Submits and waits for responses  

3. **Offering Help:**  
   - User browses help feed or searches by category  
   - Clicks "I Can Help" on a request  
   - Sends initial message to requester  

4. **Connection:**  
   - Parties coordinate via in-app messaging  
   - After completion, both leave ratings  

5. **Ongoing Engagement:**  
   - Users receive notifications about new requests in their area  
   - Weekly digest emails highlighting opportunities to help  

## 5. Design & UI/UX Guidelines

**Visual Style:**  

- Color palette: Blues and greens (trust/help associations)  
- Dark mode support via Tailwind  
- Rounded corners and soft shadows for friendly feel  

**Key UI Components (using ShadCN):**  

- Custom Card component for help requests  
- Dialog components for request creation  
- Tabs for switching between request/offer views  
- Badge system for urgency levels  

**Accessibility:**  

- WCAG AA compliance  
- Keyboard navigable interface  
- ARIA labels for screen readers  

**Micro-interactions:**  

- Subtle animations when requests receive new offers  
- Progress indicators for multi-step processes  

## 6. Technical Implementation

**Frontend Structure:**  

- Next.js App Router with route groups:  
  - `(auth)` - authentication related pages  
  - `(main)` - core application with protected routes  

**Supabase Integration:**  

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Real-time Help Requests:**  

```typescript
// components/HelpFeed.tsx
useEffect(() => {
  const channel = supabase
    .channel('help-requests')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'requests'
    }, (payload) => {
      // Update local state with new request
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

**Authentication Flow:**  

```typescript
// app/(auth)/login/page.tsx
import { supabase } from '@/lib/supabase/client'

async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  // Handle response
}
```

## 7. Development Setup

**Required Tools:**  

- Node.js 18+  
- Git  
- Supabase CLI (for local development)  

**Setup Instructions:**  

1. Clone repository  
2. Install dependencies:  

   ```bash
   npm install
   ```  

3. Set up environment variables:  

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```  

4. Run development server:  

   ```bash
   npm run dev
   ```  

**Supabase Setup:**  

1. Create new Supabase project  
2. Set up tables:  
   - `profiles` (extends auth.users)  
   - `help_requests`  
   - `offers`  
   - `messages`  
3. Enable Row Level Security with appropriate policies  
4. Set up storage bucket for user uploads  

**Deployment:**  

1. Connect Git repository to Vercel  
2. Set same environment variables in Vercel dashboard  
3. Enable automatic deployments on push to main
