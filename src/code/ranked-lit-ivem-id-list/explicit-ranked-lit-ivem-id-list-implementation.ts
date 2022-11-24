/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    AssertInternalError,
    Badness,
    BadnessList,
    CorrectnessId,
    CorrectnessRecord, MultiEvent,
    RecordList
} from "../sys/sys-internal-api";
import {
    ExplicitRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { RankScoredLitIvemIdList } from './rank-scored-lit-ivem-id-list';
import { RankedLitIvemId } from './ranked-lit-ivem-id';
import { RankedLitIvemIdListImplementation } from './ranked-lit-ivem-id-list-implementation';

export class ExplicitRankedLitIvemIdListImplementation extends RankedLitIvemIdListImplementation {
    private _rankScoredList: ExplicitRankedLitIvemIdListImplementation.List | undefined;

    constructor(readonly definition: ExplicitRankedLitIvemIdListDefinition) {
        super(true, true, true);
    }

    override subscribeRankScoredLitIvemIdList(): RankScoredLitIvemIdList {
        if (this._rankScoredList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('ERLIILIO31314');
        } else {
            const list = new ExplicitRankedLitIvemIdListImplementation.List(this.definition);
            return list;
        }
    }

    override unsubscribeRankScoredLitIvemIdList(): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIO31314');
        } else {
            this._rankScoredList = undefined;
        }
    }

    override userAdd(litIvemId: LitIvemId): void {
        this.definition.add(litIvemId);
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        this.definition.addArray(litIvemIds);
    }

    override userRemoveAt(index: number, count: number): void {
        this.definition.removeAt(index, count);
    }

    override userMoveAt(fromIndex: number, count: number, toIndex: number): void {
        throw new Error('Method not implemented.');
    }
}

export namespace ExplicitRankedLitIvemIdListImplementation {
    export class List implements RankScoredLitIvemIdList {
        get count() { return this.definition.litIvemIds.length; }

        readonly userCanAdd = true;
        readonly userCanRemove = true;
        readonly userCanMove = true;
        readonly badness = Badness.notBad;
        readonly correctnessId = CorrectnessId.Good;
        readonly usable = true;

        constructor(readonly definition: ExplicitRankedLitIvemIdListDefinition) {

        }

        getAt(index: number): RankedLitIvemId {
            return new RankedLitIvemId(
                this.definition.litIvemIds[index],
                this.correctnessId,
                index + 1,
                index,
            );
        }

        subscribeBadnessChangeEvent(_handler: BadnessList.BadnessChangeEventHandler) {
            return MultiEvent.nullDefinedSubscriptionId;
        }

        unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
            // nothing to do
        }

        subscribeCorrectnessChangedEvent(handler: CorrectnessRecord.CorrectnessChangedEventHandler): number {
            return MultiEvent.nullDefinedSubscriptionId;
        }

        unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
            // nothing to do
        }

        subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
            return this.definition.subscribeListChangeEvent(handler);
        }

        unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
            this.definition.unsubscribeListChangeEvent(subscriptionId);
        }
    }
}
