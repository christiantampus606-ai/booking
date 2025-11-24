import { GoogleGenAI, Type } from "@google/genai";
import { CampaignData, GeneratedResponse, AdFormat, CopywritingFramework, UrlAnalysisResponse } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeProductUrl = async (url: string): Promise<UrlAnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptText = `
    I need you to analyze the following Product/Landing Page URL: ${url}
    
    Using the Google Search tool, visit the page and extract the following strategic information:
    1. **Summary**: A brief 1-sentence summary of what the product/service is.
    2. **Key Benefits**: Extract 3-5 distinct, benefit-driven selling points (focus on value to user, not just features).
    3. **Target Audience**: Infer the primary target audience based on the language and pricing.
    4. **Brand Tone**: Describe the existing brand voice (e.g., Professional, Playful, Luxury).
    5. **Visual Style**: Describe the visual aesthetic of the brand.

    Output the result as a valid JSON object with the following structure:
    {
      "summary": "string",
      "keyBenefits": ["string", "string", "string"],
      "audience": "string",
      "tone": "string",
      "visualStyle": "string"
    }
  `;

  const config: any = {
    tools: [{ googleSearch: {} }],
    systemInstruction: "You are a strategic marketing analyst. Always output valid JSON.",
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: promptText }] },
      config: config,
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean up potential markdown code blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as UrlAnalysisResponse;
  } catch (error) {
    console.error("Gemini URL Analysis Error:", error);
    throw error;
  }
};

export const generateAdCreatives = async (
  data: CampaignData
): Promise<GeneratedResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Determine framework instruction
  let frameworkInstruction = "";
  if (data.framework === CopywritingFramework.AI_RECOMMENDED) {
    frameworkInstruction = "Analyze the campaign goal, audience, and platform to select the most effective copywriting framework (e.g., AIDA, PAS, BAB, FAB) for each variation. Explicitly state which framework you chose.";
  } else {
    frameworkInstruction = `Strictly apply the ${data.framework} copywriting framework for all variations.`;
  }

  // Construct the prompt
  let promptText = `
    You are a world-class Creative Director and Copywriter known for creating punchy, snappy, and high-converting ad campaigns. 
    Generate 3 distinct ad creative concepts based on the following campaign details.
    
    **CRITICAL REQUEST**: For EACH concept, you must generate **5 different Headline/Hook variations** and **2-3 distinct Call to Action (CTA) options**.

    - **Campaign Goal**: ${data.goal}
    - **Target Audience**: ${data.audience}
    - **Platform**: ${data.platform}
    - **Format**: ${data.format}
    - **Aspect Ratio**: ${data.aspectRatio}
    - **Tone**: ${data.tone}
    - **Key Benefits**: ${data.keyBenefits}
    - **Product URL**: ${data.productUrl || "Not provided"}
    - **Copywriting Framework**: ${frameworkInstruction}
    
    **CRITICAL STYLE GUIDE:**
    - The final output must be **PUNCHY and SNAPPY**.
    - Get straight to the point. Avoid fluff and long-winded sentences.
    - Use short, declarative sentences.
    - Aim for a high information-to-word ratio.
    - Use strong verbs and energetic language.
    - **HEADLINES/HOOKS**: Must be scroll-stopping. Provide 5 distinct angles per ad concept.
    - Keep body copy concise and potent.
  `;

  if (data.format === AdFormat.Image) {
    promptText += `
    \n\n🔴 **STRICT LENGTH CONSTRAINTS FOR IMAGE ADS (NON-NEGOTIABLE)** 🔴
    Since the format is 'Image', you must strictly follow these limits:
    1. **HEADLINES/HOOKS**: MAXIMUM 5 WORDS per headline. No exceptions. Keep them short, visual, and punchy.
    2. **PRIMARY TEXT (Body Copy)**: EXACTLY ONE SENTENCE. Do not write a paragraph. Do not use multiple sentences. Just one strong, benefit-driven sentence.
    `;
  }

  promptText += `
    **NEGATIVE CONSTRAINTS (STRICTLY FORBIDDEN WORDS):**
    Do NOT use the following words in any part of the copy (Headlines or Body). Find specific, fresher, and more impactful alternatives:
    - Revitalize
    - Elevate
    - Discover
    - Unlock
    - Upgrade
    - Unleash
    - Transform
    - Game-changer
    - Revolutionary
    - Synergy
    - Disrupt
    - Unprecedented
    - Groundbreaking
    - Best-in-class
    - State-of-the-art
    - Cutting-edge
    - Next-level
    - Dive deep
    - Journey
  `;

  if (data.productUrl) {
    promptText += `\n\n**INSTRUCTION:** I have provided a Product URL. Use the Google Search tool to access and analyze this specific URL. Extract features, offers, and the visual style from the website and incorporate these insights into the generated ads.`;
  }

  if (data.inspirationImageBase64) {
    promptText += `\n\nI have provided an inspiration image. Analyze its style, mood, and structure, and incorporate similar elements into the visual descriptions of the generated ads while maintaining the brand's unique identity.`;
  }

  promptText += `
    \n\n
    **OUTPUT FORMAT INSTRUCTION:**
    You MUST return the result as a valid JSON object matching the structure below. Do not output markdown formatting (like \`\`\`json). just the raw JSON string.
    
    Structure:
    {
      "variations": [
        {
          "headlines": ["string", "string", "string", "string", "string"],
          "bodyCopy": "string",
          "ctas": ["string", "string", "string"],
          "visualDescription": "string",
          "toneUsed": "string",
          "frameworkUsed": "string",
          "rationale": "string"
        }
      ]
    }

    For each of the 3 variations, provide:
    1. **headlines**: An array of EXACTLY 5 distinct, punchy headline/hook options.
    2. Compelling body copy (focus on the Key Benefits provided: ${data.keyBenefits}).
    3. **ctas**: An array of 2-3 distinct, strong, direct Call to Action (CTA) options.
    4. A detailed visual description. 
    5. The specific tone used.
    6. The specific Copywriting Framework used.
    7. A brief rationale.
  `;

  // Add a final reminder for constraints to ensure high adherence
  if (data.format === AdFormat.Image) {
    promptText += `\n\nREMINDER: For this Image ad, ensure HEADLINES are ≤ 5 WORDS and BODY COPY is EXACTLY 1 SENTENCE.`;
  }

  const parts: any[] = [{ text: promptText }];

  if (data.inspirationImageBase64) {
    // Remove header if present (e.g., "data:image/png;base64,")
    const base64Data = data.inspirationImageBase64.split(",")[1];
    parts.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG or JPEG, broadly compatible
        data: base64Data,
      },
    });
  }

  // Config options
  const config: any = {
    // NOTE: responseSchema and responseMimeType cannot be used simultaneously with tools like googleSearch.
    // We will parse the text manually.
    systemInstruction: "You are an expert ad creative generator. Always output valid JSON.",
  };

  // Add Google Search tool if URL is provided
  if (data.productUrl) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: config,
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean up potential markdown code blocks if the model adds them despite instructions
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as GeneratedResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};