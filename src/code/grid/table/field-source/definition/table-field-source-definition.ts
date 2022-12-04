/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommaText, EnumInfoOutOfOrderError, Err, ErrorCode, Integer, Ok, Result } from '../../../../sys/sys-internal-api';
// import { GridRecordFieldState } from '../../../record/grid-record-internal-api';
import { GridFieldSourceDefinition } from '../../../field/grid-field-internal-api';
import { CorrectnessTableField, TableField, TableFieldDefinition } from '../../field/grid-table-field-internal-api';
import { CorrectnessTableValue, TableValue } from '../../value/grid-table-value-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';

export abstract class TableFieldSourceDefinition extends GridFieldSourceDefinition {
    readonly fieldDefinitions: TableFieldDefinition[];

    constructor(
        private readonly _customHeadingsService: TableFieldCustomHeadingsService,
        readonly typeId: TableFieldSourceDefinition.TypeId,
        name: string,
    ) {
        super(name);
        // this.sourceName = TableFieldSourceDefinition.Source.idToName(typeId);
    }

    get fieldCount(): Integer { return this.fieldDefinitions.length; }

    getFieldName(idx: Integer): string {
        return this.fieldDefinitions[idx].name;
    }

    getFieldHeading(idx: Integer): string {
        return this.fieldDefinitions[idx].heading;
    }

    findFieldByName(name: string): Integer | undefined {
        const upperName = name.toUpperCase();
        const idx = this.fieldDefinitions.findIndex((definition) => definition.name.toUpperCase() === upperName);
        return idx >= 0 ? idx : undefined;
    }

    setFieldHeading(idx: Integer, text: string) {
        this.fieldDefinitions[idx].heading = text;
        this._customHeadingsService.setFieldHeading(this.name, this.getFieldName(idx), text);
    }

    protected tryGetCustomFieldHeading(fieldName: string): string | undefined {
        return this._customHeadingsService.tryGetFieldHeading(this.name, fieldName);
    }
}

export namespace TableFieldSourceDefinition {
    export const enum TypeId {
        Feed,
        RankedLitIvemId,
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

    export namespace Source {
        export type Id = TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };
        const infoObject: InfoObjects = {
            Feed: { id: TypeId.Feed, name: 'Feed' },
            RankedLitIvemId: { id: TypeId.RankedLitIvemId, name: 'Rli' },
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

        export function tryNameToId(name: string) {
            for (const info of infos) {
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
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
        TableField.Constructor,
        TableValue.Constructor
    ];

    // used by descendants
    export type CorrectnessTableGridConstructors = [
        CorrectnessTableField.Constructor,
        CorrectnessTableValue.Constructor
    ];

    export function initialise() {
        Source.initialiseSource();
    }

    export interface DecodedFieldName {
        readonly sourceTypeId: Source.Id;
        readonly sourcelessName: string;
    }

    export function decodeCommaTextFieldName(value: string): Result<DecodedFieldName> {
        const commaTextResult = CommaText.toStringArrayWithResult(value, true);
        if (commaTextResult.isErr()) {
            return commaTextResult.createOuter(commaTextResult.error);
        } else {
            const strArray = commaTextResult.value;
            if (strArray.length !== 2) {
                return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameNot2Elements);
            } else {
                const sourceName = strArray[0];
                const sourceId = Source.tryNameToId(sourceName);
                if (sourceId === undefined) {
                    return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameUnknownSourceId);
                } else {
                    const decodedFieldName: DecodedFieldName = {
                        sourceTypeId: sourceId,
                        sourcelessName: strArray[1],
                    }

                    return new Ok(decodedFieldName);
                }
            }
        }
    }
}
