// oxlint-disable no-magic-numbers

import { Paragraph } from "@monorepo/components";
import { cn } from "@monorepo/utils";
import type { ImageMetadata } from "../utils/image.utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ImageInfosColumn({ infos, doReverse = false, win }: { infos: ImageMetadata; doReverse?: boolean; win?: boolean }) {
  const data = [
    { label: "name", value: infos.filename },
    { label: "size", value: formatFileSize(infos.size) },
    { label: "resolution", value: `${infos.width} × ${infos.height}` },
  ];
  return (
    <div className={cn("flex flex-col gap-2", { "opacity-50": win === false })}>
      {data.map(item => (
        <div className={cn("flex items-center gap-2", { "flex-row-reverse": doReverse })} key={item.label}>
          <Paragraph>{item.label}</Paragraph>
          <Paragraph className="rounded bg-accent px-2 font-sans">{item.value}</Paragraph>
        </div>
      ))}
    </div>
  );
}

export function ImageInfos({ leftWin, infos }: { leftWin?: boolean; infos: Array<ImageMetadata | undefined> }) {
  return (
    <div className="flex w-full justify-between">
      {infos[0] && <ImageInfosColumn infos={infos[0]} win={leftWin} />}
      {infos[1] && <ImageInfosColumn doReverse infos={infos[1]} win={leftWin === false} />}
    </div>
  );
}
