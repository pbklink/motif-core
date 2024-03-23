/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayout, RevGridLayoutDefinition } from '../../rev/internal-api';
import {
    Guid,
    LockOpenListItem,
    LockOpenManager,
    MapKey,
    Ok,
    Result
} from '../../sys/internal-api';

/**
 * Provides access to a saved layout for a Grid
 *
 * @public
 */
export class GridLayout extends RevGridLayout implements LockOpenListItem<GridLayout> {
    private readonly _lockOpenManager: LockOpenManager<GridLayout>;

    // open(_opener: LockOpenListItem.Opener, fieldNames: string[]) {
    //     const fieldCount = fieldNames.length;
    //     this._fields.length = fieldCount;
    //     for (let i = 0; i < fieldCount; i++) {
    //         const fieldName = fieldNames[i];
    //         const field = new GridLayout.Field(fieldName);
    //         this._fields[i] = field;
    //     }

    //     const maxColumnCount = this._definition.columnCount;
    //     const definitionColumns = this._definition.columns;
    //     let columnCount = 0;
    //     this._columns.length = maxColumnCount;
    //     for (let i = 0; i < maxColumnCount; i++) {
    //         const definitionColumn = definitionColumns[i];
    //         const definitionColumnName = definitionColumn.name;
    //         const foundField = this._fields.find((field) => field.name === definitionColumnName);
    //         if (foundField !== undefined) {
    //             this._columns[columnCount] = {
    //                 index: columnCount,
    //                 field: foundField,
    //                 visible: true
    //             }
    //             columnCount++;
    //         }
    //         this._columns.length = columnCount;
    //     }
    //     this._definitionListChangeSubscriptionId = this._definition.subscribeListChangeEvent(
    //         (listChangeTypeId, index, count) => this.handleDefinitionListChangeEvent(listChangeTypeId, index, count)
    //     );
    // }

    // close(opener: LockOpenListItem.Opener) {
    //     this._definition.unsubscribeListChangeEvent(this._definitionListChangeSubscriptionId);
    //     this._definitionListChangeSubscriptionId = undefined;
    // }

    constructor(
        definition?: RevGridLayoutDefinition,
        id?: Guid,
        mapKey?: MapKey,
    ) {
        super(definition, id, mapKey);

        this._lockOpenManager = new LockOpenManager<GridLayout>(
            () => this.tryProcessFirstLock(),
            () => { this.processLastUnlock(); },
            () => { this.processFirstOpen(); },
            () => { this.processLastClose(); },
        );
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return this._lockOpenManager.tryLock(locker);
    }

    unlock(locker: LockOpenListItem.Locker) {
        this._lockOpenManager.unlock(locker);
    }

    openLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.openLocked(opener);
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.closeLocked(opener);
    }

    isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined) {
        return this._lockOpenManager.isLocked(ignoreOnlyLocker);
    }

    override createCopy(): GridLayout {
        const result = new GridLayout();
        result.assign(this);
        return result;
    }

    protected override assign(other: GridLayout) {
        super.assign(other);
    }

    private tryProcessFirstLock(): Promise<Result<void>> {
        return Promise.resolve(new Ok(undefined));
    }

    private processLastUnlock(): void {
        // nothing to do
    }

    private processFirstOpen(): void {
        // nothing to do
    }

    private processLastClose(): void {
        // nothing to do
    }
}
