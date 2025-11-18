import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory } from "../types";

const getAI = () => {
    if (!process.env.API_KEY) {
        console.warn("API Key not found in environment variables.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const MODEL_NAME = 'gemini-2.5-flash';

// Schema for structured output
const expenseSchema = {
    type: Type.OBJECT,
    properties: {
        amount: { type: Type.NUMBER, description: "The total numerical amount of the expense." },
        category: { 
            type: Type.STRING, 
            description: `The best fitting category from the following list: ${Object.values(ExpenseCategory).join(', ')}. If unsure, use 'Other'.`,
            enum: Object.values(ExpenseCategory)
        },
        date: { type: Type.STRING, description: "The date of the expense in YYYY-MM-DD format. Use today's date if not specified." },
        description: { type: Type.STRING, description: "A brief description of the expense (e.g., 'Lunch at Subway', 'Uber ride')." },
    },
    required: ["amount", "category", "description"],
};

/**
 * Parses natural language text to extract expense details.
 */
export const parseExpenseFromText = async (text: string) => {
    const ai = getAI();
    const today = new Date().toISOString().split('T')[0];
    
    const prompt = `
    Analyze the following text and extract expense details. 
    Today's date is ${today}. 
    Text: "${text}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseSchema,
                temperature: 0.1, // Low temperature for deterministic extraction
            },
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Text Parsing Error:", error);
        throw error;
    }
};

/**
 * Parses an image (receipt) to extract expense details.
 */
export const parseExpenseFromImage = async (base64Image: string, mimeType: string) => {
    const ai = getAI();
    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    },
                    {
                        text: `Analyze this receipt image. Extract the total amount, the merchant name as the description, the date (default to ${today} if not visible), and categorize it.`,
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseSchema,
            },
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Image Parsing Error:", error);
        throw error;
    }
};
