import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with a fallback to a demo behavior if API key is missing
const openaiApiKey = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // If no OpenAI API key is configured, use demo mode
    if (!openaiApiKey) {
      return handleDemoMode(message);
    }

    // Generate response using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for a public chat demo. Provide concise, helpful responses while mentioning that you have limited capabilities in this public demo. For full features, suggest the user logs in.',
        },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Extract and return the assistant's message
    const aiMessage = response.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a response at the moment.";

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Error in public chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
}

// Demo mode function for when no API key is available
function handleDemoMode(message: string) {
  const userInput = message.toLowerCase();
  let response = "I'm a limited public chat bot. I can only respond to basic questions. For more advanced features, please log in.";

  if (userInput.includes("hello") || userInput.includes("hi") || userInput.includes("hey")) {
    response = `Hello! How can I help you today?`;
  } else if (userInput.includes("help")) {
    response = "I can provide basic information in this demo. For full features, please log in to access the complete chat experience.";
  } else if (userInput.includes("weather")) {
    response = "I'm sorry, I don't have access to current weather information in this demo mode. Please log in for advanced capabilities.";
  } else if (userInput.includes("time")) {
    response = `The current time is ${new Date().toLocaleTimeString()}.`;
  } else if (userInput.includes("who are you") || userInput.includes("what are you")) {
    response = "I'm a limited version of the AI Chat assistant available in this public demo. For full capabilities, please sign in.";
  } else if (userInput.includes("feature") || userInput.includes("capabilities") || userInput.includes("what can you do")) {
    response = "In this public demo, I have limited capabilities. The full version includes:\n\n- Web search integration\n- Document processing\n- Custom extensions\n- Long context memory\n- Personalized experiences\n\nTo access these features, please sign in.";
  } else if (userInput.includes("login") || userInput.includes("sign in") || userInput.includes("account")) {
    response = "To access the full features, please click the 'Sign In' button at the top of the page.";
  }

  return NextResponse.json({ message: response });
} 