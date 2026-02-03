import type { ReactNode } from "react";
import { Button } from "../atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../atoms/dialog";
import { Spinner } from "../atoms/spinner";

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  children?: ReactNode;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Dialog data-testid="radio-modal" onOpenChange={props.onCancel} open={props.isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid="modal-title">{props.title}</DialogTitle>
          <DialogDescription data-testid="modal-description">{props.description}</DialogDescription>
        </DialogHeader>
        {props.children}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={props.loading}
              name="modal-cancel"
              onClick={props.onCancel}
              type="button"
              variant="secondary"
            >
              {props.loading ? <Spinner /> : undefined}
              {props.cancel}
            </Button>
          </DialogClose>
          <Button disabled={props.loading} name="modal-confirm" onClick={props.onConfirm} type="button">
            {props.loading ? <Spinner /> : undefined}
            {props.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
