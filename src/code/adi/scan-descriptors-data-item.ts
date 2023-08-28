import { AssertInternalError, Integer, Logger, UnreachableCaseError, UsableListChangeTypeId } from '../sys/sys-internal-api';
import { AurcChangeTypeId, DataMessage, DataMessageTypeId, ScanDescriptorsDataMessage } from './common/adi-common-internal-api';
import { RecordsFeedSubscriptionDataItem } from './records-feed-subscription-data-item';
import { ScanDescriptor } from './scan-descriptor';

export class ScanDescriptorsDataItem extends RecordsFeedSubscriptionDataItem<ScanDescriptor> {

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.ScanDescriptors) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const scansMsg = msg as ScanDescriptorsDataMessage;
                this.processScansDataMessage(scansMsg);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processScansDataMessage(msg: ScanDescriptorsDataMessage): void {
        let addStartMsgIdx = -1;

        const msgRecordLength = msg.changes.length;
        for (let msgChangeIdx = 0; msgChangeIdx < msgRecordLength; msgChangeIdx++) {
            const change = msg.changes[msgChangeIdx];
            switch (change.typeId) {
                case AurcChangeTypeId.Add: {
                    if (!ScanDescriptorsDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('SDIPSDMAI10091');
                    } else {
                        const mapKey = change.id;
                        if (this.hasRecord(mapKey)) {
                            addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                            Logger.logDataError('SDIPSDMAE10091', `${change.id}, ${change.name ?? ''}, ${change.description ?? ''}`);
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
                    if (!ScanDescriptorsDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('SDIPSDMUI10091');
                    } else {
                        const mapKey = change.id;
                        const scan = this.getRecordByMapKey(mapKey);

                        if (scan === undefined) {
                            Logger.logDataError('SDIPSDMUM10091', `${change.id}`);
                        } else {
                            scan.update(change);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Remove: {
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    if (!ScanDescriptorsDataMessage.isRemoveChange(change)) {
                        throw new AssertInternalError('SDIPSDMRI10091');
                    } else {
                        const removeMapKey = change.id;
                        const scanIdx = this.indexOfRecordByMapKey(removeMapKey);
                        if (scanIdx < 0) {
                            Logger.logDataError('SDIPSDMRF10091', `Scan not found: ${JSON.stringify(change)}`);
                        } else {
                            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, scanIdx, 1);
                            this.removeRecord(scanIdx);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Clear:
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    this.clearRecords();
                    break;

                default:
                    throw new UnreachableCaseError('SDIPSDMD10091', change.typeId);
            }
        }
        this.checkApplyAdd(msg.changes, addStartMsgIdx, msg.changes.length);
    }

    private checkApplyAdd(changes: readonly ScanDescriptorsDataMessage.Change[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.extendRecordCount(addCount);
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const change = changes[i];
                if (!ScanDescriptorsDataMessage.isAddUpdateChange(change)) {
                    throw new AssertInternalError('SDICAA11513');
                } else {
                    // add to all
                    const scan = new ScanDescriptor(change, this.correctnessId);
                    this.setRecord(addIdx++, scan);
                }
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }

        return -1;
    }
}
