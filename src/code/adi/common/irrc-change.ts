/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../sys/internal-api';

export const enum IrrcChangeTypeId {
    Insert,
    Replace,
    Remove,
    Clear,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IrrcChange<T> {
    typeId: IrrcChangeTypeId;
}

export interface ClearIrrcChange<T> extends IrrcChange<T> {
    typeId: IrrcChangeTypeId.Clear;
}

export interface InsertRemoveReplaceIrrcChange<T> extends IrrcChange<T> {
    at: Integer;
    count: Integer;
}

export interface RemoveIrrcChange<T> extends InsertRemoveReplaceIrrcChange<T> {
    typeId: IrrcChangeTypeId.Remove;
}

export interface InsertReplaceIrrcChange<T> extends InsertRemoveReplaceIrrcChange<T> {
    typeId: IrrcChangeTypeId.Insert | IrrcChangeTypeId.Replace;
    items: readonly T[];
}


