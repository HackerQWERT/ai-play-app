import { create } from 'zustand';

interface AgentState {
    data: any;
    loading: boolean;
    error: string | null;
    setData: (data: any) => void;
    setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    data: null,
    loading: false,
    error: null,
    setData: (data: any) => set({ data }),
    setLoading: (loading: boolean) => set({ loading })

}));