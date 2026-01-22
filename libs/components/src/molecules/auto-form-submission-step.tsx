import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../atoms/tooltip";
import { Title } from "../atoms/typography";
import { IconError } from "../icons/icon-error";
import { IconSuccess } from "../icons/icon-success";
import { IconTooltip } from "../icons/icon-tooltip";
import { IconWarning } from "../icons/icon-warning";
import { cn } from "../shadcn/utils";
import type { AutoFormSubmissionStepProps } from "./auto-form.types";

const statusConfig = {
  error: { color: "text-destructive", icon: <IconError />, title: "Error" },
  loading: { color: "text-inherit", icon: undefined, title: "Please wait..." },
  success: { color: "text-success", icon: <IconSuccess />, title: "Success" },
  "unknown-error": { color: "text-destructive", icon: <IconError />, title: "Unknown error" },
  warning: { color: "text-warning", icon: <IconWarning />, title: "Warning" },
} as const;

export function AutoFormSubmissionStep({ status, detailsList = [], tooltipDetailsList = [], children }: AutoFormSubmissionStepProps) {
  const { title, icon, color } = statusConfig[status];
  return (
    <div className="grid gap-4" data-testid={`app-status-${status}`}>
      <Title className={cn("flex items-center gap-3", color)} level={1}>
        {icon}
        {title}
        {tooltipDetailsList.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger name="details-list">
                <IconTooltip />
              </TooltipTrigger>
              <TooltipContent>
                <ul className="ml-6 list-disc">
                  {tooltipDetailsList.map(detail => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Title>
      {children}
      {detailsList.length > 0 && (
        <ul className="ml-6 list-disc">
          {detailsList.map(detail => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
