/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordField, RevRecordSourcedFieldSourceDefinition } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/internal-api';
import { CorrectnessId } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { DepthRecord } from './depth-record';

/** @public */
export abstract class DepthSideGridField extends GridField implements RevRecordField {
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

    export const sourceDefinition = new RevRecordSourcedFieldSourceDefinition('DepthSide');
}
