/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevDataSourceOrReferenceDefinition } from '@xilytix/revgrid';
import { Err, JsonElement, Ok, PickEnum, Result, UnreachableCaseError } from '@xilytix/sysutils';
import { TextFormattableValue } from '../../services/internal-api';
import { ErrorCode } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';
import { DataSourceDefinition } from './data-source-definition';
import { TableRecordSourceDefinitionFromJsonFactory } from './table-record-source-definition-from-json-factory';

/** @public */
export class DataSourceOrReferenceDefinition extends RevDataSourceOrReferenceDefinition<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {

}

/** @public */
export namespace DataSourceOrReferenceDefinition {
    export interface WithLayoutError {
        definition: DataSourceOrReferenceDefinition,
        layoutErrorCode: DataSourceDefinition.LayoutErrorCode | undefined;
    }

    export function tryCodedCreateFromJson(
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory,
        element: JsonElement
    ): Result<WithLayoutError> {
        const createResult = RevDataSourceOrReferenceDefinition.tryCreateFromJson(tableRecordSourceDefinitionFromJsonFactory, element);
        if (createResult.isErr()) {
            const errorIdPlusExtra = createResult.error;
            const errorId = errorIdPlusExtra.errorId;
            let errorText = CreateFromJsonErrorCode.fromErrorId(errorId) as string;
            const extra = errorIdPlusExtra.extra;
            if (extra !== undefined) {
                errorText += extra;
            }
            return new Err(errorText);
        } else {
            const revWithLayoutError = createResult.value;
            const revLayoutErrorId = revWithLayoutError.layoutCreateFromJsonErrorId;
            let layoutErrorCode: DataSourceDefinition.LayoutErrorCode | undefined;
            if (revLayoutErrorId !== undefined) {
                layoutErrorCode = DataSourceDefinition.LayoutErrorCode.fromErrorId(revLayoutErrorId);
            }
            return new Ok({ definition: revWithLayoutError.definition, layoutErrorCode});
        }
    }

    export type CreateFromJsonErrorCode = PickEnum<ErrorCode,
        ErrorCode.DataSourceOrReferenceDefinition_NeitherReferenceOrDefinitionJsonValueIsDefined |
        ErrorCode.DataSourceOrReferenceDefinition_BothReferenceAndDefinitionJsonValuesAreOfWrongType |
        ErrorCode.DataSourceOrReferenceDefinition_DefinitionJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceElementIsNotDefined |
        ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceJsonValueIsNotOfTypeObject |
        ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceTryCreate
    >;

    export namespace CreateFromJsonErrorCode {
        export function fromErrorId(errorId: RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId): CreateFromJsonErrorCode {
            switch (errorId) {
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.NeitherReferenceOrDefinitionJsonValueIsDefined:
                    return ErrorCode.DataSourceOrReferenceDefinition_NeitherReferenceOrDefinitionJsonValueIsDefined;
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.BothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    return ErrorCode.DataSourceOrReferenceDefinition_BothReferenceAndDefinitionJsonValuesAreOfWrongType;
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.DefinitionJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceOrReferenceDefinition_DefinitionJsonValueIsNotOfTypeObject;
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.TableRecordSourceElementIsNotDefined:
                    return ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceElementIsNotDefined;
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.TableRecordSourceJsonValueIsNotOfTypeObject:
                    return ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceJsonValueIsNotOfTypeObject;
                case RevDataSourceOrReferenceDefinition.CreateFromJsonErrorId.TableRecordSourceTryCreate:
                    return ErrorCode.DataSourceOrReferenceDefinition_TableRecordSourceTryCreate;
                default:
                    throw new UnreachableCaseError('DSORDEITEC59712', errorId);
            }
        }
    }
}
