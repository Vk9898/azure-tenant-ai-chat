"use server";

import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/components/common/server-action-response";
import {
  PROMPT_ATTRIBUTE,
  PromptModel,
  PromptModelSchema,
} from "@/components/prompt-page-components/models";
import { getCurrentUser, userHashedId } from "@/lib/auth/auth-helpers";
import { NeonDBInstance } from "@/lib/db/neondb";
import { uniqueId } from "@/components/common/util";


export const CreatePrompt = async (
  props: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const user = await getCurrentUser();
    const hashedId = await userHashedId();

    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: `Unable to create prompt - admin role required.`,
          },
        ],
      };
    }
    
    if (!hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: "User identification required",
          },
        ],
      };
    }

    const modelToSave: PromptModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      isPublished: user.isAdmin ? props.isPublished : false,
      userId: hashedId,
      createdAt: new Date(),
      type: PROMPT_ATTRIBUTE,
    };

    const valid = validateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const query = `
      INSERT INTO prompts (id, name, description, is_published, user_id, created_at, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      modelToSave.id,
      modelToSave.name,
      modelToSave.description,
      modelToSave.isPublished,
      modelToSave.userId,
      modelToSave.createdAt,
      modelToSave.type,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: rows[0] as PromptModel,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating prompt",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating prompt: ${error}`,
        },
      ],
    };
  }
};

// For regular authenticated users - provides access to published prompts and their own
export const FindAllPublishedPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const hashedId = await userHashedId();
    
    if (!hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: "User identification required",
          },
        ],
      };
    }
    
    const query = `
      SELECT * FROM prompts
      WHERE type = $1 AND (is_published = $2 OR user_id = $3)
      ORDER BY created_at DESC;
    `;
    const values = [PROMPT_ATTRIBUTE, true, hashedId];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows as PromptModel[],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompts: ${error}`,
        },
      ],
    };
  }
};

// For admin-only access to all prompts
export const FindAllPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const user = await getCurrentUser();

    // Return unauthorized if user is not an admin
    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: "Admin access required",
          },
        ],
      };
    }
    
    const query = `
      SELECT * FROM prompts
      WHERE type = $1;
    `;
    const values = [PROMPT_ATTRIBUTE];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows as PromptModel[],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompts: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePromptOperation = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  const promptResponse = await FindPromptByID(promptId);
  const currentUser = await getCurrentUser();

  if (promptResponse.status === "OK") {
    if (currentUser.isAdmin) {
      return promptResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Prompt not found with id: ${promptId}`,
      },
    ],
  };
};

export const DeletePrompt = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptId);

    if (promptResponse.status === "OK") {
      const query = `
        DELETE FROM prompts
        WHERE id = $1
        RETURNING *;
      `;
      const values = [promptId];

      const sql = await NeonDBInstance();
      const rows = await sql(query, values);

      if (rows.length > 0) {
        return {
          status: "OK",
          response: rows[0] as PromptModel,
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: "Error deleting prompt",
          },
        ],
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindPromptByID = async (
  id: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const query = `
      SELECT * FROM prompts
      WHERE type = $1 AND id = $2;
    `;
    const values = [PROMPT_ATTRIBUTE, id];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Prompt not found",
          },
        ],
      };
    }

    return {
      status: "OK",
      response: rows[0] as PromptModel,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding prompt: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPrompt = async (
  promptInput: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptInput.id);

    if (promptResponse.status === "OK") {
      const { response: prompt } = promptResponse;
      const user = await getCurrentUser();

      const modelToUpdate: PromptModel = {
        ...prompt,
        name: promptInput.name,
        description: promptInput.description,
        isPublished: user.isAdmin
          ? promptInput.isPublished
          : prompt.isPublished,
        createdAt: new Date(),
      };

      const validationResponse = validateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      const query = `
        INSERT INTO prompts (id, name, description, is_published, user_id, created_at, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            is_published = EXCLUDED.is_published,
            user_id = EXCLUDED.user_id,
            created_at = EXCLUDED.created_at
        RETURNING *;
      `;
      const values = [
        modelToUpdate.id,
        modelToUpdate.name,
        modelToUpdate.description,
        modelToUpdate.isPublished,
        modelToUpdate.userId,
        modelToUpdate.createdAt,
        modelToUpdate.type,
      ];

      const sql = await NeonDBInstance();
      const rows = await sql(query, values);

      if (rows.length > 0) {
        return {
          status: "OK",
          response: rows[0] as PromptModel,
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: "Error updating prompt",
          },
        ],
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating prompt: ${error}`,
        },
      ],
    };
  }
};

const validateSchema = (model: PromptModel): ServerActionResponse => {
  const validatedFields = PromptModelSchema.safeParse(model);

  if (!(validatedFields as any).success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors((validatedFields as any).error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
