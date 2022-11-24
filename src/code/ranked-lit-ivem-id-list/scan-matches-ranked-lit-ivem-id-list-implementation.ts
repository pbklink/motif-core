/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemIdMatchesDataDefinition, LitIvemIdMatchesDataItem } from '../adi/adi-internal-api';
import { AssertInternalError } from "../sys/sys-internal-api";
import { ScanMatchesRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankScoredLitIvemIdList } from './rank-scored-lit-ivem-id-list';
import { RankedLitIvemIdListImplementation } from './ranked-lit-ivem-id-list-implementation';

export class ScanMatchesRankedLitIvemIdListImplementation extends RankedLitIvemIdListImplementation {

    private _dataItem: LitIvemIdMatchesDataItem | undefined;

    constructor(
        private readonly _adiService: AdiService,
        readonly definition: ScanMatchesRankedLitIvemIdListDefinition,
    ) {
        super(false, false, false);
    }

    override subscribeRankScoredLitIvemIdList(): RankScoredLitIvemIdList {
        if (this._dataItem !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('SMRLIUILO31313');
        } else {
            const scanId = this.definition.scanId;
            const dataDefinition = new LitIvemIdMatchesDataDefinition();
            dataDefinition.scanId = scanId;
            this._dataItem = this._adiService.subscribe(dataDefinition) as LitIvemIdMatchesDataItem;
            return this._dataItem;
        }
    }

    override unsubscribeRankScoredLitIvemIdList(): void {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('SMRLIUILC31313');
        } else {
            this._adiService.unsubscribe(this._dataItem);
            this._dataItem = undefined;
        }
    }
}
