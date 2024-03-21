/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommaText, CommaTextErr, Err, ErrorCode, Integer, Ok, Result } from '../../../../sys/internal-api';
// import { GridRecordFieldState } from '../../../record/grid-record-internal-api';
import { GridFieldSourceDefinition } from '../../../field/internal-api';
import { TableField } from '../../field/internal-api';
import { TableValue } from '../../value/internal-api';

export abstract class TableFieldSourceDefinition<TypeId> extends GridFieldSourceDefinition {
    readonly fieldDefinitions: TableField.Definition[];

    constructor(readonly typeId: TypeId, name: string) {
        super(name);
    }

    get fieldCount(): Integer { return this.fieldDefinitions.length; }

    getFieldName(idx: Integer): string {
        return this.fieldDefinitions[idx].name;
    }

    findFieldByName(name: string): Integer | undefined {
        const upperName = name.toUpperCase();
        const idx = this.fieldDefinitions.findIndex((definition) => definition.name.toUpperCase() === upperName);
        return idx >= 0 ? idx : undefined;
    }

    encodeFieldName(sourcelessFieldName: string) {
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    abstract getFieldNameById(id: number): string;
}

export namespace TableFieldSourceDefinition {
    export type TableFieldValueConstructors = [field: TableField.Constructor, value: TableValue.Constructor];

    // used by descendants
    export type TableGridConstructors = [
        TableField.Constructor,
        TableValue.Constructor
    ];

    export interface FieldName<TypeId> {
        readonly sourceTypeId: TypeId;
        readonly sourcelessName: string;
    }

    export interface FieldId<TypeId> {
        sourceTypeId: TypeId;
        id: number;
    }

    // export function decodeCommaTextFieldName<TypeId>(value: string): Result<FieldName<TypeId>> {
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
    //                 const decodedFieldName: FieldName<TypeId> = {
    //                     sourceTypeId: sourceId,
    //                     sourcelessName: strArray[1],
    //                 }

    //                 return new Ok(decodedFieldName);
    //             }
    //         }
    //     }
    // }

    export function getSourceNameFromEncodedFieldName(value: string): Result<string> {
        const commaTextResult = CommaText.tryToStringArray(value, true);
        if (commaTextResult.isErr()) {
            return CommaTextErr.createOuter(commaTextResult.error, ErrorCode.TableFieldSourceDefinition_InvalidCommaText);
        } else {
            const strArray = commaTextResult.value;
            if (strArray.length !== 2) {
                return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameNot2Elements);
            } else {
                return new Ok(strArray[0]);
            }
        }
    }
}
