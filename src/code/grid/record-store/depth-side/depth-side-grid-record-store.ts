/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DepthStyleId, OrderSideId } from '../../../adi/adi-internal-api';
import {
    Decimal,
    GridRecordIndex,
    GridRecordInvalidatedValue,
    GridRecordStoreRecordsEventers,
    Integer
} from "../../../sys/internal-api";
import { DepthRecord } from './depth-record';

/** @public */
export abstract class DepthSideGridRecordStore {
    protected _auctionVolume: Integer | undefined;
    protected _volumeAheadNormalMaxRecordCount = 15; // make setting in future

    private _recordsEventers: GridRecordStoreRecordsEventers;

    private _openPopulated = false;
    private _openPopulatedSuccess = false;
    private _openPopulatedResolves = new Array<DepthSideGridRecordStore.OpenPopulatedResolve>();

    constructor(private _styleId: DepthStyleId, private readonly _sideId: OrderSideId) { }

    get styleId() { return this._styleId; }
    get sideId() { return this._sideId; }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    // addFields(fields: readonly GridRecordField[]) {
    //     this._fieldsEventers.addFields(fields);
    // }

    resetOpenPopulated() {
        this.resolveOpenPopulated(false);
        this._openPopulated = false;
        this._openPopulatedSuccess = false;
    }

    waitOpenPopulated(): Promise<boolean> {
        if (this._openPopulated) {
            return Promise.resolve(this._openPopulatedSuccess); // Open population already occured
        } else {
            return new Promise<boolean>((resolve) => { this._openPopulatedResolves.push(resolve); });
        }
    }

    setAuctionQuantity(value: Decimal | undefined) {
        const valueAsInteger = value === undefined ? undefined : value.toInteger().toNumber(); // Remove this when Depth supports Decimal Auction Quantity
        if (valueAsInteger !== this._auctionVolume) {
            this._auctionVolume = valueAsInteger;
            if (this.getRecordCount() > 0) {
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(0, true);
                this.eventifyInvalidateRecordAndFollowingRecords(0, lastAffectedFollowingRecordIndex);
            }
        }
    }

    protected checkResolveOpenPopulated(success: boolean) {
        if (!this._openPopulated) {
            this._openPopulated = true;
            this._openPopulatedSuccess = success; // in case wait has not been called yet
            this.resolveOpenPopulated(success);
        }
    }

    protected processAuctionAndVolumeAhead(recordIndex: Integer, doAllAuction: boolean) {
        let volumeAhead: Integer | undefined;
        if (recordIndex === 0) {
            volumeAhead = 0;
        } else {
            const previousRecord = this.getRecord(recordIndex - 1);
            const previousVolumeAhead = previousRecord.volumeAhead;
            if (previousVolumeAhead === undefined) {
                volumeAhead = undefined;
            } else {
                volumeAhead = previousVolumeAhead + previousRecord.getVolume();
            }
        }
        let record = this.getRecord(recordIndex);
        let prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
        // loop, updating successive records until no more changes to inAuction or volumeAhead
        let lastAffectedFollowingRecordIndex: Integer | undefined;
        const recordCount = this.getRecordCount();
        for (let idx = recordIndex + 1; idx < recordCount; idx++) {
            // limit the number of volumeAhead to save processing.  However must always do all inAuction
            if (!record.inAuction && idx >= this._volumeAheadNormalMaxRecordCount) {
                volumeAhead = undefined;
            } else {
                volumeAhead = prevRecordProcessResult.cumulativeVolume;
            }

            record = this.getRecord(idx);
            prevRecordProcessResult = record.processAuctionAndVolumeAhead(volumeAhead, this._auctionVolume);
            if (prevRecordProcessResult.inAuctionOrVolumeAheadOrPartialChanged) {
                lastAffectedFollowingRecordIndex = idx;
            } else {
                if (!doAllAuction || record.inAuction) {
                    break;
                }
            }
        }

        return lastAffectedFollowingRecordIndex;
    }

    protected eventifyBeginChange() {
        this._recordsEventers.beginChange();
    }

    protected eventifyEndChange() {
        this._recordsEventers.endChange();
    }

    protected eventifyRecordInserted(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.recordInserted(recordIndex);
                this._recordsEventers.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._recordsEventers.endChange();
            }
        } else {
            this._recordsEventers.recordInserted(recordIndex);
        }
    }

    protected eventifyRecordDeleted(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.recordDeleted(recordIndex);
                this._recordsEventers.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._recordsEventers.endChange();
            }
        } else {
            this._recordsEventers.recordDeleted(recordIndex);
        }
    }

    protected eventifyRecordMoved(fromIndex: Integer, toIndex: Integer) {
        this._recordsEventers.recordMoved(fromIndex, toIndex);
    }

    protected eventifyRecordReplaced(recordIndex: Integer) {
        this._recordsEventers.recordReplaced(recordIndex);
    }

    protected eventifyRecordsSplicedAndInvalidateUpTo(
        index: Integer,
        deleteCount: Integer,
        insertCount: Integer,
        lastAffectedFollowingRecordIndex: Integer | undefined
    ) {
        if (lastAffectedFollowingRecordIndex !== undefined && lastAffectedFollowingRecordIndex >= (index + insertCount)) {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.recordsSpliced(index, deleteCount, insertCount);
                this._recordsEventers.invalidateAll(); // this could be improved to only invalidate record range affected
            } finally {
                this._recordsEventers.endChange();
            }
        } else {
            this._recordsEventers.recordsSpliced(index, deleteCount, insertCount);
        }
    }

    protected eventifyAllRecordsDeleted() {
        this._recordsEventers.allRecordsDeleted();
    }

    protected eventifyInvalidateRecords(index: Integer, count: Integer) {
        this._recordsEventers.invalidateRecords(index, count);
    }

    protected eventifyRecordsLoaded() {
        this._recordsEventers.recordsLoaded();
    }

    protected eventifyInvalidateRecordAndFollowingRecords(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.invalidateRecord(recordIndex);
                this._recordsEventers.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._recordsEventers.endChange();
            }
        } else {
            this._recordsEventers.invalidateRecord(recordIndex);
        }
    }

    protected eventifyInvalidateRecordAndValuesAndFollowingRecords(
        recordIndex: Integer,
        invalidatedRecordValues: GridRecordInvalidatedValue[],
        lastAffectedFollowingRecordIndex: Integer | undefined
    ) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.invalidateRecordAndValues(recordIndex, invalidatedRecordValues);
                this._recordsEventers.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._recordsEventers.endChange();
            }
        } else {
            this._recordsEventers.invalidateRecordAndValues(recordIndex, invalidatedRecordValues);
        }
    }

    protected eventifyInvalidateRecordsAndRecordValues(
        recordIndex: Integer,
        count: Integer,
        valuesRecordIndex: Integer,
        invalidatedRecordValues: GridRecordInvalidatedValue[],
    ) {
        if (invalidatedRecordValues.length === 0) {
            this._recordsEventers.invalidateRecords(recordIndex, count);
        } else {
            this._recordsEventers.beginChange();
            try {
                this._recordsEventers.invalidateRecords(recordIndex, count);
                this._recordsEventers.invalidateRecordAndValues(valuesRecordIndex, invalidatedRecordValues);
            } finally {
                this._recordsEventers.endChange();
            }
        }
    }


    private resolveOpenPopulated(success: boolean) {
        if (this._openPopulatedResolves.length > 0) {
            for (const resolve of this._openPopulatedResolves) {
                resolve(success);
            }
            this._openPopulatedResolves.length = 0;
        }
    }

    abstract finalise(): void;
    abstract close(): void;
    abstract toggleRecordOrderPriceLevel(idx: Integer): void;
    abstract setAllRecordsToOrder(): void;
    abstract setAllRecordsToPriceLevel(): void;
    abstract setNewPriceLevelAsOrder(value: boolean): void;
    abstract getRecord(recordIndex: GridRecordIndex): DepthRecord;

    protected abstract getRecordCount(): Integer;
}

/** @public */
export namespace DepthSideGridRecordStore {
    export type RecordInsertedEventHandler = (this: void, index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) => void;
    export type RecordsInsertedEventHandler = (this: void, index: Integer, count: Integer, allInvalidated: boolean) => void;
    export type RecordDeletedEventHandler = (this: void, index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) => void;
    export type RecordsDeletedEventHandler = (this: void, index: Integer, count: Integer, allInvalidated: boolean) => void;
    export type RecordsSplicedAndInvalidateUpToEvent = (this: void,
        index: Integer, deleteCount: Integer, insertCount: Integer, lastAffectedFollowingRecordIndex: Integer | undefined
    ) => void;
    export type AllRecordsDeletedEventHandler = (this: void) => void;
    export type RecordsLoadedEventHandler = (this: void) => void;
    export type InvalidateRecordsEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type InvalidateRecordAndFollowingRecordsEventHandler = (this: void,
        index: Integer, lastAffectedFollowingRecordIndex: Integer | undefined
    ) => void;
    export type InvalidateRecordAndValuesAndFollowingRecordsEventHandler = (this: void,
        recordIndex: Integer,
        invalidatedRecordValues: GridRecordInvalidatedValue[],
        lastAffectedFollowingRecordIndex: Integer | undefined
    ) => void;
    export type InvalidateRecordsAndRecordValuesEventHandler = (this: void,
        recordIndex: Integer,
        count: Integer,
        valuesRecordIndex: Integer,
        invalidatedRecordValues: GridRecordInvalidatedValue[]
    ) => void;

    export type OpenPopulatedResolve = (this: void, success: boolean) => void;
}
