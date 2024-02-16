/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItemIncubator, NotificationChannel, NotificationDistributionMethodId, QueryNotificationDistributionMethodsDataItem } from '../adi/adi-internal-api';
import { Integer, ModifierComparableList } from '../sys/sys-internal-api';

export class NotificationChannelsService {
    readonly channelList: ModifierComparableList<NotificationChannel, Integer>;
    private readonly _supportedDistributionMethodIds: NotificationDistributionMethodId[];
    private _channelListLoaded = false;
    private _supportedDistributionMethodIdsLoaded = false;

    private _supportedDistributionMethodIdsIncubator: DataItemIncubator<QueryNotificationDistributionMethodsDataItem> | undefined;

    constructor() {
        this.channelList = new ModifierComparableList<NotificationChannel, Integer>(0);
        this._supportedDistributionMethodIds = new Array<NotificationDistributionMethodId>();
    }

    // get supportedDistributionMethodIds(): Promise<NotificationDistributionMethodId[]> {
    //     if (this._supportedDistributionMethodIdsIncubator !== undefined) {
    //         this._supportedDistributionMethodIdsIncubator.incubateSubcribe(definition)
    //     }
    // }

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

    // refreshSupportedDistributionMethods(): Promise<void> {

    // }

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
}
