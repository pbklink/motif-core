/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from './correctness';

/** @public */
export interface CorrectnessSettableListItem {
    readonly correctnessId: CorrectnessId;

    setListCorrectness(value: CorrectnessId): void;
}
