/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from '@xilytix/revgrid';
import { RevDataSource } from '../../rev/internal-api';
import { RenderValue } from '../../services/internal-api';
import { AssertInternalError, Badness, Err, ErrorCode, LockOpenListItem, Ok, PickEnum, Result } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export class DataSource extends RevDataSource<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
}

export namespace DataSource {
    export function tryLock(dataSource: DataSource, locker: LockOpenListItem.Locker): Promise<Result<void>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<void>) => void;
        const resultPromise = new Promise<Result<void>>((res) => {
            resolve = res;
        });

        const lockPromise = dataSource.tryLock(locker);
        lockPromise.then(
            (result) => {
                if (result.isOk()) {
                    resolve(new Ok(undefined));
                } else {
                    const lockErrorIdPlusTryError = result.error;
                    const lockErrorId = lockErrorIdPlusTryError.errorId;
                    let errorText = DataSource.LockErrorCode.fromId(lockErrorId) as string;
                    const tryError = lockErrorIdPlusTryError.tryError;
                    if (tryError === undefined) {
                        errorText += `: ${tryError}`;
                    }
                    resolve(new Err(errorText));
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'DSTCL35252'); }
        )

        return resultPromise;
    }

    export type LockErrorCode = PickEnum<ErrorCode,
        ErrorCode.DataSource_TableRecordSourceTry |
        ErrorCode.DataSource_LayoutDefinitionTry |
        ErrorCode.DataSource_LayoutReferenceTry |
        ErrorCode.DataSource_LayoutReferenceNotFound
    >;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevDataSource.LockErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevDataSource.LockErrorId.TableRecordSourceTry: return ErrorCode.DataSource_TableRecordSourceTry;
                case RevDataSource.LockErrorId.LayoutDefinitionTry: return ErrorCode.DataSource_LayoutDefinitionTry;
                case RevDataSource.LockErrorId.LayoutReferenceTry: return ErrorCode.DataSource_LayoutReferenceTry;
                case RevDataSource.LockErrorId.LayoutReferenceNotFound: return ErrorCode.DataSource_LayoutReferenceNotFound;
                default:
                    throw new UnreachableCaseError('DSLECFI35252', lockErrorId);
            }
        }
    }
}
