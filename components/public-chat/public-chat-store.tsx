/**
 * Public Chat Store
 * 
 * This is a simplified version of the chat functionality for unauthenticated users.
 * Unlike the authenticated version that:
 * 1. Creates a Neon database for each user
 * 2. Provides a sidebar with navigation to other features
 * 3. Persists chat data server-side
 * 
 * This public chat implementation:
 * 1. Stores all data in browser localStorage only
 * 2. Has no sidebar navigation (implemented as a standalone page)
 * 3. Provides limited functionality with simulated responses
 * 
 * See src/app/(authenticated)/layout.tsx for the authenticated layout with sidebar.
 */
"use client";
import { v4 as uuidv4 } from 'uuid';
import { proxy, useSnapshot } from "valtio";
import { FormEvent } from "react";

// Define constants for the public chat
const AI_NAME = "Multi-user RAG Chat in Azure";

// Types
export type chatStatus = "idle" | "loading" | "error";

export interface PublicChatMessageModel {
  id: string;
  role: "user" | "assistant";
  name: string;
  content: string;
  createdAt: Date;
}

// LocalStorage key for saving public chat history
const LOCAL_STORAGE_KEY = "public_chat_history";

// Define the store interface
export interface PublicChatStore {
  messages: Array<PublicChatMessageModel>;
  loading: chatStatus;
  input: string;
  autoScroll: boolean;
  userName: string;
  updateLoading: (value: chatStatus) => void;
  initChatSession: (userName?: string) => void;
  clearChatHistory: () => void;
  updateInput: (value: string) => void;
  updateAutoScroll: (value: boolean) => void;
  submitChat: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

class PublicChatState implements PublicChatStore {
  public messages: Array<PublicChatMessageModel> = [];
  public loading: chatStatus = "idle";
  public input: string = "";
  public autoScroll: boolean = true;
  public userName: string = "Guest";

  public updateLoading(value: chatStatus) {
    this.loading = value;
  }

  // Initialize chat session, optionally loading from localStorage
  public initChatSession(userName: string = "Guest") {
    this.userName = userName;
    
    // Try to load messages from localStorage
    const savedMessages = this.loadFromLocalStorage();
    
    if (savedMessages && savedMessages.length > 0) {
      this.messages = savedMessages;
    } else {
      // Start with a welcome message if no history exists
      this.messages = [
        {
          id: uuidv4(),
          role: "assistant",
          content: "Welcome to the public chat! How can I help you today?",
          name: AI_NAME,
          createdAt: new Date(),
        }
      ];
    }
  }

  // Clear chat history
  public clearChatHistory() {
    this.messages = [
      {
        id: uuidv4(),
        role: "assistant",
        content: "Chat history has been cleared. How can I help you?",
        name: AI_NAME,
        createdAt: new Date(),
      }
    ];
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  // Load messages from localStorage
  private loadFromLocalStorage(): PublicChatMessageModel[] | null {
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
  }

  // Save messages to localStorage
  private saveToLocalStorage() {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (error) {
      console.error("Failed to save chat to localStorage:", error);
    }
  }

  public updateInput(value: string) {
    this.input = value;
  }

  public updateAutoScroll(value: boolean) {
    this.autoScroll = value;
  }

  // Submit chat message
  public async submitChat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!this.input.trim()) return;
    
    const userMessage: PublicChatMessageModel = {
      id: uuidv4(),
      role: "user",
      content: this.input.trim(),
      name: this.userName,
      createdAt: new Date(),
    };
    
    // Add user message to the chat
    this.messages = [...this.messages, userMessage];
    
    // Clear input
    this.input = "";
    
    // Set loading state
    this.loading = "loading";
    
    try {
      // Save the current state to localStorage
      this.saveToLocalStorage();
      
      // Get AI response
      const aiResponse = await this.generateAIResponse(userMessage.content);
      
      // Create AI message
      const aiMessage: PublicChatMessageModel = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
        name: AI_NAME,
        createdAt: new Date(),
      };
      
      // Add AI response to the chat
      this.messages = [...this.messages, aiMessage];
      
      // Save the updated state to localStorage
      this.saveToLocalStorage();
      
      // Reset loading state
      this.loading = "idle";
    } catch (error) {
      console.error("Error processing chat:", error);
      this.loading = "error";
      
      // Add error message
      this.messages = [
        ...this.messages,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again.",
          name: AI_NAME,
          createdAt: new Date(),
        }
      ];
      
      // Save the error state to localStorage
      this.saveToLocalStorage();
    }
  }

  // Generate AI response - with API call or fallback
  private async generateAIResponse(userMessage: string): Promise<string> {
    try {
      // Make a fetch request to the local API endpoint
      const response = await fetch('/api/chat/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback mode - generate a simple response locally
      return this.generateOfflineResponse(userMessage);
    }
  }
  
  // Generate a simple response without API call (fallback mode)
  private generateOfflineResponse(userMessage: string): string {
    const input = userMessage.toLowerCase();
    
    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return `Hello ${this.userName}! How can I help you today?`;
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
  }
}

export const usePublicChatStore = () => useSnapshot(state);

// Create the state object
const state = proxy(new PublicChatState()); 