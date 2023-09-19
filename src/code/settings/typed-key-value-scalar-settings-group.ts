/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, JsonElement, MultiEvent } from '../sys/sys-internal-api';
import { SettingsGroup } from './settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export abstract class TypedKeyValueScalarSettingsGroup extends SettingsGroup {
    private _getFormattedSettingValuesMultiEvent = new MultiEvent<TypedKeyValueScalarSettingsGroup.GetFormattedSettingValuesEventHandler>();
    private _pushFormattedSettingValuesMultiEvent = new MultiEvent<TypedKeyValueScalarSettingsGroup.PushFormattedSettingValuesEventHandler>();

    constructor(groupName: string) {
        super(SettingsGroup.Type.Id.TypedKeyValue, groupName);
    }

    protected abstract get idCount(): Integer;

    load(userElement: JsonElement | undefined, operatorElement: JsonElement | undefined) {
        const count = this.idCount;
        const pushValues = new Array<TypedKeyValueSettings.PushValue>(count);
        const formattedSettingValues = new Array<TypedKeyValueScalarSettingsGroup.FormattedSettingValue>(count);
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;

            const element = info.operator ? operatorElement : userElement;
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
            pushValues[i] = pushValue;
            const formattedSettingValue: TypedKeyValueScalarSettingsGroup.FormattedSettingValue = {
                id: info.id,
                formattedValue: jsonValue,
            };
            formattedSettingValues[i] = formattedSettingValue;
        }

        let allHandledIds = new Array<Integer>();
        const handlers = this._pushFormattedSettingValuesMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            const handler = handlers[index];
            const handledIds = handler(formattedSettingValues);
            allHandledIds = [...allHandledIds, ...handledIds];
        }

        const pushValueCount = pushValues.length;
        for (let i = 0; i < pushValueCount; i++) {
            const pushValue = pushValues[i];
            const info = pushValue.info;
            const id = info.id;
            if (!allHandledIds.includes(id)) {
                info.pusher(pushValue);
            }
        }
    }

    override save(): SettingsGroup.SaveElements {
        let allFormattedSettingValues = new Array<TypedKeyValueScalarSettingsGroup.FormattedSettingValue>();
        const handlers = this._getFormattedSettingValuesMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            const formattedSettingValues = handlers[index]();
            allFormattedSettingValues = [...allFormattedSettingValues, ...formattedSettingValues];
        }

        const count = this.idCount;
        let userElement: JsonElement | undefined;
        let operatorElement: JsonElement | undefined;
        for (let id = 0; id < count; id++) {
            const info = this.getInfo(id);
            const name = info.name;
            let formattedValue: string | undefined;
            const formattedSettingValue = allFormattedSettingValues.find((fsv) => fsv.id === id);
            if (formattedSettingValue !== undefined) {
                formattedValue = formattedSettingValue.formattedValue;
            } else {
                formattedValue = info.getter();
            }

            let element: JsonElement;
            if (info.operator) {
                if (operatorElement === undefined) {
                    operatorElement = new JsonElement();
                }
                element = operatorElement;
            } else {
                if (userElement === undefined) {
                    userElement = new JsonElement();
                }
                element = userElement;
            }
            element.setString(name, formattedValue);
        }

        if (userElement !== undefined) {
            this.setSaveElementNameAndTypeId(userElement);
        }
        if (operatorElement !== undefined) {
            this.setSaveElementNameAndTypeId(operatorElement);
        }

        return {
            user: userElement,
            operator: operatorElement,
        };
    }

    notifyFormattedSettingChanged(settingId: Integer) {
        this.notifySettingChanged(settingId);
    }

    subscribeGetFormattedSettingValuesEvent(handler: TypedKeyValueScalarSettingsGroup.GetFormattedSettingValuesEventHandler) {
        return this._getFormattedSettingValuesMultiEvent.subscribe(handler);
    }

    unsubscribeGetFormattedSettingValuesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._getFormattedSettingValuesMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePushFormattedSettingValuesEvent(handler: TypedKeyValueScalarSettingsGroup.PushFormattedSettingValuesEventHandler) {
        return this._pushFormattedSettingValuesMultiEvent.subscribe(handler);
    }

    unsubscribePushFormattedSettingValuesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._pushFormattedSettingValuesMultiEvent.unsubscribe(subscriptionId);
    }

    protected abstract getInfo(idx: Integer): TypedKeyValueSettings.Info;
}

export namespace TypedKeyValueScalarSettingsGroup {
    export interface FormattedSettingValue {
        id: Integer;
        formattedValue: string | undefined;
    }

    export type GetFormattedSettingValuesEventHandler = (this: void) => FormattedSettingValue[];
    export type PushFormattedSettingValuesEventHandler = (this: void, values: FormattedSettingValue[]) => readonly Integer[];
}
