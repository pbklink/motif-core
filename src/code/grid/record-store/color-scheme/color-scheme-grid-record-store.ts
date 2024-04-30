/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordIndex, RevRecordStore } from '@xilytix/revgrid';
import {
    ColorScheme,
    ColorSettings,
    SettingsService
} from '../../../services/internal-api';
import {
    IndexedRecord,
    Integer,
    MultiEvent
} from "../../../sys/internal-api";

/** @public */
export class ColorSchemeGridRecordStore implements RevRecordStore {
    readonly colorSettings: ColorSettings;

    private readonly _records = new Array<ColorSchemeGridRecordStore.Record>(ColorScheme.Item.idCount);
    private _settingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    private _recordsEventers: RevRecordStore.RecordsEventers;

    constructor(private readonly _settingsService: SettingsService) {
        this.colorSettings = this._settingsService.color;

        for (let itemId = 0; itemId < ColorScheme.Item.idCount; itemId++) {
            const record = {
                index: itemId,
                itemId,
            };
            this._records[itemId] = record;
        }

        this._settingsChangedEventSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => { this.handleSettingsChangedEvent(); });
    }

    get recordCount(): number {
        return ColorScheme.Item.idCount;
    }

    finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedEventSubscriptionId);
    }

    setRecordEventers(recordsEventers: RevRecordStore.RecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    getRecord(index: RevRecordIndex): ColorSchemeGridRecordStore.Record {
        return this._records[index];
    }

    getRecords(): readonly ColorSchemeGridRecordStore.Record[] {
        return this._records;
    }

    // addFields(fields: readonly ColorSchemeGridRecordStore.Field[]) {
    //     this._fieldsEventers.addFields(fields);
    // }

    invalidateAll() {
        this._recordsEventers.invalidateAll();
    }

    invalidateRecord(recordIndex: RevRecordIndex) {
        this._recordsEventers.invalidateRecord(recordIndex);
    }

    recordsInserted(firstInsertedRecordIndex: RevRecordIndex, count: Integer) {
        this._recordsEventers.recordsInserted(firstInsertedRecordIndex, count);
    }

    private handleSettingsChangedEvent() {
        this.invalidateAll();
    }
}

/** @public */
export namespace ColorSchemeGridRecordStore {
    export interface Record extends IndexedRecord {
        itemId: ColorScheme.ItemId;
    }

    export type ChangedEvent = (this: void) => void;
}
