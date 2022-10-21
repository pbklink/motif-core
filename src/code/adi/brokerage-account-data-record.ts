/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessRecord, MapKey } from '../sys/sys-internal-api';

export interface BrokerageAccountDataRecord extends KeyedCorrectnessRecord {
    readonly accountMapKey: MapKey;
}
