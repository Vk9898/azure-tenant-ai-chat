"use server";

import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { ServerActionResponse } from "@/components/common/server-action-response";
import { OpenAIInstance } from "@/components/common/services/openai";

interface PlaygroundRequest {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface PlaygroundResponse {
  response: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  timeTaken: number;
}

export async function generatePlaygroundResponse(
  request: PlaygroundRequest
): Promise<ServerActionResponse<PlaygroundResponse>> {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "UNAUTHORIZED",
      errors: [{ message: "Admin access required for playground access" }],
    };
  }

  try {
    const startTime = Date.now();
    
    const openai = OpenAIInstance();
    
    const completion = await openai.chat.completions.create({
      model: request.model,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      messages: [
        {
          role: "system",
          content: request.systemPrompt || "You are a helpful AI assistant.",
        },
        {
          role: "user",
          content: request.prompt,
        },
      ],
    });
    
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    
    return {
      status: "OK",
      response: {
        response: completion.choices[0]?.message?.content || "",
        tokens: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
        timeTaken,
      },
    };
  } catch (error) {
    console.error("Error generating playground response:", error);
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
} 