/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../sys/sys-internal-api';

export interface KeyValueStore {
    getItem(key: string): Promise<Result<string | undefined>>;
    setItem(key: string, value: string): Promise<Result<void>>;
    removeItem(key: string): Promise<Result<void>>;
}
