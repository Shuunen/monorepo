// MIT License Copyright (c) 2023-PRESENT Johann Schopplich
// I had to get sources from https://github.com/johannschopplich/resultx/blob/main/src/index.ts to be able to have a cjs working version of the library
// oxlint-disable max-classes-per-file, consistent-type-definitions, curly, sort-keys, id-length
let Ok = class Ok {
    constructor(value){
        this.ok = true;
        this.value = value;
    }
};
let Err = class Err {
    constructor(error){
        this.ok = false;
        this.error = error;
    }
};
export function ok(value) {
    return new Ok(value);
}
export function err(error) {
    return new Err(error);
}
export function trySafe(fnOrPromise) {
    if (fnOrPromise instanceof Promise) {
        return fnOrPromise.then(ok).catch(err);
    }
    try {
        return ok(fnOrPromise());
    } catch (error) {
        return err(error);
    }
}
export function unwrap(result) {
    return result.ok ? {
        error: undefined,
        value: result.value
    } : {
        error: result.error,
        value: undefined
    };
}

//# sourceMappingURL=resultx.js.map