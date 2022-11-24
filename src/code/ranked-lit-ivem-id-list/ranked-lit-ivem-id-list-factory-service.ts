/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { UnreachableCaseError } from '../sys/sys-internal-api';
import {
    ExplicitRankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinition,
    ScanMatchesRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { ExplicitRankedLitIvemIdListImplementation } from './explicit-ranked-lit-ivem-id-list-implementation';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { ScanMatchesRankedLitIvemIdListImplementation } from './scan-matches-ranked-lit-ivem-id-list-implementation';

/** @public */
export class RankedLitIvemIdListFactoryService {
    constructor(private readonly _adiService: AdiService) {

    }
    // needs fixing
    createFromDefinition(definition: RankedLitIvemIdListDefinition,): RankedLitIvemIdList {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.Explicit:
                return new ExplicitRankedLitIvemIdListImplementation(
                    definition as ExplicitRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches:
                return new ScanMatchesRankedLitIvemIdListImplementation(
                    this._adiService,
                    definition as ScanMatchesRankedLitIvemIdListDefinition
                );
            case RankedLitIvemIdListDefinition.TypeId.ZenithWatchlist: return new ExplicitRankedLitIvemIdListImplementation(definition as ExplicitRankedLitIvemIdListDefinition);
            default:
                throw new UnreachableCaseError('RLILFSCFD15169', definition.typeId);
        }
    }
}
