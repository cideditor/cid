import * as fs   from 'fs';
import * as path from 'path';

export class LocalDriver {

    supports(descriptor) {

        return descriptor.match(
            /^(?![a-zA-Z+-]+:\/\/)[^\0]+$/
        );

    }

    async getName(descriptor) {

        return path.basename(descriptor);

    }

    async getStat(descriptor, { followLinks = false } = {}) {

        return new Promise((resolve, reject) => {

            let fsImpl = followLinks
                ? fs.lstat
                : fs.stat;

            fsImpl(descriptor, (error, stat) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(stat);
                }

            });

        });

    }

    async readDirectory(descriptor) {

        return new Promise((resolve, reject) => {

            fs.readdir(descriptor, (error, listing) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(listing);
                }

            });

        });

    }

    async readFile(descriptor) {

        return new Promise((resolve, reject) => {

            fs.readFile(descriptor, (error, body) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }

            });

        });

    }

    async writeFile(descriptor, body) {

        return new Promise((resolve, reject) => {

            fs.writeFile(descriptor, body, error => {

                if (error) {
                    reject(error);
                } else {
                    resolve();
                }

            });

        });

    }

};
