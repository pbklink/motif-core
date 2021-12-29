/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandContext } from '../command-context/command-context-internal-api';
import { Command } from '../command/command';
import { extStrings } from '../res/ext-strings';
import { ExtensionOrInternalError, ExternalError } from '../sys/external-error';
import { compareInteger, Integer, ModifierKey, SysTick } from '../sys/sys-internal-api';
import { UiAction } from '../ui-action/ui-action-internal-api';
import { KeyboardShortcutRegistry } from './keyboard-shortcut-registry';

/** @public */
export class KeyboardService {
    private readonly _keyboardShortcutRegistry = new KeyboardShortcutRegistry();
    private readonly _commandContextRegistations = new Array<KeyboardService.CommandContextRegistration>();
    private readonly _bubblingCancellableContexts = new Array<CommandContext>();

    private _rootCommandContext: CommandContext;

    get rootCommandContext() { return this._rootCommandContext; }

    registerCommandContext(context: CommandContext, root = false) {
        const registration: KeyboardService.CommandContextRegistration = {
            context,
            keyboardBubblingEventListener: (event) => this.handleBubblingKeydownEvent(event, registration),
            keyboardCaptureEventListener: (event) => this.handleCaptureKeydownEvent(event, registration),
            root,
        }

        this._commandContextRegistations.push(registration);

        context.htmlElement.addEventListener('keydown', registration.keyboardBubblingEventListener);
        if (root) {
            context.htmlElement.addEventListener('keydown', registration.keyboardBubblingEventListener, { capture: true });
            this._rootCommandContext = context;
        }
    }

    deregisterCommandContext(context: CommandContext) {
        const index = this._commandContextRegistations.findIndex((registration) => registration.context === context);
        if (index < 0) {
            throw new ExtensionOrInternalError(
                ExternalError.Code.CommandContextNotRegistered,
                extStrings[context.id.extensionHandle][context.displayId]
            );
        } else {
            const registration = this._commandContextRegistations[index];
            if (registration.root) {
                context.htmlElement.removeEventListener('keydown', registration.keyboardCaptureEventListener, { capture: true });
            }
            context.htmlElement.removeEventListener('keydown', registration.keyboardBubblingEventListener);

            this._commandContextRegistations.splice(index, 1);
        }
    }

    private handleCaptureKeydownEvent(event: KeyboardEvent, registration: KeyboardService.CommandContextRegistration) {
        if (registration.root) {
            this._bubblingCancellableContexts.length = 0;
        }
    }

    private handleBubblingKeydownEvent(event: KeyboardEvent, registration: KeyboardService.CommandContextRegistration) {
        let handled = this.tryProcessShortcut(event, registration.context);
        if (!handled) {
            if (event.key === 'Escape') {
                handled = this.tryProcessCancellable(registration);
            }
        }

        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    private tryProcessShortcut(event: KeyboardEvent, context: CommandContext) {
        const modifierKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
        const shortcut: Command.KeyboardShortcut = {
            key: event.key,
            modifierKeys,
        };

        const contextualCommands = this._keyboardShortcutRegistry.findCommands(shortcut);
        const commandCount = contextualCommands.length;
        if (commandCount > 0) {
            const action = context.resolveContextualCommandsToAction(contextualCommands);
            if (action !== undefined) {
                if (action.stateId !== UiAction.StateId.Disabled) {
                    action.signal(UiAction.SignalTypeId.KeyboardShortcut, modifierKeys);
                }
                return true;
            }
        }

        return false;
    }

    private tryProcessCancellable(registration: KeyboardService.CommandContextRegistration) {
        if (registration.context.timestampedCancellables.length > 0) {
            this._bubblingCancellableContexts.push(registration.context);
        }

        if (registration.root) {
            const bubblingCancellableContextCount = this._bubblingCancellableContexts.length;

            if (bubblingCancellableContextCount > 0) {
                interface SortableCancellable extends CommandContext.TimestampedCancellable {
                    bubblingOrder: Integer;
                }

                let sortableCancellables: SortableCancellable[] | undefined;
                for (let i = 0; i < bubblingCancellableContextCount; i++) {
                    const context = this._bubblingCancellableContexts[i];
                    const contextCancellables = context.timestampedCancellables;

                    if (contextCancellables.length > 0) {
                        const contextSortableCancellables: SortableCancellable[] = contextCancellables.map((contextCancellable) => ({
                            ...contextCancellable,
                            bubblingOrder: i,
                        }));

                        if (sortableCancellables === undefined) {
                            sortableCancellables = contextSortableCancellables;
                        } else {
                            sortableCancellables = [...sortableCancellables, ...contextSortableCancellables];
                        }
                    }
                }

                if (sortableCancellables !== undefined) {
                    sortableCancellables.sort(
                        (left, right) => {
                            let result: Integer;
                            result = compareInteger(left.cancellable.priority, right.cancellable.priority);
                            if (result === 0) {
                                result = compareInteger(left.bubblingOrder, right.bubblingOrder);
                                if (result === 0) {
                                    result = SysTick.compare(left.timestamp, right.timestamp);
                                }
                            }

                            return result;
                        }
                    );

                    const highestPrioritySortableCancellable = sortableCancellables[0];
                    highestPrioritySortableCancellable.cancellable.cancel();
                    return true;
                }
            }
        }

        return false;
    }
}

/** @public */
export namespace KeyboardService {
    export type KeyboardEventListener = (event: KeyboardEvent) => void
    export interface CommandContextRegistration {
        context: CommandContext;
        keyboardBubblingEventListener: KeyboardEventListener;
        keyboardCaptureEventListener: KeyboardEventListener;
        root: boolean;
    }
}
