const Anthropic = require("anthropic");
require("dotenv").config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// strong action words claude will prefer when rewriting
const POWER_WORDS = [
  "architected", "engineered", "automated", "optimized", "deployed",
  "scaled", "refactored", "implemented", "designed", "developed",
  "integrated", "migrated", "built", "launched", "delivered",
  "reduced", "improved", "increased", "streamlined", "led",
  "collaborated", "mentored", "owned", "shipped", "debugged",
];

// weak words claude will replace
const WEAK_WORDS = [
  "helped", "worked on", "assisted", "did", "made",
  "was responsible for", "tried", "attempted", "participated in",
];

async function tailorResume(jobDescription, baseResume) {
  const atsResult = await scoreATS(jobDescription, baseResume);

  // if already matching 80% or more, send it as is
  if (atsResult.score >= 80) {
    return {
      resume: baseResume,
      changed: false,
      atsScore: atsResult.score,
      message: "Resume already matches well, no changes needed",
    };
  }

  // below 80% so we only touch objective and project technical words
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are helping tailor a resume for a job application.

Rules — follow these exactly:
- ONLY change the objective/summary section and project descriptions
- ONLY swap or add technical keywords that genuinely match the job
- Do not touch work experience bullet points at all
- Do not add any skills or tools the person has not already listed
- Do not change name, contact info, education, or job titles
- Keep the exact same writing style and voice
- Do not make it sound AI written

Word rules:
- Prefer these strong action words: ${POWER_WORDS.join(", ")}
- Replace any of these weak words you find: ${WEAK_WORDS.join(", ")}
- Missing keywords to fit in naturally: ${atsResult.missing_keywords.join(", ")}

Formatting rules for the resume text:
- Font to use when rendering: Calibri for body, same font bold for headings
- Never use decorative or narrow fonts
- Keep font size hints: headings 12pt, body 10pt, nothing smaller

Job Description:
${jobDescription}

Base Resume:
${baseResume}

Return only the updated resume text, nothing else.`,
      },
    ],
  });

  return {
    resume: response.content[0].text,
    changed: true,
    atsScore: atsResult.score,
    message: "Updated objective and project sections only",
  };
}

async function tailorCoverLetter(jobDescription, baseCoverLetter) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are helping tailor a cover letter for a job application.

Rules:
- Keep the person's exact voice, do not make it sound AI written
- Do not invent experience they don't have
- Match the tone of the job description
- Keep it under 300 words
- Sound like a human wrote it naturally
- Use strong action words like: ${POWER_WORDS.slice(0, 10).join(", ")}
- Avoid weak words like: ${WEAK_WORDS.join(", ")}

Job Description:
${jobDescription}

Base Cover Letter:
${baseCoverLetter}

Return only the tailored cover letter, nothing else.`,
      },
    ],
  });

  return response.content[0].text;
}

async function scoreATS(jobDescription, resume) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Score this resume against the job description for ATS compatibility.

Return a JSON object like this:
{
  "score": 85,
  "missing_keywords": ["keyword1", "keyword2"],
  "matching_keywords": ["keyword3", "keyword4"],
  "suggestion": "one line suggestion"
}

Job Description:
${jobDescription}

Resume:
${resume}

Return only the JSON, nothing else.`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}

module.exports = { tailorResume, tailorCoverLetter, scoreATS };