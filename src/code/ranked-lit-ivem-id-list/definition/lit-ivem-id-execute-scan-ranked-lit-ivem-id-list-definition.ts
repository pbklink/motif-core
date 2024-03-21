/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdExecuteScanDataDefinition } from '../../adi/internal-api';
import { Err, ErrorCode, JsonElement, Result } from '../../sys/internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class LitIvemIdExecuteScanRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly category: string,
        readonly litIvemIdExecuteScanDataDefinition: LitIvemIdExecuteScanDataDefinition
    ) {
        super(RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        // not supported so do not save anything else
    }
}

/** @public */
export namespace LitIvemIdExecuteScanRankedLitIvemIdListDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<LitIvemIdExecuteScanRankedLitIvemIdListDefinition> {
        return new Err(ErrorCode.LitIvemIdExecuteScanRankedLitIvemIdListDefinition_JsonNotSupported);
    }
}
