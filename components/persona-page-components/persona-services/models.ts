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
  safeParse: (input: any) => {
    const errors: Array<{
      code: string;
      path: string[];
      message: string;
    }> = [];

    if (!input.name || input.name.trim() === "") {
      errors.push({
        code: "custom",
        path: ["name"],
        message: "Name is required"
      });
    }

    if (!input.description || input.description.trim() === "") {
      errors.push({
        code: "custom",
        path: ["description"],
        message: "Description is required"
      });
    }

    if (!input.persona_message || input.persona_message.trim() === "") {
      errors.push({
        code: "custom",
        path: ["persona_message"],
        message: "Persona message is required"
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          errors: errors
        }
      };
    }

    return {
      success: true,
      data: input
    };
  }
};
