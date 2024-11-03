import React from "react";
import { cn } from "@/lib/utils";

const LoadingScreen = ({ className }) => {
  return (
    <div className={cn("flex items-center justify-center h-screen", className)}>
      <div
        className="animate-spin inline-block w-16 h-16 border-[3px] border-current border-t-transparent text-primary rounded-full"
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  );
};

export default LoadingScreen;
