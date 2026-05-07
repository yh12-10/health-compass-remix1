/// <reference types="https://deno.land/x/deno@v1.37.0/cli/tsc/dts/lib.deno.ns.d.ts" />
// @ts-nocheck - Supabase Edge Function runs in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TranslateRequest {
  results: any;
  targetLanguage: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, targetLanguage }: TranslateRequest = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      throw new Error("No API key configured (need OPENAI_API_KEY or GEMINI_API_KEY)");
    }

    const isArabic = targetLanguage === "ar";
    const targetLang = isArabic ? "Arabic" : "English";

    const systemPrompt = `You are a professional medical translator. Your task is to translate ALL text content in the following JSON to ${targetLang}. 

RULES:
1. Keep the EXACT same JSON structure and keys - do NOT change any key names
2. Translate EVERY single text value to ${targetLang}. This includes:
   - Disease/condition names (e.g., "Bronchitis" → "التهاب القصبات الهوائية")
   - Disease descriptions (full sentences must be translated)
   - Medication names should keep their scientific names but add Arabic transliteration
   - Medication types, dosages, and notes
   - Prevention titles and descriptions
   - Hospital names and addresses
   - Doctor names (transliterate to Arabic)
   - Doctor specialties, hospital affiliations, experience text
   - The disclaimer text
   - Specialty names
3. DO NOT translate or modify ANY of the following - keep EXACTLY as-is:
   - All numbers (matchPercentage, rating, etc.)
   - Phone numbers (keep exact format)
   - Distance values (keep format like "2.5 km" but translate "km" to "كم")
   - Boolean values (true/false)
   - The "available" field value
   - JSON keys
   - The "severity" field values ("low", "medium", "high") - keep these as-is
4. Return ONLY valid JSON, no markdown, no code fences, no explanation

IMPORTANT: If any text is already in ${targetLang}, keep it as-is. If any text is NOT in ${targetLang}, you MUST translate it.`;

    const userPrompt = `Translate ALL text values in this JSON to ${targetLang}. Every single string value that contains English text must be fully translated:

${JSON.stringify(results, null, 2)}`;

    let aiResponse: any;
    let content: string | undefined;

    // Try OpenAI first (gpt-4o-mini - cheapest)
    if (OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        aiResponse = await response.json();
        content = aiResponse.choices?.[0]?.message?.content;
      } else {
        console.log("OpenAI failed, trying Gemini fallback");
      }
    }

    // Fallback to Gemini API (gemini-2.0-flash-lite - cheapest)
    if (!content && GEMINI_API_KEY) {
      console.log("Using Gemini API for translation");
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini error:", errorText);
        throw new Error("Translation service unavailable");
      }

      const geminiData = await geminiResponse.json();
      content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!content) {
      throw new Error("No translation response");
    }

    // Parse the translated JSON
    let translatedResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translatedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Failed to parse translation:", content);
      // Return original if translation fails
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Preserve metadata fields from original
    translatedResult.provider = results.provider;
    translatedResult.ragSource = results.ragSource;

    // Enforce 20% minimum on translated results too
    if (translatedResult.diseases && Array.isArray(translatedResult.diseases)) {
      translatedResult.diseases = translatedResult.diseases
        .filter((d: any) => d.matchPercentage >= 20)
        .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
    }

    return new Response(JSON.stringify(translatedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
