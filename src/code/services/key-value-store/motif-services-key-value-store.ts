/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result, ServiceOperatorId } from '../../sys/internal-api';
import { MotifServicesService } from '../motif-services-service';
import { KeyValueStore } from './key-value-store';

export class MotifServicesKeyValueStore implements KeyValueStore {

    private _prefix: string;

    constructor(private _motifServicesService: MotifServicesService) {
    }

    public getItem(key: string, operatorId: ServiceOperatorId | undefined): Promise<Result<string | undefined>> {
        return this._motifServicesService.getUserSetting(key, operatorId);
    }

    public setItem(key: string, value: string, operatorId: ServiceOperatorId | undefined): Promise<Result<void>> {
        return this._motifServicesService.setUserSetting(key, value, operatorId);
    }

    public removeItem(key: string, operatorId: ServiceOperatorId | undefined): Promise<Result<void>> {
        return this._motifServicesService.deleteUserSetting(key, operatorId);
    }
}
