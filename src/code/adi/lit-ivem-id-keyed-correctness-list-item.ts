/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem } from '../sys/internal-api';
import { LitIvemId } from './common/adi-common-internal-api';

export interface LitIvemIdKeyedCorrectnessListItem extends KeyedCorrectnessListItem {
    readonly litIvemId: LitIvemId;
}
