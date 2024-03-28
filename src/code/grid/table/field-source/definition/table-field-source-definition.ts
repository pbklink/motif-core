/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinition } from '@xilytix/rev-data-source';
import { RenderValue } from '../../../../services/internal-api';
import { EnumInfoOutOfOrderError, Integer } from '../../../../sys/internal-api';
// import { GridRecordFieldState } from '../../../record/grid-record-internal-api';
import { CorrectnessTableField, TableField } from '../../field/internal-api';
import { CorrectnessTableValue, TableValue } from '../../value/internal-api';

export abstract class TableFieldSourceDefinition extends RevTableFieldSourceDefinition<TableFieldSourceDefinition.TypeId, RenderValue.TypeId, RenderValue.Attribute.TypeId> {
    constructor(typeId: TableFieldSourceDefinition.TypeId) {
        super(typeId, TableFieldSourceDefinition.Type.idToName(typeId));
    }
}

export namespace TableFieldSourceDefinition {
    export const enum TypeId {
        Feed,
        LitIvemId,
        RankedLitIvemId,
        LitIvemBaseDetail,
        LitIvemExtendedDetail,
        LitIvemAlternateCodes,
        MyxLitIvemAttributes,
        EditableGridLayoutDefinitionColumn,
        SecurityDataItem,
        BrokerageAccount,
        Order,
        Holding,
        Balances,
        CallPut,
        CallSecurityDataItem,
        PutSecurityDataItem,
        TopShareholder,
        Scan,
        RankedLitIvemIdListDirectoryItem,
        GridField,
        ScanFieldEditorFrame, // outside
        LockerScanAttachedNotificationChannel,
        LockOpenNotificationChannel,
        /*LitIvemId_News,
        IvemId_Holding,
        CashItem_Holding,
        LitIvemId_IntradayProfitLossSymbolRec,
        LitIvemId_Alerts,
        LitIvemId_TmcDefinitionLegs,
        CallPut_SecurityDataItem,
        IvemId_CustomHolding,*/
    }

    export namespace Type {
        export type Id = TypeId;

        export const feedName = 'Feed';
        export const litIvemIdName = 'Lii';
        export const rankedLitIvemIdName = 'Rli';
        export const litIvemBaseDetailName = 'Lib';
        export const litIvemExtendedDetailName = 'Lie';
        export const litIvemAlternateCodesName = 'Liac';
        export const myxLitIvemAttributesName = 'MyxSA';
        export const editableGridLayoutDefinitionColumnName = 'Gldc';
        export const securityDataItemName = 'SecDI';
        export const brokerageAccountsName = 'Ba';
        export const ordersDataItemName = 'Odi';
        export const holdingsDataItemName = 'Hdi';
        export const balancesDataItemName = 'Bdi';
        export const callPutName = 'Cp';
        export const callPutSecurityDataItemName = 'CSecDI';
        export const putSecurityDataItemName = 'PSecDI';
        export const topShareholdersDataItemName = 'Tsh';
        export const scanName = 'Scn';
        export const rankedLitIvemIdListDirectoryItemName = 'RllDI';
        export const gridFieldName = 'Gf';
        export const ScanFieldEditorFrameName = 'Sfef';
        export const LockerScanAttachedNotificationChannelName = 'LSAnc';
        export const LockOpenNotificationChannelName = 'LONC'

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };
        const infoObject: InfoObjects = {
            Feed: { id: TypeId.Feed, name: feedName },
            LitIvemId: { id: TypeId.LitIvemId, name: litIvemIdName },
            RankedLitIvemId: { id: TypeId.RankedLitIvemId, name: rankedLitIvemIdName },
            LitIvemBaseDetail: { id: TypeId.LitIvemBaseDetail, name: litIvemBaseDetailName },
            LitIvemExtendedDetail: { id: TypeId.LitIvemExtendedDetail, name: litIvemExtendedDetailName },
            LitIvemAlternateCodes: { id: TypeId.LitIvemAlternateCodes, name: litIvemAlternateCodesName },
            MyxLitIvemAttributes: { id: TypeId.MyxLitIvemAttributes, name: myxLitIvemAttributesName },
            EditableGridLayoutDefinitionColumn: { id: TypeId.EditableGridLayoutDefinitionColumn, name: editableGridLayoutDefinitionColumnName },
            SecurityDataItem: { id: TypeId.SecurityDataItem, name: securityDataItemName },
            BrokerageAccount: { id: TypeId.BrokerageAccount, name: brokerageAccountsName },
            Order: { id: TypeId.Order, name: ordersDataItemName },
            Holding: { id: TypeId.Holding, name: holdingsDataItemName },
            Balances: { id: TypeId.Balances, name: balancesDataItemName },
            CallPut: { id: TypeId.CallPut, name: callPutName },
            CallSecurityDataItem: { id: TypeId.CallSecurityDataItem, name: callPutSecurityDataItemName },
            PutSecurityDataItem: { id: TypeId.PutSecurityDataItem, name: putSecurityDataItemName },
            TopShareholder: { id: TypeId.TopShareholder, name: topShareholdersDataItemName },
            Scan: { id: TypeId.Scan, name: scanName },
            RankedLitIvemIdListDirectoryItem: { id: TypeId.RankedLitIvemIdListDirectoryItem, name: rankedLitIvemIdListDirectoryItemName },
            GridField: { id: TypeId.GridField, name: gridFieldName },
            ScanFieldEditorFrame: { id: TypeId.ScanFieldEditorFrame, name: ScanFieldEditorFrameName },
            LockerScanAttachedNotificationChannel: { id: TypeId.LockerScanAttachedNotificationChannel, name: LockerScanAttachedNotificationChannelName },
            LockOpenNotificationChannel: { id: TypeId.LockOpenNotificationChannel, name: LockOpenNotificationChannelName },
        };

        const infos: Info[] = Object.values(infoObject);
        export const idCount = infos.length;

        export function idToName(id: TypeId): string {
            return infos[id].name;
        }

        export function tryNameToId(name: string) {
            for (const info of infos) {
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function initialiseSource() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as TypeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TableField.DefinitionSource.SourceId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export type TableFieldValueConstructors = [
        field: TableField.Constructor,
        value: TableValue.Constructor
    ];

    // used by descendants
    export type TableGridConstructors = [
        TableField.Constructor,
        TableValue.Constructor
    ];

    // used by descendants
    export type CorrectnessTableGridConstructors = [
        CorrectnessTableField.Constructor,
        CorrectnessTableValue.Constructor
    ];

    export function initialise() {
        Type.initialiseSource();
    }

    export type FieldName = RevTableFieldSourceDefinition.FieldName<TypeId>;
    export type FieldId = RevTableFieldSourceDefinition.FieldId<TypeId>;

    // export function decodeCommaTextFieldName(value: string): Result<FieldName> {
    //     const commaTextResult = CommaText.tryToStringArray(value, true);
    //     if (commaTextResult.isErr()) {
    //         return CommaTextErr.createOuter(commaTextResult.error, ErrorCode.TableFieldSourceDefinition_InvalidCommaText);
    //     } else {
    //         const strArray = commaTextResult.value;
    //         if (strArray.length !== 2) {
    //             return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameNot2Elements);
    //         } else {
    //             const sourceName = strArray[0];
    //             const sourceId = Type.tryNameToId(sourceName);
    //             if (sourceId === undefined) {
    //                 return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameUnknownSourceId);
    //             } else {
    //                 const decodedFieldName: FieldName = {
    //                     sourceTypeId: sourceId,
    //                     sourcelessName: strArray[1],
    //                 }

    //                 return new Ok(decodedFieldName);
    //             }
    //         }
    //     }
    // }

}
