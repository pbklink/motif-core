/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    AssertInternalError, Integer
} from "../sys/sys-internal-api";
import {
    JsonRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { ExplicitRankScoredLitIvemIdSourceList } from './json-rank-scored-lit-ivem-id-source-list';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { RankedLitIvemIdListImplementation } from './ranked-lit-ivem-id-list-implementation';

export class JsonRankedLitIvemIdListImplementation extends RankedLitIvemIdListImplementation {
    private _rankScoredList: ExplicitRankScoredLitIvemIdSourceList | undefined;

    constructor(private readonly _initialDefinition: JsonRankedLitIvemIdListDefinition) {
        super(RankedLitIvemIdList.TypeId.Json, true, true, true, true);
    }

    override createDefinition(): JsonRankedLitIvemIdListDefinition {
        const litIvemIds = this.getLitIvemIds().slice();
        return new JsonRankedLitIvemIdListDefinition(litIvemIds);
    }

    override subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdSourceList {
        if (this._rankScoredList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('ERLIILISRSLIISL31314');
        } else {
            this._rankScoredList = new ExplicitRankScoredLitIvemIdSourceList(
                this._initialDefinition,
                () => this.notifySourceListModified(),
            );
            return this._rankScoredList;
        }
    }

    override unsubscribeRankScoredLitIvemIdSourceList(): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURSLIISL31314');
        } else {
            this._rankScoredList = undefined;
        }
    }

    override userAdd(litIvemId: LitIvemId): Integer {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUA31314');
        } else {
            return this._rankScoredList.add(litIvemId);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._rankScoredList.addArray(litIvemIds);
        }
    }

    override userReplaceAt(index: Integer, litIvemIds: LitIvemId[]): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURPA31314');
        } else {
            this._rankScoredList.replaceAt(index, litIvemIds);
        }
    }

    override userRemoveAt(index: Integer, count: Integer): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURMA31314');
        } else {
            this._rankScoredList.removeAt(index, count);
        }
    }

    override userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void {
        throw new Error('Method not implemented.');
    }

    set(litIvemIds: LitIvemId[]): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIS31314');
        } else {
            this._rankScoredList.set(litIvemIds);
        }
    }

    protected notifySourceListModified() {
        // descendants can override
    }

    protected getLitIvemIds() {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIGLII31314')
        } else {
            return this._rankScoredList.litIvemIds;
        }
    }
}
