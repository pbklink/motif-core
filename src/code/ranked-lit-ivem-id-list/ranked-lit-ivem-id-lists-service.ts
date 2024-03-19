/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanList, ScansService } from '../scan/internal-api';
import { MultiEvent } from '../sys/internal-api';

export class RankedLitIvemIdListsService /* extends LockOpenList<RankedLitIvemIdList>*/ {
    private readonly _scanList: ScanList;
    private _scansbadnessChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _scansCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        this._scanList = this._scansService.scanList;

        this._scansbadnessChangedSubscriptionId = this._scanList.subscribeBadnessChangedEvent(() => { this.processScansbadnessChangedEvent(); });
        this._scansCorrectnessChangeSubscriptionId = this._scanList.subscribeCorrectnessChangedEvent(() => { this.processScansCorrectnessChangedEvent(); });
        this._scansCorrectnessChangeSubscriptionId = this._scanList.subscribeListChangeEvent(() => { this.processScansCorrectnessChangedEvent(); });

        if (!this._scanList.usable) {
            const scanCount = this._scanList.count;
            // const maxItemCount = scanCount;
            // const addItems = new Array<ScanMatchesRankedLitIvemIdListImplementation>(maxItemCount);
            // let itemCount = 0;

            for (let i = 0; i < scanCount; i++) {
                const scan = this._scanList.getAt(i);
                if (scan.symbolListEnabled) {
                    // const matchesLitIvemIdList = new ScanMatchesRankedLitIvemIdList(scan.mapKey);
                    // addItems[itemCount++] = matchesLitIvemIdList;
                }
            }

            // this.addItems(addItems, itemCount);
        }
    }

    finalise() {
        this._scanList.unsubscribeBadnessChangedEvent(this._scansbadnessChangedSubscriptionId);
        this._scansbadnessChangedSubscriptionId = undefined;
        this._scanList.unsubscribeCorrectnessChangedEvent(this._scansCorrectnessChangeSubscriptionId);
        this._scansCorrectnessChangeSubscriptionId = undefined;
    }

    private processScansbadnessChangedEvent() {
        //
    }

    private processScansCorrectnessChangedEvent() {
        //
    }
}
