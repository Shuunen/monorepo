import { cn } from "@monorepo/utils";
import { Loader2Icon } from "lucide-react";

export function IconLoading({ className }: { className?: string }) {
  return <Loader2Icon className={cn(`size-4 animate-spin`, className)} />;
}
