import { ellipsis } from "@monorepo/utils";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AppButtonNext } from "../components/app-button-next";
import { AppDisplayToggle } from "../components/app-display-toggle";
import { AppItemList } from "../components/app-item-list";
import { AppPageCard } from "../components/app-page-card";
import { sadAscii } from "../utils/strings.utils";
import { maxNameLength, type SearchState } from "./page-search.const";

const emptyResults: SearchState["results"] = [];

export function PageSearch() {
  const { input = "" } = useParams<{ input: string }>();
  const { state } = useLocation() as { state: SearchState | null };
  const results = useMemo(() => state?.results ?? emptyResults, [state?.results]);

  return (
    <AppPageCard
      cardTitle="Search"
      icon={SearchIcon}
      pageCode="search"
      pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}
    >
      <div className="flex max-h-[90%] flex-col items-center gap-3 sm:gap-5 md:max-h-full">
        <h2 className="text-center">{state?.header}</h2>
        {results.length > 0 && (
          <>
            <div className="absolute top-7 right-7">
              <AppDisplayToggle />
            </div>
            <AppItemList items={results} />
          </>
        )}
        {results.length === 0 && (
          <>
            <p>{sadAscii()}</p>
            <AppButtonNext label="Add a product" url={`/item/add/${input}`} />
          </>
        )}
      </div>
    </AppPageCard>
  );
}
