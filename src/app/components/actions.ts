"use server";

import { ApiService, OpenAPI } from "../../api";
import { redirect } from 'next/navigation';

export async function callAgentAction(formData: FormData) {
    const query = formData.get("query") as string;

    if (!query?.trim()) {
        redirect(`/agent?error=${encodeURIComponent("Query is required")}`);
    }

    OpenAPI.BASE = "http://localhost:8000";

    let result;
    try {
        result = await ApiService.agentEndpointApiAgentPost(query);
        console.log("Agent result:", result);
    } catch (err) {
        console.error("Agent call failed", err);
        return redirect(`/agent?query=${encodeURIComponent(query)}&error=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`);
    }

    return redirect(`/agent?query=${encodeURIComponent(query)}&response=${encodeURIComponent(JSON.stringify(result, null, 2))}`);
}