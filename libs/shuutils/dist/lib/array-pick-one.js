/**
 * Return an item from an array
 * @param items like : ["great", "place", "pine"]
 * @returns item like : "pine"
 */ export function pickOne(items) {
    if (items.length === 0) throw new Error('Array is empty');
    return items[Math.floor(Math.random() * items.length)];
}

//# sourceMappingURL=array-pick-one.js.map