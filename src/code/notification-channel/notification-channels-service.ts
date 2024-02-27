/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataItemIncubator, NotificationChannel, NotificationDistributionMethodId, QueryNotificationChannelsDataDefinition, QueryNotificationChannelsDataItem, QueryNotificationDistributionMethodsDataDefinition, QueryNotificationDistributionMethodsDataItem } from '../adi/adi-internal-api';
import { AssertInternalError, Integer, LockOpenListItem, Logger, Ok, Result } from '../sys/sys-internal-api';
import { LockOpenNotificationChannel } from './lock-open-notification-channel';
import { NotificationChannelList } from './notification-channel-list';

export class NotificationChannelsService {
    private readonly _channelList: NotificationChannelList;
    private readonly _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem>;
    private readonly _getSupportedDistributionMethodIdsResolves = new Array<NotificationChannelsService.GetSupportedDistributionMethodIdsResolve>();
    private readonly _queryNotificationChannelsIncubator: DataItemIncubator<QueryNotificationChannelsDataItem>;
    private readonly _queryNotificationChannelsResolves = new Array<NotificationChannelsService.QueryNotificationChannelsResolve>();

    private _supportedDistributionMethodIds: readonly NotificationDistributionMethodId[];
    private _channelListBeenLoaded = false;
    private _supportedDistributionMethodIdsLoaded = false;


    constructor(
        adiService: AdiService,
    ) {
        this._channelList = new NotificationChannelList();
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
        this._supportedDistributionMethodIdsIncubator = new DataItemIncubator<QueryNotificationDistributionMethodsDataItem>(adiService);
        this._queryNotificationChannelsIncubator = new DataItemIncubator<QueryNotificationChannelsDataItem>(adiService);
    }

    initialise() {
        // this.refreshSupportedDistributionMethodIds();
    }

    finalise() {
        this._supportedDistributionMethodIdsIncubator.cancel();
        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(undefined));
        this._getSupportedDistributionMethodIdsResolves.length = 0;
        this._queryNotificationChannelsIncubator.cancel();
        this._queryNotificationChannelsResolves.forEach((resolve) => resolve(undefined));
        this._queryNotificationChannelsResolves.length = 0;
    }

    getSupportedDistributionMethodIds(refresh: boolean): Promise<readonly NotificationDistributionMethodId[] | undefined> {
        if (!refresh && !this._supportedDistributionMethodIdsIncubator.incubating && this._supportedDistributionMethodIdsLoaded) {
            return Promise.resolve(this._supportedDistributionMethodIds);
        } else {
            const promise = new Promise<readonly NotificationDistributionMethodId[] | undefined>((resolve) => {
                this._getSupportedDistributionMethodIdsResolves.push(resolve);
            })
            this.reloadSupportedDistributionMethodIds();
            return promise;
        }
    }

    getChannelList(refresh: boolean): Promise<NotificationChannelList | undefined> {
        if (refresh || !this._channelListBeenLoaded) {
            const promise = new Promise<NotificationChannelList | undefined>((resolve) => {
                this._queryNotificationChannelsResolves.push(resolve);
            })
            this.reloadChannelist();
            return promise;
        } else {
            return Promise.resolve(this._channelList);
        }
    }

    tryLockChannel(channelId: string, locker: LockOpenListItem.Locker): Promise<Result<LockOpenNotificationChannel | undefined>> {
        // First check to see if list contains channel
        const channel = this._channelList.getItemByKey(channelId);
        if (channel !== undefined) {
            // Exists.  Lock it and return it with a promise
            return this._channelList.tryLockItemByKey(channelId, locker);
        } else {
            return Promise.resolve(new Ok(undefined)); // ToDo
        }
    }

    unlockChannel(channel: LockOpenNotificationChannel, locker: LockOpenListItem.Locker) {
        this._channelList.unlockItem(channel, locker);
    }

    // getChannelStateWithSettings(channelId: string): Promise<> {

    // }

    // getChannelWithSettingsAt(idx: Integer): Promise<> {

    // }

    // add(): Promise<Integer> {

    // }

    // delete(channelId: string): Promise<void> {

    // }

    // deleteAt(idx: Integer): Promise<void> {

    // }

    // update(channelId: string, ): Promise<void> {

    // }

    // updateAt(): Promise<void> {

    // }

    // updateEnabled(channelId: string, enabled: boolean): Promise<void> {

    // }

    // updateEnabledAt(idx: Integer, enabled: boolean): Promise<void> {

    // }

    // refreshChannel(channelId: string): Promise<NotificationChannelStateAndSettings> {

    // }

    // refreshChannelAt(idx: Integer): Promise<NotificationChannelStateAndSettings> {

    // }

    private reloadSupportedDistributionMethodIds() {
        if (this._supportedDistributionMethodIdsIncubator.incubating) {
            this._supportedDistributionMethodIdsIncubator.cancel(); // make sure any previous request is cancelled
        }
        const dataDefinition = new QueryNotificationDistributionMethodsDataDefinition();
        const dataItemOrPromise = this._supportedDistributionMethodIdsIncubator.incubateSubcribe(dataDefinition);
        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('NCSRSDMI50971'); // is query so cannot be cached
        } else {
            dataItemOrPromise.then(
                (dataItem) => {
                    if (dataItem !== undefined) { // If undefined, then cancelled.  Ignore cancels as may have been replaced by newer request (see finalise as well)
                        if (dataItem.error) {
                            Logger.logDataError('NCSRSDMI43071', '', undefined, '');
                        } else {
                            this._supportedDistributionMethodIds = dataItem.methodIds;
                            this._supportedDistributionMethodIdsLoaded = true;
                        }
                        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(this._supportedDistributionMethodIds));
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRSDMR50971'); }
            )
        }
    }

    private reloadChannelist() {
        if (this._queryNotificationChannelsIncubator.incubating) {
            this._queryNotificationChannelsIncubator.cancel(); // make sure any previous request is cancelled
        }
        const dataDefinition = new QueryNotificationChannelsDataDefinition();
        const dataItemOrPromise = this._queryNotificationChannelsIncubator.incubateSubcribe(dataDefinition);
        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('NCSRCD50971'); // is query so cannot be cached
        } else {
            dataItemOrPromise.then(
                (dataItem) => {
                    if (dataItem !== undefined) { // If undefined, then cancelled.  Ignore cancels as may have been replaced by newer request (see finalise as well)
                        if (dataItem.error) {
                            Logger.logDataError('NCSRCDE50971', '', undefined, '');
                        } else {
                            this._channelList.load(dataItem.notificationChannels, false);
                            this._channelListBeenLoaded = true;
                        }
                        this._queryNotificationChannelsResolves.forEach((resolve) => resolve(this._channelList));
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRCDR50971'); }
            )
        }
    }

    // refreshDistributionMethodMetadata(methodId: NotificationDistributionMethodId | undefined): Promise<void> {

    // }
}

export namespace NotificationChannelsService {
    export interface List {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): NotificationChannel;
        clear(): void;
        add(channel: NotificationChannel): Integer;
        remove(channel: NotificationChannel): void;
        removeAtIndex(idx: Integer): void;
    }

    export type GetSupportedDistributionMethodIdsResolve = (this: void, value: readonly NotificationDistributionMethodId[] | undefined) => void;
    export type QueryNotificationChannelsResolve = (this: void, list: NotificationChannelList | undefined) => void;
}
