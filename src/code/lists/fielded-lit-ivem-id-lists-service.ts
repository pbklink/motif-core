/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from '../sys/multi-event';
import { FieldedLitIvemIdList } from './fielded-lit-ivem-id-list';
import { FieldedLockOpenListService } from './fielded-lock-open-list-service';
import { ScansService } from './scans-service';

export class FieldedLitIvemIdListsService extends FieldedLockOpenListService<FieldedLitIvemIdList> {
    private _scansBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scansCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        super();

        this._scansBadnessChangeSubscriptionId = this._scansService.subscribeBadnessChangeEvent(() => this.processScansBadnessChangeEvent())
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeCorrectnessChangeEvent(() => this.processScansCorrectnessChangeEvent())
        this._scansCorrectnessChangeSubscriptionId = this._scansService.subscribeListChangeEvent(() => this.processScansCorrectnessChangeEvent())
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
