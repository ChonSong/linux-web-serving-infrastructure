import { GoogleGenAI } from "@google/genai";
import { PROJECTS } from "../constants";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key is available
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const PROJECT_CONTEXT = PROJECTS.map(p => 
  `- ${p.title}: ${p.description} (Stack: ${p.techStack.join(', ')})`
).join('\n');

const SYSTEM_INSTRUCTION = `
You are an intelligent portfolio assistant for a Senior Frontend Engineer.
Your goal is to answer questions about the developer's projects based on the following list:

${PROJECT_CONTEXT}

Guidelines:
1. Keep answers concise, professional, and friendly.
2. If a user asks about skills, infer them from the tech stacks listed.
3. Do not make up projects not on the list.
4. If you don't know, suggest they email the developer.
5. Format your response in plain text or simple markdown.
`;

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!ai) {
    return "Demo mode: API Key is missing. Please configure process.env.API_KEY to chat with the AI.";
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};
