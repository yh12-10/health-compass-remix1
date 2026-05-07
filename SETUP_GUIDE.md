# 🏥 Health Compass - Setup Guide

A complete step-by-step guide to run this medical symptom analyzer app on your computer.

---

## 📋 Prerequisites (Install These First)

### 1. Install Node.js

Node.js is required to run this app.

1. Go to **[https://nodejs.org](https://nodejs.org)**
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts (click "Next" for everything)
4. Restart your computer after installation

**To verify it's installed:**
- Open **Command Prompt** (search "cmd" in Windows)
- Type: `node --version`
- You should see something like `v20.x.x`

---

### 2. Install Git (Optional but Recommended)

If you received this project as a `.zip` file, you can skip this step.

1. Go to **[https://git-scm.com/downloads](https://git-scm.com/downloads)**
2. Download and install for Windows
3. Use all default options during installation

---

## 🚀 Running the App

### Step 1: Open the Project Folder

1. Extract the project if it's in a `.zip` file
2. Open the folder in **File Explorer**
3. Click on the address bar, type `cmd`, and press **Enter**
   - This opens Command Prompt in the project folder

### Step 2: Install Dependencies

In the Command Prompt window, type:

```bash
npm install
```

Wait for it to finish (may take 1-2 minutes). You'll see a progress bar.

### Step 3: Set Up Environment Variables

1. Find the file called `.env.example` in the project folder
2. **Copy** it and rename the copy to `.env`
3. The `.env` file should contain:

```
VITE_SUPABASE_PROJECT_ID="xomxxhioyfqolztqdlcd"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbXh4aGlveWZxb2x6dHFkbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzM0NjMsImV4cCI6MjA4NTg0OTQ2M30.kp6NWcOSEVTYJdf9-d-40EXrsXMLrrkWnFsXQ3GivTM"
VITE_SUPABASE_URL="https://xomxxhioyfqolztqdlcd.supabase.co"
```

> **Note:** The `.env` file is already configured. Just make sure it exists!

### Step 4: Start the App

In Command Prompt, type:

```bash
npm run dev
```

You should see:

```
VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://xxx.xxx.xxx.xxx:8080/
```

### Step 5: Open in Browser

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:8080**
3. The app should load! 🎉

---

## 🛑 How to Stop the App

In the Command Prompt where it's running:
- Press **Ctrl + C**
- Type **Y** and press **Enter** if prompted

---

## ❓ Troubleshooting

### "npm is not recognized"

Node.js is not installed properly. Reinstall Node.js and restart your computer.

### "Port 8080 is already in use"

Another app is using that port. Close other terminals or restart your computer.

### App loads but shows errors

Make sure the `.env` file exists and has the correct values (copy from `.env.example`).

### "Cannot connect to Supabase"

Check your internet connection. The app needs internet to work.

---

## 📱 Accessing from Phone

While the app is running, you can access it from your phone:

1. Find your computer's IP address:
   - Look at the `Network` line when you run `npm run dev`
   - Example: `http://192.168.1.100:8080`
2. Make sure your phone is on the same WiFi network
3. Open that address in your phone's browser

---

## 🔧 For Developers

### Project Structure

```
health-compass/
├── src/                # React source code
├── supabase/           # Edge Functions
│   └── functions/
│       ├── analyze-symptoms/    # Main AI analysis
│       └── translate-results/   # Translation
├── .env                # Environment variables
└── package.json        # Dependencies
```

### Edge Functions (Supabase)

The AI features run on Supabase Edge Functions. To deploy changes:

```bash
npx supabase login
npx supabase functions deploy analyze-symptoms --project-ref xomxxhioyfqolztqdlcd
npx supabase functions deploy translate-results --project-ref xomxxhioyfqolztqdlcd
```

### API Keys Used (Already Configured)

- **Gemini AI** (primary) - gemini-2.5-flash
- **OpenAI** (fallback) - gpt-4o-mini
- **Supabase** - Database and hosting

---

## 📞 Support

If you have issues, contact the project owner.

---

**Made with ❤️ using React, Vite, and Supabase**
