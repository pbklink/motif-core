/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, IndexedRecord } from '../../../sys/sys-internal-api';

/** @public */
export class FavouriteNamedGridLayoutDefinitionReference implements IndexedRecord {
    name: string;
    id: Guid;
    index: number;
}
