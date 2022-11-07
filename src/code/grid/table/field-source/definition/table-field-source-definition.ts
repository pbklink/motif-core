/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, GridHalign, Integer } from '../../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import { GridRecordFieldState } from '../../../record/grid-record-internal-api';
import { CorrectnessTableGridField, TableGridField } from '../../field/grid-table-field-internal-api';
import { CorrectnessTableGridValue, TableGridValue } from '../../value/grid-table-value-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';

export abstract class TableFieldSourceDefinition {
    constructor(
        private readonly _textFormatterService: TextFormatterService,
        private readonly _customHeadingsService: TableFieldCustomHeadingsService,
        readonly typeId: TableFieldSourceDefinition.TypeId,
        readonly sourceName: string,
        private readonly fieldInfos: TableFieldSourceDefinition.FieldInfoArray,
    ) {
        // this.sourceName = TableFieldSourceDefinition.Source.idToName(typeId);
    }

    get fieldCount(): Integer { return this.fieldInfos.length; }

    getFieldName(idx: Integer): string {
        return this.fieldInfos[idx].name;
    }

    getFieldHeading(idx: Integer): string {
        return this.fieldInfos[idx].heading;
    }

    findFieldByName(name: string): Integer | undefined {
        const upperName = name.toUpperCase();
        const idx = this.fieldInfos.findIndex((info: TableFieldSourceDefinition.FieldInfo) => info.name.toUpperCase() === upperName);
        return idx >= 0 ? idx : undefined;
    }

    setFieldHeading(idx: Integer, text: string) {
        this.fieldInfos[idx].name = text;
        this._customHeadingsService.setFieldHeading(this.sourceName, this.getFieldName(idx), text);
    }

    getGridFields(indexOffset: Integer): TableGridField[] {
        const fieldCount = this.fieldCount;
        const result = new Array<TableGridField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const name = this.fieldInfos[i].name;
            result[i] = new this.fieldInfos[i].gridFieldConstructor(name, indexOffset + i, this._textFormatterService);
        }
        return result;
    }

    getGridFieldInitialStates(indexOffset: Integer, headingPrefix: string): GridRecordFieldState[] {
        const fieldCount = this.fieldCount;
        const result = new Array<GridRecordFieldState>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            let heading = this.fieldInfos[i].heading;
            if (headingPrefix.length > 0) {
                heading = headingPrefix + heading;
            }

            result[i] = {
                header: heading,
                alignment: this.fieldInfos[i].textAlign,
            };
        }
        return result;
    }

    createUndefinedTableGridValue(fieldIndex: Integer): TableGridValue {
        return new this.fieldInfos[fieldIndex].gridValueConstructor();
    }

    createUndefinedTableGridValueArray(): TableGridValue[] {
        const result = new Array<TableGridValue>(this.fieldCount);
        for (let i = 0; i < this.fieldCount; i++) {
            result[i] = this.createUndefinedTableGridValue(i);
        }
        return result;
    }

    protected tryGetCustomFieldHeading(fieldName: string): string | undefined {
        return this._customHeadingsService.tryGetFieldHeading(this.sourceName, fieldName);
    }
}

export namespace TableFieldSourceDefinition {
    export const enum TypeId {
        Feed,
        LitIvemBaseDetail,
        LitIvemExtendedDetail,
        LitIvemAlternateCodes,
        MyxLitIvemAttributes,
        SecurityDataItem,
        BrokerageAccounts,
        OrdersDataItem,
        HoldingsDataItem,
        BalancesDataItem,
        CallPut,
        CallSecurityDataItem,
        PutSecurityDataItem,
        TopShareholdersDataItem,
        /*LitIvemId_News,
        IvemId_Holding,
        CashItem_Holding,
        LitIvemId_IntradayProfitLossSymbolRec,
        LitIvemId_Alerts,
        LitIvemId_TmcDefinitionLegs,
        CallPut_SecurityDataItem,
        IvemId_CustomHolding,*/
    }

    export class FieldInfo {
        sourcelessName: string;
        name: string;
        heading: string;
        textAlign: GridHalign;
        gridFieldConstructor: TableGridField.Constructor;
        gridValueConstructor: TableGridValue.Constructor;
    }
    export type FieldInfoArray = FieldInfo[];

    export namespace Source {
        export type Id = TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };
        const infoObject: InfoObjects = {
            Feed: { id: TypeId.Feed, name: 'Feed' },
            LitIvemBaseDetail: { id: TypeId.LitIvemBaseDetail, name: 'Lib' },
            LitIvemExtendedDetail: { id: TypeId.LitIvemExtendedDetail, name: 'Lie' },
            LitIvemAlternateCodes: { id: TypeId.LitIvemAlternateCodes, name: 'Liac' },
            MyxLitIvemAttributes: { id: TypeId.MyxLitIvemAttributes, name: 'MyxSA' },
            SecurityDataItem: { id: TypeId.SecurityDataItem, name: 'SecDI' },
            BrokerageAccounts: { id: TypeId.BrokerageAccounts, name: 'Ba' },
            OrdersDataItem: { id: TypeId.OrdersDataItem, name: 'Odi' },
            HoldingsDataItem: { id: TypeId.HoldingsDataItem, name: 'Hdi' },
            BalancesDataItem: { id: TypeId.BalancesDataItem, name: 'Bdi' },
            CallPut: { id: TypeId.CallPut, name: 'Cp' },
            CallSecurityDataItem: { id: TypeId.CallSecurityDataItem, name: 'CSecDI' },
            PutSecurityDataItem: { id: TypeId.PutSecurityDataItem, name: 'PSecDI' },
            TopShareholdersDataItem: { id: TypeId.TopShareholdersDataItem, name: 'Tsh' }
        };

        export const idCount = Object.keys(infoObject).length;

        const infos: Info[] = Object.values(infoObject);

        export function idToName(id: TypeId): string {
            return infos[id].name;
        }

        export function initialiseSource() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TableFieldDefinitionSource.SourceId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    // used by descendants
    export type TableGridConstructors = [
        TableGridField.Constructor,
        TableGridValue.Constructor
    ];

    // used by descendants
    export type CorrectnessTableGridConstructors = [
        CorrectnessTableGridField.Constructor,
        CorrectnessTableGridValue.Constructor
    ];

    export function initialise() {
        Source.initialiseSource();
    }
}
