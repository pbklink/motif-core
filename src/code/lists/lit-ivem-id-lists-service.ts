/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from '../sys/multi-event';
import { LockOpenList } from '../sys/sys-internal-api';
import { LitIvemIdList } from './lit-ivem-id-list';
import { ScanMatchesLitIvemIdList } from './scan-matches-lit-ivem-id-list';
import { ScansService } from './scans-service';

export class LitIvemIdListsService extends LockOpenList<LitIvemIdList> {
    private _scansBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scansCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        super();

        this._scansBadnessChangeSubscriptionId = this._scansService.subscribeBadnessChangeEvent(() => this.processScansBadnessChangeEvent());
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeCorrectnessChangeEvent(() => this.processScansCorrectnessChangeEvent());
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeListChangeEvent(() => this.processScansCorrectnessChangeEvent());

        if (!this._scansService.usable) {
            const scanCount = this._scansService.count;
            const maxItemCount = scanCount;
            const addItems = new Array<LitIvemIdList>(maxItemCount);
            let itemCount = 0;

            for (let i = 0; i < scanCount; i++) {
                const scan = this._scansService.getItemAtIndex(i);
                if (scan.symbolListEnabled) {
                    const matchesLitIvemIdList = new ScanMatchesLitIvemIdList(scan.id, '', '');
                    addItems[itemCount++] = matchesLitIvemIdList;
                }
            }

            this.addItems(addItems, itemCount);
        }
    }

    finalise() {
        this._scansService.unsubscribeBadnessChangeEvent(this._scansBadnessChangeSubscriptionId);
        this._scansBadnessChangeSubscriptionId = undefined;
        this._scansService.unsubscribeCorrectnessChangeEvent(this._scansCorrectnessChangeSubscriptionId);
        this._scansCorrectnessChangeSubscriptionId = undefined;
    }

    private processScansBadnessChangeEvent() {
        //
    }

    private processScansCorrectnessChangeEvent() {
        //
    }
}
