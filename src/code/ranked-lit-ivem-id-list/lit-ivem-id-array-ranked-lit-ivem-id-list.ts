/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankScoredLitIvemIdList } from '../adi/adi-internal-api';
import {
    AssertInternalError, Integer
} from "../sys/internal-api";
import { BaseRankedLitIvemIdList } from './base-ranked-lit-ivem-id-list';
import {
    LitIvemIdArrayRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { IndexRankScoredLitIvemIdList } from './index-rank-scored-lit-ivem-id-list';

export class LitIvemIdArrayRankedLitIvemIdList extends BaseRankedLitIvemIdList {
    readonly name: string;
    readonly description: string;
    readonly category: string;

    declare protected _lockedScoredList: IndexRankScoredLitIvemIdList;
    private readonly _initialLitIvemIds: readonly LitIvemId[];

    constructor(definition: LitIvemIdArrayRankedLitIvemIdListDefinition) {
        super(definition.typeId, true, true, true, true);
        this.name = definition.name;
        this.description = definition.description;
        this.category = definition.category;
        this._initialLitIvemIds = definition.litIvemIds;
    }

    override createDefinition(): LitIvemIdArrayRankedLitIvemIdListDefinition {
        const litIvemIds = this.getLitIvemIds().slice();
        return new LitIvemIdArrayRankedLitIvemIdListDefinition(this.name, this.description, this.category, litIvemIds);
    }

    override subscribeRankScoredLitIvemIdList(): RankScoredLitIvemIdList {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('ERLIILISRSLIISL31314');
        } else {
            this._lockedScoredList = new IndexRankScoredLitIvemIdList(
                this._initialLitIvemIds,
                () => { this.notifySourceListModified() },
            );
            return this._lockedScoredList;
        }
    }

    override unsubscribeRankScoredLitIvemIdList(): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURSLIISL31314');
        } else {
            this._lockedScoredList = undefined as unknown as IndexRankScoredLitIvemIdList;
        }
    }

    override userAdd(litIvemId: LitIvemId): Integer {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUA31314');
        } else {
            return this._lockedScoredList.add(litIvemId);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._lockedScoredList.addArray(litIvemIds);
        }
    }

    override userReplaceAt(index: Integer, litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURPA31314');
        } else {
            this._lockedScoredList.replaceAt(index, litIvemIds);
        }
    }

    override userRemoveAt(index: Integer, count: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURMA31314');
        } else {
            this._lockedScoredList.removeAt(index, count);
        }
    }

    override userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void {
        throw new Error('Method not implemented.');
    }

    set(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIS31314');
        } else {
            this._lockedScoredList.set(litIvemIds);
        }
    }

    private notifySourceListModified() {
        if (this.referentialTargettedModifiedEventer !== undefined) {
            this.referentialTargettedModifiedEventer();
        }
    }

    private getLitIvemIds() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIGLII31314')
        } else {
            return this._lockedScoredList.litIvemIds;
        }
    }
}

export namespace LitIvemIdArrayRankedLitIvemIdList {
    export type ModifiedEventer = (this: void) => void;
}
