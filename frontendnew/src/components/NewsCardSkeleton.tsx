import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsCardSkeletonProps {
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export const NewsCardSkeleton = ({ variant = 'default', className = '' }: NewsCardSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <Card className={`p-4 border-primary/10 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-4 flex-shrink-0 mt-2" />
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={`overflow-hidden border-primary/10 ${className}`}>
        <Skeleton className="aspect-video w-full" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`p-6 border-primary/10 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-4 flex-shrink-0 mt-2" />
      </div>
    </Card>
  );
};

export default NewsCardSkeleton; 