/**
 * Debounce any function
 * @param callback the function to debounce
 * @param waitFor the time to wait before calling the function
 * @returns promise with a resolve type of the original function’s return type
 */ export const debounce = (callback, waitFor)=>{
    // oxlint-disable-next-line init-declarations
    let timeout;
    // oxlint-disable-next-line require-await
    return async (...parameters)=>new Promise((resolve)=>{
            clearTimeout(timeout);
            // oxlint-disable-next-line max-nested-callbacks
            timeout = setTimeout(()=>{
                resolve(callback(...parameters));
            }, waitFor);
        });
};

//# sourceMappingURL=debounce.js.map