
import { GoogleGenAI, Type } from "@google/genai";
import { ShadowAnalysis, Ticket, Outcome } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductContext = async (
  meetingNotes: string,
  backlogCsv: string,
  commitsCsv: string,
  teamContext: string
): Promise<ShadowAnalysis> => {
  const model = "gemini-3-pro-preview"; // Using Pro for deep synthesis
  
  const prompt = `
    You are ShadowPM, an expert Agentic Product Manager. 
    Your goal is to bridge the gap between spoken meeting context and a structured engineering backlog.
    
    TEAM & PRODUCT CONTEXT:
    ${teamContext}

    EXISTING BACKLOG (REFERENCE):
    ${backlogCsv}

    RECENT ENGINEERING ACTIVITY (COMMITS):
    ${commitsCsv}

    NEW MEETING TRANSCRIPT/NOTES:
    ${meetingNotes}

    INSTRUCTIONS:
    1. EXTRACT STRUCTURED OUTCOMES: Identify clear decisions, risks, or priorities.
    2. GENERATE SYNC-READY TICKETS: Create 3-6 high-quality backlog items based on the notes.
       - Each ticket must be detailed enough for an engineer to start work.
       - Include Acceptance Criteria (AC) that are testable.
       - Map work to specific platforms (Shortcut/Linear/Jira/Github) based on content.
       - Provide a source citation (e.g., "Ref: Conversation between Dev A and PM B").
    3. RECONCILE: If an item mentioned in the meeting is already in the backlog or appears completed in the commits, mention that in the description.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          outcomes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['decision', 'priority', 'risk', 'question'] },
                content: { type: Type.STRING },
                context: { type: Type.STRING }
              },
              required: ['id', 'type', 'content', 'context']
            }
          },
          suggestedTickets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                acceptanceCriteria: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                type: { type: Type.STRING, enum: ['feature', 'bug', 'task'] },
                source: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ['id', 'title', 'description', 'acceptanceCriteria', 'priority', 'type', 'source']
            }
          }
        },
        required: ['outcomes', 'suggestedTickets']
      }
    }
  });

  try {
    const analysis: ShadowAnalysis = JSON.parse(response.text || '{}');
    return analysis;
  } catch (e) {
    console.error("JSON Parsing failed", response.text);
    throw new Error("Failed to parse AI response.");
  }
};

export const refineItemWithAI = async (
  item: Ticket | Outcome,
  instruction: string
): Promise<Ticket | Outcome> => {
  const model = "gemini-3-flash-preview";
  const isTicket = 'title' in item;
  
  const prompt = `
    Refine the following ${isTicket ? 'Product Ticket' : 'Meeting Outcome'} based on the user instruction.
    Maintain high quality, professionalism, and engineering detail.
    
    ITEM:
    ${JSON.stringify(item)}
    
    INSTRUCTION:
    ${instruction}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      // Reuse schema logic but simplified for a single item
      responseSchema: isTicket ? {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
          priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          type: { type: Type.STRING, enum: ['feature', 'bug', 'task'] },
          source: { type: Type.STRING },
          status: { type: Type.STRING }
        }
      } : {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['decision', 'priority', 'risk', 'question'] },
          content: { type: Type.STRING },
          context: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
