export default function LiveScannerSkeleton() {
  return (
    <div className="w-full flex justify-center mt-6 animate-pulse">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/5 aspect-video w-full flex items-center justify-center relative overflow-hidden">
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-foreground/10 rounded-full mb-4"></div>
            <div className="h-6 w-56 bg-foreground/10 rounded-md mb-2"></div>
            <div className="h-4 w-40 bg-foreground/10 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
