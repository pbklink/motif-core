/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, JsonElement, Logger, MultiEvent } from '../sys/sys-internal-api';
import { ColorSettings } from './color-settings';
import { ExchangeSettings } from './exchange-settings';
import { ExchangesSettings } from './exchanges-settings';
import { MasterSettings } from './master-settings';
import { ScalarSettings } from './scalar-settings';
import { SettingsGroup } from './settings-group';

export class SettingsService {
    private _registeredGroups = new Array<SettingsGroup>();
    private _beginMasterChangesCount = 0;
    private _masterChanged = false;
    private _beginChangesCount = 0;
    private _changed = false;
    private _changedSettings: SettingsService.GroupSetting[] = [];
    private _saveRequired = false;
    private _restartRequired = false;

    private _master: MasterSettings; // not registered
    private _scalar: ScalarSettings;
    private _color: ColorSettings;
    private _exchanges: ExchangesSettings;

    private _masterChangedMultiEvent = new MultiEvent<SettingsService.ChangedEventHandler>();
    private _changedMultiEvent = new MultiEvent<SettingsService.ChangedEventHandler>();

    constructor() {
        // automatically create master group but handle differently from others.
        this._master = new MasterSettings();
        this._master.beginChangesEvent = () => { this.handleMasterBeginChangesEvent(); };
        this._master.endChangesEvent = () => { this.handleMasterEndChangesEvent(); };
        this._master.settingChangedEvent = (settingId) => { this.handleMasterSettingChangedEvent(settingId); };

        // automatically create and register some groups
        this._scalar = new ScalarSettings();
        this.register(this._scalar);
        this._color = new ColorSettings();
        this.register(this._color);
        this._exchanges = new ExchangesSettings();
        this.register(this._exchanges);
    }

    get saveRequired() { return this._saveRequired; }
    get restartRequired() { return this._restartRequired; }
    get master() { return this._master; }
    get scalar() { return this._scalar; }
    get exchanges() { return this._exchanges; }
    get color() { return this._color; }

    register(group: SettingsGroup) {
        const existingGroup = this.getRegisteredGroup(group.name);
        if (existingGroup !== undefined) {
            // group with this name already exists
            return undefined;
        } else {
            group.beginChangesEvent = () => { this.handleBeginChangesEvent(); };
            group.endChangesEvent = () => { this.handleEndChangesEvent(); };
            group.settingChangedEvent = (settingId) => { this.handleSettingChangedEvent(group, settingId); };

            const count = this._registeredGroups.push(group);

            return count - 1;
        }
    }

    load(userElement: JsonElement | undefined, operatorElement: JsonElement | undefined) {
        let loadFlaggedAsChange = false;

        this.beginChanges();
        try {
            // We have 2 elements (userElement and operatorElement) which both contain an array of group elements
            // Each group element has a name and typeId
            // A group element with a specific name could be in both, either or neither of the 2 elements.
            // We need to extract the group elements from both 2 elements and then match the ones with the same name.
            // Then each group can be loaded using the matched group elements.
            const loadingGroups = new Array<SettingsService.LoadingGroup>();
            let loadingGroupCount = 0;

            if (userElement !== undefined) {
                // Put group elements into loadingGroups array
                const groupElementsResult = userElement.tryGetElementArray(SettingsService.JsonName.Groups);
                if (groupElementsResult.isErr()) {
                    Logger.logWarning('Settings: User element groups error. Index: ' + groupElementsResult.error.toString());
                } else {
                    const groupElements = groupElementsResult.value;
                    const maxCount = groupElements.length;
                    loadingGroups.length = maxCount + 10; // allow for extra operator only groups
                    for (const groupElement of groupElements) {
                        const nameAndTypeIdResult = SettingsGroup.tryGetNameAndTypeId(groupElement);
                        if (nameAndTypeIdResult.isErr()) {
                            Logger.logWarning('Settings: Error loading user element: ' + nameAndTypeIdResult.error);
                        } else {
                            const { name, typeId } = nameAndTypeIdResult.value;
                            if (SettingsService.LoadingGroup.arrayIncludesName(loadingGroups, loadingGroupCount, name)) {
                                Logger.logWarning('Settings: Duplicate user group element name: ' + name);
                            } else {
                                const loadingGroup: SettingsService.LoadingGroup = {
                                    name,
                                    typeId,
                                    userElement: groupElement,
                                    operatorElement: undefined,
                                };
                                loadingGroups[loadingGroupCount++] = loadingGroup;
                            }
                        }
                    }
                }
            }

            if (operatorElement !== undefined) {
                // Get group elements and either match with existing in loadingGroups array or add as a new group
                const groupElementsResult = operatorElement.tryGetElementArray(SettingsService.JsonName.Groups);
                if (groupElementsResult.isErr()) {
                    Logger.logWarning('Settings: Operator element groups error. Index: ' + groupElementsResult.error.toString());
                } else {
                    const groupElements = groupElementsResult.value;
                    for (const groupElement of groupElements) {
                        const nameAndTypeIdResult = SettingsGroup.tryGetNameAndTypeId(groupElement);
                        if (nameAndTypeIdResult.isErr()) {
                            Logger.logWarning('Settings: Error loading operator element: ' + nameAndTypeIdResult.error);
                        } else {
                            const { name, typeId } = nameAndTypeIdResult.value;
                            const index = SettingsService.LoadingGroup.indexOfNameInArray(loadingGroups, loadingGroupCount, name);
                            if (index >= 0) {
                                const loadingGroup = loadingGroups[index];
                                if (loadingGroup.typeId !== typeId) {
                                    Logger.logWarning('Settings: Operator and User typeId do not match: ' + name);
                                } else {
                                    loadingGroup.operatorElement = groupElement;
                                }
                            } else {
                                const loadingGroup: SettingsService.LoadingGroup = {
                                    name,
                                    typeId,
                                    userElement: undefined,
                                    operatorElement: groupElement,
                                }
                                if (loadingGroupCount >= loadingGroups.length) {
                                    loadingGroups.length += 15;
                                }
                                loadingGroups[loadingGroupCount++] = loadingGroup;
                            }
                        }
                    }
                }
            }
            loadingGroups.length = loadingGroupCount;

            const loadedGroups = new Array<SettingsGroup>(loadingGroupCount);
            let loadedGroupCount = 0;

            // Can now load groups
            for (const loadingGroup of loadingGroups) {
                const name = loadingGroup.name;
                const group = this.getRegisteredGroup(name);
                if (group === undefined) {
                    Logger.logWarning('Settings: Loading group is not registered: ' + name);
                } else {
                    const typeId = loadingGroup.typeId;
                    if (group.typeId !== typeId) {
                        Logger.logWarning(
                            `Settings: Loading group type does not match registered group type: ${name},` +
                            `${SettingsGroup.Type.idToName(typeId)}, ${SettingsGroup.Type.idToName(group.typeId)},`
                        );
                    } else {
                        group.load(loadingGroup.userElement, loadingGroup.operatorElement);
                        loadedGroups[loadedGroupCount++] = group;
                    }
                }
            }

            // For registered groups which were not included in either JSON element, load that group with defaults
            for (const group of this._registeredGroups) {
                if (!loadedGroups.includes(group)) {
                    // load defaults
                    group.load(undefined, undefined);
                }
            }

            loadFlaggedAsChange = this._changed;
        } finally {
            this.endChanges();
        }

        if (!loadFlaggedAsChange) {
            // make sure notifyChanged() is called
            this.notifyChanged();
        }
    }

    save(): SettingsService.SaveElements {
        const groupCount = this._registeredGroups.length;
        const userGroupElements = new Array<JsonElement>(groupCount);
        let userGroupCount = 0;
        const operatorGroupElements = new Array<JsonElement>(groupCount);
        let operatorGroupCount = 0;
        for (let i = 0; i < groupCount; i++) {
            const group = this._registeredGroups[i];
            const { user: userGroupElement, operator: operatorGroupElement } = group.save();
            if (userGroupElement !== undefined) {
                userGroupElements[userGroupCount++] = userGroupElement;
            }
            if (operatorGroupElement !== undefined) {
                operatorGroupElements[operatorGroupCount++] = operatorGroupElement;
            }
        }

        let userElement: JsonElement | undefined;
        if (userGroupCount > 0) {
            userGroupElements.length = userGroupCount;
            userElement = new JsonElement();
            userElement.setElementArray(SettingsService.JsonName.Groups, userGroupElements);
        }
        let operatorElement: JsonElement | undefined;
        if (operatorGroupCount > 0) {
            operatorGroupElements.length = operatorGroupCount;
            operatorElement = new JsonElement();
            operatorElement.setElementArray(SettingsService.JsonName.Groups, operatorGroupElements);
        }

        return {
            user: userElement,
            operator: operatorElement,
        };
    }

    reportSaved() {
        this._saveRequired = false;
    }

    hasSymbolNameFieldIdChanged() {
        for (const {group, id} of this._changedSettings) {
            if (group === this.exchanges && id as ExchangeSettings.Id === ExchangeSettings.Id.SymbolNameFieldId) {
                return true;
            }
        }
        return false;
    }

    subscribeMasterSettingsChangedEvent(handler: SettingsService.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._masterChangedMultiEvent.subscribe(handler);
    }

    unsubscribeMasterSettingsChangedEvent(id: MultiEvent.SubscriptionId): void {
        this._masterChangedMultiEvent.unsubscribe(id);
    }

    subscribeSettingsChangedEvent(handler: SettingsService.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeSettingsChangedEvent(id: MultiEvent.SubscriptionId): void {
        this._changedMultiEvent.unsubscribe(id);
    }

    private handleMasterBeginChangesEvent() {
        this.beginMasterChanges();
    }

    private handleMasterEndChangesEvent() {
        this.endMasterChanges();
    }

    private handleMasterSettingChangedEvent(settingId: Integer) {
        this.beginMasterChanges();
        try {
            this._masterChanged = true;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (settingId as MasterSettings.Id === MasterSettings.Id.ApplicationUserEnvironmentSelectorId) {
                this._restartRequired = true;
            }
        } finally {
            this.endMasterChanges();
        }
    }

    private handleBeginChangesEvent() {
        this.beginChanges();
    }

    private handleEndChangesEvent() {
        this.endChanges();
    }

    private handleSettingChangedEvent(group: SettingsGroup, settingId: Integer) {
        const groupSetting: SettingsService.GroupSetting = {
            group,
            id: settingId,
        };
        this._changedSettings.push(groupSetting);

        this.beginChanges();
        try {
            this._changed = true;
        } finally {
            this.endChanges();
        }
    }

    private notifyMasterChanged() {
        const handlers = this._masterChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyChanged() {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
        this._changedSettings.length = 0;
    }

    private getRegisteredGroup(name: string) {
        const count = this._registeredGroups.length;
        for (let i = 0; i < count; i++) {
            const group = this._registeredGroups[i];
            if (group.name === name) {
                return group;
            }
        }
        return undefined;
    }

    private beginMasterChanges() {
        this._beginMasterChangesCount++;
    }

    private endMasterChanges() {
        this._beginMasterChangesCount--;
        if (this._beginMasterChangesCount === 0) {
            if (this._masterChanged) {
                this.notifyMasterChanged();
                this._masterChanged = false;
            }
        }
    }

    private beginChanges() {
        this._beginChangesCount++;
    }

    private endChanges() {
        this._beginChangesCount--;
        if (this._beginChangesCount === 0) {
            if (this._changed) {
                this._saveRequired = true;
                this.notifyChanged();
                this._changed = false;
            }
        }
    }
}

export namespace SettingsService {
    export type RegistryEntry = SettingsGroup | undefined;

    export interface GroupSetting {
        group: SettingsGroup;
        id:  Integer;
    }

    export interface LoadingGroup {
        name: string;
        typeId: SettingsGroup.Type.Id;
        userElement: JsonElement | undefined;
        operatorElement: JsonElement | undefined;
    }

    export namespace LoadingGroup {
        export function arrayIncludesName(array: readonly LoadingGroup[], count: Integer, name: string) {
            const index = indexOfNameInArray(array, count, name);
            return index >= 0;
        }

        export function indexOfNameInArray(array: readonly LoadingGroup[], count: Integer, name: string) {
            for (let i = 0; i < count; i++) {
                const group = array[i];
                if (group.name === name) {
                    return i;
                }
            }
            return -1;
        }
    }


    export interface SaveElements {
        user: JsonElement | undefined;
        operator: JsonElement | undefined;
    }

    export type ChangedEventHandler = (this: void) => void;

    export const enum JsonName {
        Groups = 'groups',
    }
}
