export function applyShortcuts(shortcuts, options) {

    let mappedShortcuts = {};

    for (let sequence of Reflect.ownKeys(shortcuts)) {

        mappedShortcuts[sequence] = e => {

            e.setDefault(() => {
                shortcuts[sequence](options);
            });

        };

    }

    return mappedShortcuts;

}
