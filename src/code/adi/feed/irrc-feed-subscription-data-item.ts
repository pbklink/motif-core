/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList, Integer, MultiEvent, RecordList, UnreachableCaseError, UsableListChangeTypeId } from '../../sys/sys-internal-api';
import { InsertReplaceIrrcChange, IrrcChange, IrrcChangeTypeId, RemoveIrrcChange } from '../common/adi-common-internal-api';
import { FeedSubscriptionDataItem } from './feed-subscription-data-item';

export class IrrcFeedSubscriptionDataItem<T> extends FeedSubscriptionDataItem implements BadnessList<T> {
    readonly records = new Array<T>;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    get count() { return this.records.length; }

    indexOf(record: T) {
        const records = this.records;
        const count = records.length;
        for (let index = 0; index < count; index++) {
            if (records[index] === record) {
                return index;
            }
        }
        return -1;
    }

    getAt(recordIndex: Integer) {
        return this.records[recordIndex];
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected processIrrcChanges(changes: readonly IrrcChange<T>[]): void {
        const changesCount = changes.length;
        for (let changeIdx = 0; changeIdx < changesCount; changeIdx++) {
            const change = changes[changeIdx];
            this.processIrrcChange(change);
        }
    }

    private processIrrcChange(change: IrrcChange<T>) {
        switch (change.typeId) {
            case IrrcChangeTypeId.Insert: {
                const insertChange = change as InsertReplaceIrrcChange<T>;
                const at = insertChange.at;
                const items = insertChange.items;
                this.records.splice(at, 0, ...items);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, at, items.length);
                break;
            }

            case IrrcChangeTypeId.Replace: {
                const replaceChange = change as InsertReplaceIrrcChange<T>;
                const at = replaceChange.at;
                const items = replaceChange.items;
                const changeCount = items.length;
                this.checkUsableNotifyListChange(UsableListChangeTypeId.BeforeReplace, at, changeCount);
                this.records.splice(at, changeCount, ...items);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.AfterReplace, at, changeCount);
                break;
            }

            case IrrcChangeTypeId.Remove: {
                const removeChange = change as RemoveIrrcChange<T>;
                const at = removeChange.at;
                const changeCount = removeChange.count;
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, at, changeCount);
                this.records.splice(at, changeCount);
                break;
            }

            case IrrcChangeTypeId.Clear: {
                this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
                this.records.length = 0;
                break;
            }

            default:
                throw new UnreachableCaseError('IFSDIPIC43081', change.typeId);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }
}
