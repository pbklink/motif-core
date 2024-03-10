/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, BadnessList, ErrorCodeLogger, Integer, MultiEvent, RecordList, UnreachableCaseError, UsableListChangeTypeId } from '../../sys/internal-api';
import { AurcChangeTypeId, DataDefinition, DataMessage, DataMessageTypeId, FeedId, ScanStatusedDescriptorsDataMessage } from '../common/adi-common-internal-api';
import { FeedSubscriptionDataItem } from '../feed/internal-api';
import { ScanStatusedDescriptor } from './scan-statused-descriptor';

export class ScanStatusedDescriptorsDataItem extends FeedSubscriptionDataItem implements BadnessList<ScanStatusedDescriptor>{
    private _list = new Array<ScanStatusedDescriptor>();
    private _map = new Map<string, ScanStatusedDescriptor>();

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(definition: DataDefinition) {
        super(definition)
        this.setFeedId(FeedId.Scanner);
    }

    get count() { return this._list.length; }

    indexOf(value: ScanStatusedDescriptor) {
        const list = this._list;
        const count = list.length;
        for (let i = 0; i < count; i++) {
            const descriptor = list[i];
            if (descriptor === value) { // this may need to check if same by value (not reference)
                return i;
            }
        }
        return -1;
    }

    indexOfScanId(scanId: string) {
        const list = this._list;
        const count = list.length;
        for (let i = 0; i < count; i++) {
            const descriptor = list[i];
            if (descriptor.id === scanId) { // this may need to check if same by value (not reference)
                return i;
            }
        }
        return -1;
    }

    getAt(index: Integer) {
        return this._list[index];
    }

    toArray(): readonly ScanStatusedDescriptor[] {
        return this._list;
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.ScanDescriptors) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const scansMsg = msg as ScanStatusedDescriptorsDataMessage;
                this.processScansDataMessage(scansMsg);
            } finally {
                this.endUpdate();
            }
        }
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processSubscriptionPreOnline() {
        this.clearList();
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

    private processScansDataMessage(msg: ScanStatusedDescriptorsDataMessage): void {
        let addStartMsgIdx = -1;

        const msgRecordLength = msg.changes.length;
        for (let msgChangeIdx = 0; msgChangeIdx < msgRecordLength; msgChangeIdx++) {
            const change = msg.changes[msgChangeIdx];
            switch (change.typeId) {
                case AurcChangeTypeId.Add: {
                    if (!ScanStatusedDescriptorsDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('SDIPSDMAI10091');
                    } else {
                        if (this._map.has(change.scanId)) {
                            addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                            ErrorCodeLogger.logDataError('SDIPSDMAE10091', `${change.scanId}, ${change.scanName ?? ''}, ${change.scanDescription ?? ''}`);
                        } else {
                            if (addStartMsgIdx < 0) {
                                addStartMsgIdx = msgChangeIdx;
                            }
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Update: {
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    if (!ScanStatusedDescriptorsDataMessage.isUpdateChange(change)) {
                        throw new AssertInternalError('SDIPSDMUI10091');
                    } else {
                        const descriptor = this._map.get(change.scanId);

                        if (descriptor === undefined) {
                            ErrorCodeLogger.logDataError('SDIPSDMUM10091', `${change.scanId}`);
                        } else {
                            descriptor.update(change);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Remove: {
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    if (!ScanStatusedDescriptorsDataMessage.isRemoveChange(change)) {
                        throw new AssertInternalError('SDIPSDMRI10091');
                    } else {
                        const scanIdx = this.indexOfScanId(change.scanId);
                        if (scanIdx < 0) {
                            ErrorCodeLogger.logDataError('SDIPSDMRF10091', `Scan not found: ${JSON.stringify(change)}`);
                        } else {
                            this.removeRecord(scanIdx);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Clear:
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    this.clearList();
                    break;

                default:
                    throw new UnreachableCaseError('SDIPSDMD10091', change.typeId);
            }
        }
        this.checkApplyAdd(msg.changes, addStartMsgIdx, msg.changes.length);
    }

    private checkApplyAdd(changes: readonly ScanStatusedDescriptorsDataMessage.Change[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const list = this._list;
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = list.length;
            list.length = addStartIdx + addCount;
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const change = changes[i];
                if (!ScanStatusedDescriptorsDataMessage.isAddChange(change)) {
                    throw new AssertInternalError('SDICAA11513');
                } else {
                    const descriptor = new ScanStatusedDescriptor(change);
                    this._list[addIdx++] = descriptor;
                }
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }

        return -1;
    }

    private removeRecord(index: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, index, 1);
        const descriptor = this._list[index];
        this._list.splice(index, 1);
        this._map.delete(descriptor.id);
    }

    private clearList() {
        const count = this._list.length;
        if (count > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this.notifyListChange(UsableListChangeTypeId.Clear, 0, count);
                this._map.clear();
                this._list.length = 0;
            } finally {
                this.endUpdate();
            }
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
