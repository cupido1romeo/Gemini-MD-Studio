import { GoogleGenAI } from "@google/genai";
import { AiActionType } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize specific model for text tasks
const MODEL_NAME = 'gemini-2.5-flash';

const getSystemInstruction = (action: AiActionType): string => {
  switch (action) {
    case AiActionType.PROOFREAD:
      return "You are an expert copy editor. Correct grammar, spelling, and punctuation errors in the provided Markdown text. Preserve the original Markdown formatting exactly. Output ONLY the corrected text.";
    case AiActionType.SUMMARIZE:
      return "You are a helpful assistant. Provide a concise summary of the provided Markdown text. Output using Markdown formatting (bullet points, etc).";
    case AiActionType.CONTINUE:
      return "You are a creative writing assistant. Continue the text naturally based on the context provided. Maintain the style and tone. Use Markdown formatting where appropriate.";
    case AiActionType.FORMAT:
      return "You are a Markdown expert. Take the provided text and format it into clean, structured Markdown. Use headers, lists, code blocks, and bolding to improve readability. Do not change the core content, just the structure.";
    default:
      return "You are a helpful AI assistant.";
  }
};

export const performAiAction = async (
  text: string,
  action: AiActionType
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  if (!text.trim()) {
    throw new Error("Please enter some text first.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: getSystemInstruction(action),
        temperature: 0.7,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from AI.");
    }

    return resultText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.");
  }
};