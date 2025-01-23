"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";

import { getCurrentUser, userHashedId } from "@/features/auth-page/helpers";
import { UpsertChatThread } from "@/features/chat-page/chat-services/chat-thread-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatThreadModel,
} from "@/features/chat-page/chat-services/models";
import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import { uniqueId } from "@/features/common/util";
import {
  PERSONA_ATTRIBUTE,
  PersonaModel,
  PersonaModelSchema,
} from "./models";

interface PersonaInput {
  name: string;
  description: string;
  personaMessage: string;
  isPublished: boolean;
}


export const FindPersonaByID = async (
  id: string
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const query = `
      SELECT * FROM personas
      WHERE type = $1 AND id = $2;
    `;
    const values = [PERSONA_ATTRIBUTE, id];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Persona not found",
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
          message: `Error creating persona: ${error}`,
        },
      ],
    };
  }
};

export const CreatePersona = async (
  props: PersonaInput
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const user = await getCurrentUser();

    const modelToSave: PersonaModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      persona_message: props.personaMessage,
      isPublished: user.isAdmin ? props.isPublished : false,
      user_id: await userHashedId(),
      created_at: new Date(),
      type: PERSONA_ATTRIBUTE,
    };

    const valid = ValidateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const query = `
      INSERT INTO personas (id, name, description, persona_message, is_published, user_id, created_at, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      modelToSave.id,
      modelToSave.name,
      modelToSave.description,
      modelToSave.persona_message,
      modelToSave.isPublished,
      modelToSave.user_id,
      modelToSave.created_at,
      modelToSave.type,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: rows[0],
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating persona",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating persona: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePersonaOperation = async (
  personaId: string
): Promise<ServerActionResponse<PersonaModel>> => {
  const personaResponse = await FindPersonaByID(personaId);
  const currentUser = await getCurrentUser();
  const hashedId = await userHashedId();
 
  if (personaResponse.status === "OK") {    
    if (currentUser.isAdmin || personaResponse.response.user_id === hashedId) {
     
      return personaResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Persona not found with id: ${personaId}`,
      },
    ],
  };
};

export const DeletePersona = async (
  personaId: string
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const personaResponse = await EnsurePersonaOperation(personaId);

    if (personaResponse.status === "OK") {
      const query = `
        DELETE FROM personas
        WHERE id = $1
        RETURNING *;
      `;
      const values = [personaId];

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
            message: "Error deleting persona",
          },
        ],
      };
    }

    return personaResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting persona: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPersona = async (
  personaInput: PersonaModel
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const personaResponse = await EnsurePersonaOperation(personaInput.id);

    if (personaResponse.status === "OK") {
      const { response: persona } = personaResponse;
      const user = await getCurrentUser();

      console.log(personaInput);

      const modelToUpdate: PersonaModel = {
        ...persona,
        name: personaInput.name,
        description: personaInput.description,
        persona_message: personaInput.persona_message,
        isPublished: user.isAdmin
          ? personaInput.isPublished
          : persona.isPublished,
        created_at: new Date(),
      };

      const validationResponse = ValidateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      const query = `
        INSERT INTO personas (id, name, description, persona_message, is_published, user_id, created_at, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            persona_message = EXCLUDED.persona_message,
            is_published = EXCLUDED.is_published,
            user_id = EXCLUDED.user_id,
            created_at = EXCLUDED.created_at
        RETURNING *;
      `;
      const values = [
        modelToUpdate.id,
        modelToUpdate.name,
        modelToUpdate.description,
        modelToUpdate.persona_message,
        modelToUpdate.isPublished,
        modelToUpdate.user_id,
        modelToUpdate.created_at,
        modelToUpdate.type,
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
            message: "Error updating persona",
          },
        ],
      };
    }

    return personaResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating persona: ${error}`,
        },
      ],
    };
  }
};

export const FindAllPersonaForCurrentUser = async (): Promise<
  ServerActionResponse<Array<PersonaModel>>
> => {
  try {
    const query = `
      SELECT * FROM personas
      WHERE type = $1 AND (is_published = $2 OR user_id = $3)
      ORDER BY created_at DESC;
    `;
    const values = [PERSONA_ATTRIBUTE, true, await userHashedId()];

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
          message: `Error finding personas: ${error}`,
        },
      ],
    };
  }
};

export const CreatePersonaChat = async (
  personaId: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  const personaResponse = await FindPersonaByID(personaId);
  const user = await getCurrentUser();

  if (personaResponse.status === "OK") {
    const persona = personaResponse.response;

    const response = await UpsertChatThread({
      name: persona.name,
      useName: user.name,
      userId: await userHashedId(),
      id: "",
      createdAt: new Date(),
      lastMessageAt: new Date(),
      bookmarked: false,
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
      personaMessage: persona.persona_message,
      personaMessageTitle: persona.name,
      extension: [],
    });

    return response;
  }
  return personaResponse;
};

const ValidateSchema = (model: PersonaModel): ServerActionResponse => {
  const validatedFields = PersonaModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
