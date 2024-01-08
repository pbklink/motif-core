/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdModule } from '../adi/scan/ranked-lit-ivem-id';
import { RankedLitIvemIdListDefinitionStaticInitialise } from './definition/ranked-lit-ivem-id-list-definition-static-initialise';

/** @internal */
export namespace RankedLitIvemIdListStaticInitialise {
    export function initialise() {
        RankedLitIvemIdListDefinitionStaticInitialise.initialise();
        RankedLitIvemIdModule.initialiseStatic();
    }
}
