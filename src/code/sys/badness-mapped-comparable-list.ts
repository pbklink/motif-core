/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */


import { Badness } from './badness';
import { BadnessList } from './badness-list';
import { CorrectnessId } from './correctness';
import { CorrectnessBadness } from './correctness-badness';
import { CorrectnessList } from './correctness-list';
import { CompareFtn, CorrectnessState, Mappable, MappedComparableList, MultiEvent, UsableListChangeTypeId } from './xilytix-sysutils';

export class BadnessMappedComparableList<out T extends (Mappable & U), in U = T> extends MappedComparableList<T, U> implements CorrectnessList<T>,  BadnessList<T>, CorrectnessState<Badness> {
    private readonly _correctnessBadness: CorrectnessBadness;

    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(compareItemsFtn?: CompareFtn<U>, badness = Badness.notBad) {
        super(compareItemsFtn);
        this._correctnessBadness = new CorrectnessBadness();
        this._correctnessBadness.setBadness(badness);
        this._correctnessBadnessUsableChangedSubscriptionId = this._correctnessBadness.subscribeUsableChangedEvent(() => this.processUsableChanged());
    }

    get usable() { return this._correctnessBadness.usable; }
    get badness() { return this._correctnessBadness.badness; }
    get correctnessId(): CorrectnessId { return this._correctnessBadness.correctnessId; }

    finalise() {
        this._correctnessBadness.unsubscribeUsableChangedEvent(this._correctnessBadnessUsableChangedSubscriptionId);
        this._correctnessBadnessUsableChangedSubscriptionId = undefined;
    }

    override clone(): BadnessMappedComparableList<T, U> {
        const result = new BadnessMappedComparableList<T, U>(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    setBadness(value: Badness) {
        this._correctnessBadness.setBadness(value);
    }

    setUsable(badness: Badness): void {
        this._correctnessBadness.setUsable(badness);
    }

    setUnusable(badness: Badness): void {
        this._correctnessBadness.setUnusable(badness);
    }

    checkSetUnusable(badness: Badness): void {
        this._correctnessBadness.checkSetUnusable(badness);
    }

    subscribeUsableChangedEvent(handler: CorrectnessBadness.UsableChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeUsableChangedEvent(handler);
    }

    unsubscribeUsableChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeUsableChangedEvent(subscriptionId);
    }

    subscribeBadnessChangedEvent(handler: CorrectnessBadness.BadnessChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeBadnessChangedEvent(handler);
    }

    unsubscribeBadnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeBadnessChangedEvent(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: CorrectnessList.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeCorrectnessChangedEvent(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeCorrectnessChangedEvent(subscriptionId);
    }

    protected override assign(other: BadnessMappedComparableList<T, U>) {
        this._correctnessBadness.setBadness(other.badness);
        super.assign(other);
    }

    protected processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }
}
