/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isReadable as TinyColorIsReadable, readability as TinyColorReadability } from '@ctrl/tinycolor';
import { StringId, Strings } from '../../../res/internal-api';
import {
    ColorRenderValue,
    ColorScheme,
    ColorSettings,
    ColorSettingsItemStateIdRenderValue,
    IntegerRenderValue,
    IsReadableRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue
} from '../../../services/internal-api';
import {
    GridFieldHorizontalAlign,
    GridRevRecordField,
    UnreachableCaseError
} from "../../../sys/internal-api";
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/internal-api';
import { GridLayoutDefinition } from '../../layout/internal-api';
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

    export const allFieldNames: FieldName[] = [
        FieldName.ItemId,
        FieldName.Name,
        FieldName.Display,
        FieldName.ItemBkgdColorText,
        FieldName.ResolvedBkgdColorText,
        FieldName.ItemForeColorText,
        FieldName.ResolvedForeColorText,
        FieldName.ItemBkgdColor,
        FieldName.ResolvedBkgdColor,
        FieldName.ItemForeColor,
        FieldName.ResolvedForeColor,
        FieldName.BkgdItemState,
        FieldName.ForeItemState,
        FieldName.Readability,
        FieldName.IsReadable,
    ];

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

    export function createDefaultGridLayoutDefinition() {
        const sourcelessFieldNames: FieldName[] = [
            ColorSchemeGridField.FieldName.Display,
            ColorSchemeGridField.FieldName.ResolvedBkgdColorText,
            ColorSchemeGridField.FieldName.ResolvedBkgdColor,
            ColorSchemeGridField.FieldName.ResolvedForeColorText,
            ColorSchemeGridField.FieldName.ResolvedForeColor,
            ColorSchemeGridField.FieldName.Readability,
            ColorSchemeGridField.FieldName.IsReadable
        ];

        const count = sourcelessFieldNames.length;
        const columns = new Array<GridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const sourceName = ColorSchemeGridField.sourceDefinition.name;
            const sourcelessFieldName = sourcelessFieldNames[i];
            const fieldName = GridFieldDefinition.composeName(sourceName, sourcelessFieldName);
            const column: GridLayoutDefinition.Column = {
                fieldName,
                visible: undefined,
                autoSizableWidth: undefined,
            };
            columns[i] = column;
        }
        return new GridLayoutDefinition(columns);
    }
}

export class ItemIdColorSchemeGridField extends ColorSchemeGridField {
    constructor(colorSettings: ColorSettings) {
        const definition = new GridFieldDefinition(
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ItemId,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.Name,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.Display,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ItemBkgdColorText,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ResolvedBkgdColorText,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ItemForeColorText,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ResolvedForeColorText,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ItemBkgdColor,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ResolvedBkgdColor,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ItemForeColor,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ResolvedForeColor,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.BkgdItemState,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.ForeItemState,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.Readability,
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
            ColorSchemeGridField.sourceDefinition,
            ColorSchemeGridField.FieldName.IsReadable,
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
