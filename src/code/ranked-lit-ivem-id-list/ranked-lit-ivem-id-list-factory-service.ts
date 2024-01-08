/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { ScansService } from '../scan/internal-api';
import { UnreachableCaseError } from '../sys/sys-internal-api';
import { WatchmakerService } from '../watchmaker/watchmaker-internal-api';
import {
    LitIvemIdArrayRankedLitIvemIdListDefinition,
    LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinition,
    ScanIdRankedLitIvemIdListDefinition,
    WatchmakerListIdRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { LitIvemIdArrayRankedLitIvemIdList } from './lit-ivem-id-array-ranked-lit-ivem-id-list';
import { LitIvemIdExecuteScanRankedLitIvemIdList } from './lit-ivem-id-execute-scan-ranked-lit-ivem-id-list';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { ScanIdRankedLitIvemIdList } from './scan-id-ranked-lit-ivem-id-list';
import { WatchmakerListIdRankedLitIvemIdList } from './watchmaker-list-id-ranked-lit-ivem-id-list';

/** @public */
export class RankedLitIvemIdListFactoryService {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
        private readonly _watchmakerService: WatchmakerService,
    ) {

    }
    // needs fixing
    createFromDefinition(definition: RankedLitIvemIdListDefinition): RankedLitIvemIdList {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray:
                return new LitIvemIdArrayRankedLitIvemIdList(
                    definition as LitIvemIdArrayRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                return new WatchmakerListIdRankedLitIvemIdList(
                    this._watchmakerService,
                    definition as WatchmakerListIdRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ScanId:
                return new ScanIdRankedLitIvemIdList(
                    this._adiService,
                    this._scansService,
                    definition as ScanIdRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan:
                return new LitIvemIdExecuteScanRankedLitIvemIdList(
                    this._adiService,
                    definition as LitIvemIdExecuteScanRankedLitIvemIdListDefinition
                );
            default:
                throw new UnreachableCaseError('RLILFSCFD15169', definition.typeId);
        }
    }
}
