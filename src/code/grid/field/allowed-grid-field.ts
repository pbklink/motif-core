import { RenderValue } from '../../services/render-value';
import { AssertInternalError } from '../../sys/internal-error';
import { BidAskPair, IndexedRecord } from '../../sys/types';
import { GridField } from './grid-field';

// AllowedGridField is used in Column selector
export class AllowedGridField extends GridField {
    override getViewValue(record: IndexedRecord): RenderValue {
        throw new AssertInternalError('AGFGVV34340'); // never used to get data
    }
}

export type BidAskAllowedGridFields = BidAskPair<readonly AllowedGridField[]>;
