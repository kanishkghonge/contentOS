/**
 * Content OS for Doctors — Bespoke Prompt Generation Engine
 * Compiles doctor specialty, tone, language, CTAs, and clinical notes into a precision prompt.
 */

import { scriptFormats } from './formats.js';

export function buildDoctorPrompt(profile, insight) {
  const doctorName = profile.name || 'Doctor';
  const specialty = profile.specialty || 'General Medicine & Preventative Care';
  const audience = profile.audience || 'Patients';
  const language = profile.language || 'English';
  const tone = profile.tone || 'Conversational & Empathetic';
  const cta = profile.cta === 'both' ? 'Generate BOTH versions (1. "Read caption for full breakdown" and 2. "Comment \'HEART\' to get the medical guide")' : profile.cta;
  const reelLength = profile.reelLength || '45-60s';

  // Format list instructions
  const formatsList = scriptFormats.map((f, i) => {
    return `${i + 1}. **${f.name}** (${f.category}): ${f.promptInstruction}`;
  }).join('\n');

  return `You are a medical copywriter and clinical communication strategist.
Your task is to transform a doctor's clinical insight into a high-engagement social media content pack.

=======================================================
1. DOCTOR PROFILE & COMMUNICATION PREFERENCES
=======================================================
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Target Audience: ${audience} (speak to their specific pain points, anxieties, and clinical realities)
- Primary Language / Dialect: ${language} (Write naturally as a warm, articulate clinician speaks. No dry textbook jargon.)
- Preferred Tone: ${tone}
- Reel Duration Target: ${reelLength}
- Preferred CTA: ${cta}

=======================================================
2. CORE CLINICAL INSIGHT
=======================================================
- Title / Core Idea: ${insight.title}
- Clinical Details & Supporting Notes:
${insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.'}
${insight.references ? `- Optional References / Patient Context: ${insight.references}` : ''}

=======================================================
3. REQUESTED SCRIPT FORMATS
=======================================================
Generate one script for each of the following formats based on the clinical insight:
${formatsList}

=======================================================
4. CLINICAL SCRIPTWRITING RULES
=======================================================
1. Hook must stop the scroll in the first 2 seconds (provocative question, surprising symptom, or common misconception).
2. Body must explain the "why" simply without condescension.
3. Every script must be practical and actionable.
4. Include clear cues for pacing, on-screen text, or physical demonstrations where appropriate.

=======================================================
5. OUTPUT INSTRUCTIONS (CRITICAL: JSON ONLY)
=======================================================
Respond ONLY with a valid JSON object matching the schema below.
DO NOT include markdown outside the json, no conversational preamble, no "Here is your script pack".

{
  "version": 1,
  "insight_title": "${insight.title.replace(/"/g, '\\"')}",
  "doctor_specialty": "${specialty.replace(/"/g, '\\"')}",
  "scripts": [
    {
      "format": "Talking Head",
      "title": "Clear punchy title",
      "hook": "Scroll-stopping first sentence...",
      "script": "Complete spoken script with pacing notes and body points...",
      "cta": "Read caption for full medical details.",
      "estimated_duration": "45s",
      "confidence": 9.5
    },
    {
      "format": "Patient Story",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "60s",
      "confidence": 9.2
    },
    {
      "format": "Myth vs Fact",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "45s",
      "confidence": 9.4
    },
    {
      "format": "Q&A Consultation",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "40s",
      "confidence": 9.0
    },
    {
      "format": "Whiteboard / Concept Breakdown",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "...",
      "estimated_duration": "60s",
      "confidence": 9.1
    },
    {
      "format": "Step-by-Step Carousel",
      "title": "...",
      "hook": "...",
      "script": "Slide 1: ...\\nSlide 2: ...\\nSlide 3: ...\\nSlide 4: ...\\nSlide 5: ...",
      "cta": "...",
      "estimated_duration": "Slide-deck",
      "confidence": 8.8
    }
  ]
}`;
}
