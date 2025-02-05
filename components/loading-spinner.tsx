// components/ui/loading-spinner.tsx
export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
