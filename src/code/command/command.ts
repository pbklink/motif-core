/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtStringId } from '../res/res-internal-api';
import { ExtensionHandle, Handle, Integer, ModifierKey } from '../sys/sys-internal-api';

export interface Command {
    readonly extensionHandle: ExtensionHandle;
    readonly name: string;
    readonly key: string;
    readonly registrationHandle: Handle;
    readonly defaultDisplayIndex: ExtStringId.Index;
    readonly defaultMenuBarItemPosition?: Command.MenuBarItemPosition;
    readonly defaultKeyboardShortcut?: Command.KeyboardShortcut;
}

export namespace Command {
    export type MenuBarMenuName = string;
    export type MenuBarMenuPath = readonly MenuBarMenuName[];

    export interface MenuBarItemPosition {
        readonly menuPath: MenuBarMenuPath;
        readonly rank: Integer;
    }

    const mapKeyPartsDelimiter = ':';

    export function generateMapKey(extensionHandle: ExtensionHandle, name: string): KeyboardShortcut.MapKey {
        return extensionHandle.toString(10) + mapKeyPartsDelimiter + name;
    }

    export function isKeyEqual(left: Command, right: Command) {
        return left.key === right.key;
    }

    export interface KeyboardShortcut {
        key: string;
        modifierKeys: ModifierKey.IdSet;
    }

    export namespace KeyboardShortcut {
        export type MapKey = string;

        export function createMapKey(shortcut: KeyboardShortcut): MapKey {
            return shortcut.modifierKeys.toString() + ':' + shortcut.key;
        }
    }
}
