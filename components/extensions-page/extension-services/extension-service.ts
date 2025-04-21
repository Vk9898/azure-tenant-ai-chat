"use server";
import { NeonDBInstance } from "@/lib/db/neondb";

import {
  getCurrentUser,
  userHashedId,
  userSession,
} from "@/lib/auth/auth-helpers";
import { UpsertChatThread } from "@/components/chat-page/chat-services/chat-thread-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatThreadModel,
} from "@/components/chat-page/chat-services/models";
import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/components/common/server-action-response";
import { AzureKeyVaultInstance } from "@/components/common/services/key-vault";
import { uniqueId } from "@/components/common/util";
import { AI_NAME, CHAT_DEFAULT_PERSONA } from "@/components/theme/theme-config";
import {
  EXTENSION_ATTRIBUTE,
  ExtensionModel,
  ExtensionModelSchema,
} from "./models";

const KEY_VAULT_MASK = "**********";

export const FindExtensionByID = async (
  id: string
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const query = `
      SELECT * FROM extensions
      WHERE type = $1 AND id = $2;
    `;
    const values = [EXTENSION_ATTRIBUTE, id];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: `Extension not found with id: ${id}`,
          },
        ],
      };
    }

    return {
      status: "OK",
      response: rows[0] as ExtensionModel,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding Extension: ${error}`,
        },
      ],
    };
  }
};

export const CreateExtension = async (
  extension: ExtensionModel
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const user = await getCurrentUser();
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

    const modelToSave: ExtensionModel = {
      id: uniqueId(),
      name: extension.name,
      functions: extension.functions,
      description: extension.description,
      executionSteps: extension.executionSteps || "",
      headers: extension.headers,
      isPublished: user.isAdmin ? extension.isPublished : false,
      userId: hashedId,
      createdAt: new Date(),
      type: EXTENSION_ATTRIBUTE,
    };

    modelToSave.functions.forEach((func) => {
      if (!func.id) {
        func.id = uniqueId();
      }
    });

    modelToSave.headers.forEach((header) => {
      if (!header.id) {
        header.id = uniqueId();
      }
    });

    const valid = validateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    //create id for each parameter
    const updatedExtension = await secureHeaderValues(modelToSave);

    const query = `
      INSERT INTO extensions (id, name, functions, description, execution_steps, headers, is_published, user_id, created_at, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      updatedExtension.id,
      updatedExtension.name,
      JSON.stringify(updatedExtension.functions),
      updatedExtension.description,
      updatedExtension.executionSteps,
      JSON.stringify(updatedExtension.headers),
      updatedExtension.isPublished,
      updatedExtension.userId,
      updatedExtension.createdAt,
      updatedExtension.type,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: {
          ...rows[0],
          functions: rows[0].functions,
          headers: rows[0].headers,
        } as ExtensionModel,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating extension",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating extension: ${error}`,
        },
      ],
    };
  }
};

export const UpdateExtension = async (
  inputModel: ExtensionModel
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const extensionResponse = await EnsureExtensionOperation(inputModel.id);
    const user = await getCurrentUser();

    if (extensionResponse.status === "OK") {
      const existingExtension = extensionResponse.response;

      inputModel.isPublished = user.isAdmin
        ? inputModel.isPublished
        : existingExtension.isPublished;

      const updatedModel: ExtensionModel = {
        ...existingExtension,
        name: inputModel.name,
        executionSteps: inputModel.executionSteps,
        description: inputModel.description,
        isPublished: inputModel.isPublished,
        functions: inputModel.functions,
        headers: inputModel.headers,
      };

      const validationResponse = validateSchema(updatedModel);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      await secureHeaderValues(updatedModel);

      const query = `
        UPDATE extensions
        SET name = $2,
            execution_steps = $3,
            description = $4,
            is_published = $5,
            functions = $6,
            headers = $7
        WHERE id = $1
        RETURNING *;
      `;
      const values = [
        updatedModel.id,
        updatedModel.name,
        updatedModel.executionSteps,
        updatedModel.description,
        updatedModel.isPublished,
        JSON.stringify(updatedModel.functions),
        JSON.stringify(updatedModel.headers),
      ];

      const sql = await NeonDBInstance();
      const rows = await sql(query, values);

      if (rows.length > 0) {
        return {
          status: "OK",
          response: rows[0] as ExtensionModel,
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: `Error updating Extension`,
          },
        ],
      };
    }

    return extensionResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating Extension: ${error}`,
        },
      ],
    };
  }
};

export const CreateChatWithExtension = async (
  extensionId: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const user = await getCurrentUser();
    const hashedId = await userHashedId();
    
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
    
    const extensionResponse = await FindExtensionByID(extensionId);

    if (extensionResponse.status === "OK") {
      const extension = extensionResponse.response;
      
      const session = await userSession();
      if (!session) {
        return {
          status: "UNAUTHORIZED",
          errors: [
            {
              message: "User session required",
            },
          ],
        };
      }

      const modelToSave: ChatThreadModel = {
        id: uniqueId(),
        name: extension.name,
        useName: session.name || "User",
        userId: hashedId,
        createdAt: new Date(),
        lastMessageAt: new Date(),
        bookmarked: false,
        isDeleted: false,
        type: CHAT_THREAD_ATTRIBUTE,
        personaMessage: "",
        personaMessageTitle: extension.name,
        extension: [extension.id],
      };

      const upsertResponse = await UpsertChatThread(modelToSave);

      return upsertResponse;
    }

    return {
      status: "ERROR",
      errors: extensionResponse.errors,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating chat with extension: ${error}`,
        },
      ],
    };
  }
};

const secureHeaderValues = async (extension: ExtensionModel) => {
  const vault = AzureKeyVaultInstance();

  const headers = extension.headers.map(async (h) => {
    if (h.value !== KEY_VAULT_MASK) {
      await vault.setSecret(h.id, h.value);
      h.value = KEY_VAULT_MASK;
    }

    return h;
  });

  await Promise.all(headers);

  return extension;
};

export const EnsureExtensionOperation = async (
  id: string
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const extensionResponse = await FindExtensionByID(id);
    const currentUser = await getCurrentUser();
    const hashedId = await userHashedId();

    if (extensionResponse.status === "OK") {
      if (currentUser.isAdmin || (hashedId && extensionResponse.response.userId === hashedId)) {
        return extensionResponse;
      }
    }

    return {
      status: "UNAUTHORIZED",
      errors: [
        {
          message: `Extension not found with id: ${id}`,
        },
      ],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error accessing extension: ${error}`,
        },
      ],
    };
  }
};

export const FindSecureHeaderValue = async (
  headerId: string
): Promise<ServerActionResponse<string>> => {
  try {
    const vault = AzureKeyVaultInstance();
    const secret = await vault.getSecret(headerId);

    if (secret.value) {
      return {
        status: "OK",
        response: secret.value,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding secret for header ID: ${headerId}`,
        },
      ],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding secure header value: ${error}`,
        },
      ],
    };
  }
};

export const DeleteExtension = async (
  id: string
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const extensionResponse = await EnsureExtensionOperation(id);

    if (extensionResponse.status === "OK") {
      const vault = AzureKeyVaultInstance();
      const promises = extensionResponse.response.headers.map(async (h) => {
        await vault.beginDeleteSecret(h.id);
      });
      await Promise.all(promises);

      const query = `
        DELETE FROM extensions
        WHERE id = $1
        RETURNING *;
      `;
      const values = [id];

      const sql = await NeonDBInstance();
      const rows = await sql(query, values);

      if (rows.length > 0) {
        return {
          status: "OK",
          response: rows[0] as ExtensionModel,
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: `Error deleting Extension`,
          },
        ],
      };
    }

    return extensionResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting Extension: ${error}`,
        },
      ],
    };
  }
};

export const FindAllExtensionsForCurrentUser = async (): Promise<
  ServerActionResponse<Array<ExtensionModel>>
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
      SELECT * FROM extensions
      WHERE type = $1 AND (is_published = $2 OR user_id = $3)
      ORDER BY created_at DESC;
    `;
    const values = [EXTENSION_ATTRIBUTE, true, hashedId];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows as ExtensionModel[],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding extensions: ${error}`,
        },
      ],
    };
  }
};

export const FindAllExtensionsForAdmin = async (): Promise<
  ServerActionResponse<Array<ExtensionModel>>
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
      SELECT * FROM extensions
      WHERE type = $1
      ORDER BY created_at DESC;
    `;
    const values = [EXTENSION_ATTRIBUTE];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows as ExtensionModel[],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding extensions: ${error}`,
        },
      ],
    };
  }
};

const validateSchema = (model: ExtensionModel): ServerActionResponse => {
  const validatedFields = ExtensionModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error?.errors ?? []),
    };
  }

  return validateFunctionSchema(model);
};

const validateFunctionSchema = (
  model: ExtensionModel
): ServerActionResponse => {
  let functionNames: string[] = [];

  for (let i = 0; i < model.functions.length; i++) {
    const f = model.functions[i];
    try {
      const functionSchema = JSON.parse(f.code);
      const name = functionSchema.name;
      const findName = functionNames.find((n) => n === name);

      if (!name || name.includes(" ")) {
        return {
          status: "ERROR",
          errors: [
            {
              message: `Function name is required and cannot contain spaces.`,
            },
          ],
        };
      }

      if (findName) {
        return {
          status: "ERROR",
          errors: [
            {
              message: `Function name ${name} is already used. Please use a different name.`,
            },
          ],
        };
      } else {
        functionNames.push(name);
      }
    } catch (error) {
      return {
        status: "ERROR",
        errors: [
          {
            message: `Error validating function schema: ${error}. You can use ${AI_NAME} to generate a valid schema for your function.`,
          },
        ],
      };
    }
  }

  if (functionNames.length === 0) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `At least one function is required.`,
        },
      ],
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
