/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, WatchmakerListDescriptorsDataDefinition, WatchmakerListDescriptorsDataItem } from '../adi/adi-internal-api';
import {
    AssertInternalError,
    Integer,
    LockOpenList,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../sys/sys-internal-api";
import { WatchmakerList } from './watchmaker-list';

/** @public */
export class WatchmakerService extends LockOpenList<WatchmakerList> {
    // private readonly _scans = new Array<Scan>();
    // private readonly _scanIdMap = new Map<string, Scan>();
    private _scansOnline = false;
    private _scansOnlineResolves = new Array<WatchmakerService.ScansOnlineResolve>();

    private _descriptorsDataItem: WatchmakerListDescriptorsDataItem;
    private _descriptorsDataItemListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _descriptorsDataItemCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _scanChangeMultiEvent = new MultiEvent<WatchmakerService.RecordChangeEventHandler>();

    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _adi: AdiService) {
        super();
        // const initialCount = WatchmakerService.initialScans.length;
        // for (let i = 0; i < initialCount; i++) {
        //     const initialScan = WatchmakerService.initialScans[i];
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
        const descriptorsDefinition = new WatchmakerListDescriptorsDataDefinition();
        this._descriptorsDataItem = this._adi.subscribe(descriptorsDefinition) as WatchmakerListDescriptorsDataItem;
        this._descriptorsDataItemListChangeEventSubscriptionId = this._descriptorsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => { this.processDescriptorsListChange(listChangeTypeId, index, count); }
        );
        this._descriptorsDataItemCorrectnessChangedSubscriptionId = this._descriptorsDataItem.subscribeCorrectnessChangedEvent(
            () => { this.processDescriptorsDataItemCorrectnessChangedEvent(); }
        );

        this.processDescriptorsDataItemCorrectnessChangedEvent();

        if (this._descriptorsDataItem.usable) {
            const allCount = this._descriptorsDataItem.count;
            if (allCount > 0) {
                this.processDescriptorsListChange(UsableListChangeTypeId.PreUsableAdd, 0, allCount);
            }
            this.processDescriptorsListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processDescriptorsListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    finalise() {
        this._descriptorsDataItem.unsubscribeCorrectnessChangedEvent(this._descriptorsDataItemCorrectnessChangedSubscriptionId);
        this._descriptorsDataItemCorrectnessChangedSubscriptionId = undefined;
        this._descriptorsDataItem.unsubscribeListChangeEvent(this._descriptorsDataItemListChangeEventSubscriptionId);
        this._descriptorsDataItemListChangeEventSubscriptionId = undefined;
        this._adi.unsubscribe(this._descriptorsDataItem);
        this._descriptorsDataItem = undefined as unknown as WatchmakerListDescriptorsDataItem;

        this.resolveScansOnlinePromises(false);
    }

    subscribeScanChangeEvent(handler: WatchmakerService.RecordChangeEventHandler) {
        return this._scanChangeMultiEvent.subscribe(handler);
    }

    unsubscribeScanChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._scanChangeMultiEvent.unsubscribe(subscriptionId);
    }

    // protected override processItemAdded(scan: Scan) {
    //     this._scanChangedSubscriptionId = scan.subscribeValuesChangedEvent(
    //         (changedFieldIds, configChanged) => this.processScanFieldsChangedEvent(
    //             scan,
    //             changedFieldIds,
    //             configChanged
    //         )
    //     );
    // }

    // protected override processItemDeleted(item: WatchmakerList) {
    //     // For descendants
    // }

    private processDescriptorsDataItemCorrectnessChangedEvent() {
        const correctnessId = this._descriptorsDataItem.correctnessId;
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const scan = this.getAt(i);
            scan.setListCorrectness(correctnessId);
        }
    }

    private processDescriptorsListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this._scansOnline = false;
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.offlineAllScans(false);
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.syncDescriptors(index, count);
                break;
            case UsableListChangeTypeId.Usable:
                this._scansOnline = true;
                this.resolveScansOnlinePromises(true);
                break;
            case UsableListChangeTypeId.Insert:
                this.syncDescriptors(index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('SSPSLCBR19662');
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('SSPSLCAR19662');
            case UsableListChangeTypeId.Remove:
                // this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, orderIdx, 1);
                this.deleteScans(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                // this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, orderIdx, 1);
                this.offlineAllScans(true);
                break;
            default:
                throw new UnreachableCaseError('SSPSLCD30871', listChangeTypeId);
        }
    }

    // private processScanFieldsChangedEvent(scan: Scan, changedFieldIds: readonly Scan.FieldId[], configChanged: boolean) {

    // }

    private syncDescriptors(index: Integer, count: Integer) {
        const nextIndex = index + count;
        const addedScans = new Array<WatchmakerList>(count);
        let addCount = 0;
        for (let i = index; i < nextIndex; i++) {
            const descriptor = this._descriptorsDataItem.records[i];
            const id = descriptor.id;
            const list = this.getItemByKey(id);
            if (list !== undefined) {
                list.sync(descriptor);
            } else {
                const addedScan = new WatchmakerList(
                    this._adi,
                    descriptor
                );
                addedScans[addCount++] = addedScan;
            }
        }

        if (addCount > 0) {
            this.addItems(addedScans);
        }
    }

    private deleteScans(index: Integer, count: Integer) {
        //
    }

    private offlineAllScans(serverDeleted: boolean) {
        // for (const scan of this._scans) {
        //     scan.checkSetOffline();
        // }
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

/** @public */
export namespace WatchmakerService {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;
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
