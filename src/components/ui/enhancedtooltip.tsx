import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

const EnhancedTooltip = ({ label, tooltip, children }) => {
  return (
    <TooltipProvider delayDuration={100}> {/* Reduced delay for faster appearance */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Label htmlFor={label} className="flex items-center cursor-help"> {/* Added cursor-help class */}
            {label} <span className="ml-1 text-gray-400">ⓘ</span>
          </Label>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded shadow-lg">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EnhancedTooltip;