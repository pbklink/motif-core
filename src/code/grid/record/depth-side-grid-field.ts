/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../services/services-internal-api';
import { CorrectnessId } from '../../sys/sys-internal-api';
import { GridRecordField } from '../grid-revgrid-types';
import { DepthRecord } from './depth-record';
import { GridRecordFieldState } from './grid-record-field-state';

export abstract class DepthSideGridField implements GridRecordField {
    constructor(public readonly name: string) { }

    abstract getValue(record: DepthRecord): RenderValue;
}

export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    export interface AllFieldsAndDefaults {
        fields: DepthSideGridField[];
        defaultStates: GridRecordFieldState[];
        defaultVisibles: boolean[];
    }
}
