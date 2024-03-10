/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, logger, UnreachableCaseError, UsableListChangeTypeId } from '../../sys/internal-api';
import { AurcChangeTypeId, DataDefinition, DataMessage, DataMessageTypeId, FeedId, WatchmakerListDescriptorsDataMessage } from '../common/adi-common-internal-api';
import { KeyedCorrectnessSettableListFeedSubscriptionDataItem } from '../feed/internal-api';
import { WatchmakerListDescriptor } from './watchmaker-list-descriptor';

export class WatchmakerListDescriptorsDataItem extends KeyedCorrectnessSettableListFeedSubscriptionDataItem<WatchmakerListDescriptor> {

    constructor(definition: DataDefinition) {
        super(definition)
        this.setFeedId(FeedId.Watchlist);
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.WatchmakerListDescriptors) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const descriptorsMsg = msg as WatchmakerListDescriptorsDataMessage;
                this.processDescriptorsDataMessage(descriptorsMsg);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processDescriptorsDataMessage(msg: WatchmakerListDescriptorsDataMessage): void {
        let addStartMsgIdx = -1;

        const msgRecordLength = msg.changes.length;
        for (let msgChangeIdx = 0; msgChangeIdx < msgRecordLength; msgChangeIdx++) {
            const change = msg.changes[msgChangeIdx];
            switch (change.typeId) {
                case AurcChangeTypeId.Add: {
                    if (!WatchmakerListDescriptorsDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('WDDIPSDMAI10091');
                    } else {
                        const mapKey = change.id;
                        if (this.hasRecord(mapKey)) {
                            addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                            logger.logDataError('WDDIPSDMAE10091', `${change.id}, ${change.name}, ${change.description ?? ''}`);
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
                    if (!WatchmakerListDescriptorsDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('WDDIPSDMUI10091');
                    } else {
                        const mapKey = change.id;
                        const descriptor = this.getRecordByMapKey(mapKey);

                        if (descriptor === undefined) {
                            logger.logDataError('SDIPSDMUM10091', `${change.id}`);
                        } else {
                            descriptor.update(change);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Remove: {
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    if (!WatchmakerListDescriptorsDataMessage.isRemoveChange(change)) {
                        throw new AssertInternalError('WDDIPSDMRI10091');
                    } else {
                        const removeMapKey = change.id;
                        const descriptorIdx = this.indexOfRecordByMapKey(removeMapKey);
                        if (descriptorIdx < 0) {
                            logger.logDataError('WDDIPSDMRF10091', `Watchmaker List Descriptor not found: ${JSON.stringify(change)}`);
                        } else {
                            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, descriptorIdx, 1);
                            this.removeRecord(descriptorIdx);
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

    private checkApplyAdd(changes: readonly WatchmakerListDescriptorsDataMessage.Change[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.extendRecordCount(addCount);
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const change = changes[i];
                if (!WatchmakerListDescriptorsDataMessage.isAddUpdateChange(change)) {
                    throw new AssertInternalError('WDDICAA11513');
                } else {
                    // add to all
                    const descriptor = new WatchmakerListDescriptor(change, this.correctnessId);
                    this.setRecord(addIdx++, descriptor);
                }
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }

        return -1;
    }
}
