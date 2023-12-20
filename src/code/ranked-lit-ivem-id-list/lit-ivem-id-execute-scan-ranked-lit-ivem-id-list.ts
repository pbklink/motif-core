/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemIdExecuteScanDataDefinition, LitIvemIdScanMatchesDataItem, RankScoredLitIvemIdList } from '../adi/adi-internal-api';
import { AssertInternalError } from "../sys/sys-internal-api";
import { BaseRankedLitIvemIdList } from './base-ranked-lit-ivem-id-list';
import { LitIvemIdExecuteScanRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';

export class LitIvemIdExecuteScanRankedLitIvemIdList extends BaseRankedLitIvemIdList {
    readonly name: string;
    readonly description: string;
    readonly category: string;

    private readonly _dataDefinition: LitIvemIdExecuteScanDataDefinition;
    private _dataItem: LitIvemIdScanMatchesDataItem | undefined;

    constructor(
        private readonly _adiService: AdiService,
        definition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    ) {
        super(definition.typeId, false, false, false, false);
        this.name = definition.name;
        this.description = definition.description;
        this.category = definition.category;
        this._dataDefinition = definition.litIvemIdExecuteScanDataDefinition;
    }

    createDefinition(): LitIvemIdExecuteScanRankedLitIvemIdListDefinition {
        const copyOfDataDefinition = new LitIvemIdExecuteScanDataDefinition();
        copyOfDataDefinition.zenithCriteria = this._dataDefinition.zenithCriteria;
        copyOfDataDefinition.zenithRank = this._dataDefinition.zenithRank;
        copyOfDataDefinition.targetTypeId = this._dataDefinition.targetTypeId;
        copyOfDataDefinition.targets = this._dataDefinition.targets;
        copyOfDataDefinition.maxMatchCount = this._dataDefinition.maxMatchCount;
        return new LitIvemIdExecuteScanRankedLitIvemIdListDefinition(this.name, this.description, this.category, copyOfDataDefinition);
    }

    override subscribeRankScoredLitIvemIdList(): RankScoredLitIvemIdList {
        this._dataItem = this._adiService.subscribe(this._dataDefinition) as LitIvemIdScanMatchesDataItem;
        return this._dataItem;
    }

    override unsubscribeRankScoredLitIvemIdList(): void {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('LIIESRLIILURSLIISL31313');
        } else {
            this._adiService.unsubscribe(this._dataItem);
            this._dataItem = undefined;
        }
    }
}
