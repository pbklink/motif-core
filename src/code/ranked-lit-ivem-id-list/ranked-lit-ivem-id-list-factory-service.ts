/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from '../sys/internal-error';
import { ExplicitRankedLitIvemIdListDefinition, RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { ExplicitRankedLitIvemIdList } from './explicit-ranked-lit-ivem-id-list';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';

/** @public */
export class RankedLitIvemIdListFactoryService {
    // needs fixing
    createFromDefinition(definition: RankedLitIvemIdListDefinition,): RankedLitIvemIdList {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.Explicit: return new ExplicitRankedLitIvemIdList(definition as ExplicitRankedLitIvemIdListDefinition);
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches: return new ExplicitRankedLitIvemIdList(definition as ExplicitRankedLitIvemIdListDefinition);
            case RankedLitIvemIdListDefinition.TypeId.ZenithWatchlist: return new ExplicitRankedLitIvemIdList(definition as ExplicitRankedLitIvemIdListDefinition);
            default:
                throw new UnreachableCaseError('RLILFSCFD15169', definition.typeId);
        }
    }
}
