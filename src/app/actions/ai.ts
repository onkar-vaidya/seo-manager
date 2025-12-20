'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

// List of available API keys for rotation
// Keys are stored in .env.local as a comma-separated string
const API_KEYS = (process.env.GEMINI_API_KEYS || '').split(',').filter(k => k.trim())

export type ResearchState = {
    result?: string
    error?: string
}

export async function generateResearch(prompt: string): Promise<ResearchState> {
    let lastError: any = null;

    // Try keys in order (or could be randomized)
    for (const apiKey of API_KEYS) {
        if (!apiKey) continue;

        try {
            const genAI = new GoogleGenerativeAI(apiKey)

            // Switching to the specific model requested by the user.
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                tools: [{
                    // @ts-ignore
                    googleSearch: {}
                }]
            })

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            })

            const response = await result.response
            const text = response.text()

            return { result: text }

        } catch (error: any) {
            console.error(`Gemini API Error with key ending in ...${apiKey.slice(-4)}:`, error.message)
            lastError = error
            // If it's a rate limit (429) or other transient error, we continue to the next key.
            // If it's a permission denied (403) or not found (404), we also continue just in case.
            continue
        }
    }

    // If we run out of keys
    return { error: `All API keys failed. Last error: ${lastError?.message || 'Unknown error'}` }
}
