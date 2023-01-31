/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, SysTick } from '../../sys/sys-internal-api';
import { DataDefinition, PublisherSubscriptionDataDefinition } from './data-definition';
import { DataMessages } from './data-messages';
import { AdiPublisherTypeId, DataItemId, DataItemRequestNr } from './data-types';

export abstract class AdiPublisher {
    protected _publisherTypeId: AdiPublisherTypeId;
    protected _id: Integer;
    protected _finaliseInitiated: boolean;

    private _batchSubscriptionChanges: boolean;

    constructor(publisherTypeId?: AdiPublisherTypeId) {
        this._publisherTypeId = (publisherTypeId !== undefined) ? publisherTypeId : this.getPublisherTypeId();
        this._id = AdiPublisher.ID.getId();
    }

    get publisherTypeId(): AdiPublisherTypeId { return this._publisherTypeId; }
    get id(): Integer { return this._id; }
    get batchSubscriptionChanges(): boolean { return this._batchSubscriptionChanges; }
    set batchSubscriptionChanges(value: boolean) { this._batchSubscriptionChanges = value; }

    finalise(): boolean { // virtual
        // The Finalise function will be called when Pulse is shutting down.
        // Return TRUE to indicate this class and descendents are ready for shut down.
        // Return FALSE if this class is not yet ready for shut down. For example a
        // thread is still processing data.
        // Returning FALSE will block the shut down sequence for a limited period
        // of time. If blocked for too long, Pulse will force the shut down.
        this._finaliseInitiated = true;
        return true;
    }

    abstract getMessages(nowTickTime: SysTick.Time): DataMessages;

    abstract connect(
        dataItemId: DataItemId,
        dataItemRequestNr: DataItemRequestNr,
        dataDefinition: DataDefinition
    ): boolean;

    abstract disconnect(dataItemId: DataItemId): void;

    abstract subscribeDataItemId(dataItemId: DataItemId, dataDefinition: PublisherSubscriptionDataDefinition): boolean;
    abstract unsubscribeDataItemId(dataItemId: DataItemId): void;

    abstract activateDataItemId(dataItemId: DataItemId, dataItemRequestNr: DataItemRequestNr): void;

    protected abstract getPublisherTypeId(): AdiPublisherTypeId;
}

/** @public */
export namespace AdiPublisher {
    export namespace ID {
        let _lastId = Number.MIN_SAFE_INTEGER;
        export function getId(): number {
            if (_lastId >= Number.MAX_SAFE_INTEGER - 1) {
                throw new AssertInternalError('APIGI23331');
            }
            return ++_lastId;
        }
    }
}
