/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../services/render-value';
import { BidAskPair, IndexedRecord } from '../../sys/internal-api';
import { AssertInternalError } from '../../sys/internal-error';
import { GridField } from './grid-field';

// AllowedGridField is used in Column selector
export class AllowedGridField extends GridField {
    override getViewValue(record: IndexedRecord): RenderValue {
        throw new AssertInternalError('AGFGVV34340'); // never used to get data
    }
}

export type BidAskAllowedGridFields = BidAskPair<readonly AllowedGridField[]>;
