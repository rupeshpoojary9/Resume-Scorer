import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string; // Base64 or URL for display
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I can help you manage GitLab tasks. You can ask me to create issues or upload a screenshot of a task list.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async () => {
        if ((!inputValue.trim() && !selectedImage) || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputValue,
            image: imagePreview || undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setImagePreview(null);
        const imageToSend = selectedImage;
        setSelectedImage(null); // Clear immediately
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', userMessage.content || (imageToSend ? "Analyze this image" : ""));
            // Send history excluding the last message we just added
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            formData.append('history', JSON.stringify(history));

            if (imageToSend) {
                formData.append('image', imageToSend);
            }

            // Use port 8001 (backend)
            // Safety timeout in case the request hangs
            const timeoutId = setTimeout(() => {
                setIsLoading(false);
                setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Request timed out.' }]);
            }, 60000); // 60 seconds timeout

            const response = await fetch('http://localhost:8001/chat/message', {
                method: 'POST',
                body: formData,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Something went wrong'}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    setSelectedImage(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                    e.preventDefault(); // Prevent pasting the file name or binary data as text
                    return;
                }
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-80 md:w-96 h-[500px] mb-4 shadow-xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="p-4 border-b flex flex-row justify-between items-center bg-primary text-primary-foreground rounded-t-lg">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            GitLab Assistant
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90 h-8 w-8">
                            <X className="w-5 h-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-white border shadow-sm rounded-bl-none text-gray-800'
                                    }`}>
                                    {msg.image && (
                                        <img src={msg.image} alt="Uploaded" className="mb-2 rounded-md max-h-40 object-cover" />
                                    )}
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border shadow-sm p-3 rounded-lg rounded-bl-none">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="p-3 border-t bg-white rounded-b-lg">
                        {imagePreview && (
                            <div className="mb-2 relative inline-block">
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded border" />
                                <button
                                    onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="w-5 h-5 text-gray-500" />
                            </Button>
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                onPaste={handlePaste}
                                placeholder="Type or paste image..."
                                className="flex-1"
                            />
                            <Button onClick={sendMessage} size="icon" disabled={isLoading || (!inputValue && !selectedImage)}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
                >
                    <MessageCircle className="w-8 h-8" />
                </Button>
            )}
        </div>
    );
}
