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

    override load(userElement: JsonElement | undefined, operatorElement: JsonElement | undefined) {
        this.loadElement(userElement, false);
        this.loadElement(operatorElement, true);
    }

    override save(): SettingsGroup.SaveElements {
        const userElement = this.createSaveElement(false);
        const operatorElement = this.createSaveElement(true);
        return {
            user: userElement,
            operator: operatorElement,
        };
    }

    private loadElement(element: JsonElement | undefined, operator: boolean) {
        const requiredNamedInfoArrays = this.getNamedInfoArrays(operator);
        if (element === undefined) {
            this.loadDefaults(requiredNamedInfoArrays);
        } else {
            const namedInfoArrayElementsResult = element.tryGetElementArray(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.namedInfoArrays);
            if (namedInfoArrayElementsResult.isErr()) {
                this.loadDefaults(requiredNamedInfoArrays);
            } else {
                const namedInfoArrayElements = namedInfoArrayElementsResult.value;
                const count = namedInfoArrayElements.length;
                const loadedNames = new Array<string>(count);
                let loadedNameCount = 0;
                for (const namedInfoArrayElement of namedInfoArrayElements) {
                    const nameResult = namedInfoArrayElement.tryGetString(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.name);
                    if (nameResult.isOk()) {
                        const infoArrayElementResult = namedInfoArrayElement.tryGetElement(
                            TypedKeyValueArraySettingsGroup.InfosArrayJsonName.infoArray
                        );
                        if (infoArrayElementResult.isOk()) {
                            const name = nameResult.value;
                            if (this.loadNamedInfoArrayElement(name, infoArrayElementResult.value, requiredNamedInfoArrays)) {
                                loadedNames[loadedNameCount++] = name;
                            }
                        }
                    }
                }

                if (loadedNameCount !== count) {
                    this.loadMissingDefaults(loadedNames, requiredNamedInfoArrays);
                }
            }
        }
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
                const jsonValueResult = element.tryGetString(name);
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

    private createSaveElement(operator: boolean): JsonElement | undefined {
        const namedInfoArrays = this.getNamedInfoArrays(operator);
        const namedInfoArrayCount = namedInfoArrays.length;
        if (namedInfoArrayCount === 0) {
            return undefined;
        } else {
            const namedInfoArrayElements = new Array<JsonElement>(namedInfoArrayCount);
            for (let i = 0; i < namedInfoArrayCount; i++) {
                const namedInfoArray = namedInfoArrays[i];

                const namedInfoArrayElement = new JsonElement();
                namedInfoArrayElement.setString(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.name, namedInfoArray.name);
                const infoArrayElement = namedInfoArrayElement.newElement(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.infoArray);
                this.saveInfos(infoArrayElement, namedInfoArray.infoArray);
                namedInfoArrayElements[i] = namedInfoArrayElement;
            }

            const result = new JsonElement();
            result.setElementArray(TypedKeyValueArraySettingsGroup.InfosArrayJsonName.namedInfoArrays, namedInfoArrayElements);
            this.setSaveElementNameAndTypeId(result);

            return result;
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

    protected abstract getNamedInfoArrays(operator: boolean): TypedKeyValueArraySettingsGroup.NamedInfoArray[];
}

export namespace TypedKeyValueArraySettingsGroup {
    export namespace InfosArrayJsonName {
        export const name = 'name';
        export const infoArray = 'infoArray';
        export const namedInfoArrays = 'namedInfoArrays';
    }

    export interface NamedInfoArray {
        name: string;
        operator: boolean; // All info.operator in infoArray must match this
        infoArray: TypedKeyValueSettings.Info[];
    }

    export type IndexedNamedInfoArray = IndexSignatureHack<NamedInfoArray>;
}
