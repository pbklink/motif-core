/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BooleanScanCriteriaNode } from 'src/code/adi/common/scan-criteria-node';
import { ZenithScanCriteria } from './zenith-scan-criteria';

export namespace ZenithScanCriteriaConvert {
    export function toNode() /* BooleanScanCriteriaNode*/ {
        //
    }

    export function fromNode(node: BooleanScanCriteriaNode): ZenithScanCriteria.BooleanNode {
        return ['And'];
    }
}
