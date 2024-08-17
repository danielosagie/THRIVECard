import React from 'react';
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradient: string;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  gradient, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <Button 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        backgroundImage: gradient,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

export default GradientButton;