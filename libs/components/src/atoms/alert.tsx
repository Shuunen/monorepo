import { type ReactNode, useMemo, useState } from "react";
import { IconError } from "../icons/icon-error";
import { IconSuccess } from "../icons/icon-success";
import { IconTooltip } from "../icons/icon-tooltip";
import { IconWarning } from "../icons/icon-warning";
import { IconX } from "../icons/icon-x";
import { AlertDescription, AlertTitle, Alert as ShadAlert } from "../shadcn/alert";
import { cn } from "../shadcn/utils";
import { Button } from "./button";

type AlertProps = {
  /**
   * The content / description / message of the alert
   */
  children?: ReactNode;
  /**
   * When `true` shows a close button to acknowledge/discard the alert
   */
  closable?: boolean;
  /**
   * The title of the alert, optional, will display "type" if no title provided
   * @example `title="Something went wrong"`
   */
  title?: string;
  /**
   * The type of the alert will impact it's visual aspect : color, icon, ...
   */
  type: "success" | "warning" | "error" | "info";
};

// oxlint-disable-next-line max-lines-per-function
export function Alert({ type, title, children, closable }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const content = useMemo(() => {
    if (type === "info") {
      return {
        icon: <IconTooltip />,
        title: title ?? "Info",
      };
    }

    if (type === "success") {
      return {
        classes: cn("text-success"),
        icon: <IconSuccess />,
        title: title ?? "Success",
      };
    }

    if (type === "warning") {
      return {
        classes: cn("text-warning"),
        icon: <IconWarning />,
        title: title ?? "Warning",
      };
    }

    return {
      classes: cn("text-destructive"),
      icon: <IconError />,
      title: title ?? "Error",
      variant: "destructive",
    } as const;
  }, [type, title]);

  if (!isVisible) {
    return;
  }

  return (
    <ShadAlert className={content.classes} data-testid={`alert-${type}`} variant={content.variant}>
      {content.icon}
      <AlertTitle>
        <strong>{content.title}</strong>
      </AlertTitle>
      {closable && (
        <Button
          className="absolute top-2 right-2"
          name={`alert-${type}-close`}
          onClick={() => {
            setIsVisible(false);
          }}
          variant="ghost"
        >
          <IconX />
        </Button>
      )}
      {children && <AlertDescription className={content.classes}>{children}</AlertDescription>}
    </ShadAlert>
  );
}
