/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevDataSourceOrReference } from '@xilytix/rev-data-source';
import { RenderValue } from '../../services/internal-api';
import { AssertInternalError, Badness, Err, ErrorCode, LockOpenListItem, Ok, PickEnum, Result, UnreachableCaseError } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export class DataSourceOrReference extends RevDataSourceOrReference<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {
}

export namespace DataSourceOrReference {
    export function tryLock(dataSourceOrReference: DataSourceOrReference, locker: LockOpenListItem.Locker): Promise<Result<void>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<void>) => void;
        const resultPromise = new Promise<Result<void>>((res) => {
            resolve = res;
        });

        const lockPromise = dataSourceOrReference.tryLock(locker);
        lockPromise.then(
            (result) => {
                if (result.isOk()) {
                    resolve(new Ok(undefined));
                } else {
                    const lockErrorIdPlusTryError = result.error;
                    const lockErrorId = lockErrorIdPlusTryError.errorId;
                    let errorText = DataSourceOrReference.LockErrorCode.fromId(lockErrorId) as string;
                    const tryError = lockErrorIdPlusTryError.tryError;
                    if (tryError !== undefined) {
                        errorText = `: ${tryError}`;
                    }
                    resolve(new Err(errorText));
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'DSORTCL35252'); }
        )

        return resultPromise;
    }

    export type LockErrorCode = PickEnum<ErrorCode,
        ErrorCode.DataSourceOrReference_TableRecordSourceTry |
        ErrorCode.DataSourceOrReference_LayoutDefinitionTry |
        ErrorCode.DataSourceOrReference_LayoutReferenceTry |
        ErrorCode.DataSourceOrReference_LayoutReferenceNotFound |
        ErrorCode.DataSourceOrReference_ReferenceableTableRecordSourceTry |
        ErrorCode.DataSourceOrReference_ReferenceableLayoutDefinitionTry |
        ErrorCode.DataSourceOrReference_ReferenceableLayoutReferenceTry |
        ErrorCode.DataSourceOrReference_ReferenceableLayoutReferenceNotFound |
        ErrorCode.DataSourceOrReference_ReferenceableNotFound
>;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevDataSourceOrReference.LockErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevDataSourceOrReference.LockErrorId.TableRecordSourceTry: return ErrorCode.DataSourceOrReference_TableRecordSourceTry;
                case RevDataSourceOrReference.LockErrorId.LayoutDefinitionTry: return ErrorCode.DataSourceOrReference_LayoutDefinitionTry;
                case RevDataSourceOrReference.LockErrorId.LayoutReferenceTry: return ErrorCode.DataSourceOrReference_LayoutReferenceTry;
                case RevDataSourceOrReference.LockErrorId.LayoutReferenceNotFound: return ErrorCode.DataSourceOrReference_LayoutReferenceNotFound;
                case RevDataSourceOrReference.LockErrorId.ReferenceableTableRecordSourceTry: return ErrorCode.DataSourceOrReference_ReferenceableTableRecordSourceTry;
                case RevDataSourceOrReference.LockErrorId.ReferenceableLayoutDefinitionTry: return ErrorCode.DataSourceOrReference_ReferenceableLayoutDefinitionTry;
                case RevDataSourceOrReference.LockErrorId.ReferenceableLayoutReferenceTry: return ErrorCode.DataSourceOrReference_ReferenceableLayoutReferenceTry;
                case RevDataSourceOrReference.LockErrorId.ReferenceableLayoutReferenceNotFound: return ErrorCode.DataSourceOrReference_ReferenceableLayoutReferenceNotFound;
                case RevDataSourceOrReference.LockErrorId.ReferenceableNotFound: return ErrorCode.DataSourceOrReference_ReferenceableNotFound;
                default:
                    throw new UnreachableCaseError('DSORLECFI35252', lockErrorId);
            }
        }
    }
}
