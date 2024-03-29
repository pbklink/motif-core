/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutOrReference } from '@xilytix/rev-data-source';
import { UnreachableCaseError } from '@xilytix/sysutils';
import { AssertInternalError, Err, ErrorCode, LockOpenListItem, Ok, PickEnum, Result } from '../../sys/internal-api';

export namespace GridLayoutOrReference {
    export function tryLock(gridLayoutOrReference: RevGridLayoutOrReference, locker: LockOpenListItem.Locker): Promise<Result<void>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<void>) => void;
        const resultPromise = new Promise<Result<void>>((res) => {
            resolve = res;
        });

        const lockPromise = gridLayoutOrReference.tryLock(locker);
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
        ErrorCode.GridLayoutOrReference_DefinitionTry |
        ErrorCode.GridLayoutOrReference_ReferenceTry |
        ErrorCode.GridLayoutOrReference_ReferenceNotFound
    >;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevGridLayoutOrReference.LockErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevGridLayoutOrReference.LockErrorId.DefinitionTry: return ErrorCode.GridLayoutOrReference_DefinitionTry;
                case RevGridLayoutOrReference.LockErrorId.ReferenceTry: return ErrorCode.GridLayoutOrReference_ReferenceTry;
                case RevGridLayoutOrReference.LockErrorId.ReferenceNotFound: return ErrorCode.GridLayoutOrReference_ReferenceNotFound;
                default:
                    throw new UnreachableCaseError('GLORLECFI35252', lockErrorId);
            }
        }
    }
}
