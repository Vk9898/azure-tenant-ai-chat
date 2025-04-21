import { refineFromEmpty } from "@/components/common/schema-validation";

export const PERSONA_ATTRIBUTE = "PERSONA";

// Define types using TypeScript interfaces
export interface PersonaModel {
  id: string;
  user_id: string;
  name: string;
  description: string;
  persona_message: string;
  isPublished: boolean;
  type: typeof PERSONA_ATTRIBUTE;
  created_at: Date;
}

// Simple validation schema for TypeScript
export const PersonaModelSchema = {
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

      if (!data.persona_message || data.persona_message.trim() === '') {
        return { 
          success: false, 
          error: { 
            errors: [{ path: ['persona_message'], message: 'System message cannot be empty' }] 
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
