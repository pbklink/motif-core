/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/internal-api';
import {
    AssertInternalError,
    Badness,
    Correctness,
    CorrectnessId,
    CorrectnessRecord,
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    Integer,
    MultiEvent
} from "../../sys/internal-api";
import { FeedId, FeedStatusId, OrderStatuses, TradingEnvironment, TradingEnvironmentId } from '../common/internal-api';
import { Feed } from './feed';

export class TradingFeed extends Feed {
    readonly orderStatusesFetcherNoLongerRequiredEventer: TradingFeed.OrderStatusesFetcherNoLongerRequiredEventer;

    private _orderStatuses: OrderStatuses = [];
    private _orderStatusesFetcher: TradingFeed.OrderStatusesFetcher | undefined;
    private _orderStatusFetchCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        id: FeedId,
        public readonly environmentId: TradingEnvironmentId | undefined,
        statusId: FeedStatusId,
        listCorrectnessId: CorrectnessId,
        orderStatusesFetcher: TradingFeed.OrderStatusesFetcher | undefined,
        orderStatusesFetcherNoLongerRequiredEventer: TradingFeed.OrderStatusesFetcherNoLongerRequiredEventer | undefined,
    ) {
        super(id, statusId, listCorrectnessId);

        // orderStatusesFetcher and orderStatusesFetcherNoLongerRequiredEventer will be undefined for null trade feed
        if (orderStatusesFetcher !== undefined && orderStatusesFetcherNoLongerRequiredEventer !== undefined) {
            this.orderStatusesFetcherNoLongerRequiredEventer = orderStatusesFetcherNoLongerRequiredEventer;

            orderStatusesFetcher.setFeedStatusId(statusId);

            if (Correctness.idIsUsable(orderStatusesFetcher.correctnessId)) {
                this._orderStatuses = orderStatusesFetcher.orderStatuses;
                this.processOrderStatusesFetcherCorrectnessChangedEvent()
            } else {
                this._orderStatusesFetcher = orderStatusesFetcher;
                this._orderStatusFetchCorrectnessChangedSubscriptionId = this._orderStatusesFetcher.subscribeCorrectnessChangedEvent(
                    () => this.processOrderStatusesFetcherCorrectnessChangedEvent()
                );
            }
        }
    }

    get orderStatusesBadness() { return this._orderStatusesFetcher === undefined ? Badness.notBad : this._orderStatusesFetcher.badness; }
    get orderStatuses() { return this._orderStatuses; }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get orderStatusCount(): Integer | undefined { return this._orderStatuses === undefined ? undefined : this._orderStatuses.length; }

    override get environmentDisplay(): string {
        if (this.environmentId === undefined) {
            return '';
        } else {
            return TradingEnvironment.idToDisplay(this.environmentId);
        }
    }

    override dispose() {
        this.checkDisposeOrderStatusesFetcher();
        super.dispose();
    }

    override change(feedStatusId: FeedStatusId) {
        super.change(feedStatusId);

        if (this._orderStatusesFetcher !== undefined) {
            this._orderStatusesFetcher.setFeedStatusId(feedStatusId);
        }
    }

    protected override calculateCorrectnessId() {
        let correctnessId = super.calculateCorrectnessId();
        if (this._orderStatusesFetcher !== undefined) {
            correctnessId = Correctness.merge2Ids(correctnessId, this._orderStatusesFetcher.correctnessId);
        }
        return correctnessId;
    }

    private processOrderStatusesFetcherCorrectnessChangedEvent() {
        const fetcher = this._orderStatusesFetcher;
        if (fetcher === undefined) {
            throw new AssertInternalError('TFPOSFC23688399993');
        } else {
            if (Correctness.idIsUsable(fetcher.correctnessId)) {
                this._orderStatuses = fetcher.orderStatuses;
                this.checkDisposeOrderStatusesFetcher();
            }
            this.updateCorrectness();
        }
    }

    private checkDisposeOrderStatusesFetcher() {
        if (this._orderStatusesFetcher !== undefined) {
            this._orderStatusesFetcher.unsubscribeCorrectnessChangedEvent(this._orderStatusFetchCorrectnessChangedSubscriptionId);
            this._orderStatusFetchCorrectnessChangedSubscriptionId = undefined;
            this.orderStatusesFetcherNoLongerRequiredEventer();
            this._orderStatusesFetcher = undefined;
        }
    }
}

export namespace TradingFeed {
    export type BecameUsableEventHandler = (this: void) => void;
    export type OrderStatusesFetcherNoLongerRequiredEventer = (this: void) => void;

    export interface OrderStatusesFetcher extends CorrectnessRecord {
        readonly badness: Badness;
        readonly orderStatuses: OrderStatuses;
        setFeedStatusId(value: FeedStatusId | undefined): void;
    }

    export const enum TradingFieldId {
        Id,
        EnvironmentId,
        StatusId,
        OrderStatusCount,
    }

    export namespace TradingField {
        interface Info {
            readonly id: TradingFieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof TradingFieldId]: Info };
        const infosObject: InfosObject = {
            Id: {
                id: TradingFieldId.Id,
                name: 'FieldId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_FeedId,
                headingId: StringId.FeedFieldHeading_FeedId,
            },
            EnvironmentId: {
                id: TradingFieldId.EnvironmentId,
                name: 'EnvironmentId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_EnvironmentDisplay,
                headingId: StringId.FeedFieldHeading_EnvironmentDisplay,
            },
            StatusId: {
                id: TradingFieldId.StatusId,
                name: 'StatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_StatusId,
                headingId: StringId.FeedFieldHeading_StatusId,
            },
            OrderStatusCount: {
                id: TradingFieldId.OrderStatusCount,
                name: 'OrderStatusCount',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.TradingFeedFieldDisplay_OrderStatusCount,
                headingId: StringId.TradingFeedFieldHeading_OrderStatusCount,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialiseField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TradingFeed.FieldId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToName(id: TradingFieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: TradingFieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: TradingFieldId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: TradingFieldId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: TradingFieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: TradingFieldId) {
            return Strings[idToHeadingId(id)];
        }
    }

    export const nullFeed = new TradingFeed(
        FeedId.Null,
        undefined,
        FeedStatusId.Impaired,
        CorrectnessId.Error,
        undefined,
        undefined,
    );
}

