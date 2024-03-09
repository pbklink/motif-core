/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessComparableList } from './badness-comparable-list';
import { MultiEvent } from './multi-event';
import { UsableListChangeTypeId } from './usable-list-change-type';
import { CompareFtn } from './utils-search';
import { Integer } from './xiltyix-sysutils';

export class ModifierComparableList<out T extends U, Modifier = void, in U = T> extends BadnessComparableList<T, U> {
    private _modifierListChangeMultiEvent = new MultiEvent<ModifierComparableList.ListChangeEventHandler<Modifier>>();
    private _afterListChangedMultiEvent = new MultiEvent<ModifierComparableList.AfterListChangedEventHandler<Modifier>>();
    private _modifier: Modifier;

    constructor(readonly notChangingModifier: Modifier, compareItemsFtn?: CompareFtn<U>) {
        super(compareItemsFtn);
    }

    protected get modifier() { return this._modifier; }

    override clone(): ModifierComparableList<T, Modifier, U> {
        const result = new ModifierComparableList<T, Modifier, U>(this.notChangingModifier, this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    override setAt(index: Integer, value: T, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.setAt(index, value);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override add(value: T, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        const result = super.add(value);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
        return result;
    }

    override addUndefinedRange(undefinedValueCount: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.addUndefinedRange(undefinedValueCount);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override addRange(values: readonly T[], modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.addRange(values);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override addSubRange(values: readonly T[], rangeStartIndex: Integer, rangeCount: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.addSubRange(values, rangeStartIndex, rangeCount);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override insert(index: Integer, value: T, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.insert(index, value);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override insertRange(index: Integer, values: readonly T[], modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.insertRange(index, values);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override insertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.insertSubRange(index, values, subRangeStartIndex, subRangeCount);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override remove(value: T, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.remove(value);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override removeAtIndex(index: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.removeAtIndex(index);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override removeAtIndices(removeIndices: Integer[], modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.removeAtIndices(removeIndices);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override removeRange(index: Integer, deleteCount: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.removeRange(index, deleteCount);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override removeItems(removeItems: readonly T[], modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.removeItems(removeItems);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override exchange(index1: Integer, index2: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.exchange(index1, index2);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override move(fromIndex: Integer, toIndex: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.move(fromIndex, toIndex);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override moveRange(fromIndex: Integer, toIndex: Integer, count: Integer, modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.moveRange(fromIndex, toIndex, count);
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override clear(modifier?: Modifier) {
        if (modifier !== undefined) {
            this._modifier = modifier;
        }
        super.clear();
        this.notifyAfterListChanged();
        this._modifier = this.notChangingModifier;
    }

    override subscribeListChangeEvent(handler: ModifierComparableList.ListChangeEventHandler<Modifier>): MultiEvent.DefinedSubscriptionId {
        return this._modifierListChangeMultiEvent.subscribe(handler);
    }

    override unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._modifierListChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterListChangedEvent(handler: ModifierComparableList.AfterListChangedEventHandler<Modifier>): MultiEvent.DefinedSubscriptionId {
        return this._afterListChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterListChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._afterListChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected override notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._modifierListChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count, this._modifier);
        }
    }

    protected notifyAfterListChanged() {
        const handlers = this._afterListChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](this._modifier);
        }
    }
}

export namespace ModifierComparableList {
    export type ListChangeEventHandler<Modifier> = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer, modifier: Modifier) => void;
    export type AfterListChangedEventHandler<Modifier> = (this: void, modifier: Modifier) => void;
}
