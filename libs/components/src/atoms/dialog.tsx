import type { ComponentProps } from "react";
import { DialogContent as ShadDialogContent, DialogTitle as ShadDialogTitle } from "../shadcn/dialog";
import { type NameProp, testIdFromProps } from "./form.utils";

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "../shadcn/dialog";

type DialogContentProps = ComponentProps<typeof ShadDialogContent> & NameProp;

export function DialogContent({ ...props }: DialogContentProps) {
  return <ShadDialogContent data-testid={testIdFromProps("dialog-content", props)} {...props} />;
}

type DialogTitleProps = ComponentProps<typeof ShadDialogTitle>;

export function DialogTitle({ ...props }: DialogTitleProps) {
  return <ShadDialogTitle data-testid="dialog-title" {...props} />;
}
