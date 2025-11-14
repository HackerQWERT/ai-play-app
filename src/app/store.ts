import { create } from 'zustand';

interface AgentState {
    query: string;
    response: Record<string, unknown> | null;
    loading: boolean;
    error: string | null;
    setQuery: (query: string) => void;
    callAgent: () => Promise<void>;
}export const useAgentStore = create<AgentState>((set, get) => ({
    query: '',
    response: null,
    loading: false,
    error: null,
    setQuery: (query) => set({ query }),
    callAgent: async () => {
        const { query } = get();
        if (!query.trim()) return;

        set({ loading: true, error: null });
        try {
            const { ApiService } = await import('../api');
            const result = await ApiService.agentEndpointApiAgentPost(query);
            set({ response: result, loading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false });
        }
    },
}));