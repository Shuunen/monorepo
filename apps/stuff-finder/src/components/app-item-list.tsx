import { useCallback, useRef, useState } from "react";
import type { Item } from "../types/item.types";
import type { Display } from "../types/theme.types";
import { state, watchState } from "../utils/state.utils";
import { AppItemListEntry } from "./app-item-list-entry";

type Props = Readonly<{
  display?: Display;
  items: Item[];
  loadingItemIds?: Item["$id"][];
  onSelection?: (items: Item[]) => void;
  showPrice?: boolean;
}>;

export function AppItemList(props: Props) {
  const [display, setDisplay] = useState<Display>(props.display ?? state.display);
  // handle selection
  const [, setSelection] = useState<Item[]>([]);
  const selectionRef = useRef<Item[]>([]);
  const onSelect = useCallback(
    (item: Item, isSelected: boolean) => {
      if (props.onSelection === undefined) return;
      const currentSelection = selectionRef.current;
      const newSelection = isSelected ? [...currentSelection, item] : currentSelection.filter(data => data.$id !== item.$id);
      selectionRef.current = newSelection;
      setSelection(newSelection);
      props.onSelection(newSelection);
    },
    [props.onSelection, props],
  );
  // watch display state if not provided
  if (props.display === undefined)
    watchState("display", () => {
      setDisplay(state.display);
    });
  return (
    <nav aria-label="item list" className="mb-20 overflow-x-hidden overflow-y-auto md:mb-0" data-component="item-list">
      <div className={`grid grid-cols-1 bg-gray-100 ${display === "list" ? "" : "xs:grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-5 sm:p-5"}`} data-type="list">
        {props.items.map(item => (
          <AppItemListEntry display={display} isLoading={props.loadingItemIds?.includes(item.$id)} item={item} key={item.$id} onSelect={props.onSelection ? onSelect : undefined} showPrice={props.showPrice} />
        ))}
      </div>
    </nav>
  );
}
