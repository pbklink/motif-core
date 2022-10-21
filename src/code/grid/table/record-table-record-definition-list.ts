/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../adi/adi-internal-api';
import {
    Badness,
    Integer,
    KeyedCorrectnessRecord,
    KeyedCorrectnessRecordList,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../../sys/sys-internal-api";
import { RecordTableRecordDefinition } from './record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';
import { RandomIdTableRecordDefinitionList, TableRecordDefinitionList } from './table-record-definition-list';

export abstract class RecordTableRecordDefinitionList<Record extends KeyedCorrectnessRecord>
    extends RandomIdTableRecordDefinitionList {

    private _definitions: RecordTableRecordDefinition<Record>[] = [];

    private _recordList: KeyedCorrectnessRecordList<Record>;
    private _recordListListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _recordListBeforeRecordChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _recordListAfterRecordChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _recordListbadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    // setting accountId to undefined will return orders for all accounts
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
    }

    get recordList() { return this._recordList; }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._definitions[idx];
    }

    override open() {
        this._recordList = this.subscribeList();
        this._recordListListChangeEventSubscriptionId = this._recordList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleListListChangeEvent(listChangeTypeId, idx, count)
        );
        this._recordListBeforeRecordChangeEventSubscriptionId = this._recordList.subscribeBeforeRecordChangeEvent(
            (index) => this.handleRecordListBeforeRecordChangeEvent(index)
        );
        this._recordListAfterRecordChangedEventSubscriptionId = this._recordList.subscribeAfterRecordChangedEvent(
            (index) => this.handleRecordListAfterRecordChangedEvent(index)
        );
        this._recordListbadnessChangeEventSubscriptionId = this._recordList.subscribeBadnessChangeEvent(
            () => this.handleRecordListBadnessChangeEvent()
        );

        super.open();

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

    override close() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        }

        this._recordList.unsubscribeListChangeEvent(this._recordListListChangeEventSubscriptionId);
        this._recordList.unsubscribeBadnessChangeEvent(this._recordListbadnessChangeEventSubscriptionId);
        this._recordList.unsubscribeBeforeRecordChangeEvent(this._recordListBeforeRecordChangeEventSubscriptionId);
        this._recordList.unsubscribeAfterRecordChangedEvent(this._recordListAfterRecordChangedEventSubscriptionId);

        super.close();

        this.unsubscribeList(this._recordList);
    }

    protected getCount() { return this._definitions.length; }
    protected getCapacity() { return this._definitions.length; }
    protected setCapacity(value: Integer) { /* no code */ }

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

    private handleListListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processListListChange(listChangeTypeId, idx, count);
    }

    private handleRecordListBeforeRecordChangeEvent(index: Integer) {
        const definition = this._definitions[index];
        definition.dispose();
    }

    private handleRecordListAfterRecordChangedEvent(index: Integer) {
        const record = this._recordList.records[index];
        const definition = this.createTableRecordDefinition(record);
        this._definitions[index] = definition;
    }

    private handleRecordListBadnessChangeEvent() {
        this.checkSetUnusable(this._recordList.badness);
    }

    private insertRecords(idx: Integer, count: Integer) {
        if (count === 1) {
            const record = this._recordList.records[idx];
            const definition = this.createTableRecordDefinition(record);
            if (idx === this._definitions.length) {
                this._definitions.push(definition);
            } else {
                this._definitions.splice(idx, 0, definition);
            }
        } else {
            const definitions = new Array<RecordTableRecordDefinition<Record>>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const record = this._recordList.records[i];
                definitions[insertArrayIdx++] = this.createTableRecordDefinition(record);
            }
            this._definitions.splice(idx, 0, ...definitions);
        }
    }

    private processListListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._recordList.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._definitions.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecords(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._recordList.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._definitions.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._definitions.length = 0;
                break;
            default:
                throw new UnreachableCaseError('BADRTRDLPLLC1815392487', listChangeTypeId);
        }
    }

    protected abstract subscribeList(): KeyedCorrectnessRecordList<Record>;
    protected abstract unsubscribeList(list: KeyedCorrectnessRecordList<Record>): void;
    protected abstract createTableRecordDefinition(record: Record): RecordTableRecordDefinition<Record>;
}

export namespace RecordTableRecordDefinitionList {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
