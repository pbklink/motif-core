/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/i18n-strings';
import {
    CorrectnessId,
    CorrectnessRecord,
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    Integer,
    MultiEvent,
    ValueRecentChangeTypeId
} from "../sys/sys-internal-api";

export class RankedLitIvemId implements CorrectnessRecord {
    private _correctnessId: CorrectnessId;
    private _rank: Integer;
    private _rankScore: number;

    private _changedMultiEvent = new MultiEvent<RankedLitIvemId.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<CorrectnessRecord.CorrectnessChangedEventHandler>();

    get correctnessId() { return this._correctnessId; }
    get rank() { return this._rank; }
    get rankScore() { return this._rankScore; }

    constructor(readonly litIvemId: LitIvemId, correctnessId: CorrectnessId, rank: Integer, rankScore: number) {
        this._correctnessId = correctnessId;
        this._rank = rank;
        this._rankScore = rankScore;
    }

    setCorrectnessId(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    setRank(rank: Integer) {
        if (rank !== this._rank) {
            const recentChangeTypeId = rank > this._rank
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._rank = rank;
            const valueChanges: RankedLitIvemId.ValueChange[] = [
                { fieldId: RankedLitIvemId.FieldId.Rank, recentChangeTypeId }
            ];
            this.notifyChanged(valueChanges);
        }
    }

    setRankAndRankScore(rank: Integer, rankScore: number) {
        const valueChanges = new Array<RankedLitIvemId.ValueChange>(RankedLitIvemId.Field.idCount);
        let changedIdx = 0;

        if (rank !== this._rank) {
            const recentChangeTypeId = rank > this._rank
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._rank = rank;
            valueChanges[changedIdx++] = { fieldId: RankedLitIvemId.FieldId.Rank, recentChangeTypeId };
        }

        if (rankScore !== this._rankScore) {
            const recentChangeTypeId = rankScore > this._rankScore
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._rankScore = rankScore;
            valueChanges[changedIdx++] = { fieldId: RankedLitIvemId.FieldId.rankScore, recentChangeTypeId };
        }
        if (changedIdx >= 0) {
            valueChanges.length = changedIdx;
            this.notifyChanged(valueChanges);
        }
    }

    setInvalidRank() {
        this._rank = RankedLitIvemId.invalidRank;
    }

    isRankInvalid() {
        return this._rank === RankedLitIvemId.invalidRank;
    }

    subscribeChangedEvent(handler: RankedLitIvemId.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: CorrectnessRecord.CorrectnessChangedEventHandler): number {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: RankedLitIvemId.ValueChange[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }
}

export namespace RankedLitIvemId {
    export const invalidRank = -1;
    export type ChangedEventHandler = (this: void, valueChanges: ValueChange[]) => void;

    export const enum FieldId {
        Rank,
        rankScore,
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId;
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };
        const infosObject: InfosObject = {
            Rank: {
                id: FieldId.Rank,
                name: 'Rank',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.RankedLitIvemIdFieldDisplay_Rank,
                headingId: StringId.RankedLitIvemIdFieldHeading_Rank,
            },
            rankScore: {
                id: FieldId.rankScore,
                name: 'rankScore',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.RankedLitIvemIdFieldDisplay_rankScore,
                headingId: StringId.RankedLitIvemIdFieldHeading_rankScore,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                const info = infos[id];
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('RankedLitIvemId.FieldId', id, idToName(id));
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }
}

/** @internal */
export namespace RankedLitIvemIdModule {
    export function initialiseStatic() {
        RankedLitIvemId.Field.initialise();
    }
}
