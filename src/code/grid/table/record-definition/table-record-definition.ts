/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, MapKey } from '../../../sys/sys-internal-api';

export interface TableRecordDefinition {
    readonly typeId: TableRecordDefinition.TypeId;
    readonly mapKey: MapKey;
}

export namespace TableRecordDefinition {
    export const enum TypeId {
        LitIvemDetail,
        LitIvemBaseDetail,
        LitIvemId,
        RankedLitIvemId,
        Feed,
        BrokerageAccount,
        Order,
        Holding,
        Balances,
//        TmcDefinitionLeg,
        CallPut,
        TopShareholder,
        GridLayoutDefinitionColumn,
        Scan,
        RankedLitIvemIdListDirectoryItem,
        GridField,
        ScanFieldEditorFrame, // Outside
    }

    export namespace Type {
        export type Id = TableRecordDefinition.TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObjects = { [id in keyof typeof TableRecordDefinition.TypeId]: Info };

        const infoObjects: InfoObjects = {
            LitIvemDetail: {
                id: TableRecordDefinition.TypeId.LitIvemDetail,
                name: 'LitIvemDetail',
            },
            LitIvemBaseDetail: {
                id: TableRecordDefinition.TypeId.LitIvemBaseDetail,
                name: 'LitIvemBaseDetail',
            },
            LitIvemId: {
                id: TableRecordDefinition.TypeId.LitIvemId,
                name: 'LitIvemId',
            },
            RankedLitIvemId: {
                id: TableRecordDefinition.TypeId.RankedLitIvemId,
                name: 'RankedLitIvemId',
            },
            Feed: {
                id: TableRecordDefinition.TypeId.Feed,
                name: 'Feed',
            },
            BrokerageAccount: {
                id: TableRecordDefinition.TypeId.BrokerageAccount,
                name: 'BrokerageAccount',
            },
            // LitIvemIdBrokerageAccount: {
            //     id: TableRecordDefinition.TypeId.LitIvemIdBrokerageAccount,
            //     jsonValue: 'LitIvemIdBrokerageAccount',
            // },
            Order: {
                id: TableRecordDefinition.TypeId.Order,
                name: 'Order',
            },
            Holding: {
                id: TableRecordDefinition.TypeId.Holding,
                name: 'Holding',
            },
            Balances: {
                id: TableRecordDefinition.TypeId.Balances,
                name: 'Balances',
            },
            // TmcDefinitionLeg: {
            //     id: TableRecordDefinition.TypeId.TmcDefinitionLeg,
            //     jsonValue: 'TmcDefinitionLeg',
            // },
            CallPut: {
                id: TableRecordDefinition.TypeId.CallPut,
                name: 'CallPut',
            },
            TopShareholder: {
                id: TableRecordDefinition.TypeId.TopShareholder,
                name: 'TopShareholder',
            },
            GridLayoutDefinitionColumn: {
                id: TableRecordDefinition.TypeId.GridLayoutDefinitionColumn,
                name: 'GridLayoutDefinitionColumnEditRecord',
            },
            Scan: {
                id: TableRecordDefinition.TypeId.Scan,
                name: 'Scan',
            },
            RankedLitIvemIdListDirectoryItem: {
                id: TableRecordDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
                name: 'RankedLitIvemIdListDirectoryItem',
            },
            GridField: {
                id: TableRecordDefinition.TypeId.GridField,
                name: 'GridField',
            },
            ScanFieldEditorFrame: {  // Outside
                id: TableRecordDefinition.TypeId.ScanFieldEditorFrame,
                name: 'ScanFieldEditorFrame',
            },
        };

        const infos = Object.values(infoObjects);
        const idCount = infos.length;

        export function staticConstructor() {
            for (let id = 0; id < idCount; id++) {
                if (id as TableRecordDefinition.TypeId !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('TableRecordDefinition.TypeId', id, idToName(id));
                }
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }
    }

    export function same(left: TableRecordDefinition, right: TableRecordDefinition) {
        return left.typeId === right.typeId && left.mapKey === right.mapKey;
    }
}
