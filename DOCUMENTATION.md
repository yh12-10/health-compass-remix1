 # Medr - Medical Symptom Checker
 
 Complete Technical Documentation
 
 ---
 
 ## Table of Contents
 
 1. [Project Overview](#project-overview)
 2. [Architecture](#architecture)
 3. [Technology Stack](#technology-stack)
 4. [Project Structure](#project-structure)
 5. [Data Flow](#data-flow)
 6. [Component Architecture](#component-architecture)
 7. [Backend Functions](#backend-functions)
 8. [Internationalization (i18n)](#internationalization-i18n)
 9. [Design System](#design-system)
 10. [Type Definitions](#type-definitions)
 11. [Medical Database (RAG)](#medical-database-rag)
 12. [Key Code Blocks](#key-code-blocks)
 13. [Local Development](#local-development)
 14. [Environment Variables](#environment-variables)
 
 ---
 
 ## Project Overview
 
 **Medr** is an AI-powered medical symptom analysis application that allows users to:
 
 - Input personal information (name, age, gender, location)
 - Select symptoms from a categorized list or describe custom symptoms
 - Receive AI-generated analysis including:
   - Possible disease matches with confidence percentages
   - Suggested medications with dosage information
   - Prevention and lifestyle tips
   - Nearby hospitals based on user location
   - Recommended doctors by specialty
 
 ### Key Features
 
 - **Multi-step wizard interface** - Guided 3-step process
 - **AI-powered RAG analysis** - Uses medical knowledge base for matching
 - **Bilingual support** - English and Arabic with full RTL support
 - **Real-time translation** - Translates existing results without regenerating
 - **Location-aware recommendations** - Hospital/doctor suggestions based on user area
 - **Responsive design** - Works on desktop and mobile devices
 
 ---
 
 ## Architecture
 
 ### High-Level Architecture Diagram
 
 ```
 ┌─────────────────────────────────────────────────────────────────┐
 │                         FRONTEND (React)                        │
 │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
 │  │   Pages     │  │ Components  │  │      Providers          │ │
 │  │  - Index    │  │ - Symptom   │  │  - QueryClient          │ │
 │  │  - NotFound │  │   Checker   │  │  - TooltipProvider      │ │
 │  │             │  │ - Language  │  │  - i18next              │ │
 │  │             │  │   Switcher  │  │                         │ │
 │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
 └───────────────────────────┬─────────────────────────────────────┘
                             │
                             │ HTTP Requests (Supabase SDK)
                             ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                    BACKEND (Edge Functions)                     │
 │  ┌─────────────────────────┐  ┌────────────────────────────┐   │
 │  │   analyze-symptoms      │  │   translate-results        │   │
 │  │   - RAG matching        │  │   - JSON translation       │   │
 │  │   - AI enhancement      │  │   - Number preservation    │   │
 │  │   - Location-aware      │  │   - Bidirectional          │   │
 │  └───────────┬─────────────┘  └──────────────┬─────────────┘   │
 │              │                                │                 │
 │              └────────────────┬───────────────┘                 │
 │                               ▼                                 │
 │  ┌─────────────────────────────────────────────────────────────┐│
 │  │                    AI Providers                             ││
 │  │   Primary: OpenAI (GPT-4o-mini)                            ││
 │  │   Fallback: Gemini (gemini-3-flash-preview)                ││
 │  └─────────────────────────────────────────────────────────────┘│
 └─────────────────────────────────────────────────────────────────┘
 ```
 
 ### Request Flow Diagram
 
 ```
 User Input                 Edge Function              AI Provider
     │                           │                          │
     │  1. Submit symptoms       │                          │
     ├──────────────────────────►│                          │
     │                           │  2. RAG matching         │
     │                           │  (local database)        │
     │                           │                          │
     │                           │  3. AI enhancement       │
     │                           ├─────────────────────────►│
     │                           │                          │
     │                           │  4. Structured JSON      │
     │                           │◄─────────────────────────┤
     │  5. Analysis results      │                          │
     │◄──────────────────────────┤                          │
     │                           │                          │
 ```
 
 ---
 
 ## Technology Stack
 
 ### Frontend
 
 | Technology | Purpose |
 |------------|---------|
 | **React 18** | UI framework with hooks |
 | **TypeScript** | Type-safe development |
 | **Vite** | Build tool and dev server |
 | **Tailwind CSS** | Utility-first styling |
 | **shadcn/ui** | Component library |
 | **React Router** | Client-side routing |
 | **React Query** | Server state management |
 | **i18next** | Internationalization |
 | **Lucide React** | Icon library |
 | **Sonner** | Toast notifications |
 
 ### Backend
 
 | Technology | Purpose |
 |------------|---------|
 | **Supabase Edge Functions** | Serverless backend |
 | **Deno** | Runtime for edge functions |
 | **OpenAI API** | Primary AI provider |
 | **Fallback AI Gateway** | Secondary AI provider |
 
 ---
 
 ## Project Structure
 
 ```
 medr/
 ├── public/
 │   ├── data/
 │   │   └── medical-data.xlsx     # Source medical data
 │   ├── favicon.svg               # App icon
 │   └── robots.txt                # SEO configuration
 │
 ├── src/
 │   ├── components/
 │   │   ├── SymptomChecker/       # Main feature components
 │   │   │   ├── SymptomChecker.tsx    # Main orchestrator
 │   │   │   ├── UserInfoForm.tsx      # Step 1: User info
 │   │   │   ├── SymptomSelector.tsx   # Step 2: Symptoms
 │   │   │   ├── ResultsView.tsx       # Step 3: Results
 │   │   │   ├── LoadingAnalysis.tsx   # Loading state
 │   │   │   └── StepIndicator.tsx     # Progress indicator
 │   │   │
 │   │   ├── ui/                   # shadcn/ui components
 │   │   │   └── [40+ components]
 │   │   │
 │   │   ├── LanguageSwitcher.tsx  # Language toggle
 │   │   └── NavLink.tsx           # Navigation helper
 │   │
 │   ├── data/
 │   │   ├── symptoms.ts           # Symptom categories list
 │   │   └── medical-database.ts   # RAG knowledge base
 │   │
 │   ├── hooks/
 │   │   ├── use-mobile.tsx        # Mobile detection
 │   │   └── use-toast.ts          # Toast hook
 │   │
 │   ├── i18n/
 │   │   ├── index.ts              # i18n configuration
 │   │   ├── en.ts                 # English translations
 │   │   └── ar.ts                 # Arabic translations
 │   │
 │   ├── integrations/
 │   │   └── supabase/
 │   │       ├── client.ts         # Supabase client
 │   │       └── types.ts          # Auto-generated types
 │   │
 │   ├── lib/
 │   │   └── utils.ts              # Utility functions (cn)
 │   │
 │   ├── pages/
 │   │   ├── Index.tsx             # Home page
 │   │   └── NotFound.tsx          # 404 page
 │   │
 │   ├── types/
 │   │   └── symptom-checker.ts    # TypeScript interfaces
 │   │
 │   ├── App.tsx                   # App entry with routing
 │   ├── App.css                   # Global styles (minimal)
 │   ├── index.css                 # Tailwind + design system
 │   └── main.tsx                  # React entry point
 │
 ├── supabase/
 │   ├── config.toml               # Supabase configuration
 │   └── functions/
 │       ├── analyze-symptoms/
 │       │   └── index.ts          # Main analysis function
 │       └── translate-results/
 │           └── index.ts          # Translation function
 │
 ├── tailwind.config.ts            # Tailwind configuration
 ├── vite.config.ts                # Vite configuration
 └── tsconfig.json                 # TypeScript configuration
 ```
 
 ---
 
 ## Data Flow
 
 ### Complete User Journey
 
 ```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                        USER JOURNEY FLOW                            │
 └──────────────────────────────────────────────────────────────────────┘
 
                     ┌─────────────────┐
                     │   USER LANDS    │
                     │   ON APP        │
                     └────────┬────────┘
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │          STEP 1: YOUR INFO            │
          │  ┌─────────────────────────────────┐  │
          │  │  • Name (required)              │  │
          │  │  • Age (required)               │  │
          │  │  • Gender (required)            │  │
          │  │  • Area/City (required)         │  │
          │  └─────────────────────────────────┘  │
          │                                       │
          │  Validation: All fields must be       │
          │  filled before proceeding             │
          └───────────────────┬───────────────────┘
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │         STEP 2: SYMPTOMS              │
          │  ┌─────────────────────────────────┐  │
          │  │  • Select from 8 categories     │  │
          │  │  • 40+ predefined symptoms      │  │
          │  │  • Custom symptom textarea      │  │
          │  └─────────────────────────────────┘  │
          │                                       │
          │  Validation: At least 1 symptom      │
          │  selected OR custom text entered      │
          └───────────────────┬───────────────────┘
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │      ANALYZE SYMPTOMS CLICK           │
          └───────────────────┬───────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────┐
    │                EDGE FUNCTION                        │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  1. Combine selected + custom symptoms        │  │
    │  │  2. RAG: Match against medical database       │  │
    │  │  3. Calculate match percentages               │  │
    │  │  4. Send to AI for enhancement               │  │
    │  │  5. AI generates structured response          │  │
    │  │  6. Return JSON with all recommendations      │  │
    │  └───────────────────────────────────────────────┘  │
    └─────────────────────────┬───────────────────────────┘
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │         STEP 3: RESULTS               │
          │  ┌─────────────────────────────────┐  │
          │  │  • Possible conditions (ranked) │  │
          │  │  • Suggested medications        │  │
          │  │  • Prevention tips              │  │
          │  │  • Nearby hospitals             │  │
          │  │  • Recommended doctors          │  │
          │  │  • Medical disclaimer           │  │
          │  └─────────────────────────────────┘  │
          └───────────────────────────────────────┘
 ```
 
 ### Translation Flow
 
 ```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                    TRANSLATION FLOW                                 │
 └─────────────────────────────────────────────────────────────────────┘
 
 User switches language on results page
              │
              ▼
 ┌───────────────────────────────────────┐
 │  SymptomChecker.tsx detects change    │
 │  via useEffect on i18n.language       │
 └───────────────────┬───────────────────┘
                     │
                     ▼
 ┌───────────────────────────────────────┐
 │  Calls translateResults() instead     │
 │  of runAnalysis() - PRESERVES data    │
 └───────────────────┬───────────────────┘
                     │
                     ▼
 ┌───────────────────────────────────────┐
 │  translate-results Edge Function      │
 │  ┌─────────────────────────────────┐  │
 │  │  • Receives current results     │  │
 │  │  • AI translates text values    │  │
 │  │  • Preserves ALL numbers:       │  │
 │  │    - Phone numbers              │  │
 │  │    - Ratings                    │  │
 │  │    - Match percentages          │  │
 │  │    - Distances                  │  │
 │  └─────────────────────────────────┘  │
 └───────────────────┬───────────────────┘
                     │
                     ▼
 ┌───────────────────────────────────────┐
 │  UI updates with translated content   │
 │  Shows loading overlay during process │
 └───────────────────────────────────────┘
 ```
 
 ---
 
 ## Component Architecture
 
 ### Component Hierarchy
 
 ```
 App.tsx
 └── BrowserRouter
     └── Routes
         ├── Index.tsx (/)
         │   ├── LanguageSwitcher
         │   ├── Feature Cards (hero section)
         │   └── SymptomChecker
         │       ├── StepIndicator
         │       ├── UserInfoForm (step 1)
         │       ├── SymptomSelector (step 2)
         │       ├── LoadingAnalysis (step 3 loading)
         │       └── ResultsView (step 3 complete)
         │
         └── NotFound.tsx (*)
 ```
 
 ### SymptomChecker Component (Main Orchestrator)
 
 **Location:** `src/components/SymptomChecker/SymptomChecker.tsx`
 
 **Responsibilities:**
 - Manages wizard state (currentStep)
 - Holds form data (userInfo, symptoms, customSymptoms)
 - Handles API calls to edge functions
 - Manages loading and translation states
 - Orchestrates navigation between steps
 
 **State Management:**
 ```typescript
 const [currentStep, setCurrentStep] = useState(1);
 const [formData, setFormData] = useState<FormData>(initialFormData);
 const [isLoading, setIsLoading] = useState(false);
 const [isTranslating, setIsTranslating] = useState(false);
 const [results, setResults] = useState<AnalysisResult | null>(null);
 ```
 
 ### Component Details
 
 | Component | Purpose | Props |
 |-----------|---------|-------|
 | **StepIndicator** | Shows progress (1→2→3) | `steps`, `currentStep` |
 | **UserInfoForm** | Collects user details | `userInfo`, `onChange` |
 | **SymptomSelector** | Symptom selection UI | `selectedSymptoms`, `customSymptoms`, `onSymptomsChange`, `onCustomSymptomsChange` |
 | **LoadingAnalysis** | Animated loading state | (none) |
 | **ResultsView** | Displays analysis results | `results` |
 | **LanguageSwitcher** | Language toggle dropdown | (none) |
 
 ---
 
 ## Backend Functions
 
 ### analyze-symptoms
 
 **Location:** `supabase/functions/analyze-symptoms/index.ts`
 
 **Purpose:** Main symptom analysis with RAG matching and AI enhancement
 
 **Request Body:**
 ```typescript
 interface AnalysisRequest {
   userInfo: {
     name: string;
     age: number;
     gender: string;
     area: string;  // Used for location-aware recommendations
   };
   symptoms: string[];      // Selected symptom names
   customSymptoms: string;  // Free-text additional symptoms
   language: string;        // "en" or "ar"
 }
 ```
 
 **Response:**
 ```typescript
 interface AnalysisResult {
   diseases: Disease[];
   medications: Medication[];
   preventions: Prevention[];
   hospitals: Hospital[];
   doctors: Doctor[];
   disclaimer: string;
 }
 ```
 
 **RAG Matching Algorithm:**
 ```typescript
 function calculateMatchScore(userSymptoms: string[], diseaseSymptoms: string[]): number {
   // 1. Normalize symptoms to lowercase
   // 2. Check for exact matches
   // 3. Check for partial word matches
   // 4. Calculate percentage based on matches vs total user symptoms
   // 5. Cap at 95% (never 100% - disclaimer protection)
   return Math.min(matchPercentage, 95);
 }
 ```
 
 **AI Fallback System:**
 ```
 Primary: OpenAI GPT-4o-mini
    │
    ├── Success → Return response
    │
    └── Failure (rate limit/quota)
         │
         └── Fallback: Gemini 3 Flash Preview
 ```
 
 ### translate-results
 
 **Location:** `supabase/functions/translate-results/index.ts`
 
 **Purpose:** Translate existing results to target language without regenerating
 
 **Request Body:**
 ```typescript
 interface TranslateRequest {
   results: AnalysisResult;  // Current analysis results
   targetLanguage: string;   // "en" or "ar"
 }
 ```
 
 **Critical Translation Rules:**
 - Translate text values only (names, descriptions, etc.)
 - PRESERVE all numbers unchanged:
   - `matchPercentage` (e.g., 75)
   - `rating` (e.g., 4.8)
   - Phone numbers (e.g., "+966-11-123-4567")
   - Distances (e.g., "2.5 km")
   - Boolean values
 
 ---
 
 ## Internationalization (i18n)
 
 ### Configuration
 
 **Location:** `src/i18n/index.ts`
 
 ```typescript
 import i18n from 'i18next';
 import { initReactI18next } from 'react-i18next';
 
 i18n.use(initReactI18next).init({
   resources: {
     en: { translation: en },
     ar: { translation: ar },
   },
   lng: 'en',           // Default language
   fallbackLng: 'en',   // Fallback if translation missing
 });
 ```
 
 ### Translation Structure
 
 ```typescript
 // src/i18n/en.ts
 export const en = {
   common: { appName, loading, error, back, next, ... },
   hero: { badge, title1, title2, subtitle },
   features: { aiPowered, reliable, instant, ... },
   steps: { yourInfo, symptoms, results },
   userInfo: { title, name, age, gender, area, ... },
   symptoms: { title, selected, additional, analyzeButton },
   categories: { General, Respiratory, Digestive, ... },
   results: { title, possibleConditions, severity, ... },
   loading: { title, step1, step2, step3, step4 },
   footer: { disclaimer },
   language: { en, ar }
 };
 ```
 
 ### RTL Support
 
 **Language Switcher (`src/components/LanguageSwitcher.tsx`):**
 ```typescript
 const changeLanguage = (lng: string) => {
   i18n.changeLanguage(lng);
   document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
   document.documentElement.lang = lng;
 };
 ```
 
 **CSS RTL Support (`src/index.css`):**
 ```css
 [dir="rtl"] {
   font-family: "Plus Jakarta Sans", "Segoe UI", Tahoma, Arial, sans-serif;
 }
 
 [dir="rtl"] .text-start { text-align: right; }
 [dir="rtl"] .text-end { text-align: left; }
 ```
 
 ### Symptom Translations
 
 Symptoms have dedicated translation mapping in Arabic:
 
 ```typescript
 // src/i18n/ar.ts
 export const symptomTranslationsAr: Record<string, string> = {
   "Fever": "حمى",
   "Headache": "صداع",
   "Cough": "سعال",
   // ... 40+ symptom translations
 };
 ```
 
 ---
 
 ## Design System
 
 ### Color Palette
 
 **Location:** `src/index.css` (CSS variables) + `tailwind.config.ts` (Tailwind mappings)
 
 #### Core Colors
 
 | Variable | Light Mode | Purpose |
 |----------|------------|---------|
 | `--primary` | `173 58% 39%` | Medical teal |
 | `--background` | `210 40% 98%` | Page background |
 | `--foreground` | `222 47% 11%` | Text color |
 | `--accent` | `12 76% 61%` | Warm coral for CTAs |
 
 #### Medical Theme Colors
 
 | Variable | Color | Use Case |
 |----------|-------|----------|
 | `--medical-teal` | Primary | Main actions |
 | `--medical-blue` | `210 79% 46%` | Secondary accents |
 | `--medical-green` | `158 64% 52%` | Success/low severity |
 | `--medical-orange` | `25 95% 53%` | Warnings/medium severity |
 | `--medical-red` | `0 84% 60%` | Danger/high severity |
 | `--medical-purple` | `262 83% 58%` | Hospitals section |
 
 ### Typography
 
 ```typescript
 // tailwind.config.ts
 fontFamily: {
   sans: ["Inter", "system-ui", "sans-serif"],
   display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
 }
 ```
 
 ### Component Classes
 
 ```css
 /* Glass card effect */
 .glass-card {
   @apply bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg;
 }
 
 /* Gradient text */
 .gradient-text {
   @apply bg-gradient-to-r from-primary to-medical-blue bg-clip-text text-transparent;
 }
 
 /* Medical severity badges */
 .medical-badge-success { /* Green - low severity */ }
 .medical-badge-warning { /* Orange - medium severity */ }
 .medical-badge-danger  { /* Red - high severity */ }
 
 /* Step indicators */
 .step-indicator-active    { /* Current step */ }
 .step-indicator-completed { /* Completed step */ }
 .step-indicator-pending   { /* Future step */ }
 ```
 
 ### Animations
 
 ```css
 .animate-fade-in    /* Opacity 0 → 1 */
 .animate-slide-up   /* Opacity + translateY */
 .animate-pulse-soft /* Subtle opacity pulse */
 ```
 
 ---
 
 ## Type Definitions
 
 **Location:** `src/types/symptom-checker.ts`
 
 ```typescript
 // User information from step 1
 export interface UserInfo {
   name: string;
   age: number | null;
   gender: 'male' | 'female' | 'other' | '';
   area: string;
 }
 
 // Symptom from predefined list
 export interface Symptom {
   id: string;
   name: string;
   category: string;
 }
 
 // Disease match result
 export interface Disease {
   name: string;
   matchPercentage: number;   // 0-95
   description: string;
   severity: 'low' | 'medium' | 'high';
 }
 
 // Medication recommendation
 export interface Medication {
   name: string;
   type: string;              // e.g., "Analgesic"
   dosage: string;            // e.g., "500mg twice daily"
   notes: string;             // Side effects, warnings
 }
 
 // Prevention tip
 export interface Prevention {
   title: string;
   description: string;
 }
 
 // Hospital recommendation
 export interface Hospital {
   name: string;
   address: string;
   rating: number;            // 1-5
   distance: string;          // e.g., "2.5 km"
   phone: string;
   specialties: string[];
 }
 
 // Doctor recommendation
 export interface Doctor {
   name: string;
   specialty: string;
   hospital: string;
   rating: number;
   experience: string;        // e.g., "15 years"
   available: boolean;
 }
 
 // Complete analysis response
 export interface AnalysisResult {
   diseases: Disease[];
   medications: Medication[];
   preventions: Prevention[];
   hospitals: Hospital[];
   doctors: Doctor[];
   disclaimer: string;
 }
 
 // Form state
 export interface FormData {
   userInfo: UserInfo;
   selectedSymptoms: string[];  // Array of symptom IDs
   customSymptoms: string;      // Free text
 }
 ```
 
 ---
 
 ## Medical Database (RAG)
 
 ### Overview
 
 The application uses a Retrieval-Augmented Generation (RAG) approach:
 
 1. **Local Knowledge Base** - Embedded medical database in edge function
 2. **Symptom Matching** - Calculate match scores between user symptoms and disease symptoms
 3. **AI Enhancement** - AI enriches matches with location-aware recommendations
 
 ### Database Structure
 
 **Location:** `src/data/medical-database.ts` (frontend reference)  
 **Location:** Embedded in `supabase/functions/analyze-symptoms/index.ts` (backend)
 
 ```typescript
 interface MedicalRecord {
   disease: string;
   symptoms: string[];
   treatments: string[];
   precautions: string[];
   medicines: { name: string; sideEffects: string[] }[];
   advice: string;
   specialty: string;
   doctors: { name: string; rating?: number }[];
   hospitals: { name: string; rating?: number }[];
 }
 ```
 
 ### Diseases Covered (20+)
 
 | Category | Diseases |
 |----------|----------|
 | **General** | Common Cold, Food Poisoning |
 | **Neurological** | Migraine, Vertigo |
 | **Digestive** | Gastritis, GERD, Acid Reflux |
 | **Cardiovascular** | Hypertension |
 | **Respiratory** | Asthma, Bronchitis, Sinusitis |
 | **Musculoskeletal** | Arthritis, Back Pain |
 | **Dermatological** | Eczema |
 | **Mental Health** | Anxiety, Depression, Insomnia |
 | **Endocrine** | Diabetes Type 2 |
 | **Urological** | UTI |
 | **Immunological** | Allergic Rhinitis |
 | **Surgical** | Abdominal Hernia |
 
 ### Symptom Categories (8)
 
 **Location:** `src/data/symptoms.ts`
 
 1. **General** - Fever, Fatigue, Weight changes, Night sweats, Chills
 2. **Head & Neurological** - Headache, Migraine, Dizziness, Vision issues
 3. **Respiratory** - Cough, Shortness of breath, Sore throat, Wheezing
 4. **Digestive** - Nausea, Vomiting, Diarrhea, Abdominal pain, Bloating
 5. **Cardiovascular** - Chest pain, Palpitations, High BP, Swelling
 6. **Musculoskeletal** - Back pain, Joint pain, Muscle pain, Stiffness
 7. **Skin** - Rash, Itching, Dry skin, Bruising
 8. **Mental Health** - Anxiety, Depression, Insomnia, Mood swings
 
 ---
 
 ## Key Code Blocks
 
 ### 1. Symptom Match Algorithm
 
 ```typescript
 // supabase/functions/analyze-symptoms/index.ts
 
 function calculateMatchScore(userSymptoms: string[], diseaseSymptoms: string[]): number {
   const normalizedUser = userSymptoms.map(s => s.toLowerCase().trim());
   const normalizedDisease = diseaseSymptoms.map(s => s.toLowerCase().trim());
   
   let matchCount = 0;
   
   for (const userSymptom of normalizedUser) {
     for (const diseaseSymptom of normalizedDisease) {
       // Check for exact or partial match
       if (diseaseSymptom.includes(userSymptom) || userSymptom.includes(diseaseSymptom)) {
         matchCount++;
         break;
       }
       
       // Check for word overlap (partial matching)
       const userWords = userSymptom.split(/[\s_]+/);
       const diseaseWords = diseaseSymptom.split(/[\s_]+/);
       const hasWordOverlap = userWords.some(w => 
         w.length > 2 && diseaseWords.some(dw => dw.includes(w) || w.includes(dw))
       );
       if (hasWordOverlap) {
         matchCount += 0.5;
         break;
       }
     }
   }
   
   const matchPercentage = Math.round((matchCount / Math.max(normalizedUser.length, 1)) * 100);
   return Math.min(matchPercentage, 95); // Never exceed 95%
 }
 ```
 
 ### 2. Translation with Number Preservation
 
 ```typescript
 // supabase/functions/translate-results/index.ts
 
 const systemPrompt = `You are a medical translator. Translate the following JSON content to ${targetLang}. 
 Keep the exact same JSON structure. Only translate the text values, not the keys.
 
 CRITICAL: DO NOT translate or modify ANY of the following - keep them EXACTLY as they appear:
 - All numbers (matchPercentage, rating, age, etc.)
 - Phone numbers (keep exact format like "+966-11-123-4567")
 - Distance values (keep exact format like "2.5 km")
 - Boolean values (true/false)
 - The "available" field
 
 Return ONLY valid JSON, no other text.`;
 ```
 
 ### 3. Language Change Detection & Translation Trigger
 
 ```typescript
 // src/components/SymptomChecker/SymptomChecker.tsx
 
 const previousLanguage = useRef(i18n.language);
 
 useEffect(() => {
   // Only translate if language changed on results page
   if (previousLanguage.current !== i18n.language && 
       currentStep === 3 && 
       results && 
       !isLoading && 
       !isTranslating) {
     previousLanguage.current = i18n.language;
     translateResults(i18n.language);
   } else {
     previousLanguage.current = i18n.language;
   }
 }, [i18n.language]);
 ```
 
 ### 4. AI Provider Fallback
 
 ```typescript
 // supabase/functions/analyze-symptoms/index.ts
 
 // Try OpenAI first
 let response = await fetch("https://api.openai.com/v1/chat/completions", {
   method: "POST",
   headers: {
     Authorization: `Bearer ${OPENAI_API_KEY}`,
     "Content-Type": "application/json",
   },
   body: JSON.stringify({
     model: "gpt-4o-mini",
     messages: [...],
   }),
 });
 
 // Fallback to secondary AI if primary fails
 if (!response.ok && FALLBACK_API_KEY) {
   response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${FALLBACK_API_KEY}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       model: "google/gemini-3-flash-preview",
       messages: [...],
     }),
   });
 }
 ```
 
 ### 5. Step Validation
 
 ```typescript
 // src/components/SymptomChecker/SymptomChecker.tsx
 
 // Validation for Step 1 → Step 2
 const canProceedToStep2 = () => {
   const { name, age, gender, area } = formData.userInfo;
   return name.trim() && age && age > 0 && gender && area.trim();
 };
 
 // Validation for Step 2 → Step 3 (Analysis)
 const canProceedToStep3 = () => {
   return (
     formData.selectedSymptoms.length > 0 ||
     formData.customSymptoms.trim().length > 0
   );
 };
 ```
 
 ---
 
 ## Local Development
 
 ### Prerequisites
 
 - Node.js 18+
 - npm or bun
 
 ### Setup
 
 ```bash
 # Clone repository
 git clone <repository-url>
 cd medr
 
 # Install dependencies
 npm install
 
 # Create .env file (see Environment Variables section)
 
 # Start development server
 npm run dev
 ```
 
 ### Available Scripts
 
 | Command | Description |
 |---------|-------------|
 | `npm run dev` | Start dev server at http://localhost:5173 |
 | `npm run build` | Build for production |
 | `npm run preview` | Preview production build |
 | `npm run lint` | Run ESLint |
 
 ### Architecture Note
 
 This project uses a **hybrid development approach**:
 - Frontend runs locally via Vite
 - Edge Functions remain hosted (no local Supabase CLI needed)
 - API calls go to the hosted Supabase project
 
 ---
 
 ## Environment Variables
 
 Create a `.env` file in the project root:
 
 ```env
 # Required for Supabase connection
 VITE_SUPABASE_URL=https://your-project-id.supabase.co
 VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
 VITE_SUPABASE_PROJECT_ID=your-project-id
 ```
 
 ### Edge Function Secrets (Configured in Supabase)
 
 | Secret | Purpose |
 |--------|---------|
 | `OPENAI_API_KEY` | Primary AI provider |
 | `FALLBACK_API_KEY` | Fallback AI gateway |
 
 ---
 
 ## API Reference
 
 ### POST /functions/v1/analyze-symptoms
 
 Analyzes symptoms and returns medical recommendations.
 
 **Headers:**
 ```
 Content-Type: application/json
 Authorization: Bearer <anon-key>
 ```
 
 **Request:**
 ```json
 {
   "userInfo": {
     "name": "John Doe",
     "age": 35,
     "gender": "male",
     "area": "Riyadh, Saudi Arabia"
   },
   "symptoms": ["Headache", "Fever", "Fatigue"],
   "customSymptoms": "Sharp pain behind my eyes",
   "language": "en"
 }
 ```
 
 **Response:**
 ```json
 {
   "diseases": [
     {
       "name": "Migraine",
       "matchPercentage": 85,
       "description": "A neurological condition...",
       "severity": "medium"
     }
   ],
   "medications": [...],
   "preventions": [...],
   "hospitals": [...],
   "doctors": [...],
   "disclaimer": "This is for informational purposes only..."
 }
 ```
 
 ### POST /functions/v1/translate-results
 
 Translates existing analysis results to target language.
 
 **Request:**
 ```json
 {
   "results": { /* AnalysisResult object */ },
   "targetLanguage": "ar"
 }
 ```
 
 **Response:** Same structure as input, with text values translated.
 
 ---
 
 ## Deployment
 
 ### Production Build
 
 ```bash
 npm run build
 ```
 
 This creates a `dist/` folder with static files that can be deployed to:
 - Vercel
 - Netlify
 - AWS S3 + CloudFront
 - Any static hosting service
 
 ### Edge Functions
 
 Edge functions are automatically deployed when the Supabase project is deployed.
 
 ---
 
 ## Security Considerations
 
 1. **API Keys** - Stored as secrets, never exposed to client
 2. **Disclaimer** - Always displayed to prevent medical misuse
 3. **Match Cap** - Never shows 100% match (capped at 95%)
 4. **No PII Storage** - User data is processed but not stored
 5. **CORS** - Configured for allowed origins
 
 ---
 
 ## Future Enhancements
 
 - [ ] User authentication and history
 - [ ] Integration with real hospital APIs
 - [ ] Voice input for symptoms
 - [ ] More languages (French, Spanish, etc.)
 - [ ] PDF export of results
 - [ ] Progressive Web App (PWA) support
 
 ---
 
 © Medr - Medical Symptom Checker