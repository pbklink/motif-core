/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataItemIncubator, NotificationChannel, NotificationDistributionMethodId, QueryNotificationChannelDataDefinition, QueryNotificationChannelDataItem, QueryNotificationChannelsDataDefinition, QueryNotificationChannelsDataItem, QueryNotificationDistributionMethodsDataDefinition, QueryNotificationDistributionMethodsDataItem } from '../adi/adi-internal-api';
import { AssertInternalError, Err, Integer, LockOpenListItem, Logger, Ok, Result } from '../sys/sys-internal-api';
import { LockOpenNotificationChannel } from './lock-open-notification-channel';
import { NotificationChannelList } from './notification-channel-list';

export class NotificationChannelsService {
    private readonly _channelList: NotificationChannelList;
    private readonly _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem>;
    private readonly _getSupportedDistributionMethodIdsResolves = new Array<NotificationChannelsService.GetSupportedDistributionMethodIdsResolve>();
    private readonly _queryNotificationChannelsIncubator: DataItemIncubator<QueryNotificationChannelsDataItem>;
    private readonly _queryNotificationChannelsResolves = new Array<NotificationChannelsService.QueryNotificationChannelsResolve>();
    private readonly _idQueryNotificationChannelIncubators = new Array<NotificationChannelsService.IdQueryNotificationChannelIncubator>();

    private _supportedDistributionMethodIds: readonly NotificationDistributionMethodId[];
    private _channelListBeenLoaded = false;
    private _supportedDistributionMethodIdsLoaded = false;


    constructor(
        private readonly _adiService: AdiService,
    ) {
        this._channelList = new NotificationChannelList();
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
        this._supportedDistributionMethodIdsIncubator = new DataItemIncubator<QueryNotificationDistributionMethodsDataItem>(this._adiService);
        this._queryNotificationChannelsIncubator = new DataItemIncubator<QueryNotificationChannelsDataItem>(this._adiService);
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
            });
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

    async tryLockChannel(channelId: string, locker: LockOpenListItem.Locker, refresh: boolean): Promise<Result<LockOpenNotificationChannel | undefined>> {
        // make sure we have done an initial download of channels
        const channelList = await this.getChannelList(false);
        if (channelList === undefined) {
            return new Ok(undefined); // shutting down - ignore
        } else {
            // First check to see if list contains channel
            const channel = channelList.getItemByKey(channelId);
            if (channel !== undefined && !refresh) {
                return this._channelList.tryLockItemByKey(channelId, locker);
            } else {
                const idIncubator = this.reloadChannel(channelList, channelId, locker, undefined);
                const promise = new Promise<Result<LockOpenNotificationChannel | undefined>>((resolve) => {
                    idIncubator.resolveFtns = [...idIncubator.resolveFtns, resolve];
                });
                return promise;
            }
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

    private reloadChannel(
        channelList: NotificationChannelList,
        channelId: string,
        locker: LockOpenListItem.Locker | undefined,
        opener: LockOpenListItem.Opener | undefined,
    ) {
        // only have one
        const idIncubators = this._idQueryNotificationChannelIncubators;
        const incubatorsCount = idIncubators.length;
        let existingResolveFtns = new Array<NotificationChannelsService.QueryNotificationChannelResolve>();
        for (let i = 0; i < incubatorsCount; i++) {
            const idIncubator = idIncubators[i];
            if (idIncubator.channelId === channelId) {
                existingResolveFtns = [...existingResolveFtns, ...idIncubator.resolveFtns];
                idIncubator.incubator.cancel(); // no duplicates
                idIncubators.splice(i, 1);
                break;
            }
        }

        const incubator = new DataItemIncubator<QueryNotificationChannelDataItem>(this._adiService);
        const idIncubator: NotificationChannelsService.IdQueryNotificationChannelIncubator = {
            channelId,
            incubator,
            resolveFtns: existingResolveFtns,
        }
        idIncubators.push(idIncubator);
        const dataDefinition = new QueryNotificationChannelDataDefinition();
        dataDefinition.notificationChannelId = channelId;
        const dataItemOrPromise = incubator.incubateSubcribe(dataDefinition);
        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('NCSRCDI50971'); // is query so cannot be cached
        } else {
            dataItemOrPromise.then(
                (dataItem) => {
                    if (dataItem !== undefined) { // If undefined, then cancelled.  Ignore cancels as may have been replaced by newer request (see finalise as well)
                        if (dataItem.error) {
                            idIncubator.resolveFtns.forEach((resolve) => resolve(new Err(dataItem.errorText)));
                            this.deleteIdQueryNotificationChannelIncubator(idIncubator);
                        } else {
                            const notificationChannel = dataItem.notificationChannelStateAndSettings;
                            const idx = this._channelList.indexOfKey(notificationChannel.channelId);
                            let channel: LockOpenNotificationChannel;
                            if (idx >= 0) {
                                channel = channelList.getAt(idx);
                                channel.load(notificationChannel, true);
                            } else {
                                channel = new LockOpenNotificationChannel(notificationChannel, true);
                                channelList.addItem(channel);
                            }

                            if (locker !== undefined) {
                                const lockPromise = channelList.tryLockItemByKey(channelId, locker);
                                lockPromise.then(
                                    (result) => {
                                        if (result.isErr() || result.value !== channel) {
                                            // must always succeed
                                            throw new AssertInternalError('NCSRCDL50971');
                                        } else {
                                            this.checkOpenAndResolveQueryNotificationChannelIncubator(channelList, opener, idIncubator, channel);
                                        }
                                    },
                                    (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRCDLR50971')}
                                )
                            } else {
                                this.checkOpenAndResolveQueryNotificationChannelIncubator(channelList, opener, idIncubator, channel);
                            }
                        }
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRCDR50971'); }
            )
            return idIncubator;
        }
    }

    private checkOpenAndResolveQueryNotificationChannelIncubator(
        channelList: NotificationChannelList,
        opener: LockOpenListItem.Opener | undefined,
        idIncubator: NotificationChannelsService.IdQueryNotificationChannelIncubator,
        channel: LockOpenNotificationChannel,
    ) {
        if (opener !== undefined) {
            channelList.openLockedItem(channel, opener);
        }
        idIncubator.resolveFtns.forEach((resolve) => resolve(new Ok(channel)));
        this.deleteIdQueryNotificationChannelIncubator(idIncubator);
    }

    private deleteIdQueryNotificationChannelIncubator(idIncubator: NotificationChannelsService.IdQueryNotificationChannelIncubator) {
        const idIncubators = this._idQueryNotificationChannelIncubators;
        const index = idIncubators.indexOf(idIncubator);
        if (index < 0) {
            throw new AssertInternalError('NCSDIQNCI45454', `${index}`);
        } else {
            idIncubators.splice(index, 1);
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
    export type QueryNotificationChannelResolve = (this: void, channel: Result<LockOpenNotificationChannel | undefined>) => void;

    export interface IdQueryNotificationChannelIncubator {
        readonly channelId: string;
        readonly incubator: DataItemIncubator<QueryNotificationChannelDataItem>;
        resolveFtns: NotificationChannelsService.QueryNotificationChannelResolve[];
    }
}
