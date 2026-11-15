import { Loader2 } from 'lucide-react';

/** Full-screen loader, identical to the prototype's RootShell fallback ("Đang tải dashboard..."). */
export function PortalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-bold text-slate-500">
      <Loader2 className="mr-2 animate-spin" size={18} />
      Đang tải dashboard...
    </div>
  );
}
