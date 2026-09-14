import { cn } from "@/lib/utils"

function Spinner({ className, size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-5 w-5",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("relative inline-block", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-muted/30" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
    </div>
  )
}

function LoadingSpinner({ message, className, size = "default" }: { message?: string; className?: string; size?: "sm" | "default" | "lg" }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Spinner size={size} />
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  )
}

function LoadingOverlay({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <LoadingSpinner message={message} />
    </div>
  )
}

export { Spinner, LoadingSpinner, LoadingOverlay }
