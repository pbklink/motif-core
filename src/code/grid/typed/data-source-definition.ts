/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevDataSourceDefinition } from '@xilytix/revgrid';
import { UnreachableCaseError } from '@xilytix/sysutils';
import { TextFormattableValue } from '../../services/internal-api';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';
import { TableRecordSourceDefinitionFromJsonFactory } from './table-record-source-definition-from-json-factory';

export class DataSourceDefinition extends RevDataSourceDefinition<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {

}

export namespace DataSourceDefinition {
    export interface WithLayoutError {
        definition: DataSourceDefinition
        layoutErrorCode: LayoutErrorCode | undefined;
    }

    export function tryCodedCreateFromJson(
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory,
        element: JsonElement
    ): Result<WithLayoutError> {
        const revResult = RevDataSourceDefinition.tryCreateFromJson(tableRecordSourceDefinitionFromJsonFactory, element);
        if (revResult.isOk()) {
            const revWithLayoutError = revResult.value;
            const layoutCreateFromJsonErrorId = revWithLayoutError.layoutCreateFromJsonErrorId;
            let layoutErrorCode: LayoutErrorCode | undefined;
            if (layoutCreateFromJsonErrorId !== undefined) {
                layoutErrorCode = LayoutErrorCode.fromErrorId(layoutCreateFromJsonErrorId);
            }
            return new Ok({ definition: revWithLayoutError.definition, layoutErrorCode });
        } else {
            const createFromJsonErrorIdPlusExtra = revResult.error;
            const createFromJsonErrorId = createFromJsonErrorIdPlusExtra.errorId;
            let errorText = DefinitionErrorCode.fromErrorId(createFromJsonErrorId) as string;
            const extra = createFromJsonErrorIdPlusExtra.extra;
            if (extra !== undefined) {
                errorText += `: ${extra}`;
            }

            return new Err(errorText);
        }
    }

    export type DefinitionErrorCode = PickEnum<ErrorCode,
        ErrorCode.DataSourceDefinition_TableRecordSourceElementIsNotDefined |
        ErrorCode.DataSourceDefinition_TableRecordSourceJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceDefinition_TableRecordSourceTryCreate
    >;

    export namespace DefinitionErrorCode {
        export function fromErrorId(errorId: RevDataSourceDefinition.CreateFromJsonErrorId): DefinitionErrorCode {
            switch (errorId) {
                case RevDataSourceDefinition.CreateFromJsonErrorId.TableRecordSourceElementIsNotDefined:
                    return ErrorCode.DataSourceDefinition_TableRecordSourceElementIsNotDefined;
                case RevDataSourceDefinition.CreateFromJsonErrorId.TableRecordSourceJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceDefinition_TableRecordSourceJsonValueIsNotOfTypeObject;
                case RevDataSourceDefinition.CreateFromJsonErrorId.TableRecordSourceTryCreate:
                    return ErrorCode.DataSourceDefinition_TableRecordSourceTryCreate;
                default:
                    throw new UnreachableCaseError('DSDGECFRDSDCFJEI51512', errorId);
            }
        }
    }

    export type LayoutErrorCode = PickEnum<ErrorCode,
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceElementIsNotDefined |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceDefinition_ColumnLayoutNeitherReferenceOrDefinitionJsonValueIsDefined |
        ErrorCode.DataSourceDefinition_ColumnLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnsElementIsNotDefined |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnsElementIsNotAnArray |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnElementIsNotAnObject |
        ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionAllColumnElementsAreInvalid
    >;

    export namespace LayoutErrorCode {
        export function fromErrorId(errorId: RevDataSourceDefinition.LayoutCreateFromJsonErrorId): LayoutErrorCode {
            switch (errorId) {
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceElementIsNotDefined:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceElementIsNotDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceJsonValueIsNotOfTypeObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutNeitherReferenceOrDefinitionJsonValueIsDefined:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutNeitherReferenceOrDefinitionJsonValueIsDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceDefinitionColumnsElementIsNotDefined:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnsElementIsNotDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceDefinitionColumnsElementIsNotAnArray:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnsElementIsNotAnArray;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceDefinitionColumnElementIsNotAnObject:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionColumnElementIsNotAnObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.ColumnLayoutOrReferenceDefinitionAllColumnElementsAreInvalid:
                    return ErrorCode.DataSourceDefinition_ColumnLayoutOrReferenceDefinitionAllColumnElementsAreInvalid;
                default:
                    throw new UnreachableCaseError('DSDGECFRDSDLCFJEI51512', errorId);
            }
        }
    }
}
