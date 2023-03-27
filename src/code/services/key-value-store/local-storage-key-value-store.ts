/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ConfigServiceGroup, ConfigServiceGroupId, Ok, Result } from '../../sys/sys-internal-api';
import { KeyValueStore } from './key-value-store';

export class LocalStorageKeyValueStore implements KeyValueStore {

    public async getItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<string | undefined>> {
        const resolvedKey = this.generateResolvedKey(key, groupId);
        const item = window.localStorage.getItem(resolvedKey);
        const value = (item === null)
            ? undefined
            : item;
        return Promise.resolve(new Ok(value));
    }

    public async setItem(key: string, value: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>> {
        const resolvedKey = this.generateResolvedKey(key, groupId);
        window.localStorage.setItem(resolvedKey, value);
        return Promise.resolve(new Ok(undefined));
    }

    public async removeItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>> {
        const resolvedKey = this.generateResolvedKey(key, groupId);
        window.localStorage.removeItem(resolvedKey);
        return Promise.resolve(new Ok(undefined));
    }

    private generateResolvedKey(key: string, groupId: ConfigServiceGroupId | undefined) {
        if (groupId === undefined) {
            return key;
        } else {
            return ConfigServiceGroup.idToName(groupId) + '|' + key;
        }
    }

}
