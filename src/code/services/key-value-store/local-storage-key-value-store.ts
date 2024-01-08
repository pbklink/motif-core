/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Ok, Result, ServiceOperator, ServiceOperatorId } from '../../sys/sys-internal-api';
import { KeyValueStore } from './key-value-store';

export class LocalStorageKeyValueStore implements KeyValueStore {

    public getItem(key: string, operatorId: ServiceOperatorId | undefined): Promise<Result<string | undefined>> {
        const resolvedKey = this.generateResolvedKey(key, operatorId);
        const item = window.localStorage.getItem(resolvedKey);
        const value = (item === null)
            ? undefined
            : item;
        return Promise.resolve(new Ok(value));
    }

    public setItem(key: string, value: string, operatorId: ServiceOperatorId | undefined): Promise<Result<void>> {
        const resolvedKey = this.generateResolvedKey(key, operatorId);
        window.localStorage.setItem(resolvedKey, value);
        return Promise.resolve(new Ok(undefined));
    }

    public removeItem(key: string, operatorId: ServiceOperatorId | undefined): Promise<Result<void>> {
        const resolvedKey = this.generateResolvedKey(key, operatorId);
        window.localStorage.removeItem(resolvedKey);
        return Promise.resolve(new Ok(undefined));
    }

    private generateResolvedKey(key: string, operatorId: ServiceOperatorId | undefined) {
        if (operatorId === undefined) {
            return key;
        } else {
            return ServiceOperator.idToName(operatorId) + '|' + key;
        }
    }

}
