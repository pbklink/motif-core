/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Badness,
    BadnessList,
    Integer,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../../../sys/internal-api";
import { LockOpenListItem } from '../../../sys/lock-open-list-item';
import { TableRecordSource } from './table-record-source';

/** @public */
export abstract class SubscribeBadnessListTableRecordSource<Record, RecordList extends BadnessList<Record>> extends TableRecordSource {
    private _recordList: RecordList;
    private _recordListListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _recordListBeforeRecordChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _recordListAfterRecordChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _recordListbadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    get recordList() { return this._recordList; }

    // getDefinition(idx: Integer): TableRecordDefinition {
    //     return this._definitions[idx];
    // }

    override openLocked(opener: LockOpenListItem.Opener) {
        this._recordList = this.subscribeList(opener);
        this._recordListListChangeEventSubscriptionId = this._recordList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.processListListChange(listChangeTypeId, idx, count); }
        );
        // this._recordListBeforeRecordChangeEventSubscriptionId = this._recordList.subscribeBeforeRecordChangeEvent(
        //     (index) => this.handleRecordListBeforeRecordChangeEvent(index)
        // );
        // this._recordListAfterRecordChangedEventSubscriptionId = this._recordList.subscribeAfterRecordChangedEvent(
        //     (index) => this.handleRecordListAfterRecordChangedEvent(index)
        // );
        this._recordListbadnessChangeEventSubscriptionId = this._recordList.subscribeBadnessChangeEvent(
            () => { this.handleRecordListBadnessChangeEvent(); }
        );

        super.openLocked(opener);

        if (this._recordList.usable) {
            const newCount = this._recordList.count;
            if (newCount > 0) {
                this.processListListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
            }
            this.processListListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processListListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    override closeLocked(opener: LockOpenListItem.Opener) {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        }

        this._recordList.unsubscribeListChangeEvent(this._recordListListChangeEventSubscriptionId);
        this._recordList.unsubscribeBadnessChangeEvent(this._recordListbadnessChangeEventSubscriptionId);
        // this._recordList.unsubscribeBeforeRecordChangeEvent(this._recordListBeforeRecordChangeEventSubscriptionId);
        // this._recordList.unsubscribeAfterRecordChangedEvent(this._recordListAfterRecordChangedEventSubscriptionId);

        this.unsubscribeList(opener, this._recordList);
        super.closeLocked(opener);
    }

    protected override getCount() { return this._recordList.count; }
    // protected getCapacity() { return this._definitions.length; }
    // protected setCapacity(value: Integer) { /* no code */ }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    // private handleRecordListBeforeRecordChangeEvent(index: Integer) {
    //     const definition = this._definitions[index];
    //     definition.dispose();
    // }

    // private handleRecordListAfterRecordChangedEvent(index: Integer) {
    //     const record = this._recordList.records[index];
    //     const definition = this.createTableRecordDefinition(record);
    //     this._definitions[index] = definition;
    // }

    private handleRecordListBadnessChangeEvent() {
        this.checkSetUnusable(this._recordList.badness);
    }

    // private insertRecords(idx: Integer, count: Integer) {
    //     if (count === 1) {
    //         const record = this._recordList.records[idx];
    //         const definition = this.createTableRecordDefinition(record);
    //         if (idx === this._definitions.length) {
    //             this._definitions.push(definition);
    //         } else {
    //             this._definitions.splice(idx, 0, definition);
    //         }
    //     } else {
    //         const definitions = new Array<RecordTableRecordDefinition<Record>>(count);
    //         let insertArrayIdx = 0;
    //         for (let i = idx; i < idx + count; i++) {
    //             const record = this._recordList.records[i];
    //             definitions[insertArrayIdx++] = this.createTableRecordDefinition(record);
    //         }
    //         this._definitions.splice(idx, 0, ...definitions);
    //     }
    // }

    private processListListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._recordList.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                // this._definitions.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                // this.insertRecords(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._recordList.badness);
                break;
            case UsableListChangeTypeId.Insert:
                // this.insertRecords(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.BeforeReplace, idx, count);
                break;
            case UsableListChangeTypeId.AfterReplace:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.AfterReplace, idx, count);
                break;
            case UsableListChangeTypeId.BeforeMove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.BeforeMove, idx, count);
                break;
            case UsableListChangeTypeId.AfterMove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.AfterMove, idx, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                // this._definitions.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, count);
                // this._definitions.length = 0;
                break;
            default:
                throw new UnreachableCaseError('RTRSPLLC12487', listChangeTypeId);
        }
    }

    protected abstract subscribeList(opener: LockOpenListItem.Opener): RecordList;
    protected abstract unsubscribeList(opener: LockOpenListItem.Opener, list: RecordList): void;
}
