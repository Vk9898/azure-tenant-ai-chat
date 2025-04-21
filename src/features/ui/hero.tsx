import { Button } from "@/features/ui/button";
import { FC, ReactNode } from "react";

interface HeroProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export const Hero: FC<HeroProps> = ({ title, description, children }) => {
  return (
    <section className="bg-primary/5 border-b border-border py-8 md:py-12">
      <div className="container max-w-4xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
            {title}
          </h1>
          
          {description && (
            <p className="text-lg text-muted-foreground mb-6">
              {description}
            </p>
          )}
          
          {children && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
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
      className="flex flex-col gap-3 h-auto py-4 px-4 items-start text-start justify-start border-2 rounded-xs w-full sm:w-auto"
      onClick={props.onClick}
      uppercase={false}
    >
      <span className="flex gap-2 items-center font-bold">
        {props.icon}
        <span>{props.title}</span>
      </span>

      <span className="text-muted-foreground whitespace-break-spaces font-normal">
        {props.description}
      </span>
    </Button>
  );
};
