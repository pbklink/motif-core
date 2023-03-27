/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ConfigServiceGroupId, Result } from '../../sys/sys-internal-api';

/** @public */
export interface KeyValueStore {
    getItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<string | undefined>>;
    setItem(key: string, value: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>>;
    removeItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>>;
}

/** @public */
export namespace KeyValueStore {
    export const enum Key {
        MasterSettings = 'masterSettings',
        Settings = 'settings',
        Extensions = 'extensions',
        Layout = 'layout',
        LoadedExtensions = 'loadedExtensions',
    }
}
