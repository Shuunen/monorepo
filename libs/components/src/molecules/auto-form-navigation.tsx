import { Button } from "../atoms/button";

type AutoFormNavigationProps = {
  leftButton?: {
    disabled?: boolean;
    onClick: () => void;
  };
  centerButton?: {
    disabled?: boolean;
    onClick: () => void;
  };
  rightButton?: {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "submit";
    name: string;
  };
};

export function AutoFormNavigation({ leftButton, centerButton, rightButton }: AutoFormNavigationProps) {
  return (
    <div className="flex justify-between gap-2 pt-6">
      {leftButton ? (
        <Button disabled={leftButton.disabled} name="step-back" onClick={leftButton.onClick} type="button" variant="outline">
          Back
        </Button>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        {centerButton && (
          <Button disabled={centerButton.disabled} name="step-cancel" onClick={centerButton.onClick} type="button" variant="outline">
            Cancel
          </Button>
        )}
        {rightButton && (
          <Button disabled={rightButton.disabled} name={rightButton.name} onClick={rightButton.onClick} type={rightButton.type || "button"}>
            {rightButton.label}
          </Button>
        )}
      </div>
    </div>
  );
}
