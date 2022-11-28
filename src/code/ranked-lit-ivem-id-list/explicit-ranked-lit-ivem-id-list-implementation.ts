/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    AssertInternalError
} from "../sys/sys-internal-api";
import {
    ExplicitRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { ExplicitRankScoredLitIvemIdSourceList } from './explicit-rank-scored-lit-ivem-id-source-list';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { RankedLitIvemIdListImplementation } from './ranked-lit-ivem-id-list-implementation';

export class ExplicitRankedLitIvemIdListImplementation extends RankedLitIvemIdListImplementation {
    private _rankScoredList: ExplicitRankScoredLitIvemIdSourceList | undefined;

    constructor(private readonly _initialDefinition: ExplicitRankedLitIvemIdListDefinition) {
        super(true, true, true);
    }

    override createDefinition(): ExplicitRankedLitIvemIdListDefinition {
        const litIvemIds = this.getLitIvemIds();
        return new ExplicitRankedLitIvemIdListDefinition(litIvemIds);
    }

    override subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdSourceList {
        if (this._rankScoredList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('ERLIILISRSLIISL31314');
        } else {
            const list = new ExplicitRankScoredLitIvemIdSourceList(
                this._initialDefinition,
                () => this.notifySourceListModified(),
            );
            return list;
        }
    }

    override unsubscribeRankScoredLitIvemIdSourceList(): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURSLIISL31314');
        } else {
            this._rankScoredList = undefined;
        }
    }

    override userAdd(litIvemId: LitIvemId): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUA31314');
        } else {
            this._rankScoredList.add(litIvemId);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._rankScoredList.addArray(litIvemIds);
        }
    }

    override userRemoveAt(index: number, count: number): void {
        if (this._rankScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURA31314');
        } else {
            this._rankScoredList.removeAt(index, count);
        }
    }

    override userMoveAt(fromIndex: number, count: number, toIndex: number): void {
        throw new Error('Method not implemented.');
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
