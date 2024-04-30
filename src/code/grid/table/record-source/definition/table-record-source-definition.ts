/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadingsService, RevTableRecordSourceDefinition } from '@xilytix/revgrid';
import { StringId, Strings } from '../../../../res/internal-api';
import { TextFormattableValue } from '../../../../services/internal-api';
import {
    EnumInfoOutOfOrderError,
    Err,
    ErrorCode,
    Integer,
    JsonElement,
    JsonElementErr,
    Ok,
    Result,
    compareNumber
} from "../../../../sys/internal-api";
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';

export abstract class TableRecordSourceDefinition extends RevTableRecordSourceDefinition<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {
    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            typeId,
            TableRecordSourceDefinition.Type.idToJson(typeId),
            allowedFieldSourceDefinitionTypeIds
        );
    }
}

export namespace TableRecordSourceDefinition {
    export const enum TypeId {
        Null,
        LitIvemIdComparableList,
        LitIvemDetailsFromSearchSymbols,
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
        EditableColumnLayoutDefinitionColumn,
        Scan,
        RankedLitIvemIdListDirectoryItem,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        GridField,
        ScanFieldEditorFrame,
        ScanEditorAttachedNotificationChannel,
        LockOpenNotificationChannelList,
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
            RankedLitIvemIdList: {
                id: TableRecordSourceDefinition.TypeId.RankedLitIvemIdList,
                name: 'LitIvemIdArrayRankedLitIvemIdList',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_LitIvemIdArrayRankedLitIvemIdList,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_LitIvemIdArrayRankedLitIvemIdList
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
            EditableColumnLayoutDefinitionColumn: {
                id: TableRecordSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn,
                name: 'ColumnLayoutDefinitionColumnEditRecord',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ColumnLayoutDefinitionColumnEditRecord,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ColumnLayoutDefinitionColumnEditRecord
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
            ScanFieldEditorFrame: {
                id: TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame,
                name: 'ScanFieldEditorFrame',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ScanFieldEditorFrame,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ScanFieldEditorFrame
            },
            ScanEditorAttachedNotificationChannel: {
                id: TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel,
                name: 'ScanEditorAttachedNotificationChannel',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ScanEditorAttachedNotificationChannel,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ScanEditorAttachedNotificationChannel
            },
            LockOpenNotificationChannelList: {
                id: TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList,
                name: 'LockOpenNotificationChannelList',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_LockOpenNotificationChannelList,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_LockOpenNotificationChannelList
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
                throw new EnumInfoOutOfOrderError('TRDLLTINLT388', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export function tryGetTypeIdFromJson(element: JsonElement): Result<Type.Id> {
        const typeIdResult = element.tryGetString(RevTableRecordSourceDefinition.jsonTag_TypeId);
        if (typeIdResult.isErr()) {
            return JsonElementErr.createOuter(typeIdResult.error, ErrorCode.TableRecordSourceDefinition_TypeIdNotSpecified);
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

export namespace TypedTableRecordSourceDefinitionModule {
    export function initialiseStatic() {
        TableRecordSourceDefinition.Type.initialise();
    }
}
