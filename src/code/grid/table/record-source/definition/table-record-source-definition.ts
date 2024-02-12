/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../../../res/res-internal-api';
import {
    EnumInfoOutOfOrderError,
    Err,
    ErrorCode,
    Integer,
    JsonElement,
    Ok,
    Result,
    compareNumber
} from "../../../../sys/sys-internal-api";
import { AllowedGridField, GridField, GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachedFactoryService
} from "../../field-source/grid-table-field-source-internal-api";

export abstract class TableRecordSourceDefinition {
    constructor(
        private readonly _customHeadingsService: GridFieldCustomHeadingsService,
        readonly tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        readonly typeId: TableRecordSourceDefinition.TypeId,
        readonly allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
    ) {
    }

    createAllowedFields(): readonly AllowedGridField[] {
        const tableFieldSourceDefinitionCachedFactoryService = this.tableFieldSourceDefinitionCachedFactoryService;
        const customHeadingsService = this._customHeadingsService;
        let result: AllowedGridField[] = [];
        for (const allowedFieldSourceDefinitionTypeId of this.allowedFieldSourceDefinitionTypeIds) {
            const fieldSourceDefinition = tableFieldSourceDefinitionCachedFactoryService.get(allowedFieldSourceDefinitionTypeId);
            const fieldCount = fieldSourceDefinition.fieldCount;
            const fieldDefinitions = fieldSourceDefinition.fieldDefinitions;
            const sourceAllowedFields = new Array<AllowedGridField>(fieldCount);
            for (let i = 0; i < fieldCount; i++) {
                const fieldDefinition = fieldDefinitions[i];
                const heading = GridField.generateHeading(customHeadingsService, fieldDefinition);

                sourceAllowedFields[i] = new AllowedGridField(
                    fieldDefinition,
                    heading,
                );
            }
            result = [...result, ...sourceAllowedFields];
        }
        return result;
    }

    // createLayoutDefinition(fieldIds: TableFieldSourceDefinition.FieldId[]): GridLayoutDefinition {
    //     const fieldSourceDefinitionRegistryService = this.fieldSourceDefinitionRegistryService;
    //     const count = fieldIds.length;
    //     const fieldNames = new Array<string>(count);
    //     for (let i = 0; i < count; i++) {
    //         const fieldId = fieldIds[i];
    //         const fieldSourceDefinition = fieldSourceDefinitionRegistryService.get(fieldId.sourceTypeId);
    //         const fieldName = fieldSourceDefinition.getFieldNameById(fieldId.id);
    //         fieldNames[i] = fieldName;
    //     }

    //     return GridLayoutDefinition.createFromFieldNames(fieldNames);
    // }


    saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordSourceDefinition.jsonTag_TypeId, TableRecordSourceDefinition.Type.idToJson(this.typeId));
    }

    abstract createDefaultLayoutDefinition(): GridLayoutDefinition;
}

export namespace TableRecordSourceDefinition {
    export const jsonTag_Id = 'Id';
    export const jsonTag_Name = 'Name';
    export const jsonTag_TypeId = 'ListTypeId';

    export const enum TypeId {
        Null,
        LitIvemIdComparableList,
        LitIvemDetailsFromSearchSymbols,
        Watchlist,
        MarketMovers,
        Gics,
        ProfitIvemHolding,
        CashItemHolding,
        IntradayProfitLossSymbolRec,
        TmcDefinitionLegs,
        TmcLeg,
        TmcWithLegMatchingUnderlying,
        CallPutFromUnderlying,
        HoldingAccountPortfolio,
        Feed,
        BrokerageAccount,
        Order,
        Holding,
        Balances,
        TopShareholder,
        EditableGridLayoutDefinitionColumn,
        Scan,
        RankedLitIvemIdListDirectoryItem,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        GridField,
        ScanTest,
        ScanFieldEditorFrame,
    }

    export interface AddArrayResult {
        index: Integer; // index of first element addeded
        count: Integer; // number of elements added
    }

    export namespace Type {
        export type Id = TableRecordSourceDefinition.TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly display: StringId;
            readonly abbr: StringId;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };

        const infoObjects: InfoObjects = {
            Null: {
                id: TableRecordSourceDefinition.TypeId.Null,
                name: 'Null',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Null,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Null
            },
            LitIvemIdComparableList: {
                id: TableRecordSourceDefinition.TypeId.LitIvemIdComparableList,
                name: 'LitIvemIdList',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_LitIvemIdList,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_LitIvemIdList,
            },
            LitIvemDetailsFromSearchSymbols: {
                id: TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols,
                name: 'LitIvemDetailsFromSearchSymbols',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_LitIvemDetailsFromSearchSymbols,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_LitIvemDetailsFromSearchSymbols
            },
            Watchlist: {
                id: TableRecordSourceDefinition.TypeId.Watchlist,
                name: 'Watchlist',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Watchlist,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Watchlist
            },
            MarketMovers: {
                id: TableRecordSourceDefinition.TypeId.MarketMovers,
                name: 'MarketMovers',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_MarketMovers,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_MarketMovers
            },
            Gics: {
                id: TableRecordSourceDefinition.TypeId.Gics,
                name: 'Gics',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Gics,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Gics
            },
            ProfitIvemHolding: {
                id: TableRecordSourceDefinition.TypeId.ProfitIvemHolding,
                name: 'ProfitIvemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding
            },
            CashItemHolding: {
                id: TableRecordSourceDefinition.TypeId.CashItemHolding,
                name: 'CashItemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_CashItemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_CashItemHolding
            },
            IntradayProfitLossSymbolRec: {
                id: TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec,
                name: 'IntradayProfitLossSymbolRec',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec
            },
            TmcDefinitionLegs: {
                id: TableRecordSourceDefinition.TypeId.TmcDefinitionLegs,
                name: 'TmcDefinitionLegs',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs
            },
            TmcLeg: {
                id: TableRecordSourceDefinition.TypeId.TmcLeg,
                name: 'TmcLeg',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcLeg,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcLeg
            },
            TmcWithLegMatchingUnderlying: {
                id: TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying,
                name: 'TmcWithLegMatchingUnderlying',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying
            },
            CallPutFromUnderlying: {
                id: TableRecordSourceDefinition.TypeId.CallPutFromUnderlying,
                name: 'EtoMatchingUnderlyingCallPut',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut
            },
            HoldingAccountPortfolio: {
                id: TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio,
                name: 'HoldingAccountPortfolio',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio
            },
            Feed: {
                id: TableRecordSourceDefinition.TypeId.Feed,
                name: 'Feed',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Feed,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Feed
            },
            BrokerageAccount: {
                id: TableRecordSourceDefinition.TypeId.BrokerageAccount,
                name: 'BrokerageAccount',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount
            },
            Order: {
                id: TableRecordSourceDefinition.TypeId.Order,
                name: 'Order',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Order,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Order
            },
            Holding: {
                id: TableRecordSourceDefinition.TypeId.Holding,
                name: 'Holding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Holding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Holding
            },
            Balances: {
                id: TableRecordSourceDefinition.TypeId.Balances,
                name: 'Balances',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Balances,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Balances
            },
            TopShareholder: {
                id: TableRecordSourceDefinition.TypeId.TopShareholder,
                name: 'TopShareholder',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TopShareholder,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TopShareholder
            },
            EditableGridLayoutDefinitionColumn: {
                id: TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
                name: 'GridLayoutDefinitionColumnEditRecord',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_GridLayoutDefinitionColumnEditRecord,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_GridLayoutDefinitionColumnEditRecord
            },
            Scan: {
                id: TableRecordSourceDefinition.TypeId.Scan,
                name: 'Scan',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Scan,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Scan
            },
            RankedLitIvemIdListDirectoryItem: {
                id: TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
                name: 'RankedLitIvemIdListDirectoryItem',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_RankedLitIvemIdListDirectoryItem,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_RankedLitIvemIdListDirectoryItem
            },
            GridField: {
                id: TableRecordSourceDefinition.TypeId.GridField,
                name: 'GridField',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_GridField,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_GridField
            },
            ScanTest: {
                id: TableRecordSourceDefinition.TypeId.ScanTest,
                name: 'ScanTest',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ScanTest,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ScanTest
            },
            ScanFieldEditorFrame: {
                id: TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame,
                name: 'ScanFieldEditorFrame',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ScanFieldEditorFrame,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ScanFieldEditorFrame
            },
        };

        const infos = Object.values(infoObjects);
        export const idCount = infos.length;

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToJson(id: Id): string {
            return idToName(id);
        }

        export function tryNameToId(nameValue: string): Id | undefined {
            const upperNameValue = nameValue.toUpperCase();
            const idx = infos.findIndex((info: Info) => info.name.toUpperCase() === upperNameValue);
            return idx === -1 ? undefined : infos[idx].id;
        }

        export function tryJsonToId(name: string): Id | undefined {
            return tryNameToId(name);
        }

        export function idToDisplay(id: Id): string {
            return Strings[infos[id].display];
        }

        export function idToAbbr(id: Id): string {
            return Strings[infos[id].abbr];
        }

        export function compareId(left: Id, right: Id): Integer {
            return compareNumber(left, right);
        }

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((infoRec: Info, index: Integer) => infoRec.id !== index as TypeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TRDLLTINLT388', outOfOrderIdx, `${infos[outOfOrderIdx].name}`);
            }
        }
    }

    export function tryGetTypeIdFromJson(element: JsonElement): Result<TypeId> {
        const typeIdResult = element.tryGetString(jsonTag_TypeId);
        if (typeIdResult.isErr()) {
            return typeIdResult.createOuter(ErrorCode.TableRecordSourceDefinition_TypeIdNotSpecified);
        } else {
            const typeIdJsonValue = typeIdResult.value;
            const typeId = Type.tryJsonToId(typeIdJsonValue);
            if (typeId === undefined) {
                return new Err(`${ErrorCode.TableRecordSourceDefinition_TypeIdIsUnknown}(${typeIdJsonValue})`);
            } else {
                return new Ok(typeId);
            }
        }
    }
}

export namespace TableRecordSourceDefinitionModule {
    export function initialiseStatic() {
        TableRecordSourceDefinition.Type.initialise();
    }
}
