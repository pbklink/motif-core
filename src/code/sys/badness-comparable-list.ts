/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { BadnessList } from './badness-list';
import { CorrectnessBadness } from './correctness-badness';
import { CorrectnessList } from './correctness-list';
import { ChangeSubscribableComparableList, CompareFtn, MultiEvent } from './xilytix-sysutils';

export class BadnessComparableList<out T extends U, in U = T> extends ChangeSubscribableComparableList<T, U> implements CorrectnessList<T>,  BadnessList<T> {
    private readonly _correctnessBadness = new CorrectnessBadness();

    constructor(compareItemsFtn?: CompareFtn<U>, badness = Badness.notBad) {
        super(compareItemsFtn);
        this._correctnessBadness.setBadness(badness);
    }

    get usable() { return this._correctnessBadness.usable; }
    get badness() { return this._correctnessBadness.badness; }
    get correctnessId() { return this._correctnessBadness.correctnessId; }

    override clone(): BadnessComparableList<T, U> {
        const result = new BadnessComparableList<T, U>(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    setBadness(value: Badness) {
        this._correctnessBadness.setBadness(value);
    }

    subscribeUsableChangedEvent(handler: CorrectnessBadness.UsableChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeUsableChangedEvent(handler);
    }

    unsubscribeUsableChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeUsableChangedEvent(subscriptionId);
    }

    subscribeBadnessChangeEvent(handler: CorrectnessBadness.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeBadnessChangeEvent(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeBadnessChangeEvent(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: CorrectnessList.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessBadness.subscribeCorrectnessChangedEvent(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessBadness.unsubscribeCorrectnessChangedEvent(subscriptionId);
    }

    protected override assign(other: BadnessComparableList<T, U>) {
        this._correctnessBadness.setBadness(other.badness);
        super.assign(other);
    }
}
