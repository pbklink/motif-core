/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ConfigServiceGroupId, Result } from '../../sys/sys-internal-api';
import { MotifServicesService } from '../motif-services-service';
import { KeyValueStore } from './key-value-store';

export class MotifServicesKeyValueStore implements KeyValueStore {

    private _prefix: string;

    constructor(private _motifServicesService: MotifServicesService) {
    }

    public async getItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<string | undefined>> {
        return this._motifServicesService.getUserSetting(key, groupId);
    }


    public async setItem(key: string, value: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>> {
        return this._motifServicesService.setUserSetting(key, value, groupId);
    }

    public async removeItem(key: string, groupId: ConfigServiceGroupId | undefined): Promise<Result<void>> {
        return this._motifServicesService.deleteUserSetting(key, groupId);
    }
}
