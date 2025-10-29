import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AInodeVerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const AInodeVerifiedBadge = ({ 
  size = "md", 
  className,
  showText = true 
}: AInodeVerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium",
        sizeClasses[size],
        className
      )}
    >
      <CheckCircle className={iconSizes[size]} />
      {showText && <span>AInode Verified</span>}
    </div>
  );
};

export default AInodeVerifiedBadge;
