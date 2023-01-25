/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Ok, Result } from '../../sys/sys-internal-api';
import { KeyValueStore } from './key-value-store';

export class LocalStorageKeyValueStore implements KeyValueStore {

    public async getItem(key: string): Promise<Result<string | undefined>> {
        const item = window.localStorage.getItem(key);
        const value = (item === null)
            ? undefined
            : item;
        return Promise.resolve(new Ok(value));
    }

    public async setItem(key: string, value: string): Promise<Result<void>> {
        window.localStorage.setItem(key, value);
        return Promise.resolve(new Ok(undefined));
    }

    public async removeItem(key: string): Promise<Result<void>> {
        window.localStorage.removeItem(key);
        return Promise.resolve(new Ok(undefined));
    }
}
