import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import type { EntryContext } from "react-router";
import { PassThrough } from "node:stream";
import { Readable } from "node:stream";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(
              // 2. Convert Node PassThrough to a Web ReadableStream
              Readable.toWeb(body) as ReadableStream,
              {
                status: responseStatusCode,
                headers: responseHeaders,
              },
            ),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );
  });
}

// import { renderToPipeableStream } from "react-dom/server";
// import { ServerRouter } from "react-router";
// import type { EntryContext } from "react-router";
// import { PassThrough } from "node:stream";

// export default function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   routerContext: EntryContext,
// ) {
//   return new Promise((resolve, reject) => {
//     let shellRendered = false;
//     const { pipe, abort } = renderToPipeableStream(
//       <ServerRouter context={routerContext} url={request.url} />,
//       {
//         onShellReady() {
//           shellRendered = true;
//           const body = new PassThrough();

//           responseHeaders.set("Content-Type", "text/html");

//           resolve(
//             new Response(body, {
//               status: responseStatusCode,
//               headers: responseHeaders,
//             }),
//           );

//           pipe(body);
//         },
//         onShellError(error: unknown) {
//           reject(error);
//         },
//         onError(error: unknown) {
//           responseStatusCode = 500;
//           if (shellRendered) {
//             console.error(error);
//           }
//         },
//       },
//     );
//   });
// }
