/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ConfigServiceGroupId, Result, UnreachableCaseError } from '../sys/sys-internal-api';
import { KeyValueStore } from './key-value-store/key-value-store';
import { LocalStorageKeyValueStore } from './key-value-store/local-storage-key-value-store';
import { MotifServicesKeyValueStore } from './key-value-store/motif-services-key-value-store';
import { MotifServicesService } from './motif-services-service';

export class AppStorageService {
    private _keyValueStore: KeyValueStore;
    private _configServiceGroupId: ConfigServiceGroupId | undefined;

    constructor(private readonly _motifServicesService: MotifServicesService) {

    }

    initialise(storageTypeId: AppStorageService.TypeId, groupId: ConfigServiceGroupId | undefined) {
        this._configServiceGroupId = groupId;

        switch (storageTypeId) {
            case AppStorageService.TypeId.Local:
                this._keyValueStore = new LocalStorageKeyValueStore();
                break;
            case AppStorageService.TypeId.MotifServices:
                this._keyValueStore = new MotifServicesKeyValueStore(this._motifServicesService);
                break;
            default:
                throw new UnreachableCaseError('ASSI444873', storageTypeId);
        }
    }

    async getItem(key: KeyValueStore.Key | string, group = false): Promise<Result<string | undefined>> {
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.getItem(key, groupId);
    }

    async getSubNamedItem(key: KeyValueStore.Key | string, subName: string, group = false): Promise<Result<string | undefined>> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.getItem(stringKey, groupId);
    }

    async setItem(key: KeyValueStore.Key | string, value: string, group = false): Promise<Result<void>> {
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.setItem(key, value, groupId);
    }

    async setSubNamedItem(
        key: KeyValueStore.Key | string,
        subName: string,
        value: string,
        group = false
    ): Promise<Result<void>> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.setItem(stringKey, value, groupId);
    }

    async removeItem(key: KeyValueStore.Key | string, group = false): Promise<Result<void>> {
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.removeItem(key, groupId);
    }

    async removeSubNamedItem(key: KeyValueStore.Key | string, subName: string, group = false): Promise<Result<void>> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        const groupId = group ? this._configServiceGroupId : undefined;
        return this._keyValueStore.removeItem(stringKey, groupId);
    }
}

export namespace AppStorageService {
    export const enum TypeId {
        Local,
        MotifServices,
    }

    export function makeSubNamedKey(key: KeyValueStore.Key | string, subName: string) {
        return key + ':#' + subName;
    }
}
