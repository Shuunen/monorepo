/* v8 ignore start -- @preserve */
import { Logger, nbMsInSecond } from "@monorepo/utils";
// @ts-expect-error missing types
import notifier from "node-notifier";
// @ts-expect-error missing types
import osmosis from "osmosis";

const url = "https://www.facebook.com/some-page/";
const info = "div._4-u8 > div._2pi9._2pi2 > div._ikh > div._4bl9";
const everySeconds = 20;
// oxlint-disable-next-line require-hook
let lastNb = 0;
const logger = new Logger();

/**
 *
 */
function check() {
  osmosis
    .get(url)
    .set({ info })
    .data((/** @type {{ info: string; }} */ data) => {
      const nb = Number.parseInt(data.info.split(" ")[0] ?? "0", 10);
      if (lastNb !== nb) {
        notifier.notify({
          message: `Total : ${nb} likes`,
          title: "New like",
        });
        logger.info(`Total : ${nb} likes`);
      }
      lastNb = nb;
    })
    .error(logger.error.bind(logger));
}

setInterval(check, everySeconds * nbMsInSecond);
