/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem } from '../sys/sys-internal-api';
import { LitIvemId } from './adi-internal-api';

export interface LitIvemIdRecord extends KeyedCorrectnessListItem {
    readonly litIvemId: LitIvemId;
}
