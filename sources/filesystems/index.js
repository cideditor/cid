import { LocalDriver } from '@cideditor/cid/filesystems/LocalDriver';

let drivers = [

    new LocalDriver(),

];

export function findDriver(descriptor) {

    for (let driver of drivers)
        if (driver.supports(descriptor))
            return driver;

    return null;

}
