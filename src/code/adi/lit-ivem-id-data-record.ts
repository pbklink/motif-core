/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessRecord } from '../sys/sys-internal-api';
import { LitIvemId } from './adi-internal-api';

export interface LitIvemIdDataRecord extends KeyedCorrectnessRecord {
    readonly litIvemId: LitIvemId;
}
