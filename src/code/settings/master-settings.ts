/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer } from '../sys/sys-internal-api';
import { TypedKeyValueScalarSettingsGroup } from './typed-key-value-scalar-settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export class MasterSettings extends TypedKeyValueScalarSettingsGroup {
    private _applicationUserEnvironmentSelectorId = MasterSettings.Default.applicationUserEnvironmentSelectorId;

    private _infosObject: MasterSettings.InfosObject = {
        ApplicationUserEnvironmentSelectorId: { id: MasterSettings.Id.ApplicationUserEnvironmentSelectorId,
            name: 'applicationUserEnvironmentSelectorId',
            operator: false,
            defaulter: () => this.formatApplicationUserEnvironmentSelectorId(MasterSettings.Default.applicationUserEnvironmentSelectorId),
            getter: () => this.formatApplicationUserEnvironmentSelectorId(this._applicationUserEnvironmentSelectorId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._applicationUserEnvironmentSelectorId = this.parseApplicationUserEnvironmentSelectorId(value);
            }
        },
    } as const;

    private readonly _infos = Object.values(this._infosObject);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly idCount = this._infos.length;

    constructor() {
        super(MasterSettings.groupName);
    }

    get applicationUserEnvironmentSelectorId() { return this._applicationUserEnvironmentSelectorId; }
    set applicationUserEnvironmentSelectorId(value: Integer) {
        this._applicationUserEnvironmentSelectorId = value;
        this.notifySettingChanged(MasterSettings.Id.ApplicationUserEnvironmentSelectorId);
    }

    protected getInfo(idx: Integer) {
        return this._infos[idx];
    }

    private formatApplicationUserEnvironmentSelectorId(value: MasterSettings.ApplicationUserEnvironmentSelector.SelectorId) {
        return MasterSettings.ApplicationUserEnvironmentSelector.idToSettingValue(value);
    }

    private parseApplicationUserEnvironmentSelectorId(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultApplicationUserEnvironmentSelectorId(info);
        } else {
            const parsedValue = MasterSettings.ApplicationUserEnvironmentSelector.trySettingValueToId(value);
            if (parsedValue === undefined) {
                return this.parseDefaultApplicationUserEnvironmentSelectorId(info);
            } else {
                return parsedValue;
            }
        }
    }

    private parseDefaultApplicationUserEnvironmentSelectorId(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('MSPDAESIU2228111', defaultValueText);
        } else {
            const parsedDefaultValue = MasterSettings.ApplicationUserEnvironmentSelector.trySettingValueToId(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('MSPDAESIV2228111', parsedDefaultValue);
            }
        }
    }
}

export namespace MasterSettings {
    export const groupName = 'master';

    export const enum Id {
        ApplicationUserEnvironmentSelectorId,
    }

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };

    export namespace Default {
        export const applicationUserEnvironmentSelectorId = ApplicationUserEnvironmentSelector.SelectorId.DataEnvironment;
    }

    export namespace ApplicationUserEnvironmentSelector {
        export const enum SelectorId {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            Default,
            DataEnvironment,
            DataEnvironment_Sample,
            DataEnvironment_Demo,
            DataEnvironment_DelayedProduction,
            DataEnvironment_Production,
            Test,
        }

        export const enum SettingValue {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            Default = 'default',
            DataEnvironment = 'exchangeEnvironment',
            DataEnvironment_Sample = 'exchangeEnvironment_Sample',
            DataEnvironment_Demo = 'exchangeEnvironment_Demo',
            DataEnvironment_DelayedProduction = 'exchangeEnvironment_Delayed',
            DataEnvironment_Production = 'exchangeEnvironment_Production',
            Test = 'test',
        }

        export const defaultId = SelectorId.Default;

        interface Info {
            readonly id: SelectorId;
            readonly settingValue: string;
            readonly displayId: StringId;
            readonly titleId: StringId;
        }

        type SelectorInfosObject = { [id in keyof typeof SelectorId]: Info };

        const selectorInfosObject: SelectorInfosObject = {
            Default: {
                id: SelectorId.Default,
                settingValue: SettingValue.Default,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_Default,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_Default,
            },
            DataEnvironment: {
                id: SelectorId.DataEnvironment,
                settingValue: SettingValue.DataEnvironment,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_DataEnvironment,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_DataEnvironment,
            },
            DataEnvironment_Sample: {
                id: SelectorId.DataEnvironment_Sample,
                settingValue: SettingValue.DataEnvironment_Sample,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_DataEnvironment_Sample,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_DataEnvironment_Sample,
            },
            DataEnvironment_Demo: {
                id: SelectorId.DataEnvironment_Demo,
                settingValue: SettingValue.DataEnvironment_Demo,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_DataEnvironment_Demo,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_DataEnvironment_Demo,
            },
            DataEnvironment_DelayedProduction: {
                id: SelectorId.DataEnvironment_DelayedProduction,
                settingValue: SettingValue.DataEnvironment_DelayedProduction,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_DataEnvironment_Delayed,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_DataEnvironment_Delayed,
            },
            DataEnvironment_Production: {
                id: SelectorId.DataEnvironment_Production,
                settingValue: SettingValue.DataEnvironment_Production,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_DataEnvironment_Production,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_DataEnvironment_Production,
            },
            Test: {
                id: SelectorId.Test,
                settingValue: SettingValue.Test,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_Test,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_Test,
            },
        } as const;

        export const idCount = Object.keys(selectorInfosObject).length;
        const infos = Object.values(selectorInfosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ApplicationEnvironmentSelector', outOfOrderIdx, Strings[infos[outOfOrderIdx].displayId]);
            }
        }

        export function idToSettingValue(id: SelectorId) {
            return infos[id].settingValue;
        }

        export function trySettingValueToId(value: string) {
            const foundInfo = infos.find((info) => info.settingValue === value);
            return foundInfo?.id;
        }

        export function idToDisplayId(id: SelectorId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: SelectorId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToTitleId(id: SelectorId) {
            return infos[id].titleId;
        }

        export function idToDescription(id: SelectorId) {
            return Strings[idToTitleId(id)];
        }
    }
}

export namespace MasterSettingsModule {
    export function initialiseStatic() {
        MasterSettings.ApplicationUserEnvironmentSelector.initialise();
    }
}
