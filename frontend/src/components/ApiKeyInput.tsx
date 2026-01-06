import { useState } from 'react';
import { Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiKey } from '@/contexts/ApiKeyContext';

export default function ApiKeyInput() {
    const { isKeySet, saveApiKey, removeApiKey } = useApiKey();
    const [keyInput, setKeyInput] = useState('');

    const handleSaveKey = () => {
        if (keyInput.trim()) {
            saveApiKey(keyInput.trim());
            setKeyInput('');
        }
    };

    if (isKeySet) {
        return (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                <Key className="h-4 w-4" />
                <span className="text-sm font-medium">API Key Active</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs ml-2" onClick={removeApiKey}>Change</Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="password"
                    placeholder="Enter OpenAI API Key"
                    className="pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-64"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                />
            </div>
            <Button onClick={handleSaveKey}>Save Key</Button>
        </div>
    );
}
