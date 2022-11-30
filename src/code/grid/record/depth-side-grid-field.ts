/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../services/services-internal-api';
import { CorrectnessId, GridHalign, GridRecordField } from '../../sys/sys-internal-api';
import { DepthRecord } from './depth-record';

export abstract class DepthSideGridField implements GridRecordField {
    constructor(
        public readonly name: string,
        public readonly initialHeading: string,
        public readonly initialTextAlign: GridHalign,
    ) { }

    abstract getValue(record: DepthRecord): RenderValue;
}

export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    // export interface AllFieldsAndDefaults {
    //     fields: DepthSideGridField[];
    //     defaultStates: GridRecordFieldState[];
    //     defaultVisibles: boolean[];
    // }
}
