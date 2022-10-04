/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Scan, ScansDataDefinition } from '../adi/adi-internal-api';
import { ScansDataItem } from '../adi/scans-data-item';
import { MultiEvent, UnreachableCaseError } from '../sys/sys-internal-api';
import { Integer, UsableListChangeTypeId } from '../sys/types';
import { EditableScan } from './editable-scan';

export class ScansService {
    private readonly _scans = new Array<EditableScan>();
    private readonly _scanIdMap = new Map<string, EditableScan>();
    private _scansOnline = false;
    private _scansOnlineResolves = new Array<ScansService.ScansOnlineResolve>();

    private _scansDataItem: ScansDataItem;
    private _scansListChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<ScansService.ListChangeEventHandler>();
    private _scanChangeMultiEvent = new MultiEvent<ScansService.RecordChangeEventHandler>();
    private _correctnessChangeMultiEvent = new MultiEvent<ScansService.CorrectnessChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<ScansService.BadnessChangeEventHandler>();

    constructor(private readonly _adi: AdiService) {
        // const initialCount = ScansService.initialScans.length;
        // for (let i = 0; i < initialCount; i++) {
        //     const initialScan = ScansService.initialScans[i];
        //     const scan = new EditableScan();
        //     scan.id = i.toString();
        //     scan.index = i;
        //     scan.name = initialScan.name;
        //     scan.targetTypeId = initialScan.targetTypeId;
        //     scan.targetLitIvemIds = initialScan.targetLitIvemIds;
        //     scan.targetMarketIds = initialScan.targetMarkets;
        //     scan.matchCount = initialScan.matchCount;
        //     scan.criteriaTypeId = initialScan.criteriaTypeId;
        //     scan.modifiedStatusId = initialScan.modifiedStatusId;
        //     this._scans.push(scan);
        // }
    }

    start() {
        const scansDefinition = new ScansDataDefinition();
        this._scansDataItem = this._adi.subscribe(scansDefinition) as ScansDataItem;
        this._scansListChangeEventSubscriptionId = this._scansDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.processScansListChange(listChangeTypeId, index, count)
        );

        if (this._scansDataItem.usable) {
            const allCount = this._scansDataItem.count;
            if (allCount > 0) {
                this.processScansListChange(UsableListChangeTypeId.PreUsableAdd, 0, allCount);
            }
            this.processScansListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processScansListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    finalise() {
        this.resolveScansOnlinePromises(false);
    }

    get count(): Integer { return this.count; }

    getScan(index: Integer) {
        return this._scans[index];
    }

    getAllScansAsArray(): readonly EditableScan[] {
        return this._scans;
    }

    subscribeListChangeEvent(handler: ScansService.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeScanChangeEvent(handler: ScansService.RecordChangeEventHandler) {
        return this._scanChangeMultiEvent.subscribe(handler);
    }

    unsubscribeScanChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._scanChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangeEvent(handler: ScansService.CorrectnessChangeEventHandler) {
        return this._correctnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBadnessChangeEvent(handler: ScansService.BadnessChangeEventHandler) {
        return this._badnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._badnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyScansInserted(index: Integer, count: Integer) {
        //
    }

    private processScansListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this._scansOnline = false;
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.offlineAllScans(false);
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.onlineScans(index, count);
                break;
            case UsableListChangeTypeId.Usable:
                this._scansOnline = true;
                this.resolveScansOnlinePromises(true);
                break;
            case UsableListChangeTypeId.Insert:
                this.onlineScans(index, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.offlineScans(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.offlineAllScans(true);
                break;
            default:
                throw new UnreachableCaseError('SSPSLC30871', listChangeTypeId);
        }
    }

    private onlineScans(index: Integer, count: Integer) {
        const nextIndex = index + count;
        const addedScans = new Array<EditableScan>(count);
        let addCount = 0;
        for (let i = index; i < nextIndex; i++) {
            const dataItemScan = this._scansDataItem.records[i];
            const id = dataItemScan.id;
            const scan = this.findScan(id);
            if (scan !== undefined) {
                scan.sync(dataItemScan);
            } else {
                const addedScan = this.createScan(dataItemScan);
                addedScans[addCount++] = addedScan;
                this._scanIdMap.set(addedScan.id, addedScan);
            }
        }

        if (addCount > 0) {
            const insertIndex = this._scans.length;
            this._scans.length += addCount;
            for (let i = 0; i < addCount; i++) {
                this._scans[insertIndex + i] = addedScans[i];
            }

            this.notifyScansInserted(insertIndex, addCount);
        }
    }

    private offlineScans(index: Integer, count: Integer) {
        //
    }

    private offlineAllScans(serverDeleted: boolean) {
        for (const scan of this._scans) {
            scan.checkSetOffline();
        }
    }

    private createScan(dataItemScan: Scan): EditableScan {
        const scan = new EditableScan();
        return scan;
    }

    private findScan(id: string) {
        return this._scanIdMap.get(id);
    }

    private resolveScansOnlinePromises(ready: boolean) {
        const resolveCount = this._scansOnlineResolves.length;
        if (resolveCount > 0) {
            for (const resolve of this._scansOnlineResolves) {
                resolve(ready);
            }
            this._scansOnlineResolves.length = 0;
        }
    }

}

export namespace ScansService {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;
    export type CorrectnessChangeEventHandler = (this: void) => void;
    export type BadnessChangeEventHandler = (this: void) => void;

    export type ScansOnlineResolve = (this: void, ready: boolean) => void;

/*
    export interface InitialScan {
        name: string;
        targetTypeId: ScanTargetTypeId;
        targetMarkets: readonly MarketId[] | undefined;
        targetLitIvemIds: readonly LitIvemId[] | undefined;
        matchCount: Integer;
        criteriaTypeId: EditableScan.CriteriaTypeId;
        modifiedStatusId: EditableScan.ModifiedStatusId;
    }

    export const initialScans: InitialScan[] = [
        {
            name: 'BHP Last Price > 50',
            targetTypeId: ScanTargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('BHP', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matchCount: 0,
            criteriaTypeId: EditableScan.CriteriaTypeId.PriceGreaterThanValue,
            modifiedStatusId: EditableScan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'CBA Bid price increase > 10%',
            targetTypeId: ScanTargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('CBA', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matchCount: 0,
            criteriaTypeId: EditableScan.CriteriaTypeId.TodayPriceIncreaseGreaterThanPercentage,
            modifiedStatusId: EditableScan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'BHP or RIO Bid price increase > 10%',
            targetTypeId: ScanTargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [
                new LitIvemId('BHP', MarketId.AsxTradeMatch, DataEnvironmentId.Sample),
                new LitIvemId('RIO', MarketId.AsxTradeMatch, DataEnvironmentId.Sample),
            ],
            matchCount: 0,
            criteriaTypeId: EditableScan.CriteriaTypeId.TodayPriceIncreaseGreaterThanPercentage,
            modifiedStatusId: EditableScan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'CBA bid price > last price',
            targetTypeId: ScanTargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('CBA', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matchCount: 0,
            criteriaTypeId: EditableScan.CriteriaTypeId.Custom,
            modifiedStatusId: EditableScan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'Any bank has auction price 10% > last price',
            targetTypeId: ScanTargetTypeId.Markets,
            targetMarkets: [MarketId.AsxTradeMatch],
            targetLitIvemIds: undefined,
            matchCount: 0,
            criteriaTypeId: EditableScan.CriteriaTypeId.Custom,
            modifiedStatusId: EditableScan.ModifiedStatusId.Unmodified,
        },
    ];
*/
}
