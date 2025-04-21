import { FormEvent } from "react";
import { create } from "zustand";
import { nanoid } from "nanoid";

const STORAGE_KEY = "public-chat-messages";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  name: string;
  content: string;
  timestamp: number;
}

interface ChatStore {
  messages: ChatMessage[];
  input: string;
  loading: "idle" | "loading";
  updateInput: (input: string) => void;
  submitChat: (e: FormEvent) => void;
  sendMessage: (content: string) => void;
  initChatSession: () => void;
  clearChatHistory: () => void;
}

const handleAssistantResponse = async (userMessage: string) => {
  // Simple echo response with a delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `You said: "${userMessage}"\n\nThis is a demo chat that shows your messages echoed back to you. Sign in for a full chat experience with Azure OpenAI.`;
};

export const publicChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  input: "",
  loading: "idle",
  
  updateInput: (input) => set({ input }),
  
  submitChat: (e: FormEvent) => {
    e.preventDefault();
    const { input } = get();
    if (input.trim() && get().loading !== "loading") {
      get().sendMessage(input);
      set({ input: "" });
    }
  },
  
  sendMessage: async (content) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      name: "You",
      content,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      loading: "loading",
    }));
    
    try {
      const assistantResponse = await handleAssistantResponse(content);
      
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        name: "Azure AI",
        content: assistantResponse,
        timestamp: Date.now(),
      };
      
      set((state) => {
        const updatedMessages = [...state.messages, assistantMessage];
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
        return {
          messages: updatedMessages,
          loading: "idle",
        };
      });
    } catch (error) {
      console.error("Error processing message:", error);
      set({ loading: "idle" });
    }
  },
  
  initChatSession: () => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as ChatMessage[];
        set({ messages: parsedMessages });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  
  clearChatHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ messages: [] });
  },
}));

export const usePublicChat = () => {
  const store = publicChatStore();
  return {
    messages: store.messages,
    input: store.input,
    loading: store.loading,
  };
}; 