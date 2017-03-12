export class ImmutableRect extends Immutable.Record({

    x: null,
    y: null,

    width: null,
    height: null

}) {

    static update(current, rect) {

        if (!rect)
            return null;

        let { x, y, width, height } = rect;

        if (!current) {
            return new ImmutableRect({ x, y, width, height });
        } else {
            return current.merge({ x, y, width, height });
        }

    }

}
