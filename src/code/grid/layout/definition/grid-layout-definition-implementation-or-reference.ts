/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, LockOpenListItem, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

export abstract class GridLayoutDefinitionImplementationOrReference {
    constructor(readonly isReference: boolean) {}

    abstract tryLock(locker: LockOpenListItem.Locker): Result<GridLayoutDefinition>;
    abstract unlock(locker: LockOpenListItem.Locker): void;

    saveToJson(element: JsonElement) {
        element.setBoolean(GridLayoutDefinitionImplementationOrReference.isReferenceJsonName, this.isReference);
    }
}

export namespace GridLayoutDefinitionImplementationOrReference {
    export const isReferenceJsonName = 'isReference';

    export function tryGetIsReferenceFromJson(element: JsonElement) {
        return element.tryGetBooleanType(isReferenceJsonName);
    }
}
