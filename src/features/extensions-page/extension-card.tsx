import { Button } from "@/features/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/features/ui/card";
import { cn } from "@/lib/utils";
import { Code, Settings, Trash } from "lucide-react";

export interface ExtensionData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

interface ExtensionCardProps {
  extension: ExtensionData;
  onSettings?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function ExtensionCard({
  extension,
  onSettings,
  onDelete,
  showActions = true,
}: ExtensionCardProps) {
  return (
    <Card 
      className={cn(
        "ds-card shadow-xs hover:shadow transition-all duration-200",
        extension.isActive ? "border-primary/30" : ""
      )}
      data-slot="extension-card"
    >
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded-xs">
                <Code className="h-4 w-4" />
              </span>
              {extension.name}
              {extension.isAdmin && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-xs font-medium uppercase ml-2">
                  Admin
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {extension.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {extension.isActive ? (
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-xs font-medium uppercase">
                Active
              </span>
            ) : (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-xs font-medium uppercase">
                Inactive
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      {showActions && (
        <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto rounded-xs font-medium"
            onClick={() => onSettings?.(extension.id)}
            data-slot="extension-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto rounded-xs font-medium"
            onClick={() => onDelete?.(extension.id)}
            data-slot="extension-delete"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 