/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, ScanDescriptorsDataDefinition, ScanDescriptorsDataItem } from '../adi/adi-internal-api';
import { ServiceId, ServiceLockOpenList } from '../services/services-internal-api';
import {
    AssertInternalError,
    Integer,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../sys/sys-internal-api";
import { Scan } from './scan';

/** @public */
export class ScansService extends ServiceLockOpenList<Scan> {
    // private readonly _scans = new Array<Scan>();
    // private readonly _scanIdMap = new Map<string, Scan>();
    private _scansOnline = false;
    private _scansOnlineResolves = new Array<ScansService.ScansOnlineResolve>();

    private _scanDescriptorsDataItem: ScanDescriptorsDataItem;
    private _scanDescriptorsDataItemListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _scanDescriptorsDataItemCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _scanChangeMultiEvent = new MultiEvent<ScansService.RecordChangeEventHandler>();

    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _adi: AdiService) {
        super(ServiceId.Scan);
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
        const scansDefinition = new ScanDescriptorsDataDefinition();
        this._scanDescriptorsDataItem = this._adi.subscribe(scansDefinition) as ScanDescriptorsDataItem;
        this._scanDescriptorsDataItemListChangeEventSubscriptionId = this._scanDescriptorsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => { this.processScansListChange(listChangeTypeId, index, count) }
        );
        this._scanDescriptorsDataItemCorrectnessChangedSubscriptionId = this._scanDescriptorsDataItem.subscribeCorrectnessChangedEvent(
            () => { this.processDescriptorsDataItemCorrectnessChangedEvent(); }
        );

        this.processDescriptorsDataItemCorrectnessChangedEvent();

        if (this._scanDescriptorsDataItem.usable) {
            const allCount = this._scanDescriptorsDataItem.count;
            if (allCount > 0) {
                this.processScansListChange(UsableListChangeTypeId.PreUsableAdd, 0, allCount);
            }
            this.processScansListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processScansListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    finalise() {
        this._scanDescriptorsDataItem.unsubscribeCorrectnessChangedEvent(this._scanDescriptorsDataItemCorrectnessChangedSubscriptionId);
        this._scanDescriptorsDataItemCorrectnessChangedSubscriptionId = undefined;
        this._scanDescriptorsDataItem.unsubscribeListChangeEvent(this._scanDescriptorsDataItemListChangeEventSubscriptionId);
        this._scanDescriptorsDataItemListChangeEventSubscriptionId = undefined;
        this._adi.unsubscribe(this._scanDescriptorsDataItem);
        this._scanDescriptorsDataItem = undefined as unknown as ScanDescriptorsDataItem;

        this.resolveScansOnlinePromises(false);
    }

    subscribeScanChangeEvent(handler: ScansService.RecordChangeEventHandler) {
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

    protected override processItemDeleted(item: Scan) {
        // For descendants
    }

    private processDescriptorsDataItemCorrectnessChangedEvent() {
        const correctnessId = this._scanDescriptorsDataItem.correctnessId;
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const scan = this.getAt(i);
            scan.setListCorrectness(correctnessId);
        }
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
        const addedScans = new Array<Scan>(count);
        let addCount = 0;
        for (let i = index; i < nextIndex; i++) {
            const scanDescriptor = this._scanDescriptorsDataItem.records[i];
            const id = scanDescriptor.id;
            const scan = this.getItemByKey(id);
            if (scan !== undefined) {
                scan.sync(scanDescriptor);
            } else {
                const addedScan = new Scan(
                    this._adi,
                    scanDescriptor
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
export namespace ScansService {
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
