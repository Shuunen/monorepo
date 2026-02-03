import { sleep } from "@monorepo/utils";
import Print from "@mui/icons-material/Print";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppBarcode } from "../components/app-barcode";
import { AppPageCard } from "../components/app-page-card";
import { type PrintSize, printSizes } from "../types/print.types";
import { clearElementsForPrint } from "../utils/browser.utils";
import { itemToImageUrl } from "../utils/database.utils";
import { updateItem } from "../utils/item.utils";
import { logger } from "../utils/logger.utils";
import { itemToPrintData } from "../utils/print.utils";
import { state } from "../utils/state.utils";

const waitDelay = 200;

// oxlint-disable-next-line max-lines-per-function
export function PageItemPrint() {
  const { id } = useParams<{ id: string }>();
  if (typeof id !== "string") throw new Error("An id in the url is required");
  const item = state.items.find(one => one.$id === id);
  if (item === undefined) throw new Error(`Item with id "${id}" not found ;(`);

  const { value } = itemToPrintData(item);
  const [size, setSize] = useState<PrintSize>("40x20");
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  logger.debug("PageItemPrint", { item });
  const onSizeChange = useCallback((_event: unknown, selectedSize: PrintSize) => {
    setSize(selectedSize);
  }, []);
  const onHighlightChange = useCallback((_event: unknown, isChecked: boolean) => {
    setIsHighlighted(isChecked);
  }, []);
  const highlightSwitch = useMemo(
    () => <Switch checked={isHighlighted} onChange={onHighlightChange} />,
    [isHighlighted, onHighlightChange],
  );
  const onPrint = useCallback(async () => {
    clearElementsForPrint();
    setIsPrintMode(true);
    await sleep(waitDelay);
    globalThis.print();
    setIsPrintMode(false);
    if (item.isPrinted) return;
    item.isPrinted = true;
    const result = await updateItem(item);
    logger[result.ok ? "showSuccess" : "showError"](`${result.ok ? "updated" : "failed updating"} item as printed`);
    if (!result.ok) logger.error("pushItem failed", result);
  }, [item]);
  // trigger print directly on page load
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to run this only once
  useEffect(() => {
    void sleep(waitDelay).then(() => onPrint());
  }, []);

  return (
    <>
      <AppPageCard cardTitle="Print" icon={Print} pageCode="item-print" pageTitle={`${item.name} - Print`}>
        <div className="flex flex-col md:flex-row">
          <img alt={item.name} className="mx-auto max-h-64 w-1/3 object-contain" src={itemToImageUrl(item)} />
          <div className="flex flex-col gap-4 text-center md:items-start md:text-left">
            <h1 className="w-full">{item.name}</h1>
            <p>You are about to print a barcode with the following value : {value}</p>
            <div className="flex flex-col items-center pt-3 md:flex-row md:items-start">
              <AppBarcode isHighlighted={isHighlighted} item={item} size={size} />
              <div className="flex flex-col gap-3 md:ml-6 md:items-start">
                <ToggleButtonGroup
                  aria-label="Size"
                  color="primary"
                  exclusive={true}
                  onChange={onSizeChange}
                  size="small"
                  value={size}
                >
                  {Object.keys(printSizes).map(one => (
                    <ToggleButton key={one} value={one}>
                      {one}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <FormControlLabel control={highlightSwitch} label="Highlight zones" />
                <Button onClick={onPrint} variant="contained">
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppPageCard>
      {isPrintMode && <AppBarcode item={item} size={size} />}
    </>
  );
}
