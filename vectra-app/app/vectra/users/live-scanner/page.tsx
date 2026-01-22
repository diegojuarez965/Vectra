import Scanner from '@/app/components/users/Scanner';

export default function LiveScannerPage() {
  return(
    <div className="flex flex-col items-center justify-center h-[85%] w-full text-white">
      <Scanner />
    </div>
  );
}