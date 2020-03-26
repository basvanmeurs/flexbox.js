export class AnnotatedStructureMismatchCollector {
    private _item: any;
    private _results: any;

    constructor(item: any) {
        this._item = item;
        this._results = null;
    }

    getMismatches() {
        return this._collectMismatches();
    }

    _checkLayoutsEqual(layout: any, otherLayout: any) {
        const equal =
            this._compareFloats(layout.x, otherLayout.x) &&
            this._compareFloats(layout.y, otherLayout.y) &&
            this._compareFloats(layout.w, otherLayout.w) &&
            this._compareFloats(layout.h, otherLayout.h);
        return equal;
    }

    _compareFloats(f1: number, f2: number) {
        // Account for rounding errors.
        const delta = Math.abs(f1 - f2);
        return delta < 0.1;
    }

    _collectMismatches() {
        this._results = [];
        this._collectRecursive(this._item, []);
        const results = this._results;
        this._results = null;
        return results.map((path: string) => `[${path}]`);
    }

    _collectRecursive(item: any, location: number[]) {
        if (
            !this._checkLayoutsEqual(
                { x: item.getLayoutX(), y: item.getLayoutY(), w: item.getLayoutW(), h: item.getLayoutH() },
                item.r ? { x: item.r[0], y: item.r[1], w: item.r[2], h: item.r[3] } : { x: 0, y: 0, w: 0, h: 0 },
            )
        ) {
            this._results.push(location.join("."));
        }
        item.children.forEach((subItem: any, index: number) => {
            const subLocation = location.concat([index]);
            this._collectRecursive(subItem, subLocation);
        });
    }
}
