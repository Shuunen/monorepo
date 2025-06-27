/**
 * Check provided type against parameter
 * @param thing type to compare
 * @returns the given `thing` parameter
 * @example checkType<string>('hello')
 * checkType<PersonModel>({ name: 'John' })
 * checkType<PersonModel>(await getPerson())
 */ export function expectType(thing) {
    return thing;
}
/**
 * Check two types, you can provide the type or let TypeScript infer them
 * @param thingA first type to compare
 * @param thingB second type to compare
 * @returns parameters
 * @example expectEqualTypes(funcA(), funcB())
 * expectEqualTypes(await funcA(), await funcB())
 * expectEqualTypes<PersonModel>({ name: 'John' }, { name: 'John' })
 * expectEqualTypes<PersonModel>({ name: 'John' }, { name: 'John', age: 42 })
 */ export function expectEqualTypes(thingA, thingB) {
    return {
        thingA,
        thingB
    };
}

//# sourceMappingURL=expect-type.js.map