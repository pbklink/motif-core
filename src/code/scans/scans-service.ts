/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataEnvironmentId, LitIvemId, MarketId } from '../adi/adi-internal-api';
import { MultiEvent } from '../sys/sys-internal-api';
import { Integer, UsableListChangeTypeId } from '../sys/types';
import { Scan } from './scan';

export class ScansService {
    private readonly _scans = new Array<Scan>();

    private _listChangeMultiEvent = new MultiEvent<ScansService.ListChangeEventHandler>();
    private _scanChangeMultiEvent = new MultiEvent<ScansService.RecordChangeEventHandler>();
    private _correctnessChangeMultiEvent = new MultiEvent<ScansService.CorrectnessChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<ScansService.BadnessChangeEventHandler>();

    constructor(private readonly _adi: AdiService) {
        const initialCount = ScansService.initialScans.length;
        for (let i = 0; i < initialCount; i++) {
            const initialScan = ScansService.initialScans[i];
            const scan = new Scan();
            scan.id = i.toString();
            scan.index = i;
            scan.name = initialScan.name;
            scan.targetTypeId = initialScan.targetTypeId;
            scan.targetLitIvemIds = initialScan.targetLitIvemIds;
            scan.targetMarketIds = initialScan.targetMarkets;
            scan.matched = initialScan.matched;
            scan.criteriaTypeId = initialScan.criteriaTypeId;
            scan.modifiedStatusId = initialScan.modifiedStatusId;
            this._scans.push(scan);
        }
    }

    start() {
        //
    }

    finalise() {
        //
    }

    get count(): Integer { return this.count; }

    getScan(index: Integer) {
        return this._scans[index];
    }

    getAllScansAsArray(): readonly Scan[] {
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

}

export namespace ScansService {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;
    export type CorrectnessChangeEventHandler = (this: void) => void;
    export type BadnessChangeEventHandler = (this: void) => void;


    export interface InitialScan {
        name: string;
        targetTypeId: Scan.TargetTypeId;
        targetMarkets: readonly MarketId[] | undefined;
        targetLitIvemIds: readonly LitIvemId[] | undefined;
        matched: boolean;
        criteriaTypeId: Scan.CriteriaTypeId;
        modifiedStatusId: Scan.ModifiedStatusId;
    }

    export const initialScans: InitialScan[] = [
        {
            name: 'BHP Last Price > 50',
            targetTypeId: Scan.TargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('BHP', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matched: false,
            criteriaTypeId: Scan.CriteriaTypeId.PriceGreaterThanValue,
            modifiedStatusId: Scan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'CBA Bid price increase > 10%',
            targetTypeId: Scan.TargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('CBA', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matched: false,
            criteriaTypeId: Scan.CriteriaTypeId.TodayPriceIncreaseGreaterThanPercentage,
            modifiedStatusId: Scan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'BHP or RIO Bid price increase > 10%',
            targetTypeId: Scan.TargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [
                new LitIvemId('BHP', MarketId.AsxTradeMatch, DataEnvironmentId.Sample),
                new LitIvemId('RIO', MarketId.AsxTradeMatch, DataEnvironmentId.Sample),
            ],
            matched: false,
            criteriaTypeId: Scan.CriteriaTypeId.TodayPriceIncreaseGreaterThanPercentage,
            modifiedStatusId: Scan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'CBA bid price > last price',
            targetTypeId: Scan.TargetTypeId.Symbols,
            targetMarkets: undefined,
            targetLitIvemIds: [new LitIvemId('CBA', MarketId.AsxTradeMatch, DataEnvironmentId.Sample)],
            matched: false,
            criteriaTypeId: Scan.CriteriaTypeId.Custom,
            modifiedStatusId: Scan.ModifiedStatusId.Unmodified,
        },
        {
            name: 'Any bank has auction price 10% > last price',
            targetTypeId: Scan.TargetTypeId.Markets,
            targetMarkets: [MarketId.AsxTradeMatch],
            targetLitIvemIds: undefined,
            matched: false,
            criteriaTypeId: Scan.CriteriaTypeId.Custom,
            modifiedStatusId: Scan.ModifiedStatusId.Unmodified,
        },
    ];
}
