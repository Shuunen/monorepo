import { Button } from '../atoms/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../atoms/dialog'
import { Spinner } from '../atoms/spinner'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  cancel: string
  confirm: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Dialog data-testid="radio-modal" onOpenChange={props.onCancel} open={props.isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid="modal-title">{props.title}</DialogTitle>
          <DialogDescription data-testid="modal-description">{props.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={props.loading} onClick={props.onCancel} testId="modal-button-cancel" type="button" variant="secondary">
              {props.loading ? <Spinner /> : undefined}
              {props.cancel}
            </Button>
          </DialogClose>
          <Button disabled={props.loading} onClick={props.onConfirm} testId="modal-button-confirm" type="button">
            {props.loading ? <Spinner /> : undefined}
            {props.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
