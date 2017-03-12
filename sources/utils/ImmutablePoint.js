export class ImmutablePoint extends Immutable.Record({

    x: null,
    y: null

}) {

    static update(current, point) {

        if (!point)
            return null;

        let { x, y } = point;

        if (!current) {
            return new ImmutablePoint({ x, y });
        } else {
            return current.merge({ x, y });
        }

    }

}
