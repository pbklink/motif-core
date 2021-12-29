/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command } from '../command/command-internal-api';
import { StringId } from '../res/res-internal-api';
import { ExtensionHandle, ExtensionOrInternalError, ExternalError, SysTick } from '../sys/sys-internal-api';
import { CommandUiAction, UiAction } from '../ui-action/ui-action-internal-api';
import { Cancellable } from './cancellable';

export class CommandContext {
    private readonly _actions = new Array<CommandUiAction>();

    readonly timestampedCancellables = new Array<CommandContext.TimestampedCancellable>();

    constructor (
        public readonly id: CommandContext.Id,
        public readonly displayId: StringId,
        public readonly htmlElement: HTMLElement,
        private readonly _multipleActionsResolveEventer: CommandContext.MultipleActionsResolveEventer,
        private readonly _inheritedContext?: CommandContext,
    ) {

    }

    addAction(action: CommandUiAction) {
        if (!this._actions.includes(action)) {
            this._actions.push(action);
        }
    }

    removeAction(action: CommandUiAction) {
        const index = this._actions.indexOf(action);
        if (index >= 0) {
            this._actions.splice(index, 1);
        }
    }

    addCancellable(cancellable: Cancellable) {
        const timestampedCancellable: CommandContext.TimestampedCancellable = {
            cancellable,
            timestamp: SysTick.now(),
        }
        this.timestampedCancellables.push(timestampedCancellable);
    }

    removeCancellable(cancellable: Cancellable) {
        const index = this.timestampedCancellables.findIndex(
            (timestampedCancellable) => timestampedCancellable.cancellable === cancellable
        );

        if (index < 0) {
            throw new ExtensionOrInternalError(ExternalError.Code.CancellableNotFound, cancellable.name);
        } else {
            this.timestampedCancellables.splice(index, 1);
        }
    }

    resolveContextualCommandsToAction(contextualCommands: readonly CommandContext.ContextualCommand[]) {
        const maxCount = contextualCommands.length
        const enabledActions = new Array<CommandUiAction>(maxCount);
        let aDisabledAction: CommandUiAction | undefined;
        let count = 0;

        for (const contextualCommand of contextualCommands) {
            const action = this.resolveContextualCommandToAction(contextualCommand);
            if (action !== undefined) {
                if (action.stateId === UiAction.StateId.Disabled) {
                    aDisabledAction = action;
                } else {
                    enabledActions[count++] = action;
                }
            }
        }

        switch (count) {
            case 0: return aDisabledAction; // if we only found disabled actions, then return one disabled action so that not propagated
            case 1: return enabledActions[0];
            default: {
                enabledActions.length = count;

                return this._multipleActionsResolveEventer(enabledActions);
            }
        }
    }

    resolveContextualCommandToAction(contextualCommand: CommandContext.ContextualCommand) {
        let action: CommandUiAction | undefined;
        if (CommandContext.Id.isEqual(contextualCommand.contextId, this.id)) {
            action = this.findAction(contextualCommand);
        } else {
            if (this._inheritedContext !== undefined) {
                action = this._inheritedContext.resolveContextualCommandToAction(contextualCommand);
            } else {
                action = undefined;
            }
        }

        return action;
    }

    private findAction(command: Command) {
        for (const action of this._actions) {
            if (action.command === command) {
                return action;
            }
        }

        return undefined;
    }
}

export namespace CommandContext {
    export type CancellableAddedEventer = (this: void, cancellable: Cancellable) => void;
    export type CancellableRemovedEventer = (this: void, cancellable: Cancellable) => void;
    export type MultipleActionsResolveEventer = (this: void, actions: CommandUiAction[]) => CommandUiAction | undefined;

    export interface Id {
        readonly extensionHandle: ExtensionHandle;
        readonly name: string;
    }

    export namespace Id {
        export function isEqual(left: Id, right: Id) {
            return left.name === right.name && left.extensionHandle === right.extensionHandle;
        }
    }

    export interface ContextualCommand extends Command {
        contextId: Id
    }

    export namespace ContextualCommand {
        export function isKeyEqual(left: ContextualCommand, right: ContextualCommand) {
            return Command.isKeyEqual(left, right) && Id.isEqual(left.contextId, right.contextId);
        }
    }

    export interface TimestampedCancellable {
        cancellable: Cancellable;
        timestamp: SysTick.Time;
    }
}
