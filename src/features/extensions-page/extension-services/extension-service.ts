"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";

import {
  getCurrentUser,
  userHashedId,
  userSession,
} from "@/features/auth-page/helpers";
import { UpsertChatThread } from "@/features/chat-page/chat-services/chat-thread-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatThreadModel,
} from "@/features/chat-page/chat-services/models";
import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import { AzureKeyVaultInstance } from "@/features/common/services/key-vault";
import { uniqueId } from "@/features/common/util";
import { AI_NAME, CHAT_DEFAULT_PERSONA } from "@/features/theme/theme-config";
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
      response: rows[0],
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
  inputModel: ExtensionModel
): Promise<ServerActionResponse<ExtensionModel>> => {
  try {
    const user = await getCurrentUser();

    inputModel.headers.forEach((h) => {
      h.id = uniqueId();
    });

    inputModel.functions.forEach((f) => {
      f.id = uniqueId();
    });

    const modelToSave: ExtensionModel = {
      id: uniqueId(),
      name: inputModel.name,
      executionSteps: inputModel.executionSteps,
      description: inputModel.description,
      isPublished: user.isAdmin ? inputModel.isPublished : false,
      userId: await userHashedId(),
      createdAt: new Date(),
      type: EXTENSION_ATTRIBUTE,
      functions: inputModel.functions,
      headers: inputModel.headers,
    };

    const validatedFields = validateSchema(modelToSave);

    if (validatedFields.status === "OK") {
      await secureHeaderValues(modelToSave);

      const query = `
        INSERT INTO extensions (id, name, execution_steps, description, is_published, user_id, created_at, type, functions, headers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        modelToSave.id,
        modelToSave.name,
        modelToSave.executionSteps,
        modelToSave.description,
        modelToSave.isPublished,
        modelToSave.userId,
        modelToSave.createdAt,
        modelToSave.type,
        JSON.stringify(modelToSave.functions),
        JSON.stringify(modelToSave.headers),
      ];

      const sql = await NeonDBInstance();
      const rows = await sql(query, values);

      if (rows.length > 0) {
        return {
          status: "OK",
          response: rows[0],
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: `Unable to add Extension`,
          },
        ],
      };
    } else {
      return validatedFields;
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error adding Extension: ${error}`,
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
          response: rows[0],
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
    const extensionResponse = await FindExtensionByID(extensionId);

    if (extensionResponse.status === "OK") {
      const extension = extensionResponse.response;

      const modelToSave: ChatThreadModel = {
        id: uniqueId(),
        name: extension.name,
        useName: (await userSession())!.name,
        userId: await userHashedId(),
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
  const extensionResponse = await FindExtensionByID(id);
  const currentUser = await getCurrentUser();
  const hashedId = await userHashedId();

  if (extensionResponse.status === "OK") {
    if (currentUser.isAdmin || extensionResponse.response.userId === hashedId) {
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
          response: rows[0],
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

export const FindAllExtensionForCurrentUser = async (): Promise<
  ServerActionResponse<Array<ExtensionModel>>
> => {
  try {
    const query = `
      SELECT * FROM extensions
      WHERE type = $1 AND (is_published = $2 OR user_id = $3)
      ORDER BY created_at DESC;
    `;
    const values = [EXTENSION_ATTRIBUTE, true, await userHashedId()];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding Extensions: ${error}`,
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
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
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
