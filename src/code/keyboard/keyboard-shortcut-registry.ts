/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandContext } from '../command-context/command-context-internal-api';
import { Command } from '../command/command-internal-api';

export class KeyboardShortcutRegistry {
    private readonly _shortcutEntries = new Array<KeyboardShortcutRegistry.Entry>();
    private readonly _shortcutEntryMap = new Map<string, KeyboardShortcutRegistry.Entry>();

    registerCommandShortcut(shortcut: Command.KeyboardShortcut, contextualCommand: CommandContext.ContextualCommand) {
        const shortcutMapKey = Command.KeyboardShortcut.createMapKey(shortcut);
        const existingEntry = this._shortcutEntryMap.get(shortcutMapKey);
        if (existingEntry === undefined) {
            const newEntry = new KeyboardShortcutRegistry.Entry(shortcut, contextualCommand);
            this._shortcutEntries.push(newEntry);
            this._shortcutEntryMap.set(shortcutMapKey, newEntry);
        } else {
            existingEntry.addCommand(contextualCommand);
        }
    }

    deregisterShortcut(shortcut: Command.KeyboardShortcut, contextualCommand: CommandContext.ContextualCommand) {
        const shortcutMapKey = Command.KeyboardShortcut.createMapKey(shortcut);
        const existingEntry = this._shortcutEntryMap.get(shortcutMapKey);
        if (existingEntry !== undefined) {
            existingEntry.removeCommand(contextualCommand);
        }
    }

    findCommands(shortcut: Command.KeyboardShortcut) {
        const shortcutMapKey = Command.KeyboardShortcut.createMapKey(shortcut);
        const entry = this._shortcutEntryMap.get(shortcutMapKey);
        if (entry === undefined) {
            return [];
        } else {
            return entry.commands;
        }
    }
}

export namespace KeyboardShortcutRegistry {
    export class Entry {
        private readonly _commands: CommandContext.ContextualCommand[];

        constructor(
            private readonly _shortcut: Command.KeyboardShortcut,
            initialCommand: CommandContext.ContextualCommand
        ) {
            this._commands = [initialCommand];
        }

        get commands(): readonly CommandContext.ContextualCommand[] { return this._commands; }

        includesCommand(command: CommandContext.ContextualCommand) {
            for (const existingCommand of this._commands) {
                if (CommandContext.ContextualCommand.isKeyEqual(existingCommand, command)) {
                    return true;
                }
            }
            return false;
        }

        addCommand(command: CommandContext.ContextualCommand) {
            if (!this.includesCommand(command)) {
                this._commands.push(command);
            }
        }

        removeCommand(command: CommandContext.ContextualCommand) {
            const existingCommandCount = this._commands.length;
            for (let i = 0; i < existingCommandCount; i++) {
                const existingCommand = this._commands[i];
                if (CommandContext.ContextualCommand.isKeyEqual(existingCommand, command)) {
                    this._commands.splice(i, 1);
                    return;
                }
            }
        }
    }
}
