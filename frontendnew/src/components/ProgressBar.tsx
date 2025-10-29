interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
  className?: string;
}

const ProgressBar = ({ currentStep, totalSteps, stepNames, className }: ProgressBarProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Step indicators */}
      {stepNames && (
        <div className="flex justify-between mb-2">
          {stepNames.map((name, index) => (
            <div
              key={index}
              className={`text-xs font-medium ${
                index < currentStep
                  ? "text-primary"
                  : index === currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
      
      {/* Progress bar container */}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Progress text */}
      <div className="text-right mt-1">
        <span className="text-xs text-muted-foreground">
          {currentStep} of {totalSteps} completed
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;