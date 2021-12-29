/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtStringId, StringId } from '../res/res-internal-api';
import { ExtensionHandle, Handle } from '../sys/sys-internal-api';
import { Command } from './command';
import { InternalCommand } from './internal-command';

export class CommandRegisterService {
    private _internalExtensionHandle: ExtensionHandle;

    private readonly _registrations: CommandRegisterService.Registration[] = [];
    private readonly _registrationMap = new Map<string, CommandRegisterService.Registration>();

    get internalExtensionHandle() { return this._internalExtensionHandle; }

    setInternalExtensionHandle(value: ExtensionHandle) {
        this._internalExtensionHandle = value;
        // this._nullCommand = this.getOrRegisterInternalCommand(InternalCommand.Id.Null, StringId.InternalCommandDisplay_Null);
    }

    getCommand(extensionHandle: ExtensionHandle, name: string) {
        const key = Command.generateMapKey(extensionHandle, name);
        return this.getCommandByKey(key);
    }

    getOrRegisterCommand(
        extensionHandle: ExtensionHandle,
        name: string,
        defaultDisplayIndex: ExtStringId.Index,
        defaultMenuBarItemPosition?: Command.MenuBarItemPosition,
        defaultKeyboardShortcut?: Command.KeyboardShortcut
    ) {
        const key = Command.generateMapKey(extensionHandle, name);
        let command = this.getCommandByKey(key);
        if (command === undefined) {
            command = {
                extensionHandle,
                name,
                key,
                registrationHandle: this._registrations.length,
                defaultDisplayIndex,
                defaultMenuBarItemPosition,
                defaultKeyboardShortcut,
            } as const;

            const registration: CommandRegisterService.Registration = {
                command,
            };

            this._registrations.push(registration);
            this._registrationMap.set(key, registration);

        }
        return command;
    }

    getInternalCommand(name: string) {
        return this.getCommand(this._internalExtensionHandle, name) as InternalCommand;
    }

    getOrRegisterInternalCommand(id: InternalCommand.Id, displayId: StringId, menuBarItemPosition?: Command.MenuBarItemPosition) {
        const name = InternalCommand.idToNameId(id);
        const defaultKeyboardShortcut = InternalCommand.idToDefaultKeyboardShortcut(id);
        return this.getOrRegisterCommand(this._internalExtensionHandle,
            name, displayId, menuBarItemPosition, defaultKeyboardShortcut) as InternalCommand;
    }

    private getCommandByKey(key: string) {
        const registration = this._registrationMap.get(key);
        return registration === undefined ? undefined : registration.command;
    }
}

export namespace CommandRegisterService {
    export type RegistrationHandle = Handle;

    export interface Registration {
        readonly command: Command;
    }

    // export function isNullCommand(command: Command) {
    //     return command.name === InternalCommand.NameId.Null;
    // }
}
