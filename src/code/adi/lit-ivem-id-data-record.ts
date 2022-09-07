/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from './adi-internal-api';
import { DataRecord } from './data-record';

export interface LitIvemIdDataRecord extends DataRecord {
    readonly litIvemId: LitIvemId;
}
