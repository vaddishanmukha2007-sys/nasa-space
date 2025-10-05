



// Fix: Add file extension to resolve module.
import { ExoplanetData, ClassificationResult } from '../types.ts';
// Fix: Import GoogleGenAI from the correct package
import { GoogleGenAI } from "@google/genai";

// Fix: Replaced mock function with a real Gemini API call.
export const classifyExoplanet = async (data: ExoplanetData, lightCurveImageDataUrl: string): Promise<ClassificationResult> => {
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
    
    // The canvas toDataURL() method returns a data URL string.
    // The Gemini API expects only the raw base64 encoded data.
    // We need to strip the prefix "data:image/jpeg;base64,".
    const base64Data = lightCurveImageDataUrl.split(',')[1];
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
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

export const getFascinatingFact = async (data: ExoplanetData): Promise<string> => {
  console.log("Generating a fascinating fact with Gemini for:", data);

  const prompt = `
    Based on the following exoplanet characteristics:
    - Orbital Period: ${data.orbitalPeriod.toFixed(2)} days
    - Planetary Radius: ${data.planetaryRadius.toFixed(2)} Earth radii
    - Stellar Temperature: ${data.stellarTemperature.toFixed(0)} K

    Generate a single, fascinating, little-known, and easily understandable fact about exoplanets. The fact should be concise (around 1-3 sentences) and should creatively relate to one of the provided characteristics. Frame it as an interesting piece of trivia.

    For example, you could talk about how a short orbital period means a year on that planet is incredibly fast, how a planet of that radius compares to others in our solar system, or what the stellar temperature implies about its star's color or the 'habitable zone'.

    Do NOT simply state the data back. Provide an interesting piece of trivia or context related to it. Start the fact with "Did you know..." or a similar engaging hook.

    Return ONLY the text of the fact. Do not include any titles or introductory text like "Here is a fascinating fact:".
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt,
    });

    const factText = response.text.trim();
    if (!factText) {
        throw new Error("Gemini returned an empty fact.");
    }
    return factText;
  } catch (error) {
    console.error("Error calling Gemini API for a fact:", error);
    // Provide a fallback fact
    return "Did you know... some exoplanets, known as 'hot Jupiters', orbit so close to their star that their year lasts only a few Earth days!";
  }
};