/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordIndex, RevRecordInvalidatedValue, RevRecordStore } from '@xilytix/revgrid';
import { DepthDataItem, DepthStyleId, OrderSide, OrderSideId } from '../../../../adi/internal-api';
import { SessionInfoService } from '../../../../services/session-info-service';
import {
    AssertInternalError,
    CorrectnessId,
    Decimal,
    Integer,
    MultiEvent,
    UnreachableCaseError,
    isDecimalEqual,
    isDecimalGreaterThan,
    isDecimalLessThan,
    logger,
    moveElementInArray,
    newDecimal
} from "../../../../sys/internal-api";
import { DepthRecord } from '../depth-record';
import { DepthSideGridRecordStore } from '../depth-side-grid-record-store';
import { FullDepthRecord, OrderFullDepthRecord, PriceLevelFullDepthRecord } from './full-depth-record';

export class FullDepthSideGridRecordStore extends DepthSideGridRecordStore implements RevRecordStore {
    private _newPriceLevelAsOrder: boolean;

    private _dataItem: DepthDataItem;
    private _dataItemOrders: DepthDataItem.Order[];
    private _dataItemFinalised = true;
    private _orderIndex: FullDepthRecord[] = [];
    private _records: FullDepthRecord[] = [];

    private _dataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _afterOrderAddSubscriptionId: MultiEvent.SubscriptionId;
    private _beforeOrderRemoveSubscriptionId: MultiEvent.SubscriptionId;
    private _orderChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _orderMoveAndChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _ordersClearSubscriptionId: MultiEvent.SubscriptionId;

    private _sideIdDisplay: string; // only used for debugging
    private readonly _initialPreviousPrice: Decimal;

    private readonly _consistencyCheckingEnabled: boolean;
    private readonly _debugLoggingEnabled: boolean;

    constructor(
        sessionInfoService: SessionInfoService,
        styleId: DepthStyleId,
        sideId: OrderSideId,
    ) {
        super(styleId, sideId);

        const diagnostics = sessionInfoService.diagnostics;
        this._consistencyCheckingEnabled = diagnostics.fullDepthConsistencyCheckingEnabled;
        this._debugLoggingEnabled = diagnostics.fullDepthDebugLoggingEnabled;

        this._sideIdDisplay = OrderSide.idToDisplay(sideId);
        switch (this.sideId) {
            case OrderSideId.Ask: {
                this._initialPreviousPrice = newDecimal(Number.MIN_VALUE);
                break;
            }
            case OrderSideId.Bid: {
                this._initialPreviousPrice = newDecimal(Number.MAX_VALUE);
                break;
            }
            default:
                throw new UnreachableCaseError('FDSGRSC42289', this.sideId);
        }
    }

    get recordCount(): number { return this.getRecordCount(); }

    finalise() {
        this.finaliseDataItem();
    }

    open(value: DepthDataItem, expand: boolean) {
        this._dataItem = value;
        this._dataItemOrders = this._dataItem.getOrders(this.sideId);

        this._dataCorrectnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
            () => { this.processDataCorrectnessChanged(); }
        );

        this._afterOrderAddSubscriptionId = this._dataItem.subscribeAfterOrderInsertEvent(
            this.sideId, (index) => { this.handleAfterOrderInsertEvent(index); }
        );
        this._beforeOrderRemoveSubscriptionId = this._dataItem.subscribeBeforeOrderRemoveEvent(
            this.sideId, (index) => { this.handleBeforeOrderRemoveEvent(index); }
        );
        this._orderChangeSubscriptionId = this._dataItem.subscribeOrderChangeEvent(
            this.sideId,
            (index, oldQuantity, oldHasUndisclosed, valueChanges) => {
                this.handleOrderChangeEvent(index, oldQuantity, oldHasUndisclosed, valueChanges);
            }
        );
        this._orderMoveAndChangeSubscriptionId = this._dataItem.subscribeOrderMoveAndChangeEvent(
            this.sideId,
            (fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges) => {
                this.handleOrderMoveAndChangeEvent(fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
            }
        );
        this._ordersClearSubscriptionId = this._dataItem.subscribeBeforeOrdersClearEvent(() => { this.handleOrdersClearEvent(); });

        this._dataItemFinalised = false;

        this.processDataCorrectnessChanged();
    }

    close() {
        this.clearOrders();
        this.finaliseDataItem();
        this.resetOpenPopulated();
    }

    toggleRecordOrderPriceLevel(recordIndex: Integer) {
        const record = this._records[recordIndex];
        switch (record.typeId) {
            case DepthRecord.TypeId.Order:
                this.convertOrderToPriceLevel(record as OrderFullDepthRecord);
                break;
            case DepthRecord.TypeId.PriceLevel:
                this.convertPriceLevelToOrder(record as PriceLevelFullDepthRecord);
                break;
            default:
                throw new UnreachableCaseError('FDSGDSTROPL55857', record.typeId);
        }
    }

    setAllRecordsToOrder() {
        // const oldLength = this._records.length;
        if (this._orderIndex.length > 0) {
            this._records.length = this._orderIndex.length;
            for (let i = 0; i < this._orderIndex.length; i++) {
                this._records[i] = new OrderFullDepthRecord(i, this._dataItemOrders[i], 0, this._auctionVolume);
                this._orderIndex[i] = this._records[i];
            }
            this.processAuctionAndVolumeAhead(0, true);
        }
        this._newPriceLevelAsOrder = true;

        this.eventifyRecordsLoaded();

        this.checkConsistency();
    }

    setAllRecordsToPriceLevel() {
        let recordCount = 0;
        // const oldLength = this._records.length;
        if (this._orderIndex.length > 0) {
            this._records.length = this._orderIndex.length; // maximum possible
            let additionalOrderCount = 0;
            let record = new PriceLevelFullDepthRecord(0, this._dataItemOrders[0], 0, this._auctionVolume);
            let firstAdditionalOrderIdx = 1;
            this._orderIndex[0] = record;
            for (let i = 1; i < this._orderIndex.length; i++) {
                if (isDecimalEqual(this._dataItemOrders[i].price, record.price)) {
                    additionalOrderCount++;
                } else {
                    if (additionalOrderCount > 0) {
                        record.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
                    }
                    this._records[recordCount++] = record;

                    record = new PriceLevelFullDepthRecord(record.index + 1, this._dataItemOrders[i], 0, this._auctionVolume);
                    firstAdditionalOrderIdx = i + 1;
                    additionalOrderCount = 0;
                }
                this._orderIndex[i] = record;
            }

            if (additionalOrderCount > 0) {
                record.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
            }
            this._records[recordCount++] = record;

            this._records.length = recordCount;

            this.processAuctionAndVolumeAhead(0, true);
        }

        this.eventifyRecordsLoaded();

        this._newPriceLevelAsOrder = false;
        this.checkConsistency();
    }

    setNewPriceLevelAsOrder(value: boolean) {
        this._newPriceLevelAsOrder = true;
    }

    // GridDataStore methods
    getRecord(recordIndex: RevRecordIndex) {
        return this._records[recordIndex];
    }

    getRecords() {
        return this._records;
    }

    protected getRecordCount() {
        return this._records.length;
    }

    private processDataCorrectnessChanged() {
        switch (this._dataItem.correctnessId) {
            case CorrectnessId.Error:
                this.checkResolveOpenPopulated(false);
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                this.populateRecords(this._newPriceLevelAsOrder);
                break;
            case CorrectnessId.Suspect:
                break;
            default:
                throw new UnreachableCaseError('FDSGDS88843', this._dataItem.correctnessId);
        }
    }

    private handleAfterOrderInsertEvent(index: Integer) {
        if (this._dataItem.usable) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} AfterOrderInsert: ${index}`); }
            this.insertOrder(index);
            this.checkConsistency();
        }
    }

    private handleBeforeOrderRemoveEvent(index: Integer) {
        if (this._dataItem.usable) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} BeforeOrderRemove: ${index}`); }
            this.checkConsistency(); // before
            this.removeOrder(index);
        }
    }

    private handleOrderChangeEvent(index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        if (this._dataItem.usable) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) {
                logger.logDebug(`Depth: ${this._sideIdDisplay}` +
                    ` OrderChange: ${index} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                );
            }
            if (DepthDataItem.Order.ValueChange.arrayIncludesPriceField(valueChanges)) {
                // If order is in price level record, then it may move out - so treat as move
                this.moveAndChangeOrder(index, index, oldQuantity, oldHasUndisclosed, valueChanges);
            } else {
                this.changeOrder(index, oldQuantity, oldHasUndisclosed, valueChanges);
            }
            this.checkConsistency();
        }
    }

    private handleOrderMoveAndChangeEvent(fromIndex: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        if (this._dataItem.usable) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) {
                logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange: ${fromIndex} ${toIndex} ` +
                    `${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                );
            }
            this.moveAndChangeOrder(fromIndex, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
            this.checkConsistency();
        }
    }

    private handleOrdersClearEvent() {
        if (this._dataItem.usable) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${OrderSide.idToDisplay(this.sideId)} OrdersClear`); }
            this.checkConsistency(); // clear happens before
            this.clearOrders();
        }
    }

    private checkConsistency() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._consistencyCheckingEnabled) {
            if (this._orderIndex.length !== this._dataItemOrders.length) {
                throw new AssertInternalError(`Depth: OrderIndex length error: ${this._orderIndex.length} ${this._dataItemOrders.length}`);
            } else {
                let recordIndex = 0;
                let levelOrderIndex = 0;
                let previousPrice = newDecimal(this._initialPreviousPrice);
                let previousWasOrder = false;

                for (let i = 0; i < this._orderIndex.length; i++) {
                    if (recordIndex >= this._records.length) {
                        throw new AssertInternalError('DepthCheckConsistencey: records length', `${i} ${recordIndex}`);
                    }
                    const record = this._records[recordIndex];
                    if (this._orderIndex[i] !== record) {
                        throw new AssertInternalError('DepthCheckConsistencey: orderIndex', `${i} ${recordIndex}`);
                    } else {
                        const price = record.getPrice();
                        const previousPriceEqual = isDecimalEqual(price, previousPrice);
                        if (!previousPriceEqual) {
                            switch (this.sideId) {
                                case OrderSideId.Ask: {
                                    if (isDecimalLessThan(price, previousPrice)) {
                                        throw new AssertInternalError('DepthCheckConsistency: Ask order price decreasing',
                                            `${i}  ${recordIndex} ${price.toString()}`);
                                    }
                                    break;
                                }
                                case OrderSideId.Bid: {
                                    if (isDecimalGreaterThan(price, previousPrice)) {
                                        throw new AssertInternalError('DepthCheckConsistency: Bid order price increasing',
                                            `${i}  ${recordIndex} ${price.toString()}`);
                                    }
                                    break;
                                }
                                default:
                                    throw new UnreachableCaseError('FDSGRSCCSD29981', this.sideId);
                            }
                        }
                        switch (record.typeId) {
                            case DepthRecord.TypeId.Order: {
                                const orderRecord = record as OrderFullDepthRecord;
                                if (orderRecord.order !== this._dataItemOrders[i]) {
                                    throw new AssertInternalError('DepthCheckConsistency: order dataItemOrder', `${i} ${recordIndex}`);
                                } else {
                                    recordIndex++;
                                    levelOrderIndex = 0;
                                }
                                if (!previousWasOrder && previousPriceEqual) {
                                    throw new AssertInternalError('DepthCheckConsistency: order has same price as previous price level',
                                        `${i}  ${recordIndex}`);
                                }
                                previousWasOrder = true;
                                break;
                            }
                            case DepthRecord.TypeId.PriceLevel: {
                                const levelRecord = record as PriceLevelFullDepthRecord;
                                if (levelOrderIndex >= levelRecord.orders.length) {
                                    throw new AssertInternalError('DepthCheckConsistency: levelOrderCount',
                                        `${i}  ${recordIndex} ${levelOrderIndex}`);
                                } else {
                                    // The order of orders stored within a price level does not matter
                                    // Ignore the following consistency check
                                    // if (levelRecord.orders[levelOrderIndex] !== this._dataItemOrders[i]) {
                                    //     throw new AssertInternalError('DepthCheckConsistency: level dataItemOrder',
                                    //         `${i}  ${recordIndex} ${levelOrderIndex}`);
                                    // } else {
                                        levelOrderIndex++;
                                        if (levelOrderIndex >= levelRecord.orders.length) {
                                            recordIndex++;
                                            levelOrderIndex = 0;
                                        }
                                    }
                                // }
                                if (previousWasOrder && previousPriceEqual) {
                                    throw new AssertInternalError('DepthCheckConsistency: price level has same price as previous order',
                                        `${i}  ${recordIndex} ${levelOrderIndex}`);
                                }
                                previousWasOrder = false;
                                break;
                            }
                            default:
                                throw new UnreachableCaseError('FDSGDSCCR29987', record.typeId);
                        }
                        previousPrice = price;
                    }
                }
            }
        }
    }

    private reindexRecords(fromIndex: Integer) {
        for (let i = fromIndex; i < this._records.length; i++) {
            this._records[i].index = i;
        }
    }

    private createFullDepthRecordForNewPriceLevel(index: Integer, order: DepthDataItem.Order,
        volumeAhead: Integer | undefined, auctionQuantity: Integer | undefined
    ) {
        if (this._newPriceLevelAsOrder) {
            return new OrderFullDepthRecord(index, order, volumeAhead, auctionQuantity);
        } else {
            return new PriceLevelFullDepthRecord(index, order, volumeAhead, auctionQuantity);
        }
    }

    private insertOrder(index: Integer) {
        const order = this._dataItemOrders[index];

        // if not last, see if merge into successive order's price record or see if first (as first has not previous)
        if (index < this._orderIndex.length) {
            const succOrderRecord = this._orderIndex[index]; // not spliced yet so successive order is still at index
            const succPrice = succOrderRecord.getPrice();
            const succPriceEqual = isDecimalEqual(succPrice, order.price);
            if (succPriceEqual && FullDepthRecord.isPriceLevel(succOrderRecord)) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-MergeSuccessive: ${index}`); }
                succOrderRecord.addOrder(order);
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(succOrderRecord.index, false);
                this._orderIndex.splice(index, 0, succOrderRecord);
                this.eventifyInvalidateRecordAndFollowingRecords(succOrderRecord.index, lastAffectedFollowingRecordIndex);
                return;
            }

            if (index === 0) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-First: ${index}`); }
                // new price level at first record position
                let firstRecord: FullDepthRecord;
                if (succPriceEqual) {
                    // If successor price is equal it must be order.  Make sure this is order as well otherwise merge would be needed
                    firstRecord = new OrderFullDepthRecord(0, order, 0, this._auctionVolume)
                } else {
                    firstRecord = this.createFullDepthRecordForNewPriceLevel(0, order, 0, this._auctionVolume);
                }
                this._records.unshift(firstRecord);
                this.reindexRecords(1);
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(0, false);
                this._orderIndex.splice(0, 0, firstRecord);
                this.eventifyRecordInserted(0, lastAffectedFollowingRecordIndex);
                return;
            }
        }

        // If not first, see if previous record is price and same price.  If so, merge
        if (index > 0) {
            const prevOrderRecord = this._orderIndex[index - 1];
            const prevPrice = prevOrderRecord.getPrice();
            const prevPriceEqual = isDecimalEqual(prevPrice, order.price);
            if (prevPriceEqual && FullDepthRecord.isPriceLevel(prevOrderRecord)) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-MergePrevious: ${index}`); }
                prevOrderRecord.addOrder(order);
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(prevOrderRecord.index, false);
                this._orderIndex.splice(index, 0, prevOrderRecord);
                this.eventifyInvalidateRecordAndFollowingRecords(prevOrderRecord.index, lastAffectedFollowingRecordIndex);
                return;
            }

            // no merge required and not first. Add new record
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewButNotOnly: ${index}`); }
            const recordIndex = prevOrderRecord.index + 1;
            let record: FullDepthRecord;
            const volumeAhead = prevOrderRecord.cumulativeQuantity;
            if (prevPriceEqual) {
                // If previous price is equal then previous must be order.  Make sure this is order as well otherwise merge would be needed
                record = new OrderFullDepthRecord(recordIndex, order, volumeAhead, this._auctionVolume)
            } else {
                record = this.createFullDepthRecordForNewPriceLevel(recordIndex, order, volumeAhead, this._auctionVolume);
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (debug && index === this._records.length) {
                logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewButNotOnly-Last: ${index}`);
            }
            this._records.splice(recordIndex, 0, record); // may be last
            this.reindexRecords(recordIndex + 1);
            const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
            this._orderIndex.splice(index, 0, record); // may be last
            this.eventifyRecordInserted(recordIndex, lastAffectedFollowingRecordIndex);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Insert-NewOnly: ${index}`); }
        // first and only record
        const onlyRecord = this.createFullDepthRecordForNewPriceLevel(0, order, 0, this._auctionVolume);
        this._records.push(onlyRecord);
        this._orderIndex.push(onlyRecord);
        onlyRecord.processAuctionAndVolumeAhead(0, this._auctionVolume);
        this.eventifyRecordInserted(0, undefined);
    }

    private removeRecord(recordIndex: Integer) {
        this._records.splice(recordIndex, 1);
        let lastAffectedFollowingRecordIndex: Integer | undefined;
        if (recordIndex >= this._records.length) {
            lastAffectedFollowingRecordIndex = undefined;
        } else {
            this.reindexRecords(recordIndex);
            lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
        }
        this.eventifyRecordDeleted(recordIndex, lastAffectedFollowingRecordIndex);
    }

    private removeOrder(index: Integer) {
        const record = this._orderIndex[index];
        const recordIndex = record.index;
        this._orderIndex.splice(index, 1);
        switch (record.typeId) {
            case DepthRecord.TypeId.Order: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-Order: ${index}`); }
                this.removeRecord(recordIndex);
                break;
            }
            case DepthRecord.TypeId.PriceLevel: {
                const priceLevelRecord = record as PriceLevelFullDepthRecord;
                if (priceLevelRecord.count === 1) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-LastPrice: ${index}`); }
                    this.removeRecord(recordIndex);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this._debugLoggingEnabled) { logger.logDebug(`Depth: ${this._sideIdDisplay} Remove-NotLastPrice: ${index}`); }
                    // remove order from existing price level record
                    const order = this._dataItemOrders[index];
                    priceLevelRecord.removeOrder(order, order.quantity, order.hasUndisclosed);
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(recordIndex, false);
                    this.eventifyInvalidateRecordAndFollowingRecords(recordIndex, lastAffectedFollowingRecordIndex);
                }
                break;
            }
            default:
                throw new UnreachableCaseError('FDSGDSMACO12121', record.typeId);
        }
    }

    private changeOrder(index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        const record = this._orderIndex[index];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._debugLoggingEnabled) {
            logger.logDebug(`Depth: ${this._sideIdDisplay}` +
                ` changeOrder: ${index} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
            );
        }

        const invalidatedValues = this.processRecordOrderValueChanges(record, this._dataItemOrders[index], oldQuantity, oldHasUndisclosed, valueChanges);
        const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(record.index, false);
        this.eventifyInvalidateRecordAndValuesAndFollowingRecords(record.index, invalidatedValues, lastAffectedFollowingRecordIndex);
        this.eventifyInvalidateRecordAndFollowingRecords(record.index, lastAffectedFollowingRecordIndex);
    }

    private moveAndChangeOrder(
        fromOrderIdx: Integer,
        toOrderIdx: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        // order has already been modified and moved to toIndex in DataItem
        // work out whether fromIndex record will be deleted or have order extracted
        const toOrder = this._dataItemOrders[toOrderIdx];
        const fromRecord = this._orderIndex[fromOrderIdx];
        const fromRecordIdx = fromRecord.index;
        const fromRecordToBeKept = fromRecord.getCount() > 1; //  && !isDecimalEqual(fromRecord.getPrice(), toOrder.price)

        let toRecord: FullDepthRecord | undefined;
        let toRecordInvalidatedValues: RevRecordInvalidatedValue[] | undefined;

        // let toRecord = this._orderIndex[toOrderIdx];
        // let toToBeMerged: boolean;
        // if (FullDepthRecord.isPriceLevel(toRecord) && isDecimalEqual(toRecord.price, toOrder.price)) {
        //     // merge into existing toRecord
        //     toToBeMerged = true;
        // } else {
        //     // see if merge with record on other side
        //     if (toOrderIdx > fromOrderIdx) {
        //         // check if merge into next record
        //         if (toRecord.index === this._records.length - 1) {
        //             // toRecord is last record. No next record
        //             toToBeMerged = false;
        //         } else {
        //             const nextRecord = this._records[toRecord.index + 1];
        //             if (nextRecord.typeId === DepthRecord.TypeId.PriceLevel && isDecimalEqual(nextRecord.getPrice(), toOrder.price)) {
        //                 // merge into next
        //                 toRecord = nextRecord;
        //                 toToBeMerged = true;
        //             } else {
        //                 // insert after toRecord
        //                 toToBeMerged = false;
        //             }
        //         }
        //     } else {
        //         // check if merge into previous record
        //         if (toRecord.index === 0) {
        //             // toRecord is first record. No previous record
        //             toToBeMerged = false;
        //         } else {
        //             const prevRecord = this._records[toRecord.index - 1];
        //             if (prevRecord.typeId === DepthRecord.TypeId.PriceLevel && isDecimalEqual(prevRecord.getPrice(), toOrder.price)) {
        //                 // merge into previous
        //                 toRecord = prevRecord;
        //                 toToBeMerged = true;
        //             } else {
        //                 // insert before toRecord
        //                 toToBeMerged = false;
        //             }
        //         }
        //     }
        // }

        // const toRecordIdx = toRecord.index;

        this.eventifyBeginChange();
        try {
            // merge, demerge, shuffle, remove and insert as necessary
            const toRecordCalculation = this.calculateToRecordForMove(fromOrderIdx, fromRecordToBeKept, toOrderIdx, toOrder.price);
            if (fromRecordToBeKept) {
                if (FullDepthSideGridRecordStore.ToRecordCalculation.isMergeWithExisting(toRecordCalculation)) {
                    toRecord = toRecordCalculation.existingRecord;

                    if (fromRecord === toRecord) {
                        toRecordInvalidatedValues = this.processRecordOrderValueChanges(toRecord, toOrder, oldQuantity, oldHasUndisclosed, valueChanges);
                    } else {
                        const fromPriceLevelRecord = fromRecord as PriceLevelFullDepthRecord;
                        fromPriceLevelRecord.removeOrder(toOrder, oldQuantity, oldHasUndisclosed);

                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (this._debugLoggingEnabled) {
                            logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - fromDemerge, toMerge:` +
                                ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                            );
                        }

                        if (FullDepthRecord.isOrder(toRecord)) {
                            toRecord = new PriceLevelFullDepthRecord(toRecord.index, toOrder, undefined, undefined);
                        }

                        toRecordInvalidatedValues = (toRecord as PriceLevelFullDepthRecord).addOrder(toOrder);
                    }
                } else {
                    // create and insert 'to' record
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this._debugLoggingEnabled) {
                        logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - fromDemerge, to:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                        );
                    }

                    const fromPriceLevelRecord = fromRecord as PriceLevelFullDepthRecord;
                    fromPriceLevelRecord.removeOrder(toOrder, oldQuantity, oldHasUndisclosed);

                    const newAtIndexToRecordCalculation = toRecordCalculation as FullDepthSideGridRecordStore.NewAtIndexToRecordCalculation;
                    const toRecordIdx = newAtIndexToRecordCalculation.newIndex;
                    if (newAtIndexToRecordCalculation.forceAsOrder) {
                        toRecord = new OrderFullDepthRecord(toRecordIdx, toOrder, undefined, undefined);
                    } else {
                        toRecord = this.createFullDepthRecordForNewPriceLevel(toRecordIdx, toOrder, undefined, undefined);
                    }
                    this._records.splice(toRecordIdx, 0, toRecord);

                    this.reindexRecords(toRecordIdx + 1);
                    this.eventifyRecordInserted(toRecordIdx, undefined);
                }
            } else {
                // From record will be removed (unless order is merged into it again)
                if (FullDepthSideGridRecordStore.ToRecordCalculation.isMergeWithExisting(toRecordCalculation)) {
                    toRecord = toRecordCalculation.existingRecord;
                    if (fromRecord === toRecord) {
                        toRecordInvalidatedValues = this.processRecordOrderValueChanges(toRecord, toOrder, oldQuantity, oldHasUndisclosed, valueChanges);
                    } else {
                        // merge
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (this._debugLoggingEnabled) {
                            logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - from, toMerge:` +
                                ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                            );
                        }

                        if (FullDepthRecord.isOrder(toRecord)) {
                            toRecord = new PriceLevelFullDepthRecord(toRecord.index, toOrder, undefined, undefined);
                        }

                        toRecordInvalidatedValues = (toRecord as PriceLevelFullDepthRecord).addOrder(toOrder);

                        // delete 'from' record
                        this._records.splice(fromRecordIdx, 1);

                        this.reindexRecords(fromRecordIdx);
                        this.eventifyRecordDeleted(fromRecordIdx, undefined);
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this._debugLoggingEnabled) {
                        logger.logDebug(`Depth: ${this._sideIdDisplay} OrderMoveAndChange - from, to:` +
                            ` ${fromOrderIdx} ${toOrderIdx} ${oldQuantity} ${oldHasUndisclosed?'t':'f'} ${valueChanges.length}`
                        );
                    }

                    // FromRecord points to toOrder
                    toRecordInvalidatedValues = this.processRecordOrderValueChanges(fromRecord, toOrder, oldQuantity, oldHasUndisclosed, valueChanges);

                    const newAtIndexToRecordCalculation = toRecordCalculation as FullDepthSideGridRecordStore.NewAtIndexToRecordCalculation;
                    const toRecordIdx = newAtIndexToRecordCalculation.newIndex;

                    if (toRecordIdx !== fromRecordIdx) {
                        // shuffle records to remove and make space for 'from' at toIndex
                        if (toRecordIdx > fromRecordIdx) {
                            for (let i = fromRecordIdx; i < toRecordIdx; i++) {
                                this._records[i] = this._records[i + 1];
                                this._records[i].index = i;
                            }
                        } else {
                            for (let i = fromRecordIdx; i > toRecordIdx; i--) {
                                this._records[i] = this._records[i - 1];
                                this._records[i].index = i;
                            }
                        }

                        this.eventifyRecordMoved(fromRecordIdx, toRecordIdx);
                    }

                    // convert 'from' record to correct type if necessary
                    const orderTypeRequired = newAtIndexToRecordCalculation.forceAsOrder || this._newPriceLevelAsOrder;
                    if (orderTypeRequired) {
                        if (FullDepthRecord.isPriceLevel(fromRecord)) {
                            const orders = fromRecord.orders;
                            if (orders.length !== 1) {
                                throw new AssertInternalError('FDSSGRSCTRFMFR30100', orders.length.toString());
                            } else {
                                toRecord = new OrderFullDepthRecord(toRecordIdx, orders[0], undefined, undefined);
                            }
                        } else {
                            toRecord = fromRecord;
                            toRecord.index = toRecordIdx;
                        }
                    } else {
                        if (FullDepthRecord.isOrder(fromRecord)) {
                            const order = fromRecord.order;
                            toRecord = new PriceLevelFullDepthRecord(toRecordIdx, order, undefined, undefined);
                        } else {
                            toRecord = fromRecord;
                            toRecord.index = toRecordIdx;
                        }
                    }

                    // Move into vacated slot in this._records if not already there.  (May already be there if nothing was moved.)
                    if (toRecord !== this._records[toRecordIdx]) {
                        this._records[toRecordIdx] = toRecord;
                        this.eventifyRecordReplaced(toRecordIdx);
                    }
                }
            }

            if (toOrderIdx !== fromOrderIdx) {
                // move element in OrderIndex
                moveElementInArray<FullDepthRecord>(this._orderIndex, fromOrderIdx, toOrderIdx);
            }
            this._orderIndex[toOrderIdx] = toRecord;

            // reindex and recalculate Auction and Quantity Ahead
            let lowRecordIdx: Integer;
            const toRecordIdx = toRecord.index;
            if (toRecordIdx > fromRecordIdx) {
                lowRecordIdx = fromRecordIdx;
            } else {
                lowRecordIdx = toRecordIdx;
            }
            this.processAuctionAndVolumeAhead(lowRecordIdx, false);

            const recordCount = this._records.length;
            if (toRecordInvalidatedValues === undefined) {
                this.eventifyInvalidateRecords(lowRecordIdx, recordCount - lowRecordIdx);
            } else {
                this.eventifyInvalidateRecordsAndRecordValues(lowRecordIdx, recordCount - lowRecordIdx, toRecord.index, toRecordInvalidatedValues);
            }
        } finally {
            this.eventifyEndChange();
        }
    }

    private calculateMoveToWithFromRecordKept(fromOrderIdx: Integer, toOrderIdx: Integer, toPrice: Decimal): FullDepthSideGridRecordStore.ToRecordCalculation {
        // toRecord is defined if merge required
        // If toRecord is undefined, then toRecordIdx indicates where new toRecord should be inserted
        // Assumes orderIndex has not yet been updated to reflect order move
        const atToRecord = this._orderIndex[toOrderIdx];
        if (FullDepthRecord.isPriceLevel(atToRecord) && isDecimalEqual(atToRecord.price, toPrice)) {
            return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(atToRecord);
        } else {
            if (toOrderIdx === 0) {
                return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(0);
            } else {
                const prevRecord = this._orderIndex[toOrderIdx - 1];
                if (isDecimalEqual(prevRecord.getPrice(), toPrice)) {
                    if (FullDepthRecord.isPriceLevel(prevRecord)) {
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(prevRecord);
                    } else {
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(prevRecord.index + 1);
                    }
                } else {
                    const atToRecordIndex = atToRecord.index;
                    const newRecordIndex = toOrderIdx < fromOrderIdx ? atToRecordIndex : atToRecordIndex + 1;
                    return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(newRecordIndex);
                }
            }
        }
    }

    private calculateToRecordForMove(fromOrderIdx: Integer, fromRecordKept: boolean, toOrderIdx: Integer, toPrice: Decimal): FullDepthSideGridRecordStore.ToRecordCalculation {
        // Calculate what type of ToRecord is needed.
        // Can either be an existing record into which the toOrder will be merged or a new record.  If it is a new record, calculate its index
        // Uses this._orderIndex which specifies the record each Depth order had PRIOR to the move in the Depth DataItem
        // fromRecordKept specifies whether the fromRecord will be kept or deleted as part of the move
        const existingToRecord = this._orderIndex[toOrderIdx];

        if (toOrderIdx < fromOrderIdx || fromRecordKept) { // If toOrderIdx <= fromOrderIdx then fromRecordKept not relevent.  If fromRecordKept then insert or merge
            // toRecord will either between records associated with toOrderIdx and previous toOrderIdx, or merged with one of these.
            if (isDecimalEqual(existingToRecord.getPrice(), toPrice)) {
                // Same price as existing at toOrderIndex. Merge if PriceLevel otherwise insert as order type before.
                if (FullDepthRecord.isPriceLevel(existingToRecord)) {
                    return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(existingToRecord);
                } else {
                    const existingToRecordIndex = existingToRecord.index;
                    const newRecordIndex = toOrderIdx > fromOrderIdx ? existingToRecordIndex + 1 : existingToRecordIndex;
                    return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(newRecordIndex);
                }
            } else {
                if (toOrderIdx === 0) {
                    // There is no previous and not same as toOrderIndex so just insert at start
                    return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(0);
                } else {
                    // Compare against previous
                    const prevRecord = this._orderIndex[toOrderIdx - 1];
                    if (isDecimalEqual(prevRecord.getPrice(), toPrice)) {
                        // Same price as existing at previous.  Merge if PriceLevel otherwise insert as order type before
                        if (FullDepthRecord.isPriceLevel(prevRecord)) {
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(prevRecord);
                        } else {
                            const existingToRecordIndex = existingToRecord.index;
                            const newRecordIndex = toOrderIdx > fromOrderIdx ? existingToRecordIndex + 1 : existingToRecordIndex;
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(newRecordIndex);
                        }
                    } else {
                        // Price does not match record either side.  Insert before
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(existingToRecord.index);
                    }
                }
            }
        } else {
            if (toOrderIdx > fromOrderIdx) {
                // toRecord will either between records associated with toOrderIdx and next toOrderIdx, or merged with one of these.
                if (isDecimalEqual(existingToRecord.getPrice(), toPrice)) {
                    // Same price as existing at toOrderIndex. Merge if PriceLevel otherwise move as order type after.
                    if (FullDepthRecord.isPriceLevel(existingToRecord)) {
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(existingToRecord);
                    } else {
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(existingToRecord.index);
                    }
                } else {
                    if (toOrderIdx === this._orderIndex.length - 1) {
                        // There is no next and not same as toOrderIndex so just move to end
                        return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(this._records.length - 1);
                    } else {
                        const nextRecord = this._orderIndex[toOrderIdx + 1];
                        if (isDecimalEqual(nextRecord.getPrice(), toPrice)) {
                            // Same price as existing at after. Merge if PriceLevel otherwise move as order type after.
                            if (FullDepthRecord.isPriceLevel(nextRecord)) {
                                return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(nextRecord);
                            } else {
                                return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(existingToRecord.index);
                            }
                        } else {
                            // Price does not match record either side.  Move after
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(existingToRecord.index);
                        }
                    }
                }
            } else {
                // toOrderIdx === fromOrderIdx && from record not kept
                // toRecord will either between records associated with previous toOrderIdx and next toOrderIdx, or merged with one of these.
                if (toOrderIdx > 0) {
                    // Compare against previous
                    const prevRecord = this._orderIndex[toOrderIdx - 1];
                    if (isDecimalEqual(prevRecord.getPrice(), toPrice)) {
                        // Same price as existing at previous.  Merge if PriceLevel otherwise insert as order type before
                        if (FullDepthRecord.isPriceLevel(prevRecord)) {
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(prevRecord);
                        } else {
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(existingToRecord.index);
                        }
                    }
                }
                if (toOrderIdx < this._orderIndex.length - 1) {
                    // Compare against next
                    const nextRecord = this._orderIndex[toOrderIdx + 1];
                    if (isDecimalEqual(nextRecord.getPrice(), toPrice)) {
                        // Same price as existing at after. Merge if PriceLevel otherwise move as order type after.
                        if (FullDepthRecord.isPriceLevel(nextRecord)) {
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createMergeWithExisting(nextRecord);
                        } else {
                            return FullDepthSideGridRecordStore.ToRecordCalculation.createNewAsOrder(existingToRecord.index);
                        }
                    }
                }
                // no merging and record not kept so stays at same position
                return FullDepthSideGridRecordStore.ToRecordCalculation.createNew(existingToRecord.index);
            }
        }
    }

    // private createToRecordFromMovedFromRecord(fromRecord: FullDepthRecord, toRecordIdx: Integer): FullDepthRecord {
    //     const fromPrice = fromRecord.getPrice();

    //     // If record either side has same price, then we must be in an expanded price level.  In this case, must create order record
    //     let orderTypeRequired: boolean;
    //     // Check if previous record has same price
    //     if (toRecordIdx === 0) {
    //         orderTypeRequired = false;
    //     } else {
    //         const previousRecord = this._records[toRecordIdx - 1];
    //         orderTypeRequired = isDecimalEqual(previousRecord.getPrice(), fromPrice);
    //     }

    //     if (!orderTypeRequired) {
    //         // Check if subsequent record has same price
    //         if (toRecordIdx < this._records.length - 1) {
    //             const nextRecord = this._records[toRecordIdx + 1];
    //             orderTypeRequired = isDecimalEqual(nextRecord.getPrice(), fromPrice);
    //         }
    //     }

    //     if (!orderTypeRequired) {
    //         // Price is different from records either side - treat like a new price level
    //         if (this._newPriceLevelAsOrder) {
    //             orderTypeRequired = true;
    //         }
    //     }

    //     // Convert to required record type as appropriate
    //     let result: FullDepthRecord;
    //     if (orderTypeRequired) {
    //         if (FullDepthRecord.isPriceLevel(fromRecord)) {
    //             const orders = fromRecord.orders;
    //             if (orders.length !== 1) {
    //                 throw new AssertInternalError('FDSSGRSCTRFMFR30100', orders.length.toString());
    //             } else {
    //                 result = new OrderFullDepthRecord(toRecordIdx, orders[0], undefined, undefined);
    //             }
    //         } else {
    //             result = fromRecord;
    //         }
    //     } else {
    //         if (FullDepthRecord.isOrder(fromRecord)) {
    //             const order = fromRecord.order;
    //             result = new PriceLevelFullDepthRecord(toRecordIdx, order, undefined, undefined);
    //         } else {
    //             result = fromRecord;
    //         }
    //     }

    //     result.index = toRecordIdx;
    //     return result;
    // }

    private processRecordOrderValueChanges(
        record: FullDepthRecord,
        newOrder: DepthDataItem.Order,
        oldOrderQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]
    ) {
        switch (record.typeId) {
            case DepthRecord.TypeId.Order: {
                const orderRecord = record as OrderFullDepthRecord;
                return orderRecord.processOrderValueChanges(valueChanges);
            }
            case DepthRecord.TypeId.PriceLevel: {
                const priceLevelRecord = record as PriceLevelFullDepthRecord;
                return priceLevelRecord.processOrderChange(newOrder, oldOrderQuantity, oldHasUndisclosed, valueChanges);
            }
            default:
                throw new UnreachableCaseError('FDSGRSPROVC30007', record.typeId);
        }
    }

    private clearOrders() {
        this._orderIndex.length = 0;
        this._records.length = 0;
        this.eventifyAllRecordsDeleted();
    }

    private convertOrderToPriceLevel(record: OrderFullDepthRecord) {
        this.checkConsistency();

        let orderIdx = this._orderIndex.indexOf(record);
        if (orderIdx < 0) {
            throw new AssertInternalError('FDSGDSFDRCOTPL11134', `${orderIdx}`);
        } else {
            // find first order record with same price
            const price = record.getPrice();
            while (--orderIdx >= 0 ) {
                if (!isDecimalEqual(this._orderIndex[orderIdx].getPrice(), price)) {
                    break;
                }
            }
            const firstOrderIdx = ++orderIdx;

            // create price level record
            const firstOrderRecord = this._orderIndex[firstOrderIdx];
            const levelRecordIndex = firstOrderRecord.index;
            if (!FullDepthRecord.isOrder(firstOrderRecord)) {
                throw new AssertInternalError('FDSGDSFDSGDSCOTPL22245', JSON.stringify(firstOrderRecord));
            } else {
                const levelRecord = new PriceLevelFullDepthRecord(levelRecordIndex,
                    firstOrderRecord.order, firstOrderRecord.volumeAhead, this._auctionVolume
                );

                // replace first order record with price level record
                this._orderIndex[firstOrderIdx] = levelRecord;
                this._records[levelRecordIndex] = levelRecord;

                // find range of additional orders with same price
                const firstAdditionalOrderIdx = firstOrderIdx + 1;
                orderIdx = firstAdditionalOrderIdx;
                const orderIndexLength = this._orderIndex.length;
                while (orderIdx < orderIndexLength) {
                    if (isDecimalEqual(this._dataItemOrders[orderIdx].price, price)) {
                        // throw a test in here to confirm is order record
                        const additionalOrderRecord = this._orderIndex[orderIdx];
                        if (!FullDepthRecord.isOrder(additionalOrderRecord)) {
                            throw new AssertInternalError('FDSGDSFDSGDSCOTPL98732', `${additionalOrderRecord.index}`);
                        } else {
                            this._orderIndex[orderIdx++] = levelRecord;
                        }
                    } else {
                        break;
                    }
                }

                // add additional orders to record and insert record in _records
                const additionalOrderCount = orderIdx - firstAdditionalOrderIdx;
                if (additionalOrderCount === 0) {
                    // fix Auction quantity and invalidate
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(levelRecord.index, false);
                    this.eventifyRecordsSplicedAndInvalidateUpTo(levelRecordIndex, 1, 1, lastAffectedFollowingRecordIndex);
                } else {
                    levelRecord.addOrders(this._dataItemOrders, firstAdditionalOrderIdx, additionalOrderCount);
                    // remove additional order records and from orderIndex
                    this._records.splice(levelRecordIndex + 1, additionalOrderCount);
                    this.reindexRecords(levelRecordIndex);
                    // fix Auction quantity and invalidate
                    const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(levelRecordIndex, false);
                    this.eventifyRecordsSplicedAndInvalidateUpTo(
                        levelRecordIndex,
                        1 + additionalOrderCount,
                        1,
                        lastAffectedFollowingRecordIndex
                    );
                }
            }
        }
        this.checkConsistency();
    }

    private convertPriceLevelToOrder(record: PriceLevelFullDepthRecord) {
        const firstOrderIdx = this._orderIndex.indexOf(record);
        if (firstOrderIdx < 0) {
            throw new AssertInternalError('FDSGDSFDRCOTPL11136', `${firstOrderIdx}`);
        } else {
            const firstRecordIdx = record.index;

            // replace existing record with first order record
            const firstRecord = new OrderFullDepthRecord(firstRecordIdx, this._dataItemOrders[firstOrderIdx],
                record.volumeAhead, this._auctionVolume);
            this._orderIndex[firstOrderIdx] = firstRecord;
            this._records[record.index] = firstRecord;

            const additionalOrderCount = record.orders.length - 1;
            if (additionalOrderCount === 0) {
                // no additional orders
                // fix Auction quantity and invalidate
                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(firstRecord.index, false);
                this.eventifyRecordsSplicedAndInvalidateUpTo(firstRecord.index, 1, 1, lastAffectedFollowingRecordIndex);
            } else {
                // create order records for subsequent orders at this price
                const firstAdditionalOrderIdx = firstOrderIdx + 1;

                const firstAdditionalRecordIdx = firstRecordIdx + 1;
                const additionalOrderRecords = new Array<OrderFullDepthRecord>(additionalOrderCount);
                for (let i = 0; i < additionalOrderCount; i++) {
                    const recordIdx = firstAdditionalRecordIdx + i;
                    const order = this._dataItemOrders[firstAdditionalOrderIdx + i];
                    const additionalOrderRecord = new OrderFullDepthRecord(recordIdx, order, 0, this._auctionVolume);
                    additionalOrderRecords[i] = additionalOrderRecord;

                    // replace level record in orderIndex with additional order record
                    const orderIdx = firstAdditionalOrderIdx + i;
                    this._orderIndex[orderIdx] = additionalOrderRecord;
                }

                // add additional order records to _records
                this._records.splice(firstAdditionalRecordIdx, 0, ...additionalOrderRecords);
                this.reindexRecords(firstRecordIdx);

                const lastAffectedFollowingRecordIndex = this.processAuctionAndVolumeAhead(firstRecord.index, false);
                this.eventifyRecordsSplicedAndInvalidateUpTo(
                    firstRecord.index,
                    1,
                    1 + additionalOrderCount,
                    lastAffectedFollowingRecordIndex
                );
            }
        }
        this.checkConsistency();
    }

    private populateRecords(expand: boolean) {
        this._orderIndex.length = this._dataItemOrders.length;
        if (expand) {
            this.setAllRecordsToOrder();
        } else {
            this.setAllRecordsToPriceLevel();
        }
        this.checkConsistency();

        super.checkResolveOpenPopulated(true);
    }

    private finaliseDataItem() {
        if (!this._dataItemFinalised) {
            this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataCorrectnessChangeSubscriptionId);
            this._dataItem.unsubscribeAfterOrderInsertEvent(this.sideId, this._afterOrderAddSubscriptionId);
            this._dataItem.unsubscribeBeforeOrderRemoveEvent(this.sideId, this._beforeOrderRemoveSubscriptionId);
            this._dataItem.unsubscribeOrderChangeEvent(this.sideId, this._orderChangeSubscriptionId);
            this._dataItem.unsubscribeOrderMoveAndChangeEvent(this.sideId, this._orderMoveAndChangeSubscriptionId);
            this._dataItem.unsubscribeBeforeOrdersClearEvent(this._ordersClearSubscriptionId);

            this._dataItemFinalised = true;
        }
    }
}

export namespace FullDepthSideGridRecordStore {

    export interface ToRecordCalculation {
        mergeWithExisting: boolean;
    }

    export namespace ToRecordCalculation {
        export function isMergeWithExisting(result: ToRecordCalculation): result is MergeWithExistingToRecordCalculation {
            return result.mergeWithExisting;
        }

        export function createMergeWithExisting(existingRecord: PriceLevelFullDepthRecord): MergeWithExistingToRecordCalculation {
            return {
                mergeWithExisting: true,
                existingRecord,
            };
        }

        export function createNew(newIndex: Integer): NewAtIndexToRecordCalculation {
            return {
                mergeWithExisting: false,
                newIndex,
                forceAsOrder: false,
            };
        }

        export function createNewAsOrder(newIndex: Integer): NewAtIndexToRecordCalculation {
            return {
                mergeWithExisting: false,
                newIndex,
                forceAsOrder: true,
            };
        }
    }

    export interface MergeWithExistingToRecordCalculation extends ToRecordCalculation {
        readonly mergeWithExisting: true;
        readonly existingRecord: FullDepthRecord;
    }

    export interface NewAtIndexToRecordCalculation extends ToRecordCalculation{
        readonly mergeWithExisting: false;
        readonly newIndex: Integer;
        readonly forceAsOrder: boolean;
    }
}

const debug = true;
