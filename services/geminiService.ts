
import { ExoplanetData, ClassificationResult } from '../types';
// Fix: Import GoogleGenAI from the correct package
import { GoogleGenAI } from "@google/genai";

// Fix: Replaced mock function with a real Gemini API call.
export const classifyExoplanet = async (data: ExoplanetData, lightCurveImageBase64: string): Promise<ClassificationResult> => {
  console.log("Classifying with Gemini using multimodal image analysis for:", data);

  const prompt = `
    You are an advanced AI model with capabilities similar to a Convolutional Neural Network (CNN), specialized in astronomical image analysis.
    Your task is to analyze the attached light curve graph. This graph plots the brightness (relative flux) of a star over time (in hours). A dip in the graph can indicate an exoplanet transiting, or passing in front of, its star.

    Based *primarily on the visual pattern* in this graph, classify the signal into one of the following three categories:
    - CONFIRMED_EXOPLANET: The graph shows a clear, distinct, and relatively flat-bottomed 'U-shaped' transit dip. The signal is strong and unambiguous.
    - PLANETARY_CANDIDATE: The graph shows a potential dip, but it might be shallow, noisy, V-shaped, or have other ambiguities that require further investigation.
    - FALSE_POSITIVE: The graph shows no discernible transit dip, or the pattern is clearly attributable to stellar noise, variability, or an instrumental artifact (e.g., a V-shape suggesting an eclipsing binary star).

    For context only, the parameters used to generate this curve were:
    - Orbital Period: ${data.orbitalPeriod} days
    - Transit Duration: ${data.transitDuration} hours
    - Planetary Radius: ${data.planetaryRadius} Earth radii
    - Stellar Temperature: ${data.stellarTemperature} K

    Your final classification must be based on your visual analysis of the image. Return ONLY one of the three classification strings above.
  `;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: lightCurveImageBase64,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: { parts: [imagePart, textPart] },
    });
    const resultText = response.text.trim();

    if (Object.values(ClassificationResult).includes(resultText as ClassificationResult)) {
        return resultText as ClassificationResult;
    } else {
        console.error("Unexpected classification from Gemini:", resultText);
        throw new Error(`Unexpected classification from API: ${resultText}`);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
