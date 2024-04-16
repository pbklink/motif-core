/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutOrReference } from '@xilytix/rev-data-source';
import { UnreachableCaseError } from '@xilytix/sysutils';
import { AssertInternalError, Err, ErrorCode, LockOpenListItem, Ok, PickEnum, Result } from '../../sys/internal-api';

export namespace ColumnLayoutOrReference {
    export function tryLock(columnLayoutOrReference: RevColumnLayoutOrReference, locker: LockOpenListItem.Locker): Promise<Result<void>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<void>) => void;
        const resultPromise = new Promise<Result<void>>((res) => {
            resolve = res;
        });

        const lockPromise = columnLayoutOrReference.tryLock(locker);
        lockPromise.then(
            (lockIdPlusTryError) => {
                if (lockIdPlusTryError.isOk()) {
                    resolve(new Ok(undefined));
                } else {
                    const lockErrorIdPlusTryError = lockIdPlusTryError.error;
                    const lockErrorId = lockErrorIdPlusTryError.errorId;
                    let errorText = LockErrorCode.fromId(lockErrorId) as string;
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
        ErrorCode.ColumnLayoutOrReference_DefinitionTry |
        ErrorCode.ColumnLayoutOrReference_ReferenceTry |
        ErrorCode.ColumnLayoutOrReference_ReferenceNotFound
    >;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevColumnLayoutOrReference.LockErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevColumnLayoutOrReference.LockErrorId.DefinitionTry: return ErrorCode.ColumnLayoutOrReference_DefinitionTry;
                case RevColumnLayoutOrReference.LockErrorId.ReferenceTry: return ErrorCode.ColumnLayoutOrReference_ReferenceTry;
                case RevColumnLayoutOrReference.LockErrorId.ReferenceNotFound: return ErrorCode.ColumnLayoutOrReference_ReferenceNotFound;
                default:
                    throw new UnreachableCaseError('GLORLECFI35252', lockErrorId);
            }
        }
    }
}
