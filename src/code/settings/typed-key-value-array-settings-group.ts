/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexSignatureHack, JsonElement } from '../sys/sys-internal-api';
import { SettingsGroup } from './settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export abstract class TypedKeyValueArraySettingsGroup extends SettingsGroup {
    constructor(groupName: string) {
        super(SettingsGroup.Type.Id.TypedKeyValue, groupName);
    }

    load(element: JsonElement | undefined) {
        const namedInfoArrays = this.getNamedInfoArrays();
        if (element === undefined) {
            this.loadDefaults(namedInfoArrays);
        } else {
            const namedInfoArrayElementsResult = element.tryGetElementArray(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.namedInfoArrays);
            if (namedInfoArrayElementsResult.isErr()) {
                this.loadDefaults(namedInfoArrays);
            } else {
                const namedInfoArrayElements = namedInfoArrayElementsResult.value;
                const count = namedInfoArrayElements.length;
                const loadedNames = new Array<string>(count);
                let loadedNameCount = 0;
                for (const namedInfoArrayElement of namedInfoArrayElements) {
                    const nameResult = namedInfoArrayElement.tryGetStringType(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.name);
                    if (nameResult.isOk()) {
                        const infoArrayElementResult = namedInfoArrayElement.tryGetElementType(
                            TypedKeyValueArraySettingsGroup.InfosArrayJsonName.infoArray
                        );
                        if (infoArrayElementResult.isOk()) {
                            const name = nameResult.value;
                            if (this.loadNamedInfoArrayElement(name, infoArrayElementResult.value, namedInfoArrays)) {
                                loadedNames[loadedNameCount++] = name;
                            }
                        }
                    }
                }

                if (loadedNameCount !== count) {
                    this.loadMissingDefaults(loadedNames, namedInfoArrays);
                }
            }
        }
    }

    override save(element: JsonElement) {
        super.save(element);

        const namedInfoArrays = this.getNamedInfoArrays();
        const count = namedInfoArrays.length;
        const namedInfoArrayElements = new Array<JsonElement>(count);
        for (let i = 0; i < count; i++) {
            const namedInfoArray = namedInfoArrays[i];
            const namedInfoArrayElement = new JsonElement();
            namedInfoArrayElement.setString(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.name, namedInfoArray.name);
            const infoArrayElement = namedInfoArrayElement.newElement(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.infoArray);
            this.saveInfos(infoArrayElement, namedInfoArray.infoArray);
            namedInfoArrayElements[i] = namedInfoArrayElement;
        }

        element.setElementArray(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.namedInfoArrays, namedInfoArrayElements);
    }

    private loadDefaults(namedInfoArrays: TypedKeyValueArraySettingsGroup.NamedInfoArray[]) {
        for (const array of namedInfoArrays) {
            this.loadInfos(undefined, array.infoArray);
        }
    }

    private loadMissingDefaults(loadedNames: string[], namedInfoArrays: TypedKeyValueArraySettingsGroup.NamedInfoArray[]) {
        for (const namedInfoArray of namedInfoArrays) {
            const name = namedInfoArray.name;
            if (!loadedNames.includes(name)) {
                this.loadInfos(undefined, namedInfoArray.infoArray);
            }
        }
    }

    private loadNamedInfoArrayElement(
        name: string,
        infoArrayElement: JsonElement,
        namedInfoArrays: TypedKeyValueArraySettingsGroup.NamedInfoArray[]
    ) {
        const namedInfoArray = namedInfoArrays.find((array) => array.name === name);
        if (namedInfoArray === undefined) {
            return false;
        } else {
            this.loadInfos(infoArrayElement, namedInfoArray.infoArray);
            return true;
        }
    }

    private loadInfos(element: JsonElement | undefined, infos: TypedKeyValueSettings.Info[]) {
        const count = infos.length;
        for (let i = 0; i < count; i++) {
            const info = infos[i];
            const name = info.name;
            let jsonValue: string | undefined;
            if (element === undefined) {
                jsonValue = undefined;
            } else {
                const jsonValueResult = element.tryGetStringType(name);
                if (jsonValueResult.isErr()) {
                    jsonValue = undefined;
                } else {
                    jsonValue = jsonValueResult.value;
                }
            }
            const pushValue: TypedKeyValueSettings.PushValue = {
                info,
                value: jsonValue,
            };
            info.pusher(pushValue);
        }
    }

    private saveInfos(element: JsonElement, infos: TypedKeyValueSettings.Info[]) {
        const count = infos.length;
        for (let i = 0; i < count; i++) {
            const info = infos[i];
            const name = info.name;
            const value = info.getter();
            element.setString(name, value);
        }
    }

    protected abstract getNamedInfoArrays(): TypedKeyValueArraySettingsGroup.NamedInfoArray[];
}

export namespace TypedKeyValueArraySettingsGroup {
    export namespace InfosArrayJsonName {
        export const name = 'name';
        export const infoArray = 'infoArray';
        export const namedInfoArrays = 'namedInfoArrays';
    }

    export interface NamedInfoArray {
        name: string;
        infoArray: TypedKeyValueSettings.Info[];
    }

    export type IndexedNamedInfoArray = IndexSignatureHack<NamedInfoArray>;
}
