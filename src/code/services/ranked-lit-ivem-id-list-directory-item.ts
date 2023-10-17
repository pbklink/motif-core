/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export interface RankedLitIvemIdListDirectoryItem {
    readonly serviceId: RankedLitIvemIdListDirectoryItem.ServiceId;
    readonly name: string;
    readonly id: string;
    readonly writable: boolean;
}

export namespace RankedLitIvemIdListDirectoryItem {
    export const enum ServiceId {
        Watchmaker,
        Scan,
    }
}
