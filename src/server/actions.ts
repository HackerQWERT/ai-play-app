"use server";

import { ApiAgentService, OpenAPI } from "../api";

export async function callAgentAction(formData: FormData) {
    const query = formData.get("query") as string;

    if (!query?.trim()) {
        return { error: "Query is required" };
    }

    OpenAPI.BASE = "http://localhost:8000";

    try {
        const result = await ApiAgentService.vibeApiAgentVibePost(query);
        console.log("Agent result:", result);
        return { success: true, data: result };
    } catch (err) {
        console.error("Agent call failed", err);
        return { error: err instanceof Error ? err.message : "Unknown error" };
    }
}