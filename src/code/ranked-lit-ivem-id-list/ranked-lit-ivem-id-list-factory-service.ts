/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { ScansService } from '../scan/scan-internal-api';
import { UnreachableCaseError } from '../sys/sys-internal-api';
import {
    JsonRankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinition,
    ScanMatchesRankedLitIvemIdListDefinition,
    ZenithWatchlistRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { JsonRankedLitIvemIdListImplementation } from './json-ranked-lit-ivem-id-list-implementation';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { ScanMatchesRankedLitIvemIdListImplementation } from './scan-matches-ranked-lit-ivem-id-list-implementation';
import { ZenithWatchlistRankedLitIvemIdListImplementation } from './zenith-watchlist-ranked-lit-ivem-id-list-implementation';

/** @public */
export class RankedLitIvemIdListFactoryService {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
    ) {

    }
    // needs fixing
    createFromDefinition(definition: RankedLitIvemIdListDefinition,): RankedLitIvemIdList {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.Explicit:
                return new JsonRankedLitIvemIdListImplementation(
                    definition as JsonRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches:
                return new ScanMatchesRankedLitIvemIdListImplementation(
                    this._adiService,
                    this._scansService,
                    definition as ScanMatchesRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ZenithWatchlist:
                return new ZenithWatchlistRankedLitIvemIdListImplementation(
                    this._adiService,
                    definition as ZenithWatchlistRankedLitIvemIdListDefinition
                );
            default:
                throw new UnreachableCaseError('RLILFSCFD15169', definition.typeId);
        }
    }
}
