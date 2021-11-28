/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecordField } from 'grid-revgrid-types';
import { RenderValue } from 'services-internal-api';
import { CorrectnessId } from 'sys-internal-api';
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
