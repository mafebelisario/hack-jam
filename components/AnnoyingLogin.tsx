import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AppState } from '../types';

interface Props {
    onSuccess: () => void;
}

export const AnnoyingLogin: React.FC<Props> = ({ onSuccess }) => {
    const [step, setStep] = useState<'form' | 'captcha' | 'rolematch'>('form');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    
    // Step 2 State
    const [captchaSelected, setCaptchaSelected] = useState<number | null>(null);
    const [captchaAttempts, setCaptchaAttempts] = useState(0);
    
    // Step 3 State
    const [roleSelected, setRoleSelected] = useState<number | null>(null);

    // Requirements MUST be alphabetically ordered as requested
    const requirements = [
        { id: 'req1', label: "A special character must be included ($%#@!)", check: (p: string) => /[$%#@!]/.test(p) },
        { id: 'req2', label: "Be at least 8 characters long", check: (p: string) => p.length >= 8 },
        { id: 'req3', label: "Contains the letter 'z' (lowercase)", check: (p: string) => p.includes('z') },
        { id: 'req4', label: "Does NOT contain the word 'password'", check: (p: string) => !p.toLowerCase().includes('password') },
        { id: 'req5', label: "Ends with a number", check: (p: string) => /\d$/.test(p) },
    ];

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = [];
        if (username.length < 3) newErrors.push("Username is too short (or too boring).");
        
        const failingReqs = requirements.filter(r => !r.check(password));
        if (failingReqs.length > 0) {
            newErrors.push("Password does not meet the alphabetically sorted criteria.");
        }

        setErrors(newErrors);

        if (newErrors.length === 0) {
            setStep('captcha');
        }
    };

    const handleCaptchaSubmit = () => {
        if (captchaSelected === null) return;
        // Annoying logic: First attempt always fails. Second attempt succeeds regardless of choice.
        if (captchaAttempts === 0) {
            setErrors(["WRONG! That image clearly doesn't smell like purple. Try again."]);
            setCaptchaAttempts(1);
            setCaptchaSelected(null);
        } else {
            setErrors([]);
            setStep('rolematch');
        }
    };

    const handleRoleSubmit = () => {
        if (roleSelected === null) return;
        // Randomly decide if they are right (50/50) to be annoying, but let them pass eventually
        const isSuccess = Math.random() > 0.3; 
        
        if (isSuccess) {
            onSuccess();
        } else {
            setErrors(["Access Denied. That person is obviously not the Chief Pencil Sharpener. Try again."]);
            // Reset to force re-selection
            setRoleSelected(null);
        }
    };

    if (step === 'form') {
        return (
            <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-4 comic-sans">
                <div className="bg-white p-8 rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-black max-w-md w-full transform rotate-1">
                    <h1 className="text-4xl font-bold text-center mb-6 text-pink-600 animate-bounce">LOGIN NOW!!</h1>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-xl font-bold mb-2 transform -rotate-2 group-hover:rotate-2 transition-transform">User Name</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border-4 border-blue-400 p-3 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-yellow-300 outline-none text-lg font-mono"
                                placeholder="Type here..."
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xl font-bold mb-2 transform rotate-1 group-hover:-rotate-1 transition-transform">Secret Code</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-4 border-red-400 p-3 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-pink-300 outline-none text-lg"
                            />
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-400">
                            <h3 className="font-bold text-sm uppercase mb-2 underline">Strict Requirements (A-Z):</h3>
                            <ul className="space-y-1">
                                {requirements.map((req) => (
                                    <li key={req.id} className={`text-sm flex items-center gap-2 ${req.check(password) ? 'text-green-600 font-bold line-through' : 'text-red-500'}`}>
                                        <span>{req.check(password) ? '✅' : '❌'}</span>
                                        {req.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-red-100 border-l-8 border-red-600 p-4 text-red-800 font-bold animate-pulse">
                                {errors.map(e => <p key={e}>{e}</p>)}
                            </div>
                        )}

                        <Button type="submit" variant="annoying" className="w-full text-2xl py-4 shake-hover">
                            LET ME IN !!!
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    if (step === 'captcha') {
        return (
            <div className="min-h-screen bg-purple-600 flex items-center justify-center p-4 comic-sans">
                <div className="bg-white p-8 rounded-full shadow-2xl border-8 border-yellow-400 max-w-2xl w-full text-center">
                    <h2 className="text-3xl font-black mb-4 text-indigo-900">Security Check 1 of 2</h2>
                    <p className="text-xl mb-8 font-bold">Please select the image that <span className="text-pink-600 underline decoration-wavy">smells like the color purple</span>.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[101, 102, 103, 104].map((id, idx) => (
                            <div 
                                key={id}
                                onClick={() => setCaptchaSelected(id)}
                                className={`cursor-pointer overflow-hidden rounded-xl border-4 transition-all transform hover:scale-105 ${captchaSelected === id ? 'border-green-500 ring-4 ring-green-200 scale-95' : 'border-transparent hover:border-pink-400'}`}
                            >
                                <img src={`https://picsum.photos/id/${id}/300/200`} alt="Random" className="w-full h-32 object-cover" />
                            </div>
                        ))}
                    </div>

                    {errors.length > 0 && (
                        <div className="mb-6 text-red-600 font-black text-xl bg-red-200 p-2 rounded inline-block">
                            {errors[0]}
                        </div>
                    )}

                    <Button onClick={handleCaptchaSubmit} variant="annoying" className="w-full text-xl">
                        VERIFY HUMANITY
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'rolematch') {
         return (
            <div className="min-h-screen bg-green-600 flex items-center justify-center p-4 comic-sans">
                <div className="bg-white p-6 rounded-lg shadow-[20px_20px_0px_0px_#000] border-4 border-black max-w-3xl w-full text-center">
                    <h2 className="text-3xl font-black mb-2">Security Check 2 of 2</h2>
                    <p className="text-lg mb-6">Identify the corporate role.</p>
                    
                    <div className="bg-blue-100 p-4 mb-8 rounded-xl border-2 border-blue-300 inline-block">
                        <h3 className="text-2xl font-bold text-blue-800">"Junior Vice President of Cloud Watching"</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { id: 1, img: 64, name: "Candidate A" },
                            { id: 2, img: 65, name: "Candidate B" },
                            { id: 3, img: 91, name: "Candidate C" }
                        ].map((person) => (
                            <div 
                                key={person.id}
                                onClick={() => setRoleSelected(person.id)}
                                className={`cursor-pointer p-4 bg-gray-50 rounded-xl border-4 transition-all ${roleSelected === person.id ? 'border-blue-600 bg-blue-50 transform -translate-y-2' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                <img src={`https://picsum.photos/id/${person.img}/200/200`} alt={person.name} className="w-32 h-32 rounded-full mx-auto mb-3 object-cover border-2 border-black" />
                                <p className="font-bold text-xl">{person.name}</p>
                            </div>
                        ))}
                    </div>

                     {errors.length > 0 && (
                        <div className="mb-6 text-red-600 font-bold text-lg">
                            {errors[0]}
                        </div>
                    )}

                    <Button onClick={handleRoleSubmit} variant="annoying" className="px-12 text-xl py-3">
                        CONFIRM IDENTITY
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};