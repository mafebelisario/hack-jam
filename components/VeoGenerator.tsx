import React, { useState, useEffect } from 'react';
import { generateVeoVideo } from '../services/geminiService';
import { Button } from './Button';
import { Video, Upload, Play, Download, AlertCircle, Settings } from 'lucide-react';

// Interface for AI Studio globals, used with casting to avoid declaration conflicts with existing types in the environment
interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

export const VeoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUri, setGeneratedVideoUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkApiKey();
    }, []);

    const getAIStudio = (): AIStudio | undefined => {
        return (window as any).aistudio;
    }

    const checkApiKey = async () => {
        const aistudio = getAIStudio();
        if (aistudio && aistudio.hasSelectedApiKey) {
            const hasKey = await aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        }
    };

    const handleSelectKey = async () => {
        const aistudio = getAIStudio();
        if (aistudio && aistudio.openSelectKey) {
            await aistudio.openSelectKey();
            // Assume success after interaction
            setApiKeySelected(true);
        } else {
            setError("AI Studio environment not detected. This app requires the AI Studio wrapper.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setGeneratedVideoUri(null); // Reset previous result
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;
        
        setIsGenerating(true);
        setError(null);
        setGeneratedVideoUri(null);

        try {
            // Double check API key before request
            const aistudio = getAIStudio();
            if (aistudio) {
                await aistudio.openSelectKey();
            }

            const base64Data = await blobToBase64(selectedFile);

            const uri = await generateVeoVideo({
                prompt: prompt.trim() || "Animate this image cinematographically",
                aspectRatio,
                resolution: '720p', // Defaulting to 720p for speed
                image: {
                    data: base64Data,
                    mimeType: selectedFile.type
                }
            });

            if (uri) {
                setGeneratedVideoUri(uri);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unknown error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                <div className="p-4 bg-blue-50 rounded-full">
                    <Video className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Enable Veo Generation</h2>
                <p className="text-gray-600 max-w-md">
                    To generate high-quality videos with Veo, you need to select a paid API key from your Google Cloud project.
                </p>
                <Button onClick={handleSelectKey} className="px-8 py-3">
                    Select API Key
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                    Read more about billing <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-500 underline">here</a>.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                        <Video className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Veo Studio</h1>
                </div>
                <Button variant="ghost" onClick={handleSelectKey} className="text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Switch API Key
                </Button>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800">Generation Failed</h3>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Configuration */}
                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Source Image <span className="text-red-500">*</span>
                        </label>
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="hidden" 
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg shadow-md object-contain" />
                                ) : (
                                    <div className="bg-gray-100 p-4 rounded-full">
                                        <Upload className="w-6 h-6 text-gray-500" />
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-600 mt-2">
                                    {selectedFile ? 'Click to change image' : 'Upload a photo to animate'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Animation Prompt (Optional)
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe how the image should move (e.g., 'The waterfall flows naturally', 'Cyberpunk neon lights flickering')"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Aspect Ratio
                        </label>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setAspectRatio('16:9')}
                                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '16:9' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div className="w-8 h-5 border-2 border-current rounded-sm"></div>
                                <span className="text-xs font-semibold">Landscape (16:9)</span>
                            </button>
                            <button 
                                onClick={() => setAspectRatio('9:16')}
                                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div className="w-5 h-8 border-2 border-current rounded-sm"></div>
                                <span className="text-xs font-semibold">Portrait (9:16)</span>
                            </button>
                        </div>
                    </div>

                    <Button 
                        onClick={handleGenerate} 
                        disabled={!selectedFile} 
                        isLoading={isGenerating}
                        className="w-full py-4 text-lg shadow-lg shadow-blue-200"
                    >
                        {isGenerating ? 'Generating Video (this may take a minute)...' : 'Generate Video'}
                        {!isGenerating && <Play className="w-5 h-5 ml-2 fill-current" />}
                    </Button>
                </div>

                {/* Right Column: Preview & Result */}
                <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                    {generatedVideoUri ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 z-10">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Generation Complete
                            </h3>
                            <video 
                                src={`${generatedVideoUri}&key=${process.env.API_KEY}`} 
                                controls 
                                autoPlay 
                                loop 
                                className="w-full max-h-[500px] rounded-lg shadow-2xl bg-black"
                            />
                            <div className="flex gap-2 mt-4">
                                <Button variant="secondary" onClick={() => setGeneratedVideoUri(null)}>
                                    Generate Another
                                </Button>
                                <a 
                                    href={`${generatedVideoUri}&key=${process.env.API_KEY}`} 
                                    download="veo_generation.mp4"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 z-10">
                            {isGenerating ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-16 h-16 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-400 font-medium">Veo is dreaming...</p>
                                    <p className="text-xs text-gray-600 mt-2">This process typically takes 60-90 seconds.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Video className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-lg font-medium">Your video will appear here</p>
                                    <p className="text-sm mt-2 opacity-60">Upload an image and click Generate</p>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Ambient background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};