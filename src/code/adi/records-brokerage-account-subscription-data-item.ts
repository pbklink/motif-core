/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, KeyedCorrectnessSettableList, MapKey, MultiEvent, RecordList, UsableListChangeTypeId } from '../sys/internal-api';
import { BrokerageAccountGroup, SingleBrokerageAccountGroup } from './brokerage-account-group';
import { BrokerageAccountGroupRecordList } from './brokerage-account-group-record-list';
import { BrokerageAccountRecord } from './brokerage-account-record';
import { BrokerageAccountSubscriptionDataItem } from './brokerage-account-subscription-data-item';
import { DataDefinition } from './common/internal-api';

export abstract class RecordsBrokerageAccountSubscriptionDataItem<Record extends BrokerageAccountRecord>
    extends BrokerageAccountSubscriptionDataItem implements BrokerageAccountGroupRecordList<Record> {

    private _brokerageAccountGroup: BrokerageAccountGroup;

    private _records: Record[] = [];
    private _recordsMap = new Map<MapKey, Record>();

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _beforeRecordChangeMultiEvent = new MultiEvent<KeyedCorrectnessSettableList.BeforeRecordChangeEventHandler>();
    private _afterRecordChangedMultiEvent = new MultiEvent<KeyedCorrectnessSettableList.AfterRecordChangedEventHandler>();

    constructor(definition: DataDefinition) {
        super(definition);
        this._brokerageAccountGroup = new SingleBrokerageAccountGroup(this.accountKey);
    }

    get brokerageAccountGroup() { return this._brokerageAccountGroup; }

    get records() { return this._records; }
    get count() { return this._records.length; }

    indexOf(record: Record) {
        const count = this.count;
        for (let index = 0; index < count; index++) {
            if (this._records[index] === record) {
                return index;
            }
        }
        return -1;
    }

    getAt(recordIndex: Integer) {
        return this._records[recordIndex];
    }

    toArray(): readonly Record[] {
        return this._records;
    }

    getRecordByMapKey(mapKey: MapKey) {
        return this._recordsMap.get(mapKey);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecordChangeEvent(handler: KeyedCorrectnessSettableList.BeforeRecordChangeEventHandler) {
        return this._beforeRecordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecordChangedEvent(handler: KeyedCorrectnessSettableList.AfterRecordChangedEventHandler) {
        return this._afterRecordChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecordChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected override stop() {
        this.clearRecords(); // make sure disposed
        super.stop();
    }

    protected override processSubscriptionPreOnline() {
        this.clearRecords();
        super.processSubscriptionPreOnline();
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            if (this.count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, this.count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    protected override processCorrectnessChanged() {
        super.processCorrectnessChanged();

        const correctnessId = this.correctnessId;
        for (const record of this._records) {
            record.setListCorrectness(correctnessId);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer): void {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    protected extendRecordCount(extra: Integer) {
        const extendStartIdx = this._records.length;
        this._records.length = extendStartIdx + extra;
        return extendStartIdx;
    }

    protected setRecord(index: Integer, record: Record) {
        this.records[index] = record;
        const mapKey = record.mapKey;
        this._recordsMap.set(mapKey, record);
    }

    protected removeRecord(index: Integer) {
        const record = this._records[index];
        const mapKey = record.mapKey;
        record.dispose();
        this._records.splice(index, 1);
        this._recordsMap.delete(mapKey);
    }

    protected clearRecords() {
        const count = this._records.length;
        if (count > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this.notifyListChange(UsableListChangeTypeId.Clear, 0, count);
                this._recordsMap.clear();
                for (const record of this._records) {
                    record.dispose();
                }
                this._records.length = 0;
            } finally {
                this.endUpdate();
            }
        }
    }

    protected hasRecord(mapKey: MapKey) {
        return this._recordsMap.has(mapKey);
    }

    protected indexOfRecordByMapKey(mapKey: MapKey) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const record = this._records[i];
            if (record.mapKey === mapKey) {
                return i;
            }
        }
        return -1;
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private notifyBeforeRecordChange(index: Integer) {
        const handlers = this._beforeRecordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private notifyAfterRecordChanged(index: Integer) {
        const handlers = this._afterRecordChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }
}
