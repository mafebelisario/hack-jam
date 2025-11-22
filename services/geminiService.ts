import { GoogleGenAI } from "@google/genai";
import { VideoGenerationConfig } from "../types";

// Define custom types to handle the operation loop manually since the SDK types can be tricky with operations
interface VideoOperation {
    name: string;
    metadata?: any;
    done?: boolean;
    error?: any;
    response?: {
        generatedVideos: Array<{
            video: {
                uri: string;
                mimeType: string;
            }
        }>
    };
}

export const generateVeoVideo = async (config: VideoGenerationConfig): Promise<string | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please select a key.");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        console.log("Starting generation with model: veo-3.1-fast-generate-preview");
        
        // Prepare request parameters
        const params: any = {
            model: 'veo-3.1-fast-generate-preview',
            config: {
                numberOfVideos: 1,
                resolution: config.resolution,
                aspectRatio: config.aspectRatio,
            }
        };

        if (config.prompt) {
            params.prompt = config.prompt;
        } else {
            // If no prompt is provided but an image is, Veo still needs a prompt sometimes, 
            // or we just rely on the image. The prompt is technically optional in the SDK if image is present, 
            // but good to have a fallback.
            params.prompt = "Animate this image";
        }

        if (config.image) {
            params.image = {
                imageBytes: config.image.data,
                mimeType: config.image.mimeType,
            };
        }

        let operation = await ai.models.generateVideos(params) as unknown as VideoOperation;

        console.log("Operation started:", operation);

        // Polling loop
        while (!operation.done) {
            console.log("Polling operation status...");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            
            // Re-fetch operation status
            const updatedOp = await ai.operations.getVideosOperation({ operation: operation as any });
            operation = updatedOp as unknown as VideoOperation;
        }

        if (operation.error) {
            console.error("Operation failed:", operation.error);
            throw new Error(operation.error.message || "Video generation failed.");
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) {
            throw new Error("No video URI returned from successful operation.");
        }

        return videoUri;

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
};