/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, Badness, CorrectnessBadness, delay1Tick, Integer, MultiEvent, SysTick } from '../../sys/internal-api';
import {
    AdiPublisher,
    DataChannel,
    DataChannelId,
    DataDefinition,
    DataItemId,
    DataItemRequestNr,
    DataMessage,
    firstDataItemId,
    firstDataItemRequestNr
} from '../common/adi-common-internal-api';

export abstract class DataItem extends CorrectnessBadness {
    private static readonly _firstValidDataItemId: DataItemId = firstDataItemId;
    private static readonly _firstValidDataItemRequestNr: DataItemRequestNr = firstDataItemRequestNr;

    private static _nextDataItemId: DataItemId = DataItem._firstValidDataItemId;

    onWantActivation: DataItem.WantActivationEventHandler;
    onCancelWantActivation: DataItem.CancelWantActivationEventHandler;
    onKeepActivation: DataItem.KeepActivationEventHandler;
    onAvailableForDeactivation: DataItem.AvailableForDeactivationEventHandler;
    onRequirePublisher: DataItem.RequirePublisherEventHandler;
    onRequireDestruction: DataItem.RequireDestructionEventHandler;
    onRequireDataItem: DataItem.RequireDataItemEventHandler;
    onReleaseDataItem: DataItem.ReleaseDataItemEventHandler;

    private readonly _id: DataItemId;

    private readonly _definition: DataDefinition;
    private readonly _channelId: DataChannelId;

    private _activeRequestNr: DataItemRequestNr = DataItem._firstValidDataItemRequestNr;
    private _subscribeCount = 0;

    private _active = false;
    private _startDelayHandle: ReturnType<typeof setTimeout> | undefined;
    private _started = false;
    private _deactivationDelayed: boolean;
    private _deactivationDelayUntil: SysTick.Time;

    private _availableForDeactivationTickTime: SysTick.Time;

    private _beginUpdateCount: Integer = 0;
    private _updateChanges = false;

    private _beginChangesMultiEvent = new MultiEvent<DataItem.BeginChangesEventHandler>();
    private _endChangesMultiEvent = new MultiEvent<DataItem.EndChangesEventHandler>();

    constructor(definition: DataDefinition) {
        super();

        this._definition = definition;
        this._channelId = definition.channelId;

        this._id = /* this._definition.snapshot ? invalidDataItemId :*/ DataItem.getNextDataItemId();
    }

    get id() { return this._id; }
    get channelName() { return this.getChannelName(); }
    get activeRequestNr() { return this._activeRequestNr; }
    get nextRequestNr() { return this.getNextRequestNr(); }
    get definition() { return this._definition; }
    get channelId() { return this._channelId; }

    get subscribeCount() { return this._subscribeCount; }
    get availableForDeactivationTickTime() { return this._availableForDeactivationTickTime; }

    get active() { return this._active; }
    get started() { return this._started; }
    get online() { return this.getOnline(); }
    get deactivationDelayed(): boolean { return this._deactivationDelayed; }

    protected get beginUpdateCount(): number { return this._beginUpdateCount; }

    private static getNextDataItemId(): Integer {
        return this._nextDataItemId++;
    }

    incSubscribeCount() {
        const WasZero = this._subscribeCount === 0;
        this._subscribeCount++;
        if (WasZero) {
            if (!this.definition.referencable) {
                this.activate();
            } else {
                if (this.active) {
                    this.onKeepActivation(this);
                } else {
                    this.onWantActivation(this);
                }
            }
        }
    }

    decSubscribeCount() {
        this._subscribeCount--;
        assert(this._subscribeCount >= 0);

        if (this._subscribeCount === 0) {
            if (!this.definition.referencable) {
                this.deactivate(); // will Destroy Object - do not use anymore
            } else {
                if (this.active) {
                    this.onAvailableForDeactivation(this);
                } else {
                    this.onCancelWantActivation(this);
                    this.onRequireDestruction(this);  // will Destroy Object - do not use anymore
                }
            }
        }
    }

    activate() {
        this.beginUpdate();
        try {
            assert(!this.active);
            this._active = true;

            // Delay so that DataItem events can be bound to
            this._startDelayHandle = delay1Tick(() => { this.start(); });

        } finally {
            this.endUpdate();
        }
    }

    deactivate() {
        this.beginUpdate();
        try {
            if (this._started) {
                this.stop();
            } else {
                // Possible that deactivate is called before start() has been run.  Cancel start()
                if (this._startDelayHandle !== undefined) {
                    clearTimeout(this._startDelayHandle);
                    this._startDelayHandle = undefined;
                }
            }

            this._deactivationDelayed = false;
            this._active = false;
        } finally {
            this.endUpdate();
        }

        this.onRequireDestruction(this); // will Destroy object - do not use anymore
    }

    notifyDeactivationDelayed(UntilTime: SysTick.Time) {
        this._deactivationDelayed = true;
        this._deactivationDelayUntil = UntilTime;
    }

    hasDeactivationDelayExpired(nowTickTime: SysTick.Time): boolean {
        assert(this._deactivationDelayed);
        return nowTickTime < this._deactivationDelayUntil;
    }

    notifyKeepActivation() {
        this._deactivationDelayed = false;
    }

    processMessage(msg: DataMessage) {
        // overriden in descendants
    }

    subscribeDataItem(Definition: DataDefinition): DataItem {
        return this.onRequireDataItem(Definition);
    }

    unsubscribeDataItem(dataItem: DataItem) {
        this.onReleaseDataItem(dataItem);
    }

    subscribeBeginChangesEvent(handler: DataItem.BeginChangesEventHandler) {
        return this._beginChangesMultiEvent.subscribe(handler);
    }

    unsubscribeBeginChangesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beginChangesMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeEndChangesEvent(handler: DataItem.EndChangesEventHandler) {
        return this._endChangesMultiEvent.subscribe(handler);
    }

    unsubscribeEndChangesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._endChangesMultiEvent.unsubscribe(subscriptionId);
    }

    protected getDefinition() { return this._definition; }
    /** online indicates whether a DataItem can be cached.
     * Overridden in PublisherSubscriptionDataItem to also include NotSynchronised and Synchronised */
    protected getOnline() { return this.usable; }

    protected start() {
        this._started = true;
    }

    protected stop() { // virtual;
        // no code - child classes can override
    }

    protected beginUpdate() {
        assert(this._beginUpdateCount >= 0);
        this._beginUpdateCount++;
        if (this._beginUpdateCount === 1) {
            this._updateChanges = false;
        }
    }

    protected endUpdate() {
        this._beginUpdateCount--;
        assert(this._beginUpdateCount >= 0);
        if (this._beginUpdateCount === 0 && this._updateChanges) {
            this.broadcastEndChangesEvent();
            this._updateChanges = false;
        }
    }

    protected notifyUpdateChange() {
        if (this._beginUpdateCount > 0) {
            if (!this._updateChanges) {
                this._updateChanges = true;
                this.broadcastBeginChangesEvent();
            }
        }
    }

    private broadcastBeginChangesEvent() {
        const handlers = this._beginChangesMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this);
        }
    }

    private broadcastEndChangesEvent() {
        const handlers = this._endChangesMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this);
        }
    }

    private getNextRequestNr(): DataItemRequestNr {
        return ++this._activeRequestNr;
    }

    private getChannelName(): string {
        return DataChannel.idToName(this._channelId);
    }

    /** Descendants need to implement to indicate when they are usable.
     * The result is used to determine whether processUsableChanged() is called */
    protected abstract override calculateUsabilityBadness(): Badness;
}

export namespace DataItem {
    export type SubscribeDataItemFtn = (this: void, dataDefinition: DataDefinition) => DataItem;
    export type UnsubscribeDataItemFtn = (this: void, dataItem: DataItem) => void;

    export type BeginChangesEventHandler = (this: void, DataItem: DataItem) => void;
    export type EndChangesEventHandler = (this: void, DataItem: DataItem) => void;
    export type SubscriptionStatusChangeEventHandler = (this: void, DataItem: DataItem) => void;
    export type SubscriptionConfirmationEventHandler = (this: void, DataItem: DataItem) => void;

    export type WantActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type KeepActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type CancelWantActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type AvailableForDeactivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type RequireDestructionEventHandler = (this: void, DataItem: DataItem) => void;

    export type RequirePublisherEventHandler = (this: void, definition: DataDefinition) => AdiPublisher;

    export type RequireDataItemEventHandler = (this: void, Definition: DataDefinition) => DataItem;
    export type ReleaseDataItemEventHandler = (this: void, DataItem: DataItem) => void;

    export type TProcessMessageEventHandler = (DataItem: DataItem, NowTickTime: SysTick.Time, Msg: DataMessage) => void;
}

export namespace DataItemModule {
    export function initialiseStatic(): void {
        Badness.Reason.initialise();
    }
}
