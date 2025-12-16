import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image'; // Nano Banana

// Helper to convert File to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    if (file.size === 0) {
      reject(new Error("File is empty"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Handle cases where readAsDataURL fails or returns empty
      if (!result || !result.includes(',')) {
        reject(new Error("Failed to read file data"));
        return;
      }
      
      const base64String = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type || 'image/png', // Fallback MIME type
        },
      });
    };
    reader.onerror = (e) => reject(new Error("File reading failed: " + e.target?.error));
    reader.readAsDataURL(file);
  });
};

export const generateFabricOverlay = async (
  modelImage: File,
  patternImage: File,
  settings: GenerationSettings
): Promise<{ imageUrl: string | null; text: string | null }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Prepare images
    const modelPart = await fileToPart(modelImage);
    const patternPart = await fileToPart(patternImage);

    // Construct a precise prompt based on settings
    const materialInstruction = settings.fabricType !== 'original' 
      ? `MATERIAL SIMULATION: Simulate the physical properties of ${settings.fabricType}. Ensure the light reflection, drape, and texture micro-details match real ${settings.fabricType} fabric.`
      : `MATERIAL: Maintain the original fabric weight and texture feel, but apply the new pattern.`;

    const scaleInstruction = settings.scale !== 'original'
      ? `PATTERN SCALE: The pattern from Image 2 must be tiled at a ${settings.scale} scale. Adjust the repeat size to look realistic for a ${settings.scale} print.`
      : `PATTERN SCALE: Use the pattern scale exactly as it appears in the swatch relative to the garment.`;

    const targetInstruction = settings.targetArea !== 'whole outfit'
      ? `TARGETING: Apply the new fabric ONLY to the ${settings.targetArea} of the model. Keep all other garments and accessories unchanged.`
      : `TARGETING: Apply the new fabric to the primary outfit worn by the model.`;

    const prompt = `
      You are an expert fashion AI specialized in virtual try-on and textile rendering for garment manufacturing.
      
      Input:
      - Image 1: Reference photo of a model.
      - Image 2: A swatch of fabric design/pattern.
      
      Task:
      Generate a photorealistic image of the model from Image 1, replacing the material of the target garment with the EXACT fabric design from Image 2.
      
      Configuration:
      1. ${targetInstruction}
      2. ${materialInstruction}
      3. ${scaleInstruction}
      ${settings.customPrompt ? `4. CUSTOM NOTES: ${settings.customPrompt}` : ''}
      
      Critical Instructions:
      1. TEXTURE FIDELITY: The fabric pattern, color, and texture from Image 2 must be applied accurately. Do not alter the design motifs or colors of the pattern.
      2. GEOMETRIC CONSISTENCY: Map the pattern from Image 2 onto the 3D surface of the clothing in Image 1. It must follow the existing folds, wrinkles, and body curvature perfectly.
      3. PHOTOREALISM: Preserve the original lighting, shadows, and shading from Image 1 to ensure the new fabric looks physically real.
      4. PRESERVATION: Do not change the model's face, hair, pose, background, or skin tone. Only the clothing fabric changes.
      
      Return ONLY the generated image.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: prompt },
          modelPart,
          patternPart
        ]
      }
    });

    let generatedImageUrl: string | null = null;
    let generatedText: string | null = null;

    // Parse response for image and text
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } else if (part.text) {
            generatedText = part.text;
          }
        }
      }
    }

    return { imageUrl: generatedImageUrl, text: generatedText };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Re-throw or format error for UI
    if (error instanceof Error) {
        throw new Error(`Generation failed: ${error.message}`);
    }
    throw error;
  }
};