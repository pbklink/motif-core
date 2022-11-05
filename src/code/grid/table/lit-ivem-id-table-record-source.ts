/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdListFactoryService } from 'src/code/lists/lit-ivem-id-list-factory-service';
import { AdiService, LitIvemId, SecurityDataItem } from '../../adi/adi-internal-api';
import { LitIvemIdList } from '../../lists/lit-ivem-id-list';
import { AssertInternalError, Integer, JsonElement, LockOpenListItem, PickEnum, UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { LitIvemIdTableRecordDefinition } from './lit-ivem-id-table-record-definition';
import { RecordTableRecordSource } from './record-table-record-source';
import { SecurityDataItemTableValueSource } from './security-data-item-table-value-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class LitIvemIdTableRecordSource extends RecordTableRecordSource<LitIvemId, LitIvemIdList> {
    protected override readonly allowedFieldDefinitionSourceTypeIds: LitIvemIdTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        private readonly _litIvemIdlist: LitIvemIdList
    ) {
        super(TableRecordSource.TypeId.LitIvemId);
    }

    override saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordSource.jsonTag_TypeId, TableRecordSource.Type.idToJson(this.typeId));
        const litIvemIdListElement = element.newElement(LitIvemIdTableRecordSource.JsonName.litIvemIdList);
        this._litIvemIdlist.saveToJson(litIvemIdListElement);
    }

    override createRecordDefinition(idx: Integer): LitIvemIdTableRecordDefinition {
        const litIvemId = this._litIvemIdlist.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.LitIvemId,
            mapKey: litIvemId.mapKey,
            litIvemId: litIvemId,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
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

    override createDefaultlayout() {
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
        this._litIvemIdlist.open(opener);
        return this._litIvemIdlist;
    }

    protected override unsubscribeList() {
        this._litIvemIdlist.close(this.opener);
    }
}

export namespace LitIvemIdTableRecordSource {
    export namespace JsonName {
        export const litIvemIdList = 'litIvemIdList';
    }

    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem
    >;

    export function tryCreateFromJson(
        adiService: AdiService,
        litIvemIdListFactoryService: LitIvemIdListFactoryService,
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): LitIvemIdTableRecordSource | undefined {
        const litIvemIdListElement = element.tryGetElement(JsonName.litIvemIdList, 'LIITRSTCFJL33339');
        if (litIvemIdListElement === undefined) {
            return undefined;
        } else {
            const litIvemIdList = litIvemIdListFactoryService.tryCreateFromJson(litIvemIdListElement);
            if (litIvemIdList === undefined) {
                return undefined;
            } else {
                return new LitIvemIdTableRecordSource(adiService, tableFieldSourceDefinitionsService, litIvemIdList);
            }
        }
    }
}
