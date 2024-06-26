/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldSourceDefinition } from '@xilytix/rev-data-source';
import { RenderValue } from '../../../services/internal-api';
import { CorrectnessId, GridRevRecordField } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { DepthRecord } from './depth-record';

/** @public */
export abstract class DepthSideGridField extends GridField implements GridRevRecordField {
    abstract override getViewValue(record: DepthRecord): RenderValue;
}

/** @public */
export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    // export interface AllFieldsAndDefaults {
    //     fields: DepthSideGridField[];
    //     defaultStates: GridRecordFieldState[];
    //     defaultVisibles: boolean[];
    // }

    export const sourceDefinition = new RevFieldSourceDefinition('DepthSide');
}
