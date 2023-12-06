/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { EnumInfoOutOfOrderError, HtmlTypes, Integer, JsonElement, Logger, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ColorScheme } from './color-scheme';
import { ColorSchemePreset } from './color-scheme-preset';
import { SettingsGroup } from './settings-group';

export class ColorSettings extends SettingsGroup {
    private _baseScheme: ColorScheme;
    private _activeScheme: ColorScheme;
    private _resolvedItems = new Array<ColorScheme.ResolvedItem>(ColorScheme.Item.idCount);
    private _beginChangeCount = 0;
    private _changed = false;

    private _lastOpaqueItems = new Array<ColorSettings.LastOpaqueItem>(ColorScheme.Item.idCount);

    constructor() {
        super(SettingsGroup.Type.Id.Color, ColorSettings.groupName);
    }

    get lastNonInheritedItems() { return this._lastOpaqueItems; }

    override beginChanges() {
        this._beginChangeCount++;
        if (this._beginChangeCount === 1) {
            super.beginChanges();
        }
    }

    override endChanges() {
        if (--this._beginChangeCount === 0) {
            if (this._changed) {
                this.resolve();
                this.notifySettingChanged(0);
                this._changed = false;
            }
            super.endChanges();
        }
    }

    override load(userElement: JsonElement | undefined, _operatorElement: JsonElement | undefined) {
        this.beginChanges();
        try {
            if (userElement === undefined) {
                this.loadDefault();
            } else {
                const baseNameResult = userElement.tryGetString(ColorSettings.JsonName.BaseName);
                if (baseNameResult.isErr()) {
                    this.loadDefaultWithWarning('baseName not found');
                } else {
                    let isBuiltIn: boolean;
                    const isBuiltInResult = userElement.tryGetBoolean(ColorSettings.JsonName.BaseIsBuiltIn);
                    if (isBuiltInResult.isErr()) {
                        Logger.logWarning(`${ColorSettings.loadWarningPrefix} isBuiltIn not found. Assuming true`);
                        isBuiltIn = true;
                    } else {
                        isBuiltIn= isBuiltInResult.value;
                    }

                    if (!isBuiltIn) {
                        this.loadDefaultWithWarning('Only BuiltIn currently supported');
                    } else {
                        const baseName = baseNameResult.value;
                        const scheme = ColorSchemePreset.createColorSchemeByName(baseNameResult.value);
                        if (scheme === undefined) {
                            this.loadDefaultWithWarning(`Built In color scheme not found: ${baseName}`);
                        } else {
                            this._baseScheme = scheme;
                            this._activeScheme = this._baseScheme.createCopy();

                            const differenceElementsResult = userElement.tryGetElementArray(ColorSettings.JsonName.Differences);
                            if (differenceElementsResult.isOk()) {
                                const differenceElements = differenceElementsResult.value;
                                if (differenceElements.length > 0) {
                                    this.loadDifferences(differenceElements);
                                }
                            }

                            this.resolve();
                            this.initialiseLastOpaqueItemColors();
                        }
                    }
                }
            }
        } finally {
            this.endChanges();
        }
    }

    override save(): SettingsGroup.SaveElements {
        const element = new JsonElement();
        this.setSaveElementNameAndTypeId(element);
        element.setString(ColorSettings.JsonName.BaseName, this._baseScheme.name);
        element.setBoolean(ColorSettings.JsonName.BaseIsBuiltIn, this._baseScheme.builtIn);
        const differences = this._activeScheme.differencesFrom(this._baseScheme);
        if (differences.length > 0) {
            const differenceElements = new Array<JsonElement>(differences.length);
            for (let i = 0; i < differences.length; i++) {
                const differenceItem = differences[i];
                const differenceElement = new JsonElement();
                differenceElement.setString(ColorSettings.JsonName.ItemName, ColorScheme.Item.idToName(differenceItem.id));
                if (differenceItem.bkgd !== ColorScheme.schemeInheritColor) {
                    differenceElement.setString(ColorSettings.JsonName.ItemBkgd, differenceItem.bkgd);
                }
                if (differenceItem.fore !== ColorScheme.schemeInheritColor) {
                    differenceElement.setString(ColorSettings.JsonName.ItemFore, differenceItem.fore);
                }
                differenceElements[i] = differenceElement;
            }

            element.setElementArray(ColorSettings.JsonName.Differences, differenceElements);
        }

        return {
            user: element,
            operator: undefined,
        };
    }

    loadColorScheme(value: string) {
        // TODO: Presets are hard coded into form.
        this.beginChanges();
        try {
            let scheme: ColorScheme | undefined;
            switch (value) {
                case '<Light>':
                    scheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Light);
                    break;
                case '<Dark>':
                    scheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Dark);
                    break;
                default:
                    scheme = undefined;
            }
            if (scheme === undefined) {
                this.loadDefaultWithWarning(`Selected color scheme not found: ${value}`);
            } else {
                this._baseScheme = scheme;
                this._activeScheme = this._baseScheme.createCopy();
                this.resolve();
                this.initialiseLastOpaqueItemColors();
            }
            this._changed = true;
        } finally {
            this.endChanges();
        }
    }

    getItemFore(itemId: ColorScheme.ItemId) {
        return this._activeScheme.items[itemId].fore;
    }

    setItemFore(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor): void {
        this.setItemColor(itemId, ColorScheme.BkgdForeId.Fore, color);
    }

    getItemBkgd(itemId: ColorScheme.ItemId) {
        return this._activeScheme.items[itemId].bkgd;
    }

    setItemBkgd(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor): void {
        this.setItemColor(itemId, ColorScheme.BkgdForeId.Bkgd, color);
    }

    getItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        switch (bkgdFore) {
            case ColorScheme.BkgdForeId.Bkgd: return this.getItemBkgd(itemId);
            case ColorScheme.BkgdForeId.Fore: return this.getItemFore(itemId);
            default: throw new UnreachableCaseError('CSFGIC323085543', bkgdFore);
        }
    }

    setItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId, color: ColorScheme.ItemColor): void {
        this.beginChanges();
        try {
            if (color !== ColorScheme.schemeInheritColor && color !== ColorScheme.schemeTransparentColor) {
                this.setLastOpaqueItemColor(itemId, bkgdFore, color);
            }
            switch (bkgdFore) {
                case ColorScheme.BkgdForeId.Bkgd:
                    if (color !== this._activeScheme.items[itemId].bkgd) {
                        this._activeScheme.items[itemId].bkgd = color;
                        this._changed = true;
                    }
                    break;
                case ColorScheme.BkgdForeId.Fore:
                    if (color !== this._activeScheme.items[itemId].fore) {
                        this._activeScheme.items[itemId].fore = color;
                        this._changed = true;
                    }
                    break;
                default:
                    throw new UnreachableCaseError('CSFSIC1009185', bkgdFore);
            }
        } finally {
            this.endChanges();
        }
    }

    getForeItemStateId(itemId: ColorScheme.ItemId) {
        if (!ColorScheme.Item.idHasFore(itemId)) {
            return ColorSettings.ItemStateId.Never;
        } else {
            const value = this.getItemFore(itemId);
            if (value === ColorScheme.schemeInheritColor) {
                return ColorSettings.ItemStateId.Inherit;
            } else {
                return ColorSettings.ItemStateId.Value;
            }
        }
    }

    getBkgdItemStateId(itemId: ColorScheme.ItemId) {
        if (!ColorScheme.Item.idHasBkgd(itemId)) {
            return ColorSettings.ItemStateId.Never;
        } else {
            const value = this.getItemBkgd(itemId);
            if (value === ColorScheme.schemeInheritColor) {
                return ColorSettings.ItemStateId.Inherit;
            } else {
                return ColorSettings.ItemStateId.Value;
            }
        }
    }

    getFore(itemId: ColorScheme.ItemId): ColorScheme.ResolvedColor {
        return this._resolvedItems[itemId].fore;
    }

    getBkgd(itemId: ColorScheme.ItemId): ColorScheme.ResolvedColor {
        return this._resolvedItems[itemId].bkgd;
    }

    getColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        switch (bkgdFore) {
            case ColorScheme.BkgdForeId.Bkgd: return this.getBkgd(itemId);
            case ColorScheme.BkgdForeId.Fore: return this.getFore(itemId);
            default: throw new UnreachableCaseError('CSGC6847739', bkgdFore);
        }
    }

    getLastOpaqueItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        const lastOpaqueItem = this._lastOpaqueItems[itemId];
        return lastOpaqueItem[bkgdFore];
    }

    setLastOpaqueItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId,
        value: ColorSettings.UndefineableOpaqueColor) {
        const lastOpaqueItem = this._lastOpaqueItems[itemId];
        lastOpaqueItem[bkgdFore] = value;
    }

    private initialiseLastOpaqueItemColors() {
        for (let i = 0; i < this._lastOpaqueItems.length; i++) {
            const itemId = i as ColorScheme.ItemId;

            let bkgdColor = this.getItemBkgd(itemId);
            if (bkgdColor === '' || bkgdColor === ColorScheme.cssInheritColor || bkgdColor === HtmlTypes.transparentColor) {
                bkgdColor = this.getBkgd(itemId); // try using resolved color instead
                if (bkgdColor === '' || bkgdColor === HtmlTypes.transparentColor) {
                    bkgdColor = ColorSettings.FallbackLastOpaqueBkgdColor;
                }
            }

            let foreColor = this.getItemFore(itemId);
            if (foreColor === '' || foreColor === ColorScheme.cssInheritColor || foreColor === HtmlTypes.transparentColor) {
                foreColor = this.getFore(itemId); // try using resolved color instead
                if (foreColor === '' || foreColor === HtmlTypes.transparentColor) {
                    foreColor = ColorSettings.FallbackLastOpaqueForeColor;
                }
            }

            const lastOpaqueItem: ColorSettings.LastOpaqueItem = [
                bkgdColor, foreColor
            ];
            this._lastOpaqueItems[itemId] = lastOpaqueItem;
        }
    }

    private loadDefault() {
        this._baseScheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Dark);
        this._activeScheme = this._baseScheme.createCopy();
        this.resolve();
        this.initialiseLastOpaqueItemColors();
    }

    private loadDefaultWithWarning(warningText: string) {
        Logger.logWarning(`${ColorSettings.loadWarningPrefix} ${warningText}`);
        this.loadDefault();
    }

    private loadDifferences(differenceElements: JsonElement[]) {
        for (let i = 0; i < differenceElements.length; i++) {
            const differenceElement = differenceElements[i];
            const itemNameResult = differenceElement.tryGetString(ColorSettings.JsonName.ItemName);
            if (itemNameResult.isErr()) {
                Logger.logWarning(`${ColorSettings.loadWarningPrefix} Difference missing Item Name`);
            } else {
                const itemName = itemNameResult.value;
                const itemId = ColorScheme.Item.tryNameToId(itemName);
                if (itemId === undefined) {
                    Logger.logWarning(`${ColorSettings.loadWarningPrefix} Difference Item Name not found: ${itemName}`);
                } else {
                    const bkgdResult = differenceElement.tryGetString(ColorSettings.JsonName.ItemBkgd);
                    const bkgd = bkgdResult.isErr() ? ColorScheme.schemeInheritColor : bkgdResult.value;
                    const foreResult = differenceElement.tryGetString(ColorSettings.JsonName.ItemFore);
                    const fore = foreResult.isErr() ? ColorScheme.schemeInheritColor : foreResult.value;

                    this._activeScheme.items[itemId] = ColorScheme.Item.create(itemId, bkgd, fore);
                }
            }
        }
    }

    private resolve() {
        for (let itemId = 0; itemId < ColorScheme.Item.idCount; itemId++) {
            this._resolvedItems[itemId] = this._activeScheme.resolve(itemId);
        }
    }
}

export namespace ColorSettings {
    export const groupName = 'color';

    export const enum JsonName {
        BaseName = 'baseName',
        BaseIsBuiltIn = 'baseIsBuiltIn',
        ItemName = 'itemName',
        ItemBkgd = 'itemBkgd',
        ItemFore = 'itemFore',
        Differences = 'differences',
    }

    export const loadWarningPrefix = 'Color Settings Load Warning:';

    export type ChangedEventHandler = (this: void) => void;

    export type UndefineableOpaqueColor = ColorScheme.OpaqueColor | undefined;
    export type BkgdForeUndefinableOpaqueColorArray = [
        UndefineableOpaqueColor, // Bkgd
        UndefineableOpaqueColor  // Fore
    ];
    export type LastOpaqueItem = BkgdForeUndefinableOpaqueColorArray;

    export const FallbackLastOpaqueBkgdColor = '#000';
    export const FallbackLastOpaqueForeColor = '#FFF';

    export const enum ItemStateId {
        Never,
        Inherit,
        Value,
    }

    export namespace ItemState {
        export type Id = ItemStateId;

        interface Info {
            id: Id;
            displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ItemStateId]: Info };

        const infosObject: InfosObject = {
            Never: {
                id: ItemStateId.Never,
                displayId: StringId.ColorSettingsItemStateDisplay_Never,
            },
            Inherit: {
                id: ItemStateId.Inherit,
                displayId: StringId.ColorSettingsItemStateDisplay_Inherit,
            },
            Value: {
                id: ItemStateId.Value,
                displayId: StringId.ColorSettingsItemStateDisplay_Value,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ItemStateId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ColorSettings.ItemState', outOfOrderIdx, infos[outOfOrderIdx].id.toString(10));
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }
}
