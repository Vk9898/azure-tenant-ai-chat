import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetTitle } from "@/components/ui/sheet";
import { KeyRound, Plus, Trash } from "lucide-react";
import { FC } from "react";
import { HeaderModel } from "../extension-services/models";
import { extensionStore, useExtensionState } from "../extension-store";

interface Props {
  header: HeaderModel;
}

export const EndpointHeaderRow: FC<Props> = (props) => {
  return (
    <div className="flex gap-2">
      <input
        id={`header-id-${props.header.id}`}
        type="hidden"
        name={`header-id[]`}
        value={props.header.id}
      />
      <Input
        id={`header-key-${props.header.id}`}
        placeholder="key"
        className="flex-1 rounded-xs"
        name={`header-key[]`}
        required
        defaultValue={props.header.key}
      />
      <Input
        id={`header-value-${props.header.id}`}
        name={`header-value[]`}
        placeholder="value"
        className="flex-1 rounded-xs"
        required
        defaultValue={props.header.value}
      />
      <Button
        variant={"outline"}
        size={"icon"}
        type="button"
        onClick={() =>
          extensionStore.removeHeader({
            headerId: props.header.id,
          })
        }
        aria-label="Remove this header"
        className="rounded-xs"
      >
        <Trash size={18} />
      </Button>
    </div>
  );
};

export const EndpointHeaderTitle = () => {
  return (
    <div className="flex gap-2">
      <Label className="text-muted-foreground flex-1">Key</Label>
      <Label className="text-muted-foreground flex-1">Value</Label>
      <Label className="text-muted-foreground w-10"> </Label>
    </div>
  );
};

export const EndpointHeader = () => {
  const { extension } = useExtensionState();
  const { headers } = extension;
  return (
    <div className="flex flex-col gap-4 bg-foreground/[0.02] border-2 p-4 sm:p-6 rounded-xs shadow-xs" data-slot="endpoint-headers">
      <div className="flex justify-between items-center gap-2">
        <SheetTitle>Headers</SheetTitle>
        <Button
          type="button"
          className="flex gap-2 rounded-xs uppercase font-bold"
          variant={"outline"}
          onClick={() =>
            extensionStore.addEndpointHeader({
              key: "",
              value: "",
            })
          }
        >
          <Plus size={18} /> Add Header
        </Button>
      </div>
      <Alert className="text-xs rounded-xs">
        <KeyRound size={18} />
        <AlertTitle>Secure header values</AlertTitle>
        <AlertDescription className="text-xs">
          Header values are stored and retrieved from Azure Key Vault
        </AlertDescription>
      </Alert>
      <EndpointHeaderTitle />
      {headers.map((header, index) => (
        <div className="grid gap-2" key={header.id}>
          <EndpointHeaderRow header={header} />
        </div>
      ))}
    </div>
  );
};
