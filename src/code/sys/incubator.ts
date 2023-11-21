/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export interface Incubator {
    readonly incubating: boolean;

    finalise(): void;
    cancel(): void;
}
