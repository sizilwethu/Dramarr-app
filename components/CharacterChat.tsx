
import React, { useState, useEffect, useRef } from 'react';
import { AICharacter, Message, User } from '../types';
import { GoogleGenAI } from "@google/genai";
import { ChevronLeft, Send, Sparkles, User as UserIcon, X, Info } from 'lucide-react';

interface CharacterChatProps {
    character: AICharacter;
    currentUser: User;
    onBack: () => void;
}

export const CharacterChat: React.FC<CharacterChatProps> = ({ character, currentUser, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: character.id, receiverId: currentUser.id, content: `Hello @${currentUser.username}. I hear you've been following my story. What's on your mind?`, timestamp: Date.now(), isRead: true, isAI: true }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            receiverId: character.id,
            content: input,
            timestamp: Date.now(),
            isRead: true
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Fresh instance for updated API keys following guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const history = messages.map(m => ({
                role: m.senderId === currentUser.id ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [...history, { role: 'user', parts: [{ text: input }] }],
                config: {
                    systemInstruction: `You are ${character.name}, a character from a short drama series. 
                    Personality: ${character.personality}. 
                    Context: ${character.description}. 
                    Keep your responses cinematic, slightly dramatic, and consistent with your role. 
                    Address the user as @${currentUser.username}. 
                    Maximum 2 sentences per response.`,
                    temperature: 0.8
                }
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                senderId: character.id,
                receiverId: currentUser.id,
                content: response.text || "I... I can't find the words right now.",
                timestamp: Date.now(),
                isRead: true,
                isAI: true
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="h-full bg-black flex flex-col animate-fade-in relative">
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-neon-purple/20 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white p-2">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={character.avatarUrl} className="w-10 h-10 rounded-full border-2 border-neon-purple object-cover" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-none">{character.name}</h3>
                            <p className="text-[10px] text-neon-purple font-bold uppercase tracking-widest mt-1">AI Protagonist</p>
                        </div>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-white"><Info size={20} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                {messages.map(m => {
                    const isAI = m.senderId === character.id;
                    return (
                        <div key={m.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-[24px] px-5 py-3 text-sm shadow-2xl relative ${isAI ? 'bg-gray-900 text-gray-200 rounded-bl-none border border-white/5' : 'bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-br-none'}`}>
                                {isAI && <Sparkles size={10} className="absolute -top-1 -right-1 text-neon-purple animate-pulse" />}
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-gray-900/50 rounded-2xl px-5 py-3 flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-10 pb-20 md:pb-6">
                <div className="flex gap-2 bg-gray-900 rounded-2xl p-2 border border-white/5">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${character.name}...`}
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-white focus:outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="bg-neon-purple text-white p-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
