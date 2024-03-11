/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer } from './xiltyix-sysutils';

/** @public */
export const enum UsableListChangeTypeId {
    Unusable,
    PreUsableAdd,
    PreUsableClear,
    Usable,
    Insert,
    BeforeReplace,
    AfterReplace,
    BeforeMove,
    AfterMove,
    Remove,
    Clear,
}

/** @public */
export namespace UsableListChangeType {
    export interface MoveParameters {
        fromIndex: Integer;
        toIndex: Integer;
        count: Integer;
    }
    const moveParametersRegistrations = new Array<MoveParameters | undefined>();

    export function registerMoveParameters(fromIndex: Integer, toIndex: Integer, count: Integer): Integer {
        const move: MoveParameters = {
            fromIndex,
            toIndex,
            count,
        };

        const index = moveParametersRegistrations.indexOf(undefined);
        if (index >= 0) {
            moveParametersRegistrations[index] = move;
            return index;
        } else {
            const length = moveParametersRegistrations.push(move);
            return length - 1;
        }
    }

    export function deregisterMoveParameters(index: Integer) {
        moveParametersRegistrations[index] = undefined;
    }

    export function getMoveParameters(index: Integer) {
        const parameters = moveParametersRegistrations[index];
        if (parameters === undefined) {
            throw new AssertInternalError('ULCTGMP44497', index.toString());
        } else {
            return parameters;
        }
    }
}

