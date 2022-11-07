/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ExchangeId,
    LitIvemAlternateCodes,
    LitIvemDetail,
    LitIvemFullDetail,
    MarketId,
    MarketInfo,
    MyxLitIvemAttributes,
    SearchSymbolsDataDefinition,
    SymbolFieldId,
    SymbolsDataItem
} from "../../../adi/adi-internal-api";
import {
    AssertInternalError,
    Badness,
    Integer, LockOpenListItem,
    MultiEvent,
    PickEnum,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { LitIvemDetailTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableValueList } from '../record/grid-table-record-internal-api';
import {
    LitIvemAlternateCodesTableValueSource,
    LitIvemBaseDetailTableValueSource,
    LitIvemExtendedDetailTableValueSource,
    MyxLitIvemAttributesTableValueSource
} from "../value-source/grid-table-value-source-internal-api";
import {
    LitIvemIdFromSearchSymbolsTableRecordSourceDefinition
} from "./definition/lit-ivem-id-from-symbol-search-table-record-source-definition";
import { SingleDataItemTableRecordSource } from './single-data-item-table-record-source';

export class LitIvemIdFromSearchSymbolsTableRecordSource extends SingleDataItemTableRecordSource {
    protected override readonly allowedFieldDefinitionSourceTypeIds:
        LitIvemIdFromSearchSymbolsTableRecordSource.FieldDefinitionSourceTypeId[] = [
            TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
            TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail,
            TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
            TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes,
        ];

    private readonly _dataDefinition: SearchSymbolsDataDefinition;
    private readonly _exchangeId: ExchangeId | undefined;
    private readonly _isFullDetail: boolean;

    private _recordList: LitIvemDetail[] = [];

    private _dataItem: SymbolsDataItem;
    private _dataItemSubscribed = false;
    private _litIvemDetails: LitIvemDetail[];
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _badnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    // setting accountId to undefined will return orders for all accounts
    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        definition: LitIvemIdFromSearchSymbolsTableRecordSourceDefinition
    ) {
        super(definition);
        const dataDefinition = definition.dataDefinition;
        this._exchangeId = this.calculateExchangeId(dataDefinition);
        this._isFullDetail = dataDefinition.fullSymbol;
    }

    override createRecordDefinition(
        idx: Integer
    ): LitIvemDetailTableRecordDefinition {
        const record = this._recordList[idx];
        return {
            typeId: TableRecordDefinition.TypeId.LitIvemDetail,
            mapKey: record.key.mapKey,
            record,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const litIvemDetail = this._recordList[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId =
                fieldDefinitionSource.typeId as LitIvemIdFromSearchSymbolsTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail: {
                    const valueSource = new LitIvemBaseDetailTableValueSource(
                        result.fieldCount,
                        litIvemDetail,
                        this._dataItem
                    );
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail: {
                    if (this._isFullDetail) {
                        const litIvemFullDetail =
                            litIvemDetail as LitIvemFullDetail;
                        const valueSource =
                            new LitIvemExtendedDetailTableValueSource(
                                result.fieldCount,
                                litIvemFullDetail,
                                this._dataItem
                            );
                        result.addSource(valueSource);
                    }
                    break;
                }
                case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes: {
                    if (this._isFullDetail) {
                        const litIvemFullDetail =
                            litIvemDetail as LitIvemFullDetail;
                        const altCodesSource =
                            new LitIvemAlternateCodesTableValueSource(
                                result.fieldCount,
                                litIvemFullDetail,
                                this._dataItem
                            );
                        result.addSource(altCodesSource);
                    }
                    break;
                }
                case TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes: {
                    if (this._isFullDetail) {
                        const litIvemFullDetail =
                            litIvemDetail as LitIvemFullDetail;
                        switch (this._exchangeId) {
                            case ExchangeId.Myx:
                                const attributesSource =
                                    new MyxLitIvemAttributesTableValueSource(
                                        result.fieldCount,
                                        litIvemFullDetail,
                                        this._dataItem
                                    );
                                result.addSource(attributesSource);
                                break;
                        }
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError(
                        "SDITRSCTVL15599",
                        fieldDefinitionSourceTypeId
                    );
            }
        }

        return result;
    }

    override createDefaultLayout() {
        const result = new GridLayout();

        this.addLitIvemBaseDetailToDefaultGridLayout(result);

        if (this._isFullDetail) {
            this.addLitIvemExtendedDetailFieldDefinitionSource(result);
            switch (this._exchangeId) {
                case ExchangeId.Myx:
                    this.addMyxLitIvemAttributesFieldDefinitionSource(result);
                    break;
            }
            this.addLitIvemAlternateCodesFieldDefinitionSource(result);
        }

        return result;
    }

    override activate(opener: LockOpenListItem.Opener) {
        const definition = this._dataDefinition.createCopy();
        this._dataItem = this._adiService.subscribe(
            definition
        ) as SymbolsDataItem;
        this._dataItemSubscribed = true;
        super.setSingleDataItem(this._dataItem);
        this._litIvemDetails = this._dataItem.records;
        this._listChangeEventSubscriptionId =
            this._dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) =>
                    this.handleDataItemListChangeEvent(
                        listChangeTypeId,
                        idx,
                        count
                    )
            );
        this._badnessChangeEventSubscriptionId =
            this._dataItem.subscribeBadnessChangeEvent(() =>
                this.handleDataItemBadnessChangeEvent()
            );

        super.activate(opener);

        if (this._dataItem.usable) {
            const newCount = this._litIvemDetails.length;
            if (newCount > 0) {
                this.processDataItemListChange(
                    UsableListChangeTypeId.PreUsableAdd,
                    0,
                    newCount
                );
            }
            this.processDataItemListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processDataItemListChange(
                UsableListChangeTypeId.Unusable,
                0,
                0
            );
        }
    }

    override deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
        }

        if (!this._dataItemSubscribed) {
            throw new AssertInternalError("BATRDLD4332", "");
        } else {
            this._dataItem.unsubscribeListChangeEvent(
                this._listChangeEventSubscriptionId
            );
            this._listChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangeEvent(
                this._badnessChangeEventSubscriptionId
            );
            this._badnessChangeEventSubscriptionId = undefined;

            super.deactivate();

            this._adiService.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    protected getCount() {
        return this._recordList.length;
    }
    protected getCapacity() {
        return this._recordList.length;
    }
    protected setCapacity(value: Integer) {
        /* no code */
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(
                    UsableListChangeTypeId.PreUsableAdd,
                    0,
                    count
                );
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleDataItemListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        idx: Integer,
        count: Integer
    ) {
        this.processDataItemListChange(listChangeTypeId, idx, count);
    }

    private handleDataItemBadnessChangeEvent() {
        this.checkSetUnusable(this._dataItem.badness);
    }

    private calculateExchangeId(dataDefinition: SearchSymbolsDataDefinition) {
        let marketIdsExchangeId: ExchangeId | undefined;
        const marketIds = dataDefinition.marketIds;
        let marketIdsDefined: boolean;
        if (marketIds === undefined) {
            marketIdsDefined = false;
            marketIdsExchangeId = undefined;
        } else {
            const marketIdCount = marketIds.length;
            if (marketIdCount === 0) {
                marketIdsDefined = false;
                marketIdsExchangeId = undefined;
            } else {
                marketIdsDefined = true;
                marketIdsExchangeId = MarketInfo.idToExchangeId(marketIds[0]);
                // make sure they are all the same
                for (let i = 1; i < marketIdCount; i++) {
                    const elementExchangeId = MarketInfo.idToExchangeId(
                        marketIds[i]
                    );
                    if (elementExchangeId !== marketIdsExchangeId) {
                        marketIdsExchangeId = undefined;
                        break;
                    }
                }
            }
        }

        const dataDefinitionExchangeId = dataDefinition.exchangeId;
        const dataDefinitionExchangeIdDefined =
            dataDefinitionExchangeId !== undefined;

        let exchangeId: ExchangeId | undefined;
        if (marketIdsDefined) {
            if (!dataDefinitionExchangeIdDefined) {
                exchangeId = marketIdsExchangeId;
            } else {
                if (marketIdsExchangeId === dataDefinitionExchangeId) {
                    exchangeId = marketIdsExchangeId;
                } else {
                    exchangeId = undefined;
                }
            }
        } else {
            if (dataDefinitionExchangeIdDefined) {
                exchangeId = dataDefinitionExchangeId;
            } else {
                exchangeId = undefined;
            }
        }
        return exchangeId;
    }

    private insertRecordDefinition(idx: Integer, count: Integer) {
        if (count === 1) {
            const record = this._litIvemDetails[idx];
            if (idx === this._recordList.length) {
                this._recordList.push(record);
            } else {
                this._recordList.splice(idx, 0, record);
            }
        } else {
            const records = new Array<LitIvemDetail>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const record = this._litIvemDetails[i];
                records[insertArrayIdx++] = record;
            }
            this._recordList.splice(idx, 0, ...records);
        }
    }

    private processDataItemListChange(
        listChangeTypeId: UsableListChangeTypeId,
        idx: Integer,
        count: Integer
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._recordList.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecordDefinition(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecordDefinition(idx, count);
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Insert,
                    idx,
                    count
                );
                break;
            case UsableListChangeTypeId.Replace:
                throw new AssertInternalError("SDITRSPDILC19662");
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Remove,
                    idx,
                    count
                );
                this._recordList.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Clear,
                    idx,
                    count
                );
                this._recordList.length = 0;
                break;
            default:
                throw new UnreachableCaseError(
                    "SDITRDLPDILC83372992",
                    listChangeTypeId
                );
        }
    }

    private addLitIvemBaseDetailToDefaultGridLayout(gridLayout: GridLayout) {
        const fieldSourceDefinition =
            this._tableFieldSourceDefinitionsService.litIvemBaseDetail;

        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.Id
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.Name
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.Code
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.MarketId
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.ExchangeId
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemDetail.BaseField.Id.TradingMarketIds
            )
        );
    }

    private addLitIvemExtendedDetailFieldDefinitionSource(
        gridLayout: GridLayout
    ) {
        const fieldSourceDefinition =
            this._tableFieldSourceDefinitionsService.litIvemExtendedDetail;

        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.IsIndex
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.Categories
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.CallOrPutId
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.StrikePrice
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.ExpiryDate
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemFullDetail.ExtendedField.Id.ContractSize
            )
        );
        // gridLayout.addField(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.DepthDirectionId));
    }

    private addMyxLitIvemAttributesFieldDefinitionSource(
        gridLayout: GridLayout
    ) {
        const fieldSourceDefinition =
            this._tableFieldSourceDefinitionsService.myxLitIvemAttributes;

        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                MyxLitIvemAttributes.Field.Id.MarketClassification
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                MyxLitIvemAttributes.Field.Id.Category
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                MyxLitIvemAttributes.Field.Id.Sector
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                MyxLitIvemAttributes.Field.Id.SubSector
            )
        );
    }

    private addLitIvemAlternateCodesFieldDefinitionSource(
        gridLayout: GridLayout
    ) {
        const fieldSourceDefinition =
            this._tableFieldSourceDefinitionsService.litIvemAlternateCodes;

        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemAlternateCodes.Field.Id.Ticker
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemAlternateCodes.Field.Id.Isin
            )
        );
        gridLayout.addField(
            fieldSourceDefinition.getSupportedFieldNameById(
                LitIvemAlternateCodes.Field.Id.Gics
            )
        );
    }
}

export namespace LitIvemIdFromSearchSymbolsTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail |
        TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes |
        TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes
    >;


    // export interface Request {
    //     typeId: Request.TypeId;
    // }

    // export namespace Request {
    //     export const enum TypeId {
    //         Query,
    //         Subscription,
    //     }

    //     export function createCopy(request: Request) {
    //         switch (request.typeId) {
    //             case TypeId.Query: return QueryRequest.createCopy(request as QueryRequest);
    //             case TypeId.Subscription: return SubscriptionRequest.createCopy(request as SubscriptionRequest);
    //             default:
    //                 throw new UnreachableCaseError('SDITRDLRCC59938812', request.typeId);
    //         }
    //     }

    //     export function saveToJson(request: Request, element: JsonElement) {
    //         // throw new NotImplementedError('STRDLRSTJ3233992888');
    //     }
    // }

    // export interface QueryRequest extends Request {
    //     typeId: Request.TypeId.Query;

    //     searchText: string;
    //     showFull: boolean;

    //     exchangeId: ExchangeId | undefined;
    //     marketIds: readonly MarketId[] | undefined;
    //     cfi: string | undefined;
    //     fieldIds: readonly SymbolFieldId[] | undefined;
    //     isPartial: boolean | undefined;
    //     isCaseSensitive: boolean | undefined;
    //     preferExact: boolean | undefined;
    //     startIndex: Integer | undefined;
    //     count: Integer | undefined;
    // }

    // export namespace QueryRequest {
    //     export function createCopy(request: QueryRequest) {
    //         const result: QueryRequest = {
    //             typeId: Request.TypeId.Query,
    //             searchText: request.searchText,
    //             showFull: request.showFull,
    //             exchangeId: request.exchangeId,
    //             marketIds: request.marketIds,
    //             cfi: request.cfi,
    //             fieldIds: request.fieldIds,
    //             isPartial: request.isPartial,
    //             isCaseSensitive: request.isCaseSensitive,
    //             preferExact: request.preferExact,
    //             startIndex: request.startIndex,
    //             count: request.count,
    //         };

    //         return result;
    //     }
    // }

    // export interface SubscriptionRequest extends Request {
    //     typeId: Request.TypeId.Subscription;

    //     marketId: MarketId;
    //     classId: IvemClassId;
    // }

    // export namespace SubscriptionRequest {
    //     export function createCopy(request: SubscriptionRequest) {
    //         const result: SubscriptionRequest = {
    //             typeId: Request.TypeId.Subscription,
    //             marketId: request.marketId,
    //             classId: request.classId,
    //         };

    //         return result;
    //     }
    // }

    export function createDefaultCondition() {
        const defaultCondition: SearchSymbolsDataDefinition.Condition = {
            text: '',
            fieldIds: [SymbolFieldId.Code],
            isCaseSensitive: false,
        };

        return defaultCondition;
    }

    export function createDefaultDataDefinition(defaultExchangeId: ExchangeId, defaultMarketId: MarketId) {
        const condition = createDefaultCondition();
        const result = new SearchSymbolsDataDefinition();
        result.conditions = [condition];
        result.exchangeId = defaultExchangeId;
        result.marketIds = [defaultMarketId];
        result.cfi = '';
        result.index = false;
        result.preferExact = false;
        result.fullSymbol = false;
        result.count = 200;

        return result;
    }
}
