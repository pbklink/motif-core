/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemId, SecurityDataItem } from '../../../adi/adi-internal-api';
import { LitIvemIdList, LitIvemIdListFactoryService } from '../../../lit-ivem-id-list/lit-ivem-id-list-internal-api';
import { AssertInternalError, Integer, LockOpenListItem, PickEnum, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionFactoryService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { LitIvemIdTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { LitIvemIdFromListTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { RecordTableRecordSource } from './grid-table-record-source-internal-api';

export class LitIvemIdFromListTableRecordSource extends RecordTableRecordSource<LitIvemId, LitIvemIdList> {
    private readonly _litIvemIdlist: LitIvemIdList;

    protected override readonly allowedFieldDefinitionSourceTypeIds: LitIvemIdTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
        litIvemIdListFactoryService: LitIvemIdListFactoryService,
        definition: LitIvemIdFromListTableRecordSourceDefinition,
    ) {
        super(definition);
        // this._litIvemIdlist = litIvemIdListFactoryService.createFromDefinition(definition.litIvemIdlistDefinition);
    }

    override createRecordDefinition(idx: Integer): LitIvemIdTableRecordDefinition {
        const litIvemId = this._litIvemIdlist.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.LitIvemId,
            mapKey: litIvemId.mapKey,
            litIvemId: litIvemId,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const litIvemId = this._litIvemIdlist.getAt(recordIndex);

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId =
                fieldDefinitionSource.typeId as LitIvemIdTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.SecurityDataItem: {
                    const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, litIvemId, this._adiService);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('LIITRSCTVK19909', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultLayout() {
        const result = new GridLayout();

        const fieldSourceDefinition = this._tableFieldSourceDefinitionsService.securityDataItem;

        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.LitIvemId));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Name));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskCount));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskQuantity));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskUndisclosed));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionPrice));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionQuantity));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionRemainder));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.CallOrPut));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Cfi));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ContractSize));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Exchange));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ExpiryDate));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.IsIndex));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Market));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.NumberOfTrades));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.OpenInterest));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.QuotationBasis));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Settlement));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ShareIssue));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StatusNote));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StrikePrice));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingMarkets));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingState));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateAllows));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateReason));
        // result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Trend));
        result.addField(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ValueTraded));

        return result;
    }

    // override loadFromJson(element: JsonElement) {
    //     super.loadFromJson(element);

    //     this._list.clear();

    //     const definitionElementArray = element.tryGetElementArray(LitIvemIdTableRecordSource.jsonTag_DefinitionKeys);

    //     if (definitionElementArray !== undefined && definitionElementArray.length > 0) {
    //         this._list.capacity = definitionElementArray.length;
    //         for (const definitionElement of definitionElementArray) {
    //             const definition = LitIvemIdTableRecordDefinition.tryCreateFromJson(definitionElement);
    //             if (definition === undefined) {
    //                 Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: ' +
    //                     `Could not create definition from JSON element: ${definitionElement}`, 100);
    //             } else {
    //                 const typeId = definition.typeId;
    //                 if (typeId !== LitIvemIdTableRecordSource.definitionTypeId) {
    //                     Logger.logError(`LitIvemIdTableRecordDefinitionList.loadFromJson: Incorrect definition type: ${typeId}`);
    //                 } else {
    //                     if (!LitIvemIdTableRecordDefinition.is(definition)) {
    //                         Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: Interface missing');
    //                     } else {
    //                         this._list.add(definition);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // override saveToJson(element: JsonElement) {
    //     super.saveToJson(element);

    //     const keyElementArray = new Array<JsonElement>(this._list.count);

    //     for (let i = 0; i < this._list.count; i++) {
    //         const definition = this._list.getItem(i);
    //         const keyElement = new JsonElement();
    //         definition.saveKeyToJson(keyElement);
    //         keyElementArray[i] = keyElement;
    //     }

    //     element.setElementArray(LitIvemIdTableRecordSource.jsonTag_DefinitionKeys, keyElementArray);
    // }

    override userCanAdd() {
        return this._litIvemIdlist.userCanAdd;
    }

    override userCanRemove() {
        return this._litIvemIdlist.userCanRemove;
    }

    override userCanMove() {
        return this._litIvemIdlist.userCanMove;
    }

    override userAdd(recordDefinition: TableRecordDefinition) {
        if (LitIvemIdTableRecordDefinition.is(recordDefinition)) {
            this._litIvemIdlist.userAdd(recordDefinition.litIvemId);
        } else {
            throw new AssertInternalError('LIITRSUA44490');
        }
    }

    override userAddArray(recordDefinitions: TableRecordDefinition[]) {
        const litIvemIds = recordDefinitions.map((definition) => {
            if (LitIvemIdTableRecordDefinition.is(definition)) {
                return definition.litIvemId;
            } else {
                throw new AssertInternalError('LIITRSUAA44490');
            }
        });
        this._litIvemIdlist.userAddArray(litIvemIds);
    }

    override userRemoveAt(recordIndex: Integer, removeCount: Integer) {
        this._litIvemIdlist.userRemoveAt(recordIndex, removeCount);
    }

    override userMoveAt(fromIndex: Integer, moveCount: Integer, toIndex: Integer) {
        this._litIvemIdlist.userMoveAt(fromIndex, moveCount, toIndex);
    }

    protected override getCount() { return this._litIvemIdlist.count; }
    protected override subscribeList(opener: LockOpenListItem.Opener) {
        this._litIvemIdlist.openLocked(opener);
        return this._litIvemIdlist;
    }

    protected override unsubscribeList() {
        this._litIvemIdlist.closeLocked(this.opener);
    }
}

export namespace LitIvemIdTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem
    >;
}
