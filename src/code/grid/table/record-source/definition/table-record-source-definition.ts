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
    TableFieldSourceDefinitionRegistryService
} from "../../field-source/grid-table-field-source-internal-api";

export abstract class TableRecordSourceDefinition {
    constructor(
        private readonly _customHeadingsService: GridFieldCustomHeadingsService,
        readonly fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly typeId: TableRecordSourceDefinition.TypeId,
        readonly allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[]
    ) {
    }

    createAllowedFields(): readonly AllowedGridField[] {
        let result: AllowedGridField[] = [];
        for (const allowedFieldSourceDefinitionTypeId of this.allowedFieldSourceDefinitionTypeIds) {
            const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.get(allowedFieldSourceDefinitionTypeId);
            const fieldCount = fieldSourceDefinition.fieldCount;
            const fieldDefinitions = fieldSourceDefinition.fieldDefinitions;
            const sourceAllowedFields = new Array<AllowedGridField>(fieldCount);
            for (let i = 0; i < fieldCount; i++) {
                const fieldDefinition = fieldDefinitions[i];
                const heading = GridField.generateHeading(this._customHeadingsService, fieldDefinition);

                sourceAllowedFields[i] = new AllowedGridField(
                    fieldDefinition,
                    heading,
                );
            }
            result = [...result, ...sourceAllowedFields];
        }
        return result;
    }

    saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordSourceDefinition.jsonTag_TypeId, TableRecordSourceDefinition.Type.idToJson(this.typeId));
    }

    protected createGridLayoutDefinitionColumnsFromFieldNames(fieldNames: string[]): GridLayoutDefinition.Column[] {
        const count = fieldNames.length;
        const columns = new Array<GridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const fieldName = fieldNames[i];
            const column: GridLayoutDefinition.Column = {
                fieldName,
            };
            columns[i] = column;
        }
        return columns;
    }

    abstract createDefaultLayoutDefinition(): GridLayoutDefinition;
}

export namespace TableRecordSourceDefinition {
    export const jsonTag_Id = 'Id';
    export const jsonTag_Name = 'Name';
    export const jsonTag_TypeId = 'ListTypeId';

    export const enum TypeId {
        Null,
        LitIvemIdFromSearchSymbols,
        RankedLitIvemIdList,
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
        GridField,
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
            LitIvemIdFromSearchSymbols: {
                id: TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols,
                name: 'Symbol',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_LitIvemIdFromSearchSymbols,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_LitIvemIdFromSearchSymbols
            },
            RankedLitIvemIdList: {
                id: TableRecordSourceDefinition.TypeId.RankedLitIvemIdList,
                name: 'LitIvemId',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_RankedLitIvemIdList,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_RankedLitIvemIdList
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
            GridField: {
                id: TableRecordSourceDefinition.TypeId.GridField,
                name: 'GridField',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_GridField,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_GridField
            },
        };

        const infos = Object.values(infoObjects);
        export const count = infos.length;

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
            const outOfOrderIdx = infos.findIndex((infoRec: Info, index: Integer) => infoRec.id !== index);
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
