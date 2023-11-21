/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { ScansService } from '../scan/scan-internal-api';
import { UnreachableCaseError } from '../sys/sys-internal-api';
import { WatchmakerService } from '../watchmaker/watchmaker-internal-api';
import {
    JsonRankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinition,
    ScanMatchesRankedLitIvemIdListDefinition,
    WatchmakerRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { JsonScoredRankedLitIvemIdList } from './json-scored-ranked-lit-ivem-id-list';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { ScanMatchesScoredRankedLitIvemIdList } from './scan-matches-scored-ranked-lit-ivem-id-list';
import { WatchmakerScoredRankedLitIvemIdList } from './watchmaker-scored-ranked-lit-ivem-id-list';

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
            case RankedLitIvemIdListDefinition.TypeId.Json:
                return new JsonScoredRankedLitIvemIdList(
                    definition as JsonRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches:
                return new ScanMatchesScoredRankedLitIvemIdList(
                    this._adiService,
                    this._scansService,
                    definition as ScanMatchesRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.Watchmaker:
                return new WatchmakerScoredRankedLitIvemIdList(
                    this._watchmakerService,
                    definition as WatchmakerRankedLitIvemIdListDefinition
                );
            default:
                throw new UnreachableCaseError('RLILFSCFD15169', definition.typeId);
        }
    }
}
