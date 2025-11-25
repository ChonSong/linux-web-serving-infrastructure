import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScenarioResult, ScenarioJudgment } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDisputeAndGenerateGame = async (
  p1Name: string,
  p1Statement: string,
  p2Name: string,
  p2Statement: string
): Promise<AnalysisResult> => {
  const ai = getClient();

  const prompt = `
    You are an expert, empathetic, and slightly humorous couples counsellor AI.
    
    Two partners, ${p1Name} and ${p2Name}, have a dispute.
    
    ${p1Name}'s perspective: "${p1Statement}"
    ${p2Name}'s perspective: "${p2Statement}"

    Your goal is to:
    1. Analyze the core conflict non-judgmentally.
    2. Reframe each person's point so the other can understand the underlying emotion (e.g., "She isn't mad about the trash, she feels unheard").
    3. Generate 3 multiple-choice quiz questions. These questions are the "game".
       - The questions should test EMPATHY.
       - Example: Ask ${p1Name} what ${p2Name} is *really* feeling.
       - Make the options tricky but the correct one should be the most empathetic/insightful one.
    4. Provide a final "Verdict" that awards points for effort/intent rather than declaring a winner, and a compatibility score based on their communication styles in this instance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A witty 1-sentence summary of the fight." },
            p1Perspective: { type: Type.STRING, description: `A compassionate translation of ${p1Name}'s feelings.` },
            p2Perspective: { type: Type.STRING, description: `A compassionate translation of ${p2Name}'s feelings.` },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetPlayer: { type: Type.STRING, enum: ["p1", "p2"], description: "Who should answer this question." },
                  aboutPlayer: { type: Type.STRING, enum: ["p1", "p2"], description: "Who the question is about." },
                  question: { type: Type.STRING, description: "The question text." },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 possible answers." },
                  correctIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)." },
                  reasoning: { type: Type.STRING, description: "Why this is the correct answer." },
                },
                required: ["targetPlayer", "aboutPlayer", "question", "options", "correctIndex", "reasoning"],
              },
            },
            verdict: { type: Type.STRING, description: "A paragraph of advice and closing thoughts." },
            compatibilityScore: { type: Type.INTEGER, description: "A score from 0-100 based on how solvable this is." },
            funTip: { type: Type.STRING, description: "A fun, quick actionable tip." },
          },
          required: ["summary", "p1Perspective", "p2Perspective", "questions", "verdict", "compatibilityScore", "funTip"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Communication breakdown detected.",
      p1Perspective: "They feel unheard.",
      p2Perspective: "They feel unappreciated.",
      questions: [],
      verdict: "Talk it out!",
      compatibilityScore: 50,
      funTip: "Hug it out."
    };
  }
};

export const generateVibeCheckScenario = async (): Promise<ScenarioResult> => {
  const ai = getClient();
  const prompt = "Generate a wild, funny, or intense hypothetical scenario for a couple to face together. It could be a zombie apocalypse, winning the lottery, getting lost in a jungle, or a cooking disaster. Keep it short and engaging. Also provide a prompt to generate an image for this scenario.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING, description: "The scenario text." },
          imagePrompt: { type: Type.STRING, description: "A descriptive prompt for an image generator." },
        },
        required: ["scenario", "imagePrompt"],
      },
    },
  });
  
  if (!response.text) throw new Error("No response");
  return JSON.parse(response.text) as ScenarioResult;
};

export const generateScenarioImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (e) {
    console.error("Image gen failed", e);
    // Fallback placeholder if image gen fails (though we shouldn't hit this often)
    return "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
};

export const judgeVibeCheck = async (
  scenario: string,
  p1Name: string,
  p1Action: string,
  p2Name: string,
  p2Action: string
): Promise<ScenarioJudgment> => {
  const ai = getClient();
  const prompt = `
    Scenario: ${scenario}
    
    ${p1Name}'s Action: ${p1Action}
    ${p2Name}'s Action: ${p2Action}
    
    Judge who survived better, who was funnier, or who was more practical. Rate their compatibility based on these actions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING, description: "The name of the winner or 'Tie'." },
          compatibility: { type: Type.INTEGER, description: "0-100 score." },
          analysis: { type: Type.STRING, description: "Humorous analysis of their actions." },
          funnyComment: { type: Type.STRING, description: "A witty closing remark." },
        },
        required: ["winner", "compatibility", "analysis", "funnyComment"],
      },
    },
  });

  if (!response.text) throw new Error("No response");
  return JSON.parse(response.text) as ScenarioJudgment;
};
