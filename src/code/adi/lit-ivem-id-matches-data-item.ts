/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, Logger, UnreachableCaseError, UsableListChangeTypeId } from '../sys/sys-internal-api';
import { AurcChangeTypeId, DataMessage, DataMessageTypeId, LitIvemIdMatchesDataMessage } from './common/adi-common-internal-api';
import { LitIvemIdMatch } from './lit-ivem-id-match';
import { MatchesDataItem } from './matches-data-item';

export class LitIvemIdMatchesDataItem extends MatchesDataItem<LitIvemIdMatch> {

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.LitIvemIdMatches) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const matchesMsg = msg as LitIvemIdMatchesDataMessage;
                this.processMatchesDataMessage(matchesMsg);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMatchesDataMessage(msg: LitIvemIdMatchesDataMessage): void {
        let addStartMsgIdx = -1;

        const msgRecordLength = msg.changes.length;
        for (let msgChangeIdx = 0; msgChangeIdx < msgRecordLength; msgChangeIdx++) {
            const change = msg.changes[msgChangeIdx];
            switch (change.typeId) {
                case AurcChangeTypeId.Add: {
                    if (!LitIvemIdMatchesDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('LIIMDIPSDMAI10091');
                    } else {
                        const mapKey = change.target;
                        if (this.hasRecord(mapKey)) {
                            addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                            Logger.logDataError('LIIMDIPSDMAE10091', `${change.target}`);
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
                    if (!LitIvemIdMatchesDataMessage.isAddUpdateChange(change)) {
                        throw new AssertInternalError('LIIMDIPSDMUI10091');
                    } else {
                        const mapKey = change.target;
                        const match = this.getRecordByMapKey(mapKey);

                        if (match === undefined) {
                            Logger.logDataError('LIIMDIPSDMUM10091', `${change.target}`);
                        } else {
                            match.update(change);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Remove: {
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    if (!LitIvemIdMatchesDataMessage.isAddUpdateRemoveChange(change)) {
                        throw new AssertInternalError('LIIMDIPSDMRI10091');
                    } else {
                        const removeMapKey = change.target;
                        const matchIdx = this.indexOfRecordByMapKey(removeMapKey);
                        if (matchIdx < 0) {
                            Logger.logDataError('LIIMDIPSDMRF10091', `Match not found: ${change}`);
                        } else {
                            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, matchIdx, 1);
                            this.removeRecord(matchIdx);
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Clear:
                    addStartMsgIdx = this.checkApplyAdd(msg.changes, addStartMsgIdx, msgChangeIdx);
                    this.clearRecords();
                    break;

                default:
                    throw new UnreachableCaseError('LIIMDIPSDMD10091', change.typeId);
            }
        }
        this.checkApplyAdd(msg.changes, addStartMsgIdx, msg.changes.length);
    }

    private checkApplyAdd(changes: readonly LitIvemIdMatchesDataMessage.Change[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.extendRecordCount(addCount);
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const change = changes[i];
                if (!LitIvemIdMatchesDataMessage.isAddUpdateChange(change)) {
                    throw new AssertInternalError('LIIMDICAA11513');
                } else {
                    // add to all
                    const match = new LitIvemIdMatch(change, this.correctnessId);
                    this.setRecord(addIdx++, match);
                }
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }

        return -1;
    }
}
