"use client";

import { useSession } from "next-auth/react";
import { FC } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ServerActionResponse } from "../common/server-action-response";
import { Button, dsButtonPrimary } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LoadingIndicator } from "../ui/loading";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  addOrUpdatePersona,
  personaStore,
  usePersonaState,
} from "./persona-store";

interface Props {}

export const AddNewPersona: FC<Props> = (props) => {
  const initialState: ServerActionResponse | undefined = undefined;

  const { isOpened, persona } = usePersonaState();

  const [formState, formAction] = useFormState(
    addOrUpdatePersona,
    initialState
  );

  const { data } = useSession();

  const PublicSwitch = () => {
    if (data === undefined || data === null) return null;

    if (data?.user?.isAdmin) {
      return (
        <div className="flex items-center space-x-2">
          <Switch name="isPublished" defaultChecked={persona.isPublished} />
          <Label htmlFor="description" className="font-medium">Publish</Label>
        </div>
      );
    }
  };

  return (
    <Sheet
      open={isOpened}
      onOpenChange={(value) => {
        personaStore.updateOpened(value);
      }}
    >
      <SheetContent 
        className="min-w-[480px] sm:w-[540px] border-l-2 rounded-xs" 
        data-slot="add-persona-sheet"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{persona.id ? "Edit Persona" : "Create Persona"}</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex-1 flex flex-col">
          <ScrollArea
            className="flex-1 -mx-6 flex max-h-[calc(100vh-140px)]"
            type="always"
          >
            <div className="pb-6 px-6 flex gap-6 flex-col flex-1">
              <input type="hidden" name="id" defaultValue={persona.id} />
              {formState && formState.status === "OK" ? null : (
                <>
                  {formState &&
                    formState.errors.map((error, index) => (
                      <div key={index} className="text-red-500 bg-destructive/10 p-3 rounded-xs border border-destructive">
                        {error.message}
                      </div>
                    ))}
                </>
              )}
              <div className="grid gap-2">
                <Label className="font-medium">Name</Label>
                <Input
                  type="text"
                  required
                  name="name"
                  defaultValue={persona.name}
                  placeholder="Name of your persona"
                  className="rounded-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium">Short description</Label>
                <Input
                  type="text"
                  required
                  defaultValue={persona.description}
                  name="description"
                  placeholder="Short description"
                  className="rounded-xs"
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor="personaMessage" className="font-medium">Personality</Label>
                <Textarea
                  className="min-h-[300px] rounded-xs"
                  required
                  defaultValue={persona.persona_message}
                  name="personaMessage"
                  placeholder="Personality of your persona"
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="py-4 flex sm:justify-between flex-row border-t border-border">
            <PublicSwitch /> 
            <Submit />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

function Submit() {
  const status = useFormStatus();
  return (
    <Button 
      disabled={status.pending} 
      className={`${dsButtonPrimary} gap-2`}
      data-slot="submit-button"
    >
      <LoadingIndicator isLoading={status.pending} />
      Save
    </Button>
  );
}
