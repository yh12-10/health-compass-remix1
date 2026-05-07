/// <reference types="https://deno.land/x/deno@v1.37.0/cli/tsc/dts/lib.deno.ns.d.ts" />
// @ts-nocheck - Supabase Edge Function runs in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserInfo {
  name: string;
  age: number;
  gender: string;
  area: string;
}

interface AnalysisRequest {
  userInfo: UserInfo;
  symptoms: string[];
  customSymptoms: string;
  language: string;
}

// Calculate REALISTIC match score between user symptoms and disease symptoms
// Uses balanced scoring: considers BOTH how many user symptoms matched AND
// what fraction of the disease's total symptoms the user has.
function calculateMatchScore(userSymptoms: string[], diseaseSymptoms: string[]): number {
  const normalizedUser = userSymptoms.map(s => s.toLowerCase().trim().replace(/_/g, ' '));
  const normalizedDisease = diseaseSymptoms.map(s => s.toLowerCase().trim().replace(/_/g, ' '));

  let userMatchCount = 0; // how many user symptoms found in disease
  let diseaseMatchCount = 0; // how many disease symptoms matched by user
  const matchedDiseaseIndices = new Set<number>();

  for (const userSymptom of normalizedUser) {
    let bestMatch = 0;
    let bestIdx = -1;
    for (let i = 0; i < normalizedDisease.length; i++) {
      const diseaseSymptom = normalizedDisease[i];
      // Exact match
      if (diseaseSymptom === userSymptom) {
        bestMatch = 1;
        bestIdx = i;
        break;
      }
      // Substring containment
      if (diseaseSymptom.includes(userSymptom) || userSymptom.includes(diseaseSymptom)) {
        if (0.9 > bestMatch) { bestMatch = 0.9; bestIdx = i; }
        continue;
      }
      // Word-level overlap
      const userWords = userSymptom.split(/[\s_\/]+/).filter(w => w.length > 2);
      const diseaseWords = diseaseSymptom.split(/[\s_\/]+/).filter(w => w.length > 2);
      for (const uw of userWords) {
        for (const dw of diseaseWords) {
          if (dw === uw && 0.8 > bestMatch) { bestMatch = 0.8; bestIdx = i; }
          else if ((dw.includes(uw) || uw.includes(dw)) && 0.5 > bestMatch) { bestMatch = 0.5; bestIdx = i; }
        }
      }
    }
    userMatchCount += bestMatch;
    if (bestIdx >= 0 && bestMatch >= 0.5) {
      matchedDiseaseIndices.add(bestIdx);
    }
  }

  // Recall: what % of USER symptoms matched in this disease
  const recall = userMatchCount / Math.max(normalizedUser.length, 1);
  // Precision: what % of DISEASE symptoms were covered by user
  const precision = matchedDiseaseIndices.size / Math.max(normalizedDisease.length, 1);

  // Weighted F-score: recall matters more (weight 0.6) but precision prevents inflated scores
  let score: number;
  if (recall === 0 && precision === 0) {
    score = 0;
  } else {
    // Weighted harmonic mean (F-beta with beta=1.2 favoring recall slightly)
    const beta = 1.2;
    const betaSq = beta * beta;
    score = ((1 + betaSq) * precision * recall) / (betaSq * precision + recall);
  }

  return Math.min(Math.round(score * 100), 95);
}

// Fetch medical database from Supabase
async function fetchMedicalDatabase(supabaseClient: any) {
  const { data: diseases, error: diseasesError } = await supabaseClient
    .from("diseases")
    .select("*");

  if (diseasesError) {
    console.error("Error fetching diseases:", diseasesError);
    throw new Error("Failed to fetch medical database");
  }

  const { data: medicines, error: medicinesError } = await supabaseClient
    .from("medicines")
    .select("*");

  if (medicinesError) {
    console.error("Error fetching medicines:", medicinesError);
    throw new Error("Failed to fetch medicines");
  }

  const { data: providers, error: providersError } = await supabaseClient
    .from("disease_providers")
    .select("*");

  if (providersError) {
    console.error("Error fetching providers:", providersError);
    throw new Error("Failed to fetch providers");
  }

  return diseases.map((disease: any) => ({
    disease: disease.name,
    symptoms: disease.symptoms || [],
    treatments: disease.treatments || [],
    precautions: disease.precautions || [],
    advice: disease.advice || "",
    specialty: disease.specialty || "",
    medicines: medicines
      .filter((m: any) => m.disease_id === disease.id)
      .map((m: any) => ({ name: m.name, sideEffects: m.side_effects || [] })),
    doctors: providers
      .filter((p: any) => p.disease_id === disease.id && p.provider_type === "doctor")
      .map((p: any) => p.name),
    hospitals: providers
      .filter((p: any) => p.disease_id === disease.id && p.provider_type === "hospital")
      .map((p: any) => p.name),
  }));
}

// Find matching diseases from database — MINIMUM 20%
function findMatchingDiseases(symptoms: string[], medicalDatabase: any[]) {
  const matches = medicalDatabase.map(record => ({
    ...record,
    matchScore: calculateMatchScore(symptoms, record.symptoms)
  }));

  return matches
    .filter(m => m.matchScore >= 20) // STRICT: 20% minimum, no less
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8); // Top 8 matches to give AI more context
}

// Log user activity to database
async function logUserActivity(supabaseClient: any, data: any) {
  try {
    const { error } = await supabaseClient.from("user_activity").insert(data);
    if (error) {
      console.error("Activity log insert error:", JSON.stringify(error));
    } else {
      console.log("Activity logged successfully");
    }
  } catch (logError) {
    console.error("Activity log exception:", logError);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInfo, symptoms, customSymptoms, language = "en" }: AnalysisRequest = await req.json();

    // @ts-ignore - Deno runtime globals
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    // @ts-ignore - Deno runtime globals
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    // @ts-ignore - Deno runtime globals
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    // @ts-ignore - Deno runtime globals
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      throw new Error("No API key configured (need OPENAI_API_KEY or GEMINI_API_KEY)");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Create Supabase client with service role for DB access
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Combine symptoms
    const allSymptoms = [...symptoms];
    if (customSymptoms?.trim()) {
      allSymptoms.push(...customSymptoms.split(/[,،]+/).map(s => s.trim()).filter(Boolean));
    }

    console.log("User symptoms:", allSymptoms.join(", "));

    // Fetch medical database from Supabase
    let medicalDatabase: any[] = [];
    try {
      medicalDatabase = await fetchMedicalDatabase(supabaseClient);
      console.log(`Fetched ${medicalDatabase.length} diseases from database`);
    } catch (dbError) {
      console.error("Database fetch failed, AI will use its own knowledge:", dbError);
    }

    // Find matching diseases from our RAG database (minimum 20%)
    const matchingDiseases = findMatchingDiseases(allSymptoms, medicalDatabase);
    const hasRAGMatches = matchingDiseases.length > 0;

    console.log(`RAG matching: ${matchingDiseases.length} matches found (hasRAG: ${hasRAGMatches})`);
    if (hasRAGMatches) {
      console.log("Top matches:", matchingDiseases.slice(0, 3).map(d => `${d.disease}: ${d.matchScore}%`).join(", "));
    }

    // Build detailed RAG context — EXCLUDE DB hospitals/doctors (they're generic placeholders)
    // The AI will generate location-specific hospitals/doctors instead
    let ragContext = "";
    if (hasRAGMatches) {
      ragContext = matchingDiseases.map(d =>
        `DISEASE: ${d.disease}
Match Score: ${d.matchScore}%
Symptoms in DB: ${d.symptoms.join(", ")}
Treatments: ${d.treatments.join(", ")}
Precautions: ${d.precautions.join(", ")}
Advice: ${d.advice}
Medicines: ${d.medicines.map((m: any) => `${m.name} (Side effects: ${m.sideEffects.join(", ")})`).join("; ")}
Specialty: ${d.specialty}`
      ).join("\n\n===\n\n");
    }

    const isArabic = language === "ar";
    const userLocation = userInfo.area || "the patient's location";

    // Build system prompt — STRICT instructions to use DB data
    let systemPrompt: string;

    if (hasRAGMatches) {
      systemPrompt = `You are a medical AI assistant. You have access to a verified medical database. Below are the matched diseases from our database for the patient's symptoms.

=== MEDICAL DATABASE MATCHES (USE THESE — DO NOT IGNORE) ===
${ragContext}
=== END DATABASE MATCHES ===

CRITICAL RULES:
1. You MUST use the diseases from the database above as your PRIMARY source for the "diseases" array in your response.
2. The "matchPercentage" for each disease MUST be the exact "Match Score" from the database context above. DO NOT make up your own percentages. DO NOT change them.
3. Every disease in your response MUST have matchPercentage >= 20. Do NOT include any disease below 20%.
4. Use the medicines, treatments, precautions, and advice EXACTLY as provided in the database.
5. You may add 1-2 additional diseases from your own knowledge if highly relevant, but they must also have matchPercentage >= 20.

HOSPITALS & DOCTORS — LOCATION RULES (VERY IMPORTANT):
- The patient is located in "${userLocation}".
- ALL hospitals MUST be REAL hospitals that actually exist in "${userLocation}". Do NOT use hospitals from any other city or country.
- ALL doctors MUST be associated with hospitals in "${userLocation}".
- Use actual hospital names, real addresses, and real phone numbers from "${userLocation}" ONLY.
- Do NOT suggest hospitals from Doha, Alexandria, Muscat, Dubai, or any city other than "${userLocation}".
- If you don't know real hospitals in "${userLocation}", create realistic-sounding ones with the city name.

Respond with valid JSON ONLY (no markdown, no explanation) in ${isArabic ? "Arabic" : "English"}:
{
  "diseases": [{ "name": "Disease Name", "matchPercentage": 45, "description": "Brief description of the condition", "severity": "low|medium|high" }],
  "medications": [{ "name": "Medicine Name", "type": "Type (e.g., Analgesic)", "dosage": "Recommended dosage", "notes": "Important notes or side effects" }],
  "preventions": [{ "title": "Prevention Tip", "description": "Detailed prevention advice" }],
  "hospitals": [{ "name": "Real Hospital in ${userLocation}", "address": "Real address in ${userLocation}", "rating": 4.5, "distance": "2.5 km", "phone": "+962-XXX", "specialties": ["Relevant specialty"] }],
  "doctors": [{ "name": "Dr. Name", "specialty": "Specialty", "hospital": "Hospital in ${userLocation}", "rating": 4.8, "experience": "15 years", "available": true }],
  "disclaimer": "${isArabic ? "هذا ليس تشخيصًا طبيًا. يرجى استشارة طبيب للتشخيص والعلاج الدقيق." : "This is not a medical diagnosis. Please consult a healthcare professional for accurate diagnosis and treatment."}"
}`;
    } else {
      systemPrompt = `You are a medical AI assistant. Our medical database had NO matches for the patient's symptoms (all scored below 20%). Use your own medical knowledge to analyze the symptoms.

RULES:
1. Analyze the symptoms using your medical expertise.
2. Every disease you suggest MUST have matchPercentage >= 20. Do NOT include any disease below 20%.
3. Be realistic with match percentages based on how well symptoms align.
4. Provide practical medications, prevention tips, and specialist recommendations.

HOSPITALS & DOCTORS — LOCATION RULES (VERY IMPORTANT):
- The patient is located in "${userLocation}".
- ALL hospitals MUST be REAL hospitals that actually exist in "${userLocation}". Do NOT use hospitals from any other city or country.
- ALL doctors MUST be associated with hospitals in "${userLocation}".
- Use actual hospital names, real addresses, and real phone numbers from "${userLocation}" ONLY.
- Do NOT suggest hospitals from Doha, Alexandria, Muscat, Dubai, or any city other than "${userLocation}".

Respond with valid JSON ONLY (no markdown, no explanation) in ${isArabic ? "Arabic" : "English"}:
{
  "diseases": [{ "name": "Disease Name", "matchPercentage": 55, "description": "Brief description", "severity": "low|medium|high" }],
  "medications": [{ "name": "Medicine Name", "type": "Type", "dosage": "Dosage", "notes": "Notes" }],
  "preventions": [{ "title": "Prevention Tip", "description": "How to prevent" }],
  "hospitals": [{ "name": "Real Hospital in ${userLocation}", "address": "Real address in ${userLocation}", "rating": 4.5, "distance": "2.5 km", "phone": "+962-XXX", "specialties": ["Specialty"] }],
  "doctors": [{ "name": "Dr. Name", "specialty": "Specialty", "hospital": "Hospital in ${userLocation}", "rating": 4.8, "experience": "15 years", "available": true }],
  "disclaimer": "${isArabic ? "هذا ليس تشخيصًا طبيًا. يرجى استشارة طبيب للتشخيص والعلاج الدقيق." : "This is not a medical diagnosis. Please consult a healthcare professional for accurate diagnosis and treatment."}"
}`;
    }

    const userPrompt = isArabic
      ? `معلومات المريض:
- الاسم: ${userInfo.name}
- العمر: ${userInfo.age} سنة
- الجنس: ${userInfo.gender === "male" ? "ذكر" : userInfo.gender === "female" ? "أنثى" : "آخر"}
- المنطقة/المدينة: ${userInfo.area}

الأعراض: ${allSymptoms.join("، ")}

قم بتحليل هذه الأعراض وتقديم نتائج دقيقة من قاعدة البيانات الطبية.`
      : `Patient Information:
- Name: ${userInfo.name}
- Age: ${userInfo.age} years old
- Gender: ${userInfo.gender}
- Location: ${userInfo.area}

Symptoms: ${allSymptoms.join(", ")}

Analyze these symptoms and provide accurate results from the medical database.`;

    let content: string | undefined;
    let provider: string = "";

    // Try Gemini FIRST
    if (GEMINI_API_KEY) {
      console.log("Trying Gemini API...");
      try {
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
                temperature: 0.3, // Lower temperature for more consistent DB-faithful output
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          provider = "gemini-2.5-flash";
          console.log("Gemini API succeeded");
        } else {
          const errorText = await geminiResponse.text();
          console.error("Gemini API error:", geminiResponse.status, errorText);
        }
      } catch (e) {
        console.error("Gemini API exception:", e);
      }
    }

    // Fallback to OpenAI
    if (!content && OPENAI_API_KEY) {
      console.log("Falling back to OpenAI API...");
      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

        if (openaiResponse.ok) {
          const aiResponse = await openaiResponse.json();
          content = aiResponse.choices?.[0]?.message?.content;
          provider = "gpt-4o-mini";
          console.log("OpenAI API succeeded");
        } else {
          const errorText = await openaiResponse.text();
          console.error("OpenAI API error:", openaiResponse.status, errorText);
        }
      } catch (e) {
        console.error("OpenAI API exception:", e);
      }
    }

    // If both failed
    if (!content) {
      // Still log the failed attempt
      await logUserActivity(supabaseClient, {
        user_name: userInfo.name,
        user_age: userInfo.age,
        user_gender: userInfo.gender,
        user_area: userInfo.area,
        selected_symptoms: allSymptoms,
        custom_symptoms: customSymptoms || null,
        matched_diseases: [],
        top_match_score: 0,
        rag_source: "error",
        ai_provider: "none",
        language: language,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
        user_agent: req.headers.get("user-agent") || null,
      });

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Remove markdown code fences if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // POST-PROCESSING: Enforce minimum 20% match on ALL diseases in output
    if (analysisResult.diseases && Array.isArray(analysisResult.diseases)) {
      analysisResult.diseases = analysisResult.diseases
        .filter((d: any) => d.matchPercentage >= 20)
        .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

      // If AI returned nothing above 20%, generate from our RAG data directly
      if (analysisResult.diseases.length === 0 && hasRAGMatches) {
        analysisResult.diseases = matchingDiseases.slice(0, 5).map(d => ({
          name: d.disease,
          matchPercentage: d.matchScore,
          description: d.advice || `Possible condition based on symptoms: ${d.symptoms.slice(0, 3).join(", ")}`,
          severity: d.matchScore >= 70 ? "high" : d.matchScore >= 40 ? "medium" : "low",
        }));
      }
    }

    // Add metadata
    analysisResult.provider = provider;
    analysisResult.ragSource = hasRAGMatches ? "database" : "ai-knowledge";

    // Log user activity — ALWAYS logs on every output
    const matchedDiseaseNames = hasRAGMatches
      ? matchingDiseases.map(d => d.disease)
      : (analysisResult.diseases || []).map((d: any) => d.name);
    const topScore = hasRAGMatches
      ? matchingDiseases[0]?.matchScore || 0
      : (analysisResult.diseases?.[0]?.matchPercentage || 0);

    await logUserActivity(supabaseClient, {
      user_name: userInfo.name,
      user_age: userInfo.age,
      user_gender: userInfo.gender,
      user_area: userInfo.area,
      selected_symptoms: allSymptoms,
      custom_symptoms: customSymptoms || null,
      matched_diseases: matchedDiseaseNames,
      top_match_score: topScore,
      rag_source: hasRAGMatches ? "database" : "ai-knowledge",
      ai_provider: provider,
      language: language,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      user_agent: req.headers.get("user-agent") || null,
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-symptoms:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
