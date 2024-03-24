// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { LockOpenList } from '@xilytix/sysutils';
import { RevReferenceableGridLayoutDefinition } from './definition/internal-api';
import { RevReferenceableGridLayout } from './rev-referenceable-grid-layout';

export interface RevReferenceableGridLayoutsService extends LockOpenList<RevReferenceableGridLayout> {
    getOrNew(definition: RevReferenceableGridLayoutDefinition): RevReferenceableGridLayout;
}
