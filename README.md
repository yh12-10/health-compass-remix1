# Medical Symptom Checker

An AI-powered medical symptom analysis application with multilingual support (English & Arabic).

## Features

- Multi-step symptom checker wizard
- AI-powered symptom analysis
- Bilingual support (English/Arabic) with RTL
- Suggested medications, prevention tips, nearby hospitals, and doctors
- Real-time translation of results

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- i18next for internationalization
- Supabase Edge Functions for AI backend

## Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Deployment

Build the project:

```sh
npm run build
```

Deploy the `dist` folder to any static hosting service.