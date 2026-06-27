import { Archive as ArchiveIcon } from "lucide-react";

import { formatCount } from "@/lib/format";

/**
 * Tiny archive counter. The site's only "metric" — watching it climb is the
 * reward. Count is mocked for now; wired to the backend later.
 */
export function Stats({ count }: { count: number }) {
  return (
    <div className="text-secondary flex items-center gap-2">
      <ArchiveIcon className="size-4" />
      <span className="text-code-snippet text-secondary font-mono">
        {formatCount(count)} rejections archived
      </span>
    </div>
  );
}
