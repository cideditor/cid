import { isFunction }              from 'lodash';
import { connect as reduxConnect } from 'react-redux';

export function connect(mapStateToProps, mapDispatchToProps, mergeProps, { withRef = true, ... extraOptions } = {}) {

    let decorator = reduxConnect(mapStateToProps, mapDispatchToProps, mergeProps, { withRef, ... extraOptions });

    return function (Class) {

        let Wrapper = decorator(Class);

        Class.WrapperComponent = Wrapper;

        for (let name of Reflect.ownKeys(Class)) {

            if (Reflect.has(Wrapper, name))
                continue;

            if (isFunction(Class.prototype[name])) {
                Wrapper[name] = function (... args) { return Class[name].apply(this === Wrapper ? Class : this, args); };
            } else {
                Wrapper[name] = Class[name];
            }

        }

        for (let name of Reflect.ownKeys(Class.prototype)) {

            if (Reflect.has(Wrapper.prototype, name))
                continue;

            if (isFunction(Class.prototype[name])) {
                Wrapper.prototype[name] = function (... args) { return Class.prototype[name].apply(this instanceof Wrapper ? this.getWrappedInstance() : this, args); };
            } else {
                Wrapper.prototype[name] = Class.prototype[name];
            }

        }

        return Wrapper;

    };

}

export function statics(fields) {

    return function (klass) {

        return Object.assign(klass, fields);

    };

}
