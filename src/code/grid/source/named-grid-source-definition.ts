/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { AssertInternalError, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { GridLayoutDefinition, NamedGridLayoutDefinition, NamedGridLayoutDefinitionsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition } from '../table/record-source/definition/grid-table-record-source-definition-internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class NamedGridSourceDefinition extends GridSourceDefinition implements LockOpenListItem {
    readonly mapKey: Guid;
    readonly upperCaseName: string;

    private readonly locker: LockOpenListItem.Locker;

    private _tableRecordSourceDefinitionLocked = false;
    private _lockedNamedGridLayoutDefinition: NamedGridLayoutDefinition | undefined;

    constructor(
        private readonly _namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        id: Guid,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinition: GridLayoutDefinition,
        namedGridLayoutId: Guid | undefined,
        readonly name: string,
        public index: number,
    ) {
        super(id, tableRecordSourceDefinition, gridLayoutDefinition, namedGridLayoutId);
        this.mapKey = id;
        this.upperCaseName = name.toUpperCase();
        this.locker = {
            lockerName: `${Strings[StringId.Grid]}: ${name}`
        }
    }

    openLocked(opener: LockOpenListItem.Opener): void {
        throw new AssertInternalError('NGSDO23309');
    }

    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new AssertInternalError('NGSDO23309');
    }

    close(opener: LockOpenListItem.Opener): void {
        throw new AssertInternalError('NGSDC23309');
    }

    tryProcessFirstLock(): Result<void> {
        let layoutLockResult: Result<NamedGridLayoutDefinition | undefined> | undefined;
        if (this.namedGridLayoutId !== undefined) {
            layoutLockResult = this._namedGridLayoutDefinitionsService.tryLockItemByKey(this.namedGridLayoutId, this.locker);
            if (layoutLockResult.isErr()) {
                return layoutLockResult.createOuter(ErrorCode.NamedGridSourceDefinition_TryProcessFirstLockLayout);
            } else {
                this._lockedNamedGridLayoutDefinition = layoutLockResult.value;
            }
        }

        const recordSourceLockResult = this.tableRecordSourceDefinition.tryLock(this.locker);
        if (recordSourceLockResult.isErr()) {
            if (this._lockedNamedGridLayoutDefinition !== undefined) {
                this._namedGridLayoutDefinitionsService.unlockItem(this._lockedNamedGridLayoutDefinition, this.locker);
            }
            return recordSourceLockResult.createOuter(ErrorCode.NamedGridSourceDefinition_TryProcessFirstLockRecordSource);
        } else {
            this._tableRecordSourceDefinitionLocked = true;
            return new Ok(undefined);
        }
    }

    processLastUnlock() {
        if (this._tableRecordSourceDefinitionLocked) {
            this.tableRecordSourceDefinition.unlock(this.locker);
            this._tableRecordSourceDefinitionLocked = false;
        }

        if (this._lockedNamedGridLayoutDefinition !== undefined) {
            this._namedGridLayoutDefinitionsService.unlockItem(this._lockedNamedGridLayoutDefinition, this.locker);
            this._lockedNamedGridLayoutDefinition = undefined;
        }
    }

    tryProcessFirstOpen(): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(): void {
        // no code
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

/** @public */
export namespace NamedGridSourceDefinition {
    export function is(definition: GridSourceDefinition): definition is NamedGridSourceDefinition {
        return definition instanceof NamedGridSourceDefinition;
    }
}
