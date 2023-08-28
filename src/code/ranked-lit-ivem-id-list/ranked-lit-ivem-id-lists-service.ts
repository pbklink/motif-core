/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScansService } from '../scan/scan-internal-api';
import { MultiEvent } from '../sys/multi-event';

export class RankedLitIvemIdListsService /* extends LockOpenList<RankedLitIvemIdList>*/ {
    private _scansBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scansCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        // super();

        this._scansBadnessChangeSubscriptionId = this._scansService.subscribeBadnessChangeEvent(() => this.processScansBadnessChangeEvent());
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeCorrectnessChangedEvent(() => this.processScansCorrectnessChangedEvent());
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeListChangeEvent(() => this.processScansCorrectnessChangedEvent());

        if (!this._scansService.usable) {
            const scanCount = this._scansService.count;
            // const maxItemCount = scanCount;
            // const addItems = new Array<ScanMatchesRankedLitIvemIdListImplementation>(maxItemCount);
            // let itemCount = 0;

            for (let i = 0; i < scanCount; i++) {
                const scan = this._scansService.getAt(i);
                if (scan.symbolListEnabled) {
                    // const matchesLitIvemIdList = new ScanMatchesRankedLitIvemIdList(scan.mapKey);
                    // addItems[itemCount++] = matchesLitIvemIdList;
                }
            }

            // this.addItems(addItems, itemCount);
        }
    }

    finalise() {
        this._scansService.unsubscribeBadnessChangeEvent(this._scansBadnessChangeSubscriptionId);
        this._scansBadnessChangeSubscriptionId = undefined;
        this._scansService.unsubscribeCorrectnessChangedEvent(this._scansCorrectnessChangeSubscriptionId);
        this._scansCorrectnessChangeSubscriptionId = undefined;
    }

    private processScansBadnessChangeEvent() {
        //
    }

    private processScansCorrectnessChangedEvent() {
        //
    }
}
