/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevAllowedFieldsGridLayoutDefinition } from '@xilytix/rev-data-source';
import { RenderValue } from '../../../services/internal-api';
import { BidAskPair } from '../../../sys/internal-api';

export class AllowedFieldsGridLayoutDefinition extends RevAllowedFieldsGridLayoutDefinition<RenderValue.TypeId, RenderValue.Attribute.TypeId> {
    // Uses AllowedGridField instead of RevFieldDefinition as heading can be changed at runtime
}

export type BidAskAllowedFieldsGridLayoutDefinitions = BidAskPair<AllowedFieldsGridLayoutDefinition>;
