import { Button } from "@/features/ui/button";
import { FC, ReactNode } from "react";

interface HeroProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
}

export const Hero: FC<HeroProps> = ({ title, description, children, icon }) => {
  return (
    <section className="bg-muted py-8 md:py-12 border-b-2 border-border">
      <div className="container px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="bg-primary/10 p-2 rounded-xs">
                {icon}
              </div>
            )}
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {children && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-4 md:mt-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface HeroButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export const HeroButton: FC<HeroButtonProps> = (props) => {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 justify-start gap-3 border-2"
      onClick={props.onClick}
      uppercase={false}
    >
      <div className="bg-primary/10 p-1.5 rounded-xs">
        {props.icon}
      </div>
      <div className="text-left">
        <div className="font-bold">{props.title}</div>
        <div className="text-xs text-muted-foreground">{props.description}</div>
      </div>
    </Button>
  );
};
