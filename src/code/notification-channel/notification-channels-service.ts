/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataItemIncubator, NotificationChannel, NotificationDistributionMethodId, QueryNotificationDistributionMethodsDataDefinition, QueryNotificationDistributionMethodsDataItem } from '../adi/adi-internal-api';
import { AssertInternalError, Integer, Logger, ModifierComparableList } from '../sys/sys-internal-api';

export class NotificationChannelsService {
    readonly channelList: ModifierComparableList<NotificationChannel, Integer>;
    private readonly _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem>;
    private readonly _getSupportedDistributionMethodIdsResolves = new Array<NotificationChannelsService.GetSupportedDistributionMethodIdsResolve>();

    private _supportedDistributionMethodIds: readonly NotificationDistributionMethodId[];
    private _channelListLoaded = false;
    private _supportedDistributionMethodIdsLoaded = false;


    constructor(
        adiService: AdiService,
    ) {
        this.channelList = new ModifierComparableList<NotificationChannel, Integer>(0);
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
        this._supportedDistributionMethodIdsIncubator = new DataItemIncubator<QueryNotificationDistributionMethodsDataItem>(adiService);

    }

    initialise() {
        this.refreshSupportedDistributionMethodIds();
    }

    finalise() {
        this._supportedDistributionMethodIdsIncubator.cancel();
        this._getSupportedDistributionMethodIdsResolves.forEach((resolve) => resolve(undefined));
        this._getSupportedDistributionMethodIdsResolves.length = 0;
    }

    getSupportedDistributionMethodIds(refresh: boolean): Promise<readonly NotificationDistributionMethodId[] | undefined> {
        if (this._supportedDistributionMethodIdsIncubator !== undefined && !refresh && !this._supportedDistributionMethodIdsIncubator.incubating) {
            return Promise.resolve(this._supportedDistributionMethodIds);
        } else {
            const promise = new Promise<readonly NotificationDistributionMethodId[] | undefined>((resolve) => {
                this._getSupportedDistributionMethodIdsResolves.push(resolve);
            })
            this.refreshSupportedDistributionMethodIds();
            return promise;
        }
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

    // refresh(): Promise<void> {

    // }

    // refreshChannel(channelId: string): Promise<NotificationChannelStateAndSettings> {

    // }

    // refreshChannelAt(idx: Integer): Promise<NotificationChannelStateAndSettings> {

    // }

    // refreshChannels(): Promise<void> {

    // }

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
                            const queryNotificationDistributionMethodsDataItem = dataItem as QueryNotificationDistributionMethodsDataItem;
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
