/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { ExplicitLitIvemIdListDefinition } from './explicit-lit-ivem-id-list-definition';

export class NamedExplicitLitIvemIdListDefinition extends ExplicitLitIvemIdListDefinition implements LockOpenListItem {
    mapKey: string;
    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstLock(): Result<void, string> {
        throw new Error('Method not implemented.');
    }
    processLastUnlock(): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstOpen(): Result<void, string> {
        throw new Error('Method not implemented.');
    }
    processLastClose(): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        throw new Error('Method not implemented.');
    }
    index: number;

    name: string;
}
