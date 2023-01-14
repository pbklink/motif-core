/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, JsonElement } from '../sys/sys-internal-api';
import { SettingsGroup } from './settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export abstract class TypedKeyValueSettingsGroup extends SettingsGroup {
    constructor(groupName: string) {
        super(SettingsGroup.Type.Id.TypedKeyValue, groupName);
    }

    protected abstract get idCount(): Integer;

    load(element: JsonElement | undefined) {
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
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

    override save(element: JsonElement) {
        super.save(element);
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;
            const value = info.getter();
            element.setString(name, value);
        }
    }

    protected abstract getInfo(idx: Integer): TypedKeyValueSettings.Info;
}
