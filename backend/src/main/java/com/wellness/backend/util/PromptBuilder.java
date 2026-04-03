package com.wellness.backend.util;

import com.wellness.backend.dto.AiRequest;

public class PromptBuilder {

    public static String buildPrompt(AiRequest request) {
        

        StringBuilder symptomsText = new StringBuilder();

        if (request.symptoms != null && !request.symptoms.isEmpty()) {
            for (AiRequest.Symptom s : request.symptoms) {
                symptomsText.append("- ")
                        .append(s.name)
                        .append(" (")
                        .append(s.severity)
                        .append(")\n");
            }
        } else {
            symptomsText.append("No symptoms provided\n");
        }

        String durationText = (request.duration != null && !request.duration.isBlank())
                ? request.duration
                : "Not specified";

        return """
You are an AI wellness assistant for a healthcare platform.

Follow strict safety and medical guidance principles similar to OpenFDA and WHO.

USER INPUT:
Symptoms:
%s
Duration: %s

TASK:
Based on the symptoms, generate SAFE wellness recommendations.

YOU MUST PROVIDE:
1. Natural remedies (Ayurveda, home remedies)
2. Therapy suggestions (Yoga, Reiki, Massage)
3. Lifestyle advice (diet, sleep, hydration)
4. Basic OTC medicine suggestions (ONLY safe common ones)
5. Safety warning

STRICT SAFETY RULES:
- Do NOT diagnose any disease
- Do NOT suggest prescription drugs
- Do NOT suggest antibiotics
- Do NOT provide dosage or frequency
- Only suggest common OTC medicines like paracetamol, ibuprofen (if appropriate)
- Keep recommendations general and safe
- If symptoms are multiple, consider them together
- If severity is high, include stronger warning
- If duration is long, include warning to consult doctor

OUTPUT RULES:
- Return ONLY valid JSON
- No extra text before or after JSON
- Keep responses short
- Use comma-separated phrases

STRICT JSON FORMAT:
{
  "remedies": "",
  "therapy": "",
  "lifestyle": "",
  "medicine": "",
  "warning": ""
}
""".formatted(symptomsText.toString(), durationText);
    }
   
}