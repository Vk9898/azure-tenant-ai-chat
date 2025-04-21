import { refineFromEmpty } from "@/components/common/schema-validation";

export const EXTENSION_ATTRIBUTE = "EXTENSION";

// Define types using TypeScript interfaces
export interface ExtensionModel {
  id: string;
  name: string;
  description: string;
  executionSteps: string;
  headers: HeaderModel[];
  userId: string;
  isPublished: boolean;
  createdAt: Date;
  functions: ExtensionFunctionModel[];
  type: typeof EXTENSION_ATTRIBUTE;
}

export interface ExtensionFunctionModel {
  id: string;
  code: string;
  endpoint: string;
  endpointType: EndpointType;
  isOpen: boolean;
}

export interface HeaderModel {
  id: string;
  key: string;
  value: string;
}

export type EndpointType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Simple validation schema for TypeScript
export const ExtensionModelSchema = {
  safeParse: (data: any) => {
    try {
      // Simple validation logic
      if (!data.name || data.name.trim() === '') {
        return { 
          success: false, 
          error: { 
            errors: [{ path: ['name'], message: 'Title cannot be empty' }] 
          } 
        };
      }
      
      if (!data.description || data.description.trim() === '') {
        return { 
          success: false, 
          error: { 
            errors: [{ path: ['description'], message: 'Description cannot be empty' }] 
          } 
        };
      }

      if (!data.executionSteps || data.executionSteps.trim() === '') {
        return { 
          success: false, 
          error: { 
            errors: [{ path: ['executionSteps'], message: 'Execution steps cannot be empty' }] 
          } 
        };
      }
      
      // Check functions
      if (!data.functions || !Array.isArray(data.functions) || data.functions.length === 0) {
        return { 
          success: false, 
          error: { 
            errors: [{ path: ['functions'], message: 'At least one function is required' }] 
          } 
        };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: { 
          errors: [{ path: [], message: `Validation error: ${error}` }] 
        } 
      };
    }
  }
};
