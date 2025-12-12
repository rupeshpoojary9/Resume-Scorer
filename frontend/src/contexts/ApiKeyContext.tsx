import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setApiKey as setGlobalApiKey, getApiKey, clearApiKey as clearGlobalApiKey } from '@/lib/api';

interface ApiKeyContextType {
    apiKey: string | null;
    isKeySet: boolean;
    saveApiKey: (key: string) => void;
    removeApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
    const [apiKey, setApiKey] = useState<string | null>(getApiKey());
    const [isKeySet, setIsKeySet] = useState<boolean>(!!getApiKey());

    useEffect(() => {
        const storedKey = getApiKey();
        if (storedKey) {
            setApiKey(storedKey);
            setIsKeySet(true);
        }
    }, []);

    const saveApiKey = (key: string) => {
        setGlobalApiKey(key);
        setApiKey(key);
        setIsKeySet(true);
    };

    const removeApiKey = () => {
        clearGlobalApiKey();
        setApiKey(null);
        setIsKeySet(false);
    };

    return (
        <ApiKeyContext.Provider value={{ apiKey, isKeySet, saveApiKey, removeApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
}

export function useApiKey() {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within an ApiKeyProvider');
    }
    return context;
}
