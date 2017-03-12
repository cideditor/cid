import { put }      from 'redux-saga/effects';
import { asEffect } from 'redux-saga/utils';

export function * atomicBatch(builder) {

    let actions = [];

    let generator = builder();
    let inject, next;

    while (!(next = generator.next(inject)).done) {

        let yieldValue = next.value, asPut = asEffect.put(yieldValue);

        if (!asPut) {
            inject = yield yieldValue;
        } else {
            actions.push(asPut.action);
        }

    }

    if (actions.length > 0)
        yield put(actions);

    return next.value;

}
