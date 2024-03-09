/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../../services/services-internal-api';
import { CorrectnessId, GridRevRecordField } from '../../../sys/internal-api';
import { GridField, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';
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

    export const sourceDefinition = new GridFieldSourceDefinition('DepthSide');
}
