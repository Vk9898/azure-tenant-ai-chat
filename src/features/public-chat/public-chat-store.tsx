"use client";
import { uniqueId } from "@/features/common/util";
import { showError } from "@/features/globals/global-message-store";
import { AI_NAME } from "@/features/theme/theme-config";
import { proxy, useSnapshot } from "valtio";
import { FormEvent } from "react";

// Define the public chat message model - note this data is ONLY stored client-side
// and NOT saved to a database unlike the authenticated chat which uses NeonDB
export type PublicChatMessageModel = {
  id: string;
  role: "user" | "assistant";
  content: string;
  name: string;
  createdAt: Date;
};

type chatStatus = "idle" | "loading";

// LocalStorage key for saving public chat history
const LOCAL_STORAGE_KEY = "public_chat_history";

class PublicChatState {
  public messages: Array<PublicChatMessageModel> = [];
  public loading: chatStatus = "idle";
  public input: string = "";
  public autoScroll: boolean = false;
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
          id: uniqueId(),
          role: "assistant",
          content: "Welcome to the public chat! How can I help you today?",
          name: AI_NAME,
          createdAt: new Date(),
        }
      ];
    }
  }

  // Save current chat history to localStorage
  private saveToLocalStorage() {
    try {
      // Only keep the last 20 messages to prevent localStorage limits
      const messagesToSave = this.messages.slice(-20);
      
      // Serialize dates for proper JSON storage
      const serializedMessages = messagesToSave.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString()
      }));
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializedMessages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);
    }
  }

  // Load chat history from localStorage
  private loadFromLocalStorage(): PublicChatMessageModel[] | null {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedData) return null;
      
      const parsedData = JSON.parse(savedData);
      
      // Restore dates from ISO strings
      return parsedData.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt)
      }));
    } catch (error) {
      console.error("Failed to load chat history from localStorage:", error);
      return null;
    }
  }

  // Clear chat history both in memory and localStorage
  public clearChatHistory() {
    this.messages = [
      {
        id: uniqueId(),
        role: "assistant",
        content: "Chat history cleared. How can I help you today?",
        name: AI_NAME,
        createdAt: new Date(),
      }
    ];
    
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }

  public updateInput(value: string) {
    this.input = value;
  }

  public updateAutoScroll(value: boolean) {
    this.autoScroll = value;
  }

  private reset() {
    this.input = "";
  }

  private async chat() {
    this.updateAutoScroll(true);
    this.loading = "loading";

    const newUserMessage: PublicChatMessageModel = {
      id: uniqueId(),
      role: "user",
      content: this.input,
      name: this.userName,
      createdAt: new Date(),
    };

    this.messages.push(newUserMessage);
    this.reset();

    try {
      // Simulate a response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simple bot response based on input
      let botResponse = "I'm a limited public chat bot. I can only respond to basic questions. For more advanced features, please log in.";
      
      const input = this.input.toLowerCase();
      
      if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
        botResponse = `Hello ${this.userName}! How can I help you today?`;
      } else if (input.includes("help")) {
        botResponse = "I can provide basic information. For more advanced features, please log in to access the full chat experience. You can ask me about:\n\n- Basic information\n- Current time\n- Simple calculations\n- Limited definitions";
      } else if (input.includes("weather")) {
        botResponse = "I'm sorry, I don't have access to current weather information. This is a limited public chat demonstration. Please log in for access to external data.";
      } else if (input.includes("time")) {
        botResponse = `The current time is ${new Date().toLocaleTimeString()}.`;
      } else if (input.includes("who are you") || input.includes("what are you")) {
        botResponse = "I'm a limited version of the Tenant AI Chat assistant. I can answer basic questions in this public demo. For full capabilities including web searches, document analysis, and more, please sign in.";
      } else if (input.includes("feature") || input.includes("capabilities") || input.includes("what can you do")) {
        botResponse = "In this public demo, I have limited capabilities. The full version includes:\n\n- Web search integration\n- Document processing\n- Custom extensions\n- Long context memory\n- Personalized experiences\n\nTo access these features, please sign in.";
      } else if (input.includes("calculate") || input.includes("math") || input.match(/[0-9+\-*/()]/)) {
        // Simple math operations
        try {
          if (input.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
            // Extract the mathematical expression
            const expression = input.match(/\d+\s*[\+\-\*\/]\s*\d+/)[0];
            // Use Function constructor to safely evaluate the expression
            const result = new Function(`return ${expression}`)();
            botResponse = `The result of ${expression} is ${result}.`;
          } else {
            botResponse = "I can do simple calculations. Try something like '2 + 2' or '10 * 5'.";
          }
        } catch (error) {
          botResponse = "I had trouble with that calculation. I can only perform simple operations in this demo mode.";
        }
      } else if (input.includes("login") || input.includes("sign in") || input.includes("account")) {
        botResponse = "To access the full features of Tenant AI Chat, please click the 'Sign In' button at the top of the page or use this link: [Sign In](/auth/signin)";
      } else if (input.includes("clear") || input.includes("reset") || input.includes("start over")) {
        this.clearChatHistory();
        botResponse = "Chat history cleared. How can I help you today?";
      } else if (input.includes("save") || input.includes("store") || input.includes("persist")) {
        botResponse = "Your public chat history is temporarily stored in your browser's local storage. It's not saved to a database and will be lost if you clear your browser data. For persistent chat history, please sign in.";
      }

      const botMessage: PublicChatMessageModel = {
        id: uniqueId(),
        role: "assistant",
        content: botResponse,
        name: AI_NAME,
        createdAt: new Date(),
      };

      this.messages.push(botMessage);
      
      // Save to localStorage after each interaction
      this.saveToLocalStorage();
      
    } catch (error) {
      showError("" + error);
    } finally {
      this.loading = "idle";
    }
  }

  public async submitChat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (this.input === "" || this.loading !== "idle") {
      return;
    }

    this.chat();
  }
}

export const publicChatStore = proxy(new PublicChatState());

export const usePublicChat = () => {
  return useSnapshot(publicChatStore, { sync: true });
}; 