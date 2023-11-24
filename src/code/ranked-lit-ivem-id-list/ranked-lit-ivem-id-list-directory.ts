/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../services/services-internal-api';
import {
    AssertInternalError,
    Badness,
    BadnessList,
    ComparableList,
    CorrectnessBadness,
    Integer,
    LockOpenList,
    LockOpenListItem,
    MultiEvent,
    RecordList,
    ResourceBadness,
    Result,
    UnreachableCaseError,
    UsableListChangeTypeId,
    removeFromArray
} from '../sys/sys-internal-api';

export class RankedLitIvemIdListDirectory extends CorrectnessBadness implements BadnessList<RankedLitIvemIdListDirectoryItem> {
    private readonly _sourceCount: Integer;
    private readonly _sources: RankedLitIvemIdListDirectory.Source[];
    private readonly _itemList = new ComparableList<RankedLitIvemIdListDirectoryItem>();
    private readonly _listChangeQueue = new RankedLitIvemIdListDirectory.ListChangeQueue();

    private _listChangeProcessing = false;
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(
        namedSourceLists: readonly RankedLitIvemIdListDirectory.NamedSourceList[],
        private readonly _locker: LockOpenListItem.Locker,
    ) {
        super();
        this._sourceCount = namedSourceLists.length;
        this._sources = new Array<RankedLitIvemIdListDirectory.Source>(this._sourceCount);
        for (let i = 0; i < this._sourceCount; i++) {
            const namedSourceList = namedSourceLists[i];
            const badnessResourceName = namedSourceList.name;
            this._sources[i] = {
                list: namedSourceList.list,
                badnessResourceName,
                lastResourceBadness: {
                    reasonId: Badness.ReasonId.Inactive,
                    reasonExtra: '',
                    resourceName: badnessResourceName,
                },
                lockedItems: [],
                badnessChangeEventSubscriptionId: undefined,
                listChangeEventSubscriptionId: undefined,
            }
        }

        this.updateBadness(undefined);
    }

    get count() { return this._itemList.count; }

    indexOf(item: RankedLitIvemIdListDirectoryItem) {
        return this._itemList.indexOf(item);
    }

    getAt(index: Integer) {
        return this._itemList.getAt(index);
    }

    toArray(): readonly RankedLitIvemIdListDirectoryItem[] {
        return this._itemList.toArray();
    }

    open() {
        for (const source of this._sources) {
            const sourceList = source.list;
            source.badnessChangeEventSubscriptionId = sourceList.subscribeBadnessChangeEvent(
                () => { this.handleSourceBadnessChangeEvent(source); }
            );
            source.listChangeEventSubscriptionId = sourceList.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => {
                    this.handleSourceListChangeEvent(source, listChangeTypeId, idx, count);
                }
            );
        }

        this.setUnusable({ reasonId: Badness.ReasonId.Opening, reasonExtra: '' });

        this.enqueueListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.Open, undefined, []);
    }

    close() {
        for (const source of this._sources) {
            const sourceList = source.list;
            sourceList.unsubscribeBadnessChangeEvent(source.badnessChangeEventSubscriptionId);
            source.badnessChangeEventSubscriptionId = undefined;
            sourceList.unsubscribeListChangeEvent(source.listChangeEventSubscriptionId);
            source.listChangeEventSubscriptionId = undefined;
        }

        this.enqueueListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.Close, undefined, []);

        this.setUnusable(Badness.inactive);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private handleSourceBadnessChangeEvent(source: RankedLitIvemIdListDirectory.Source) {
        this.updateBadness(source);
    }

    private handleSourceListChangeEvent(source: RankedLitIvemIdListDirectory.Source, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                break; // handled through badness change
            case UsableListChangeTypeId.PreUsableAdd:
                this.enqueueSourceRecordRangeListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.InsertSourceRange, source, idx, count);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                if (source.list.count > 0) {
                    this.enqueueListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.ClearSource, source, []);
                }
                break;
            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;
            case UsableListChangeTypeId.Insert:
                if (source.list.usable) {
                    this.enqueueSourceRecordRangeListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.InsertSourceRange, source, idx, count);
                }
                break;
            case UsableListChangeTypeId.BeforeReplace:
                if (source.list.usable) {
                    this.enqueueSourceRecordRangeListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.RemoveSourceRange, source, idx, count);
                }
                break;
            case UsableListChangeTypeId.AfterReplace:
                if (source.list.usable) {
                    this.enqueueSourceRecordRangeListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.InsertSourceRange, source, idx, count);
                }
                break;
            case UsableListChangeTypeId.Remove:
                if (source.list.usable) {
                    this.enqueueSourceRecordRangeListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.RemoveSourceRange, source, idx, count);
                }
                break;
            case UsableListChangeTypeId.Clear:
                if (source.list.count > 0) {
                    this.enqueueListChangeAndProcess(RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.ClearSource, source, []);
                }
                break;
            default:
                throw new UnreachableCaseError('RLIILDHSLCE20208', listChangeTypeId);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private enqueueSourceRecordRangeListChangeAndProcess(
        changeTypeId: RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.InsertSourceRange | RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.RemoveSourceRange,
        source: RankedLitIvemIdListDirectory.Source,
        rangeStartIndex: Integer,
        rangeLength: Integer
    ) {
        const sourceList = source.list;
        const items = new Array<RankedLitIvemIdListDirectoryItem>(rangeLength);
        let index = rangeStartIndex;
        for (let i = 0; i < rangeLength; i++) {
            const item = sourceList.getAt(index++);
            items[i] = item;
        }
        this.enqueueListChangeAndProcess(changeTypeId, source, items);
    }

    private enqueueListChangeAndProcess(
        typeId: RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId,
        source: RankedLitIvemIdListDirectory.Source | undefined,
        items: RankedLitIvemIdListDirectoryItem[],
    ) {
        const change: RankedLitIvemIdListDirectory.ListChangeQueue.Change = {
            source,
            typeId,
            items,
        };
        this._listChangeQueue.enqueue(change);
        this.processListChangeQueue();
    }

    private processListChangeQueue() {
        if (!this._listChangeProcessing) {
            const change = this._listChangeQueue.dequeue();
            if (change !== undefined) {
                switch (change.typeId) {
                    case RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.Open: {
                        this.processOpenListChange(); // async
                        break;
                    }
                    case RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.InsertSourceRange: {
                        const source = change.source;
                        if (source === undefined) {
                            throw new AssertInternalError('RLIILDPLCQI51071');
                        } else {
                            this.processInsertSourceRangeListChange(source, change.items); // async
                        }
                        break;
                    }
                    case RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.RemoveSourceRange: {
                        const source = change.source;
                        if (source === undefined) {
                            throw new AssertInternalError('RLIILDPLCQI51071');
                        } else {
                            this.processRemoveSourceRangeListChange(source, change.items);
                        }
                        break;
                    }
                    case RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.ClearSource: {
                        const source = change.source;
                        if (source === undefined) {
                            throw new AssertInternalError('RLIILDPLCQI51071');
                        } else {
                            this.processClearSourceListChange(source);
                        }
                        break;
                    }
                    case RankedLitIvemIdListDirectory.ListChangeQueue.Change.TypeId.Close: {
                        this.processCloseListChange();
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('RLIILDPLCQD51071', change.typeId);
                }
            }
        }
    }

    private processOpenListChange() {
        const sourceCount = this._sources.length;
        if (sourceCount === 0) {
            this.processListChangeQueue(); // nothing to do - check queue again
        } else {
            this._listChangeProcessing = true;

            let itemCount = 0;
            for (const source of this._sources) {
                const sourceList = source.list;
                if (sourceList.usable) {
                    itemCount += sourceList.count;
                }
            }

            this._itemList.capacity = itemCount;

            // unlock everything asynchronously
            const sourcePromises = new Array<Promise<Result<RankedLitIvemIdListDirectoryItem>[]>>(sourceCount)
            const usableSources = new Array<RankedLitIvemIdListDirectory.Source>(sourceCount);
            let usableCount = 0;
            for (let i = 0; i < sourceCount; i++) {
                const source = this._sources[i];
                const sourceList = source.list;
                if (sourceList.usable) {
                    usableSources[usableCount] = source;
                    sourcePromises[usableCount] = sourceList.lockAllItems(this._locker);
                    usableCount++;
                }
            }

            sourcePromises.length = usableCount;

            // wait till all unlocked
            const allPromise = Promise.all(sourcePromises);

            allPromise.then(
                (allSourcesLockResults) => {
                    if (usableCount !== allSourcesLockResults.length) {
                        throw new AssertInternalError('RLIILDPOLCC10512', `${usableCount}, ${allSourcesLockResults.length}`);
                    } else {
                        const firstAddIndex = this._itemList.count;
                        let addCount = 0;
                        for (let i = 0; i < usableCount; i++) {
                            const sourceLockResults = allSourcesLockResults[i];
                            const source = usableSources[i];
                            const maxSourceLockedCount = sourceLockResults.length;
                            const sourceLockedItems = new Array<RankedLitIvemIdListDirectoryItem>(maxSourceLockedCount);
                            let sourceLockedCount = 0;
                            for (const lockResult of sourceLockResults)  {
                                if (lockResult.isOk()) {
                                    const item = lockResult.value;
                                    this._itemList.add(item);
                                    sourceLockedItems[sourceLockedCount++] = item;
                                }
                            }
                            sourceLockedItems.length = sourceLockedCount;
                            source.lockedItems = [...source.lockedItems, ...sourceLockedItems];
                            addCount += sourceLockedCount;
                        }
                        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, addCount);

                        this.updateBadness(undefined);

                        this._listChangeProcessing = false;
                        this.processListChangeQueue(); // check queue
                    }
                },
                (error) => { throw AssertInternalError.createIfNotError(error, 'RLIILDPOLCE10512') }
            );
        }
    }

    private processCloseListChange() {
        this._listChangeProcessing = true;

        const itemCount = this._itemList.count;
        if (itemCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, itemCount);
            this._itemList.clear();

            for (const source of this._sources) {
                const sourceLockedItems = source.lockedItems;
                if (sourceLockedItems.length > 0) {
                    source.list.unlockItems(sourceLockedItems, this._locker);
                    source.lockedItems = [];
                }
            }
        }

        this._listChangeProcessing = false;
        this.processListChangeQueue(); // check queue
    }

    private processInsertSourceRangeListChange(source: RankedLitIvemIdListDirectory.Source, items: RankedLitIvemIdListDirectoryItem[]) {
        const sourceList = source.list;
        if (sourceList.usable) {
            const lockResultsPromise = sourceList.lockItems(items, this._locker);
            lockResultsPromise.then(
                (lockResults) => {
                    const firstAddIndex = this._itemList.count;
                    const lockedItems = new Array<RankedLitIvemIdListDirectoryItem>(items.length);
                    let addCount = 0;
                    for (const lockResult of lockResults)  {
                        if (lockResult.isOk()) {
                            const item = lockResult.value;
                            if (item !== undefined) {
                                this._itemList.add(item);
                                lockedItems[addCount++] = item;
                            }
                        }
                    }
                    lockedItems.length = addCount;
                    source.lockedItems = [...source.lockedItems, ...lockedItems];

                    this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, addCount);

                    this._listChangeProcessing = false;
                    this.processListChangeQueue(); // check queue
                },
                (error) => { throw AssertInternalError.createIfNotError(error, 'RLIILDPCLCE10512') }
            );
        }
    }

    private processRemoveSourceRangeListChange(source: RankedLitIvemIdListDirectory.Source, items: RankedLitIvemIdListDirectoryItem[]) {
        this._listChangeProcessing = true;

        const sourceList = source.list;
        const itemCount = items.length;
        const itemListCount  = this._itemList.count;
        if (itemCount === itemListCount) {
            // clear
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, itemCount);
            this._itemList.clear();

            sourceList.unlockItems(items, this._locker);
            source.lockedItems = [];
        } else {
            this._itemList.removeItems(
                items,
                (idx, count) => { this.notifyListChange(UsableListChangeTypeId.Remove, idx, count); }
            );
            const lockedItems = source.lockedItems;
            const oldLockedItemCount = lockedItems.length;
            removeFromArray(lockedItems, items);
            if (lockedItems.length !== oldLockedItemCount - itemCount) {
                throw new AssertInternalError('RLIILDPRSRLC41081', `${lockedItems.length}, ${oldLockedItemCount}, ${itemCount}`);
            }
        }

        this._listChangeProcessing = false;
        this.processListChangeQueue(); // check queue
    }

    private processClearSourceListChange(source: RankedLitIvemIdListDirectory.Source) {
        const lockedItems = source.lockedItems;
        this.processRemoveSourceRangeListChange(source, lockedItems);
    }

    private updateBadness(changedSource: RankedLitIvemIdListDirectory.Source | undefined) {
        const sources = this._sources;
        const sourceCount = sources.length;

        const resourceBadnesses = new Array<ResourceBadness>(sourceCount);
        for (let i = 0; i < sourceCount; i++) {
            const source = sources[i];
            if (changedSource === undefined || source === changedSource) {
                this.updateSourceResourceBadness(source);
            }
            resourceBadnesses[i] = source.lastResourceBadness;
        }
        const badness = ResourceBadness.consolidate(resourceBadnesses);
        this.setBadness(badness);
    }

    private updateSourceResourceBadness(source: RankedLitIvemIdListDirectory.Source) {
        const list = source.list;
        const listBadness = list.badness;
        source.lastResourceBadness = {
            reasonId: listBadness.reasonId,
            reasonExtra: listBadness.reasonExtra,
            resourceName: source.badnessResourceName,
        }
    }
}

export namespace RankedLitIvemIdListDirectory {
    export interface NamedSourceList {
        name: string;
        list: LockOpenList<RankedLitIvemIdListDirectoryItem>;
    }

    export interface Source {
        readonly list: LockOpenList<RankedLitIvemIdListDirectoryItem>;
        readonly badnessResourceName: string;
        lastResourceBadness: ResourceBadness;
        lockedItems: RankedLitIvemIdListDirectoryItem[];
        listChangeEventSubscriptionId: MultiEvent.SubscriptionId | undefined;
        badnessChangeEventSubscriptionId: MultiEvent.SubscriptionId | undefined;
    }

    export class ListChangeQueue {
        private readonly _items = new Array<ListChangeQueue.Change>();

        get length() { return this._items.length; }

        enqueue(item: ListChangeQueue.Change) {
            this._items.push(item);
        }

        dequeue() {
            return this._items.shift();
        }
    }

    export namespace ListChangeQueue {
        export interface Change {
            source: Source | undefined;
            typeId: Change.TypeId;
            items: RankedLitIvemIdListDirectoryItem[];
        }

        export namespace Change {
            export const enum TypeId {
                Open,
                InsertSourceRange,
                RemoveSourceRange,
                ClearSource,
                Close,
            }
        }
    }
}
