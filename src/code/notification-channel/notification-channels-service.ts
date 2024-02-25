/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataItemIncubator, NotificationChannel, NotificationDistributionMethodId, QueryNotificationDistributionMethodsDataDefinition, QueryNotificationDistributionMethodsDataItem } from '../adi/adi-internal-api';
import { AssertInternalError, Integer, LockOpenListItem, Logger, Ok, Result } from '../sys/sys-internal-api';
import { LockOpenNotificationChannel } from './lock-open-notification-channel';
import { NotificationChannelList } from './notification-channel-list';

export class NotificationChannelsService {
    readonly channelList: NotificationChannelList;
    private readonly _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem>;
    private readonly _getSupportedDistributionMethodIdsResolves = new Array<NotificationChannelsService.GetSupportedDistributionMethodIdsResolve>();

    private _supportedDistributionMethodIds: readonly NotificationDistributionMethodId[];
    private _channelListBeenLoaded = false;
    private _supportedDistributionMethodIdsLoaded = false;


    constructor(
        adiService: AdiService,
    ) {
        this.channelList = new NotificationChannelList();
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
        this._supportedDistributionMethodIdsIncubator = new DataItemIncubator<QueryNotificationDistributionMethodsDataItem>(adiService);

    }

    initialise() {
        // this.refreshSupportedDistributionMethodIds();
    }

    finalise() {
        this._supportedDistributionMethodIdsIncubator.cancel();
        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(undefined));
        this._getSupportedDistributionMethodIdsResolves.length = 0;
    }

    getSupportedDistributionMethodIds(refresh: boolean): Promise<readonly NotificationDistributionMethodId[] | undefined> {
        if (!refresh && !this._supportedDistributionMethodIdsIncubator.incubating) {
            return Promise.resolve(this._supportedDistributionMethodIds);
        } else {
            const promise = new Promise<readonly NotificationDistributionMethodId[] | undefined>((resolve) => {
                this._getSupportedDistributionMethodIdsResolves.push(resolve);
            })
            this.refreshSupportedDistributionMethodIds();
            return promise;
        }
    }

    tryLockChannel(channelId: string, locker: LockOpenListItem.Locker): Promise<Result<LockOpenNotificationChannel | undefined>> {
        // First check to see if list contains channel
        const channel = this.channelList.getItemByKey(channelId);
        if (channel !== undefined) {
            // Exists.  Lock it and return it with a promise
            return this.channelList.tryLockItemByKey(channelId, locker);
        } else {
            return Promise.resolve(new Ok(undefined)); // ToDo
        }
    }

    unlockChannel(channel: LockOpenNotificationChannel, locker: LockOpenListItem.Locker) {
        this.channelList.unlockItem(channel, locker);
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

    refreshChannels(): Promise<void> {
        return Promise.resolve(); // ToDo
    }

    private refreshSupportedDistributionMethodIds() {
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
                    if (dataItem !== undefined) { // If undefined, then cancelled.  Ignore cancels as may have been replaced by newer request
                        if (dataItem.error) {
                            Logger.logDataError('NCSRSDMI43071', '', undefined, '');
                        } else {
                            const queryNotificationDistributionMethodsDataItem = dataItem;
                            this._supportedDistributionMethodIds = queryNotificationDistributionMethodsDataItem.methodIds;
                        }
                        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(this._supportedDistributionMethodIds));
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRSDMR50971'); }
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
}
