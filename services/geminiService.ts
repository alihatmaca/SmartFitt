import { GoogleGenAI, Content, Part } from "@google/genai";
import { UserProfile, WorkoutLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates a response from the AI Coach.
 * It constructs a system instruction based on the user's profile and logs
 * to ensure the AI acts as an evidence-based coach aware of the user's context.
 */
export const generateCoachResponse = async (
  userMessage: string,
  userProfile: UserProfile,
  workoutLogs: WorkoutLog[],
  chatHistory: Content[]
): Promise<string> => {
  try {
    // Construct context string
    const contextString = `
      USER CONTEXT:
      Name: ${userProfile.name}
      Level: ${userProfile.level}
      Goal: ${userProfile.goal}
      
      RECENT WORKOUT LOGS:
      ${workoutLogs.map(log => `- [${log.date}] ${log.exercise}: ${log.weight}kg x ${log.reps} reps (RPE ${log.rpe || 'N/A'})`).join('\n')}
    `;

    const systemInstruction = `
      You are the "SmartFit Coach", a scientific, evidence-based fitness expert.
      Your goal is to help the user "${userProfile.name}" achieve "${userProfile.goal}".
      
      GUIDELINES:
      1. Base all answers ONLY on evidence-based science (peer-reviewed studies, biomechanics, physiology).
      2. REJECT "bro-science", myths, or unproven supplements.
      3. Be concise, motivating, but objective.
      4. Use the user's "Recent Workout Logs" to provide specific feedback if asked about progress.
      5. If the user asks about something dangerous, warn them.
      
      ${contextString}
    `;

    // We use a stateless request here for simplicity in this architecture, 
    // passing previous history if we were maintaining a full session object, 
    // but here we just append the latest message to a "chat" structure conceptually.
    // For a robust chat, we would maintain the history array.
    
    // Convert strict Content[] to the format expected by generateContent if needed,
    // or simply use the chat helper. Here we will use a fresh generation with system instruction
    // to ensure the context is always fresh.
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...chatHistory, // Previous turns
        { role: 'user', parts: [{ text: userMessage }] } // Current turn
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, I couldn't generate a response based on the scientific literature at this moment.";

  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "Connection error. Please check your network or API key.";
  }
};