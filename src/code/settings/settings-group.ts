/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, Err, ErrorCode, Integer, JsonElement, Ok, Result } from '../sys/sys-internal-api';

export abstract class SettingsGroup {
    beginChangesEvent: SettingsGroup.BeginChangesEvent;
    endChangesEvent: SettingsGroup.EndChangesEvent;
    settingChangedEvent: SettingsGroup.SettingChangedEvent;

    constructor(
        readonly typeId: SettingsGroup.Type.Id,
        readonly name: string
    ) {
    }

    beginChanges() {
        this.beginChangesEvent();
    }

    endChanges() {
        this.endChangesEvent();
    }

    protected notifySettingChanged(settingId: Integer) {
        this.settingChangedEvent(settingId);
    }

    protected setSaveElementNameAndTypeId(element: JsonElement) {
        const name = this.name;
        const typeIdJsonValue = SettingsGroup.Type.idToJsonValue(this.typeId);

        element.setString(SettingsGroup.GroupJsonName.TypeId, typeIdJsonValue);
        element.setString(SettingsGroup.GroupJsonName.Name, name);
    }

    abstract load(userElement: JsonElement | undefined, operatorElement: JsonElement | undefined): void;
    abstract save(): SettingsGroup.SaveElements;
}

export namespace SettingsGroup {
    export type BeginChangesEvent = (this: void) => void;
    export type EndChangesEvent = (this: void) => void;
    export type SettingChangedEvent = (this: void, settingId: Integer) => void;

    export interface SaveElements {
        user: JsonElement | undefined;
        operator: JsonElement | undefined;
    }

    export const enum GroupJsonName {
        Name = 'groupName',
        TypeId = 'groupTypeId',
    }

    export function tryGetNameAndTypeId(element: JsonElement): Result<NameAndTypeId> {
        const nameResult = element.tryGetString(GroupJsonName.Name);
        if (nameResult.isErr()) {
            return nameResult.createOuter(ErrorCode.SettingGroup_ElementMissingName);
        } else {
            const name = nameResult.value;
            const jsonTypeIdResult = element.tryGetString(GroupJsonName.TypeId);
            if (jsonTypeIdResult.isErr()) {
                return jsonTypeIdResult.createOuter(`${ErrorCode.SettingGroup_ElementMissingTypeId}: ${name}`);
            } else {
                const jsonTypeId = jsonTypeIdResult.value;
                const typeId = Type.tryJsonValueToId(jsonTypeId);
                if (typeId === undefined) {
                    return new Err(`${ErrorCode.SettingGroup_ElementHasUnsupportedTypeId}: ${name}, ${jsonTypeId}`);
                } else {
                    return new Ok({
                        name,
                        typeId,
                    });
                }
            }
        }
    }

    export interface NameAndTypeId {
        name: string;
        typeId: Type.Id;
    }

    export namespace Type {
        export const enum Id {
            TypedKeyValue,
            Color,
        }

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            TypedKeyValue: {
                id: Id.TypedKeyValue,
                jsonValue: 'typedKeyValue',
            },
            Color: {
                id: Id.Color,
                jsonValue: 'color',
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SettingsGroup', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToName(id: Id) {
            return infos[id].jsonValue;
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(jsonValue: string) {
            const foundInfo = infos.find((info) => info.jsonValue === jsonValue);
            return foundInfo?.id;
        }
    }
}

export namespace SettingsGroupModule {
    export function initialiseStatic() {
        SettingsGroup.Type.initialise();
    }
}
