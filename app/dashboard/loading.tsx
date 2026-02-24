import React from "react";
import { Loader2Icon } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2Icon className="animate-spin text-muted-foreground" size={48} />
    </div>
  );
}
