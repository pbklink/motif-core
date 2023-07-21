/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isReadable as TinyColorIsReadable, readability as TinyColorReadability } from '@ctrl/tinycolor';
import { StringId, Strings } from '../../../res/res-internal-api';
import {
    ColorRenderValue,
    ColorSettingsItemStateIdRenderValue,
    IntegerRenderValue,
    IsReadableRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue
} from '../../../services/services-internal-api';
import {
    ColorScheme,
    ColorSettings
} from '../../../settings/settings-internal-api';
import {
    GridFieldHorizontalAlign,
    GridRevRecordField,
    UnreachableCaseError
} from "../../../sys/sys-internal-api";
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';
import { ColorSchemeGridRecordStore } from './color-scheme-grid-record-store';

export abstract class ColorSchemeGridField extends GridField implements GridRevRecordField {
    constructor(
        private readonly _colorSettings: ColorSettings,
        definition: GridFieldDefinition,
    ) {
        super(definition);
    }

    get colorSettings() { return this._colorSettings; }

    abstract override getViewValue(record: ColorSchemeGridRecordStore.Record): RenderValue;
}

export namespace ColorSchemeGridField {
    export const enum FieldName {
        ItemId = 'Id',
        Name = 'Name',
        Display = 'Display',
        ItemBkgdColorText = 'ItemBkgdText',
        ResolvedBkgdColorText = 'ResolvedBkgdText',
        ItemForeColorText = 'ItemForeText',
        ResolvedForeColorText = 'ResolvedForeText',
        ItemBkgdColor = 'ItemBkgd',
        ResolvedBkgdColor = 'ResolvedBkgd',
        ItemForeColor = 'ItemFore',
        ResolvedForeColor = 'ResolvedFore',
        BkgdItemState = 'BkgdItemState',
        ForeItemState = 'ForeItemState',
        Readability = 'Readability',
        IsReadable = 'IsReadable',
    }

    export const sourceDefinition = new GridFieldSourceDefinition('ColorScheme');

    export function createField(name: FieldName, colorSettings: ColorSettings) {
        switch (name) {
            case FieldName.ItemId: return new ItemIdColorSchemeGridField(colorSettings);
            case FieldName.Name: return new NameColorSchemeGridField(colorSettings);
            case FieldName.Display: return new DisplayColorSchemeGridField(colorSettings);
            case FieldName.ItemBkgdColorText: return new ItemBkgdColorTextColorSchemeGridField(colorSettings);
            case FieldName.ResolvedBkgdColorText: return new ResolvedBkgdColorTextColorSchemeGridField(colorSettings);
            case FieldName.ItemForeColorText: return new ItemForeColorTextColorSchemeGridField(colorSettings);
            case FieldName.ResolvedForeColorText: return new ResolvedForeColorTextColorSchemeGridField(colorSettings);
            case FieldName.ItemBkgdColor: return new ItemBkgdColorColorSchemeGridField(colorSettings);
            case FieldName.ResolvedBkgdColor: return new ResolvedBkgdColorColorSchemeGridField(colorSettings);
            case FieldName.ItemForeColor: return new ItemForeColorColorSchemeGridField(colorSettings);
            case FieldName.ResolvedForeColor: return new ResolvedForeColorColorSchemeGridField(colorSettings);
            case FieldName.BkgdItemState: return new BkgdItemStateColorSchemeGridField(colorSettings);
            case FieldName.ForeItemState: return new ForeItemStateColorSchemeGridField(colorSettings);
            case FieldName.Readability: return new ReadabilityColorSchemeGridField(colorSettings);
            case FieldName.IsReadable: return new IsReadableColorSchemeGridField(colorSettings);
            default:
                throw new UnreachableCaseError('CSGFCF300087', name);
        }
    }
}

export class ItemIdColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ItemId,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ItemId],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    override getViewValue(record: ColorSchemeGridRecordStore.Record): IntegerRenderValue {
        return new IntegerRenderValue(record.itemId);
    }
}

export class NameColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.Name,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_Name],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    override getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
        return new StringRenderValue(ColorScheme.Item.idToName(record.itemId));
    }
}

export class DisplayColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.Display,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_Display],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
        return new StringRenderValue(ColorScheme.Item.idToDisplay(record.itemId));
    }
}

export class ItemBkgdColorTextColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ItemBkgdColorText,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ItemBkgdColorText],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
        return new StringRenderValue(this.colorSettings.getItemBkgd(record.itemId));
    }
}

export class ResolvedBkgdColorTextColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ResolvedBkgdColorText,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ResolvedBkgdColorText],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
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

export class ItemForeColorTextColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ItemForeColorText,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ItemForeColorText],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
        return new StringRenderValue(this.colorSettings.getItemFore(record.itemId));
    }
}

export class ResolvedForeColorTextColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ResolvedForeColorText,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ResolvedForeColorText],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): StringRenderValue {
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

export class ItemBkgdColorColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ItemBkgdColor,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ItemBkgdColor],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): ColorRenderValue {
        return new ColorRenderValue(this.colorSettings.getItemBkgd(record.itemId));
    }
}

export class ResolvedBkgdColorColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ResolvedBkgdColor,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ResolvedBkgdColor],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): ColorRenderValue {
        return new ColorRenderValue(this.colorSettings.getBkgd(record.itemId));
    }
}

export class ItemForeColorColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ItemForeColor,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ItemForeColor],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): ColorRenderValue {
        return new ColorRenderValue(this.colorSettings.getItemFore(record.itemId));
    }
}

export class ResolvedForeColorColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ResolvedForeColor,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_ResolvedForeColor],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): ColorRenderValue {
        return new ColorRenderValue(this.colorSettings.getFore(record.itemId));
    }
}

export class BkgdItemStateColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.BkgdItemState,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_NotHasBkgd],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record) {
        const stateId = this.colorSettings.getBkgdItemStateId(record.itemId);
        return new ColorSettingsItemStateIdRenderValue(stateId);
    }
}

export class ForeItemStateColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.ForeItemState,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_NotHasFore],
            GridFieldHorizontalAlign.left,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record) {
        const stateId = this.colorSettings.getForeItemStateId(record.itemId);
        return new ColorSettingsItemStateIdRenderValue(stateId);
    }
}

export class ReadabilityColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.Readability,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_Readability],
            GridFieldHorizontalAlign.right,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): NumberRenderValue {
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

export class IsReadableColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.FieldName.IsReadable,
            ColorSchemeGridField.sourceDefinition,
            Strings[StringId.ColorGridHeading_IsReadable],
            GridFieldHorizontalAlign.center,
        );
        super(colorSettings, definition);
    }

    getViewValue(record: ColorSchemeGridRecordStore.Record): IsReadableRenderValue {
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
