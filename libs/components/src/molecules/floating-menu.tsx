import { cn } from "@monorepo/utils";
// oxlint-disable-next-line no-restricted-imports
import { LoaderCircleIcon, type LucideProps, PackageIcon, PackageOpenIcon } from "lucide-react";
import { createElement, type ForwardRefExoticComponent, type RefAttributes, useEffect, useMemo, useState } from "react";
import { Command, CommandEmpty, CommandItem, CommandList } from "../atoms/command";
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/popover";

export type FloatingMenuAction = {
  disabled?: boolean;
  handleClick: () => void;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  name: string;
};

// oxlint-disable-next-line max-lines-per-function
export function FloatingMenu({
  actions = [],
  isLoading = false,
  isSettingsRequired = false,
}: Readonly<{ actions: FloatingMenuAction[]; isLoading?: boolean; isSettingsRequired?: boolean }>) {
  const [isOpen, setOpen] = useState(false);
  const iconOpen = isOpen ? <PackageOpenIcon /> : <PackageIcon />;
  const icon = useMemo(() => (isLoading ? <LoaderCircleIcon /> : iconOpen), [iconOpen, isLoading]);
  // oxlint-disable-next-line max-nested-callbacks
  const availableActions = useMemo(
    () => (isSettingsRequired ? actions.filter(action => ["Home", "Settings"].includes(action.name)) : actions),
    [actions, isSettingsRequired],
  );
  useEffect(() => {
    setOpen(false);
  }, []);
  return (
    <>
      {isOpen && (
        <div
          className="fixed right-0 bottom-0 z-10 size-full bg-black/20 bg-linear-to-tl"
          data-component="speed-dial-backdrop"
        />
      )}
      <Popover onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "fixed right-5 bottom-5 cursor-pointer rounded-full bg-primary p-4 transition-all",
            isSettingsRequired ? "animate-pulse" : "opacity-50 hover:opacity-100",
          )}
        >
          {icon}
        </PopoverTrigger>
        <PopoverContent className="mr-5 mb-2 w-fit p-1">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {/* <CommandItem>Profile</CommandItem> */}
              {availableActions.map(action => (
                <CommandItem
                  className="cursor-pointer text-lg"
                  disabled={action.disabled}
                  key={action.name}
                  onSelect={action.handleClick}
                >
                  {createElement(action.icon, { className: "size-5" })}
                  {action.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
