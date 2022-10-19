/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// This is code from DataItem.  Eventually migrate DataItem, TableRecordDefinitionList, Table and SequenceHistory to descend from this.

import { Badness } from './badness';
import { CorrectnessId } from './correctness';
import { AssertInternalError } from './internal-error';
import { MultiEvent } from './multi-event';

export class CorrectnessBadness {
    private _badness = Badness.createCopy(Badness.inactive);
    private _correctnessId = CorrectnessId.Suspect;
    private _setGoodBadTransactionId = 0;
    private _good = false;
    private _usable = false;
    private _error = false;
    private _correctnessChangeMultiEvent = new MultiEvent<CorrectnessBadness.CorrectnessChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<CorrectnessBadness.BadnessChangeEventHandler>();

    get badness() { return this._badness; }
    get good() { return this._good; }
    get usable() { return this._usable; }
    get error() { return this._error; }

    subscribeCorrectnessChangeEvent(handler: CorrectnessBadness.CorrectnessChangeEventHandler) {
        return this._correctnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBadnessChangeEvent(handler: CorrectnessBadness.BadnessChangeEventHandler) {
        return this._badnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._badnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected setUsable(badness: Badness) {
        if (Badness.isUnusable(badness)) {
            throw new AssertInternalError('DISU100029484'); // must always be usable
        } else {
            this.setBadness(badness);
        }
    }

    protected setUnusable(badness: Badness) {
        if (Badness.isUsable(badness)) {
            throw new AssertInternalError('DISNU100029484'); // must always be unusable
        } else {
            this.setBadness(badness);
        }
    }

    protected checkSetUnusuable(badness: Badness) {
        if (badness.reasonId !== Badness.ReasonId.NotBad) {
            this.setBadness(badness);
        }
    }

    protected processUsableChanged() {
        // available for override
    }

    protected processBadnessChange() {
        this.notifyBadnessChange();
    }

    protected processCorrectnessChange() {
        this.notifyCorrectnessChange();
    }

    // setBadness can also make a DataItem Good
    private setGood() {
        if (!this._good) {
            this._correctnessId = CorrectnessId.Good;
            const oldUsable = this._usable;
            this._good = true;
            this._usable = true;
            this._error = false;
            this._badness = {
                reasonId: Badness.ReasonId.NotBad,
                reasonExtra: '',
            } as const;
            const transactionId = ++this._setGoodBadTransactionId;
            if (!oldUsable) {
                this.processUsableChanged();
            }
            if (transactionId === this._setGoodBadTransactionId) {
                this.processBadnessChange();
                this.processCorrectnessChange();
            }
        }
    }

    private setBadness(badness: Badness) {
        if (Badness.isGood(badness)) {
            this.setGood();
        } else {
            const newReasonId = badness.reasonId;
            const newReasonExtra = badness.reasonExtra;
            if (newReasonId !== this._badness.reasonId || newReasonExtra !== this.badness.reasonExtra) {
                const oldUsable = this._usable;
                const oldCorrectnessId = this._correctnessId;
                this._correctnessId = Badness.Reason.idToCorrectnessId(newReasonId);
                this._good = false;
                this._usable = this._correctnessId === CorrectnessId.Usable; // Cannot be Good
                this._error = this._correctnessId === CorrectnessId.Error;
                this._badness = {
                    reasonId: newReasonId,
                    reasonExtra: newReasonExtra,
                } as const;
                const transactionId = ++this._setGoodBadTransactionId;
                if (oldUsable !== this._usable) {
                    this.processUsableChanged();
                }
                if (transactionId === this._setGoodBadTransactionId) {
                    this.processBadnessChange();

                    if (this._correctnessId !== oldCorrectnessId) {
                        this.processCorrectnessChange();
                    }
                }
            }
        }
    }

    private notifyBadnessChange(): void {
        const handlers = this._badnessChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyCorrectnessChange(): void {
        const handlers = this._correctnessChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }
}

export namespace CorrectnessBadness {
    export type CorrectnessChangeEventHandler = (this: void) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
}
