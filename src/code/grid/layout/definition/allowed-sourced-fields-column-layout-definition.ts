/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevAllowedSourcedFieldsColumnLayoutDefinition } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/internal-api';
import { BidAskPair } from '../../../sys/internal-api';

export class AllowedSourcedFieldsColumnLayoutDefinition extends RevAllowedSourcedFieldsColumnLayoutDefinition<RenderValue.TypeId, RenderValue.Attribute.TypeId> {
    // Uses AllowedGridField instead of RevFieldDefinition as heading can be changed at runtime
}

export type BidAskAllowedSourcedFieldsColumnLayoutDefinitions = BidAskPair<AllowedSourcedFieldsColumnLayoutDefinition>;
