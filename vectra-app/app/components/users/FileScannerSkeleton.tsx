export default function FileScannerSkeleton() {
  return (
    <div className="w-full flex justify-center mt-6 animate-pulse">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border-2 border-dashed border-foreground/10 bg-foreground/5 p-12 text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="h-12 w-12 bg-foreground/10 rounded-xl mb-4"></div>
          <div className="h-5 w-48 bg-foreground/10 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-foreground/10 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
