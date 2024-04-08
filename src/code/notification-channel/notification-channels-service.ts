/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CreateNotificationChannelDataDefinition, CreateNotificationChannelDataItem, DataItemIncubator, DeleteNotificationChannelDataDefinition, DeleteNotificationChannelDataItem, NotificationChannel, NotificationDistributionMethodId, QueryNotificationChannelDataDefinition, QueryNotificationChannelDataItem, QueryNotificationChannelsDataDefinition, QueryNotificationChannelsDataItem, QueryNotificationDistributionMethodsDataDefinition, QueryNotificationDistributionMethodsDataItem } from '../adi/internal-api';
import { AssertInternalError, Badness, Err, Integer, LockOpenListItem, Ok, Result } from '../sys/internal-api';
import { LockOpenNotificationChannel } from './lock-open-notification-channel';
import { LockOpenNotificationChannelList } from './lock-open-notification-channel-list';

export class NotificationChannelsService {
    readonly list: LockOpenNotificationChannelList;

    private readonly _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem>;
    private readonly _getSupportedDistributionMethodIdsResolves = new Array<NotificationChannelsService.GetSupportedDistributionMethodIdsResolve>();
    private readonly _queryNotificationChannelsIncubator: DataItemIncubator<QueryNotificationChannelsDataItem>;
    private readonly _queryNotificationChannelsResolves = new Array<NotificationChannelsService.QueryNotificationChannelsResolve>();
    private readonly _idQueryNotificationChannelIncubators = new Array<NotificationChannelsService.IdQueryNotificationChannelIncubator>();
    private readonly _createNotificationChannelIncubators = new Array<DataItemIncubator<CreateNotificationChannelDataItem>>();
    private readonly _idDeleteNotificationChannelIncubators = new Array<NotificationChannelsService.IdDeleteNotificationChannelIncubator>();

    private _supportedDistributionMethodIds: readonly NotificationDistributionMethodId[];
    private _supportedDistributionMethodIdsLoaded = false;


    constructor(
        private readonly _adiService: AdiService,
    ) {
        this.list = new LockOpenNotificationChannelList();
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
        this._supportedDistributionMethodIdsIncubator = new DataItemIncubator<QueryNotificationDistributionMethodsDataItem>(this._adiService);
        this._queryNotificationChannelsIncubator = new DataItemIncubator<QueryNotificationChannelsDataItem>(this._adiService);
    }

    initialise() {
        // this.refreshSupportedDistributionMethodIds();
    }

    finalise() {
        this._supportedDistributionMethodIdsIncubator.cancel();
        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(new Ok(undefined)));
        this._getSupportedDistributionMethodIdsResolves.length = 0;
        this._queryNotificationChannelsIncubator.cancel();
        this._queryNotificationChannelsResolves.forEach((resolve) => resolve(new Ok(undefined)));
        this._queryNotificationChannelsResolves.length = 0;
        this._idQueryNotificationChannelIncubators.forEach(
            (idIncubator) => {
                idIncubator.incubator.cancel();
                idIncubator.resolveFtns.forEach((resolve) => resolve(new Ok(undefined)));
                idIncubator.resolveFtns.length = 0;
            }
        );
        this.list.finalise();
    }

    getSupportedDistributionMethodIds(refresh: boolean): Promise<Result<readonly NotificationDistributionMethodId[] | undefined>> {
        if (!refresh && !this._supportedDistributionMethodIdsIncubator.incubating && this._supportedDistributionMethodIdsLoaded) {
            return Promise.resolve(new Ok(this._supportedDistributionMethodIds));
        } else {
            const promise = new Promise<Result<readonly NotificationDistributionMethodId[] | undefined>>((resolve) => {
                this._getSupportedDistributionMethodIdsResolves.push(resolve);
            });
            this.incubateReloadSupportedDistributionMethodIds();
            return promise;
        }
    }

    getLoadedList(refresh: boolean): Promise<Result<LockOpenNotificationChannelList | undefined>> {
        if (refresh || !this.list.usable ) {
            const promise = new Promise<Result<LockOpenNotificationChannelList | undefined>>((resolve) => {
                this._queryNotificationChannelsResolves.push(resolve);
            })
            this.incubateReloadChannelist();
            return promise;
        } else {
            return Promise.resolve(new Ok(this.list));
        }
    }

    async tryLockChannel(channelId: string, locker: LockOpenListItem.Locker, refresh: boolean): Promise<Result<LockOpenNotificationChannel | undefined>> {
        // make sure we have done an initial download of channels
        const result = await this.getLoadedList(false);
        if (result.isErr()) {
            return result.createType();
        } else {
            const list = result.value;
            if (list === undefined) {
                return new Ok(undefined); // shutting down - ignore
            } else {
                // First check to see if list contains channel
                const channel = list.getItemByKey(channelId);
                if (channel !== undefined && !refresh) {
                    return this.list.tryLockItemByKey(channelId, locker);
                } else {
                    const idIncubator = this.incubateReloadChannel(list, channelId, locker, undefined);
                    const promise = new Promise<Result<LockOpenNotificationChannel | undefined>>((resolve) => {
                        idIncubator.resolveFtns = [...idIncubator.resolveFtns, resolve];
                    });
                    return promise;
                }
            }
        }
    }

    tryOpenChannel(lockedChannel: LockOpenNotificationChannel, opener: LockOpenListItem.Opener): Promise<Result<LockOpenNotificationChannel | undefined>> {
        const list = this.list; // List must have already been loaded to get lockedChannel
        if (lockedChannel.settingsLoaded) {
            this.list.openLockedItem(lockedChannel, opener);
            return Promise.resolve(new Ok(lockedChannel));
        } else {
            const idIncubator = this.incubateReloadChannel(list, lockedChannel.id, undefined, opener);
            const promise = new Promise<Result<LockOpenNotificationChannel | undefined>>(
                (resolve) => {
                    idIncubator.resolveFtns = [...idIncubator.resolveFtns, resolve];
                }
            );
            return promise;
        }
    }

    async tryLockAndOpenChannel(channelId: string, lockerOpener: LockOpenListItem.Opener, refresh: boolean): Promise<Result<LockOpenNotificationChannel | undefined>> {
        const lockResult = await this.tryLockChannel(channelId, lockerOpener, refresh);
        if (lockResult.isErr()) {
            return lockResult;
        } else {
            const lockedChannel = lockResult.value;
            if (lockedChannel === undefined) {
                return new Ok(undefined);
            } else {
                const openResult = await this.tryOpenChannel(lockedChannel, lockerOpener);
                if (openResult.isErr()) {
                    return openResult;
                } else {
                    const openedChannel = openResult.value;
                    return new Ok(openedChannel);
                }
            }
        }
    }

    unlockChannel(channel: LockOpenNotificationChannel, locker: LockOpenListItem.Locker) {
        this.list.unlockItem(channel, locker);
    }

    closeChannel(openedChannel: LockOpenNotificationChannel, opener: LockOpenListItem.Opener) {
        this.list.closeLockedItem(openedChannel, opener);
    }

    async tryCreateChannel(dataDefinition: CreateNotificationChannelDataDefinition): Promise<Result<LockOpenNotificationChannel | undefined>> {
        const result = await this.getLoadedList(false);
        if (result.isErr()) {
            return result.createType();
        } else {
            const list = result.value;
            if (list === undefined) {
                return new Ok(undefined); // shutting down - ignore
            } else {
                const incubateResult = await this.incubateCreateChannel(list, dataDefinition);
                return incubateResult;
            }
        }
    }

    async tryDeleteChannel(channelId: string): Promise<Result<void>> {
        const result = await this.getLoadedList(false);
        if (result.isErr()) {
            return result.createType();
        } else {
            const list = result.value;
            if (list === undefined) {
                return new Ok(undefined); // shutting down - ignore
            } else {
                // First check to see if list contains channel
                const idIncubator = this.incubateDeleteChannel(list, channelId);
                const promise = new Promise<Result<void>>((resolve) => {
                    idIncubator.resolveFtns = [...idIncubator.resolveFtns, resolve];
                });
                return promise;
            }
        }
    }

    async tryDeleteChannels(channelIds: string[]): Promise<Result<void>> {
        const channelIdCount = channelIds.length;
        const deletePromises = new Array<Promise<Result<void>>>(channelIdCount);
        for (let i = 0; i < channelIdCount; i++) {
            const channelId = channelIds[i];
            const promise = this.tryDeleteChannel(channelId);
            deletePromises[i] = promise;
        }

        const allPromise = Promise.all(deletePromises);
        const results = await allPromise;
        const resultCount = results.length;
        for (let i = 0; i < resultCount; i++) {
            const result = results[i];
            if (result.isErr()) {
                return result;
            }
        }
        return new Ok(undefined);
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

    private incubateReloadSupportedDistributionMethodIds() {
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
                        let result: Result<readonly NotificationDistributionMethodId[] | undefined>;
                        if (dataItem.error) {
                            result = new Err(dataItem.errorText);
                        } else {
                            this._supportedDistributionMethodIds = dataItem.methodIds;
                            this._supportedDistributionMethodIdsLoaded = true;
                            result = new Ok(this._supportedDistributionMethodIds);
                        }
                        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(result));
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRSDMR50971'); }
            )
        }
    }

    private incubateReloadChannelist() {
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
                        let result: Result<LockOpenNotificationChannelList | undefined>;
                        if (dataItem.error) {
                            result = new Err(dataItem.errorText);
                        } else {
                            const list = this.list;
                            list.load(dataItem.notificationChannels, false);
                            if (!list.usable) {
                                list.setBadness(Badness.notBad);
                            }
                            result = new Ok(this.list);
                        }
                        this._queryNotificationChannelsResolves.forEach((resolve) => resolve(result));
                        this._queryNotificationChannelsResolves.length = 0;
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRCDR50971'); }
            )
        }
    }

    private incubateReloadChannel(
        channelList: LockOpenNotificationChannelList,
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
                            const idx = this.list.indexOfKey(notificationChannel.channelId);
                            let channel: LockOpenNotificationChannel;
                            if (idx >= 0) {
                                channel = channelList.getAt(idx);
                                channel.load(notificationChannel, true);
                            } else {
                                channel = new LockOpenNotificationChannel(notificationChannel, true);
                                channelList.add(channel);
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

    private async incubateCreateChannel(
        channelList: LockOpenNotificationChannelList,
        dataDefinition: CreateNotificationChannelDataDefinition,
    ): Promise<Result<LockOpenNotificationChannel | undefined>> {
        // only have one
        const incubators = this._createNotificationChannelIncubators;

        const incubator = new DataItemIncubator<CreateNotificationChannelDataItem>(this._adiService);
        incubators.push(incubator);
        const dataItemOrPromise = incubator.incubateSubcribe(dataDefinition);
        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('NCSIVCDI50971'); // is query so cannot be cached
        } else {
            const dataItem = await dataItemOrPromise;
            if (dataItem === undefined) { // Cancelled - probably shutting down
                return new Ok(undefined);
            } else {
                if (dataItem.error) {
                    return new Err(dataItem.errorText);
                } else {
                    const channelId = dataItem.notificationChannelId;

                    const idIncubator = this.incubateReloadChannel(channelList, channelId, undefined, undefined);
                    const reloadPromise = new Promise<Result<LockOpenNotificationChannel | undefined>>(
                        (resolve) => {
                            idIncubator.resolveFtns = [...idIncubator.resolveFtns, resolve];
                        }
                    );
                    return reloadPromise;
                }
            }
        }
    }

    private incubateDeleteChannel(
        channelList: LockOpenNotificationChannelList,
        channelId: string,
    ) {
        // only have one
        const idIncubators = this._idDeleteNotificationChannelIncubators;
        const incubatorsCount = idIncubators.length;
        let existingResolveFtns = new Array<NotificationChannelsService.DeleteNotificationChannelResolve>();
        for (let i = 0; i < incubatorsCount; i++) {
            const idIncubator = idIncubators[i];
            if (idIncubator.channelId === channelId) {
                existingResolveFtns = [...existingResolveFtns, ...idIncubator.resolveFtns];
                idIncubator.incubator.cancel(); // no duplicates
                idIncubators.splice(i, 1);
                break;
            }
        }

        const incubator = new DataItemIncubator<DeleteNotificationChannelDataItem>(this._adiService);
        const idIncubator: NotificationChannelsService.IdDeleteNotificationChannelIncubator = {
            channelId,
            incubator,
            resolveFtns: existingResolveFtns,
        }
        idIncubators.push(idIncubator);
        const dataDefinition = new DeleteNotificationChannelDataDefinition();
        dataDefinition.notificationChannelId = channelId;
        const dataItemOrPromise = incubator.incubateSubcribe(dataDefinition);
        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('NCSIDCDI50971'); // is query so cannot be cached
        } else {
            dataItemOrPromise.then(
                (dataItem) => {
                    if (dataItem !== undefined) { // If undefined, then cancelled.  Ignore cancels as may have been replaced by newer request (see finalise as well)
                        if (dataItem.error) {
                            idIncubator.resolveFtns.forEach((resolve) => resolve(new Err(dataItem.errorText)));
                            this.deleteIdDeleteNotificationChannelIncubator(idIncubator);
                        } else {
                            const idx = this.list.indexOfKey(channelId);
                            let channel: LockOpenNotificationChannel;
                            if (idx >= 0) {
                                channel = channelList.getAt(idx);
                                channel.forceDelete();
                            }
                            idIncubator.resolveFtns.forEach((resolve) => resolve(new Ok(undefined)));
                            this.deleteIdDeleteNotificationChannelIncubator(idIncubator);
                        }
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCSRCDR50971'); }
            )
            return idIncubator;
        }
    }

    private checkOpenAndResolveQueryNotificationChannelIncubator(
        channelList: LockOpenNotificationChannelList,
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
            idIncubator = idIncubators[index];
            idIncubator.resolveFtns.length = 0;
            idIncubators.splice(index, 1);
        }
    }

    private deleteIdDeleteNotificationChannelIncubator(idIncubator: NotificationChannelsService.IdDeleteNotificationChannelIncubator) {
        const idIncubators = this._idDeleteNotificationChannelIncubators;
        const index = idIncubators.indexOf(idIncubator);
        if (index < 0) {
            throw new AssertInternalError('NCSDIDNCI45454', `${index}`);
        } else {
            idIncubator = idIncubators[index];
            idIncubator.resolveFtns.length = 0;
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

    export type GetSupportedDistributionMethodIdsResolve = (this: void, result: Result<readonly NotificationDistributionMethodId[] | undefined>) => void;
    export type QueryNotificationChannelsResolve = (this: void, result: Result<LockOpenNotificationChannelList | undefined>) => void;
    export type QueryNotificationChannelResolve = (this: void, result: Result<LockOpenNotificationChannel | undefined>) => void;
    export type DeleteNotificationChannelResolve = (this: void, result: Result<void>) => void;
    export type CreateNotificationChannelResolve = (this: void, result: Result<string | undefined>) => void;

    export interface IdQueryNotificationChannelIncubator {
        readonly channelId: string;
        readonly incubator: DataItemIncubator<QueryNotificationChannelDataItem>;
        resolveFtns: NotificationChannelsService.QueryNotificationChannelResolve[];
    }

    export interface IdDeleteNotificationChannelIncubator {
        readonly channelId: string;
        readonly incubator: DataItemIncubator<DeleteNotificationChannelDataItem>;
        resolveFtns: NotificationChannelsService.DeleteNotificationChannelResolve[];
    }
}
