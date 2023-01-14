/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderSideId } from '../../../../adi/adi-internal-api';
import { RenderValue } from '../../../../services/services-internal-api';
import { CorrectnessId, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { DepthSideGridField } from '../depth-side-grid-field';
import { ShortDepthRecord } from './short-depth-record';
import { ShortDepthSideField, ShortDepthSideFieldId } from './short-depth-side-field';

export class ShortDepthSideGridField extends DepthSideGridField {
    constructor(
        private _id: ShortDepthSideFieldId,
        private _sideId: OrderSideId,
        private _getDataItemCorrectnessIdEvent: ShortDepthSideGridField.GetDataItemCorrectnessIdEventHandler
    ) {
        super(
            ShortDepthSideField.idToName(_id),
            ShortDepthSideField.idToDefaultHeading(_id),
            ShortDepthSideField.idToDefaultTextAlign(_id),
        );
    }

    override getValue(record: ShortDepthRecord): RenderValue {
        let dataCorrectnessAttribute: RenderValue.Attribute | undefined;
        const correctnessId = this._getDataItemCorrectnessIdEvent();
        switch (correctnessId) {
            case CorrectnessId.Suspect:
                dataCorrectnessAttribute = RenderValue.DataCorrectnessAttribute.suspect;
                break;
            case CorrectnessId.Error:
                dataCorrectnessAttribute = RenderValue.DataCorrectnessAttribute.error;
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                dataCorrectnessAttribute = undefined;
                break;
            default:
                throw new UnreachableCaseError('SDSGFGFV5438827', correctnessId);
        }

        return record.getRenderValue(this._id, this._sideId, dataCorrectnessAttribute);
    }

    compare(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareField(this._id, left, right);
    }

    compareDesc(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareFieldDesc(this._id, left, right);
    }
}

export namespace ShortDepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    // export function createAllFields(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField[] {
    //     const idCount = ShortDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //     }

    //     return fields;
    // }

    // export function createAllFieldsAndDefaults(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField.AllFieldsAndDefaults {
    //     const idCount = ShortDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);
    //     const defaultStates = new Array<GridRecordFieldState>(idCount);
    //     const defaultVisibles = new Array<boolean>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //         const defaultState: GridRecordFieldState = {
    //             header: ShortDepthSideField.idToDefaultHeading(id),
    //             alignment: ShortDepthSideField.idToDefaultTextAlign(id),
    //         };
    //         defaultStates[id] = defaultState;
    //         defaultVisibles[id] = ShortDepthSideField.idToDefaultVisible(id);
    //     }

    //     return {
    //         fields,
    //         defaultStates,
    //         defaultVisibles,
    //     };
    // }
}
