/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isReadable as TinyColorIsReadable, readability as TinyColorReadability } from '@ctrl/tinycolor';
import { StringId, Strings } from '../../res/res-internal-api';
import {
    ColorRenderValue,
    ColorSettingsItemStateIdRenderValue,
    IntegerRenderValue,
    IsReadableRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue
} from '../../services/services-internal-api';
import {
    ColorScheme,
    ColorSettings,
    SettingsService
} from '../../settings/settings-internal-api';
import {
    GridFieldHAlign,
    GridRecordIndex,
    GridRecordStore,
    GridRecordStoreRecordsEventers,
    GridRevRecordField,
    IndexedRecord,
    Integer,
    MultiEvent,
    UnreachableCaseError
} from "../../sys/sys-internal-api";
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../field/grid-field-internal-api';

/** @public */
export class ColorSchemeGridRecordStore implements GridRecordStore {
    private readonly _records = new Array<ColorSchemeGridRecordStore.Record>(ColorScheme.Item.idCount);
    private _colorSettings: ColorSettings;
    private _settingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    // private _fieldsEventers: GridRecordStoreFieldsEventers;
    private _recordsEventers: GridRecordStoreRecordsEventers;

    constructor(private readonly _settingsService: SettingsService) {
        this._colorSettings = this._settingsService.color;

        for (let itemId = 0; itemId < ColorScheme.Item.idCount; itemId++) {
            const record = {
                index: itemId,
                itemId,
            };
            this._records[itemId] = record;
        }

        this._settingsChangedEventSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    get colorSettings() { return this._colorSettings; }

    get recordCount(): number {
        return ColorScheme.Item.idCount;
    }

    finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedEventSubscriptionId);
    }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    createItemIdField() { return new ColorSchemeGridRecordStore.ItemIdField(this.colorSettings); }
    createNameField() { return new ColorSchemeGridRecordStore.NameField(this.colorSettings); }
    createDisplayField() { return new ColorSchemeGridRecordStore.DisplayField(this.colorSettings); }
    createItemBkgdColorTextField() { return new ColorSchemeGridRecordStore.ItemBkgdColorTextField(this.colorSettings); }
    createResolvedBkgdColorTextField() { return new ColorSchemeGridRecordStore.ResolvedBkgdColorTextField(this.colorSettings); }
    createItemForeColorTextField() { return new ColorSchemeGridRecordStore.ItemForeColorTextField(this.colorSettings); }
    createResolvedForeColorTextField() { return new ColorSchemeGridRecordStore.ResolvedForeColorTextField(this.colorSettings); }
    createItemBkgdColorField() { return new ColorSchemeGridRecordStore.ItemBkgdColorField(this.colorSettings); }
    createResolvedBkgdColorField() { return new ColorSchemeGridRecordStore.ResolvedBkgdColorField(this.colorSettings); }
    createItemForeColorField() { return new ColorSchemeGridRecordStore.ItemForeColorField(this.colorSettings); }
    createResolvedForeColorField() { return new ColorSchemeGridRecordStore.ResolvedForeColorField(this.colorSettings); }
    createBkgdItemStateField() { return new ColorSchemeGridRecordStore.BkgdItemStateField(this.colorSettings); }
    createForeItemStateField() { return new ColorSchemeGridRecordStore.ForeItemStateField(this.colorSettings); }
    createReadabilityField() { return new ColorSchemeGridRecordStore.ReadabilityField(this.colorSettings); }
    createIsReadableField() { return new ColorSchemeGridRecordStore.IsReadableField(this.colorSettings); }

    getRecord(index: GridRecordIndex): ColorSchemeGridRecordStore.Record {
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

    invalidateRecord(recordIndex: GridRecordIndex) {
        this._recordsEventers.invalidateRecord(recordIndex);
    }

    recordsInserted(firstInsertedRecordIndex: GridRecordIndex, count: Integer) {
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

    export namespace FieldName {
        export const itemId = 'Id';
        export const name = 'Name';
        export const display = 'Display';
        export const itemBkgdColorText = 'ItemBkgdText';
        export const resolvedBkgdColorText = 'ResolvedBkgdText';
        export const itemForeColorText = 'ItemForeText';
        export const resolvedForeColorText = 'ResolvedForeText';
        export const itemBkgdColor = 'ItemBkgd';
        export const resolvedBkgdColor = 'ResolvedBkgd';
        export const itemForeColor = 'ItemFore';
        export const resolvedForeColor = 'ResolvedFore';
        export const bkgdState = 'BkgdState';
        export const foreState = 'ForeState';
        export const readability = 'readability';
        export const isReadable = 'isReadable';
    }

    export abstract class Field extends GridField implements GridRevRecordField {
        constructor(
            private readonly _colorSettings: ColorSettings,
            name: string,
            heading: string,
            hAlign: GridFieldHAlign
        ) {
            const definition = new GridFieldDefinition(
                name,
                heading,
                hAlign,
                Field.sourceDefinition,
            );
            super(definition);
        }

        get colorSettings() { return this._colorSettings; }

        abstract override getValue(record: Record): RenderValue;
    }

    export namespace Field {
        export class SourceDefinition extends GridFieldSourceDefinition {
        }

        export const sourceDefinition = new SourceDefinition('ColorScheme');
    }

    export class ItemIdField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemId, Strings[StringId.ColorGridHeading_ItemId], GridFieldHAlign.right);
        }

        getValue(record: Record): IntegerRenderValue {
            return new IntegerRenderValue(record.itemId);
        }
    }

    export class NameField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.name, Strings[StringId.ColorGridHeading_Name], GridFieldHAlign.left);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(ColorScheme.Item.idToName(record.itemId));
        }
    }

    export class DisplayField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.display, Strings[StringId.ColorGridHeading_Display], GridFieldHAlign.left);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(ColorScheme.Item.idToDisplay(record.itemId));
        }
    }

    export class ItemBkgdColorTextField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColorText, Strings[StringId.ColorGridHeading_ItemBkgdColorText], GridFieldHAlign.right);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(this.colorSettings.getItemBkgd(record.itemId));
        }
    }

    export class ResolvedBkgdColorTextField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColorText, Strings[StringId.ColorGridHeading_ResolvedBkgdColorText], GridFieldHAlign.right);
        }

        getValue(record: Record): StringRenderValue {
            const stateId = this.colorSettings.getBkgdItemStateId(record.itemId);
            let attribute: RenderValue.GreyedOutAttribute | undefined;
            let value: string;

            switch (stateId) {
                case ColorSettings.ItemStateId.Never:
                    value = '';
                    attribute = undefined;
                    break;
                case ColorSettings.ItemStateId.Inherit:
                    value = this.colorSettings.getBkgd(record.itemId);
                    attribute = {
                        id: RenderValue.AttributeId.GreyedOut,
                    };
                    break;
                case ColorSettings.ItemStateId.Value:
                    value = this.colorSettings.getBkgd(record.itemId);
                    attribute = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('CSGDSRBCTF12129', stateId);
            }

            const renderValue = new StringRenderValue(value);
            if (attribute !== undefined) {
                renderValue.addAttribute(attribute);
            }

            return renderValue;
        }
    }

    export class ItemForeColorTextField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColorText, Strings[StringId.ColorGridHeading_ItemForeColorText], GridFieldHAlign.right);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(this.colorSettings.getItemFore(record.itemId));
        }
    }

    export class ResolvedForeColorTextField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColorText, Strings[StringId.ColorGridHeading_ResolvedForeColorText], GridFieldHAlign.right);
        }

        getValue(record: Record): StringRenderValue {
            const stateId = this.colorSettings.getForeItemStateId(record.itemId);
            let attribute: RenderValue.GreyedOutAttribute | undefined;
            let value: string;

            switch (stateId) {
                case ColorSettings.ItemStateId.Never:
                    value = '';
                    attribute = undefined;
                    break;
                case ColorSettings.ItemStateId.Inherit:
                    value = this.colorSettings.getFore(record.itemId);
                    attribute = {
                        id: RenderValue.AttributeId.GreyedOut,
                    };
                    break;
                case ColorSettings.ItemStateId.Value:
                    value = this.colorSettings.getFore(record.itemId);
                    attribute = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('CSGDSRBCTF12129', stateId);
            }

            const renderValue = new StringRenderValue(value);
            if (attribute !== undefined) {
                renderValue.addAttribute(attribute);
            }

            return renderValue;
        }
    }

    export class ItemBkgdColorField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColor, Strings[StringId.ColorGridHeading_ItemBkgdColor], GridFieldHAlign.left);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getItemBkgd(record.itemId));
        }
    }

    export class ResolvedBkgdColorField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColor, Strings[StringId.ColorGridHeading_ResolvedBkgdColor], GridFieldHAlign.left);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getBkgd(record.itemId));
        }
    }

    export class ItemForeColorField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColor, Strings[StringId.ColorGridHeading_ItemForeColor], GridFieldHAlign.left);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getItemFore(record.itemId));
        }
    }

    export class ResolvedForeColorField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColor, Strings[StringId.ColorGridHeading_ResolvedForeColor], GridFieldHAlign.left);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getFore(record.itemId));
        }
    }

    export class BkgdItemStateField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.bkgdState, Strings[StringId.ColorGridHeading_NotHasBkgd], GridFieldHAlign.left);
        }

        getValue(record: Record) {
            const stateId = this.colorSettings.getBkgdItemStateId(record.itemId);
            return new ColorSettingsItemStateIdRenderValue(stateId);
        }
    }

    export class ForeItemStateField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.foreState, Strings[StringId.ColorGridHeading_NotHasFore], GridFieldHAlign.left);
        }

        getValue(record: Record) {
            const stateId = this.colorSettings.getForeItemStateId(record.itemId);
            return new ColorSettingsItemStateIdRenderValue(stateId);
        }
    }

    export class ReadabilityField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.readability, Strings[StringId.ColorGridHeading_Readability], GridFieldHAlign.right);
        }

        getValue(record: Record): NumberRenderValue {
            if (ColorScheme.Item.idHasBkgd(record.itemId) && ColorScheme.Item.idHasFore(record.itemId)) {
                const resolvedBkgdColor = this.colorSettings.getBkgd(record.itemId);
                const resolvedForeColor = this.colorSettings.getFore(record.itemId);
                const value = TinyColorReadability(resolvedBkgdColor, resolvedForeColor);
                return new NumberRenderValue(value);
            } else {
                return new NumberRenderValue(undefined);
            }
        }
    }

    export class IsReadableField extends Field {
        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.isReadable, Strings[StringId.ColorGridHeading_IsReadable], GridFieldHAlign.center);
        }

        getValue(record: Record): IsReadableRenderValue {
            if (ColorScheme.Item.idHasBkgd(record.itemId) && ColorScheme.Item.idHasFore(record.itemId)) {
                const resolvedBkgdColor = this.colorSettings.getBkgd(record.itemId);
                const resolvedForeColor = this.colorSettings.getFore(record.itemId);
                const value = TinyColorIsReadable(resolvedBkgdColor, resolvedForeColor);
                return new IsReadableRenderValue(value);
            } else {
                return new IsReadableRenderValue(undefined);
            }
        }
    }
}
