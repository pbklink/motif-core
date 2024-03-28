/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevDataSourceDefinition } from '@xilytix/rev-data-source';
import { UnreachableCaseError } from '@xilytix/sysutils';
import { RenderValue } from '../../services/internal-api';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';
import { TableRecordSourceDefinitionFromJsonFactory } from './table-record-source-definition-from-json-factory';

export class DataSourceDefinition extends RevDataSourceDefinition<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
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
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceElementIsNotDefined |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceDefinition_GridLayoutNeitherReferenceOrDefinitionJsonValueIsDefined |
        ErrorCode.DataSourceDefinition_GridLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnsElementIsNotDefined |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnsElementIsNotAnArray |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnElementIsNotAnObject |
        ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionAllColumnElementsAreInvalid
    >;

    export namespace LayoutErrorCode {
        export function fromErrorId(errorId: RevDataSourceDefinition.LayoutCreateFromJsonErrorId): LayoutErrorCode {
            switch (errorId) {
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceElementIsNotDefined:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceElementIsNotDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceJsonValueIsNotOfTypeObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutNeitherReferenceOrDefinitionJsonValueIsDefined:
                    return ErrorCode.DataSourceDefinition_GridLayoutNeitherReferenceOrDefinitionJsonValueIsDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    return ErrorCode.DataSourceDefinition_GridLayoutBothReferenceAndDefinitionJsonValuesAreOfWrongType;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionJsonValueIsNotOfTypeObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceDefinitionColumnsElementIsNotDefined:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnsElementIsNotDefined;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceDefinitionColumnsElementIsNotAnArray:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnsElementIsNotAnArray;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceDefinitionColumnElementIsNotAnObject:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionColumnElementIsNotAnObject;
                case RevDataSourceDefinition.LayoutCreateFromJsonErrorId.GridLayoutOrReferenceDefinitionAllColumnElementsAreInvalid:
                    return ErrorCode.DataSourceDefinition_GridLayoutOrReferenceDefinitionAllColumnElementsAreInvalid;
                default:
                    throw new UnreachableCaseError('DSDGECFRDSDLCFJEI51512', errorId);
            }
        }
    }
}
