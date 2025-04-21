import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { FormEvent } from "react";

// Constants
const AI_NAME = "Multi-user RAG Chat in Azure";
const LOCAL_STORAGE_KEY = "public_chat_history";

// Types
export type ChatStatus = "idle" | "loading" | "error";

export interface PublicChatMessage {
  id: string;
  role: "user" | "assistant";
  name: string;
  content: string;
  createdAt: Date;
}

// Store interface
interface PublicChatStore {
  messages: PublicChatMessage[];
  loading: ChatStatus;
  input: string;
  userName: string;
  
  // Actions
  initChatSession: (userName?: string) => void;
  clearChatHistory: () => void;
  updateInput: (input: string) => void;
  submitChat: (e: FormEvent) => Promise<void>;
}

// Helper functions
const loadFromLocalStorage = (): PublicChatMessage[] | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) return null;
    
    const parsedData = JSON.parse(savedData);
    
    // Convert string dates back to Date objects
    return parsedData.map((msg: any) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }));
  } catch (error) {
    console.error("Failed to load chat from localStorage:", error);
    return null;
  }
};

const saveToLocalStorage = (messages: PublicChatMessage[]) => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save chat to localStorage:", error);
  }
};

// Generate a simple response without API call (fallback mode)
const generateOfflineResponse = (message: string, userName: string): string => {
  const input = message.toLowerCase();
  
  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return `Hello ${userName}! How can I help you today?`;
  } 
  
  if (input.includes("help")) {
    return "I can provide basic information in this offline mode. For full features, please check your internet connection or try again later.";
  } 
  
  if (input.includes("weather")) {
    return "I'm sorry, I don't have access to current weather information in this offline mode.";
  } 
  
  if (input.includes("time")) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  } 
  
  if (input.includes("who are you") || input.includes("what are you")) {
    return "I'm a limited version of the AI Chat assistant available in this public demo. I'm currently in offline mode due to connection issues.";
  } 
  
  if (input.includes("feature") || input.includes("capabilities")) {
    return "In this public demo, I have limited capabilities. The full version includes many more features that require a connection to our servers.";
  }
  
  if (input.includes("login") || input.includes("sign in")) {
    return "You can sign in using the button at the top of the page for a more complete experience.";
  }
  
  return "I'm currently in offline mode due to connection issues. I can only respond to basic queries in this mode.";
};

// Create the store
export const usePublicChatStore = create<PublicChatStore>((set, get) => ({
  messages: [],
  loading: "idle",
  input: "",
  userName: "Guest",
  
  initChatSession: (userName = "Guest") => {
    set({ userName });
    
    const savedMessages = loadFromLocalStorage();
    
    if (savedMessages && savedMessages.length > 0) {
      set({ messages: savedMessages });
    } else {
      // Start with a welcome message if no history exists
      set({
        messages: [
          {
            id: uuidv4(),
            role: "assistant" as const,
            content: "Welcome to the public chat! How can I help you today?",
            name: AI_NAME,
            createdAt: new Date(),
          }
        ]
      });
    }
  },
  
  clearChatHistory: () => {
    const newMessages = [
      {
        id: uuidv4(),
        role: "assistant" as const,
        content: "Chat history has been cleared. How can I help you?",
        name: AI_NAME,
        createdAt: new Date(),
      }
    ];
    
    set({ messages: newMessages });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
  
  updateInput: (input) => {
    set({ input });
  },
  
  submitChat: async (e: FormEvent) => {
    e.preventDefault();
    
    const { input, messages, userName } = get();
    
    if (!input.trim() || get().loading !== "idle") return;
    
    // Create user message
    const userMessage: PublicChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      name: userName,
      createdAt: new Date(),
    };
    
    // Update messages and clear input
    const updatedMessages = [...messages, userMessage];
    set({ 
      messages: updatedMessages,
      input: "",
      loading: "loading" 
    });
    
    // Save to localStorage
    saveToLocalStorage(updatedMessages);
    
    try {
      // Try to get response from API
      let aiResponseText = "";
      
      try {
        // Make a fetch request to the local API endpoint
        const response = await fetch('/api/chat/public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        aiResponseText = data.message;
      } catch (error) {
        console.error('Error generating AI response:', error);
        aiResponseText = generateOfflineResponse(userMessage.content, userName);
      }
      
      // Create AI message
      const aiMessage: PublicChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponseText,
        name: AI_NAME,
        createdAt: new Date(),
      };
      
      // Update messages with AI response
      const finalMessages = [...get().messages, aiMessage];
      set({ 
        messages: finalMessages,
        loading: "idle" 
      });
      
      // Save to localStorage
      saveToLocalStorage(finalMessages);
      
    } catch (error) {
      console.error("Error in chat submission:", error);
      
      // Add error message
      const errorMessage: PublicChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
        name: AI_NAME,
        createdAt: new Date(),
      };
      
      const errorMessages = [...get().messages, errorMessage];
      set({ 
        messages: errorMessages,
        loading: "error" 
      });
      
      saveToLocalStorage(errorMessages);
    }
  },
})); 