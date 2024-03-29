/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem, MapKey } from '../sys/internal-api';

export interface BrokerageAccountRecord extends KeyedCorrectnessListItem {
    readonly accountMapKey: MapKey;
}
