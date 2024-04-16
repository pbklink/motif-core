/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldDefinition } from '@xilytix/rev-data-source';
import { OrderSideId } from '../../../../adi/internal-api';
import { RenderValue } from '../../../../services/internal-api';
import { CorrectnessId, UnreachableCaseError } from '../../../../sys/internal-api';
import { AllowedGridField } from '../../../field/internal-api';
import { DepthSideGridField } from '../depth-side-grid-field';
import { FullDepthRecord } from './full-depth-record';
import { FullDepthSideField, FullDepthSideFieldId } from './full-depth-side-field';

export class FullDepthSideGridField extends DepthSideGridField {
    constructor(
        private _id: FullDepthSideFieldId,
        private _sideId: OrderSideId,
        private _getDataItemCorrectnessIdEvent: FullDepthSideGridField.GetDataItemCorrectnessIdEventHandler
    ) {
        const definition = FullDepthSideGridField.createRevFieldDefinition(_id);
        super(definition);
    }

    override getViewValue(record: FullDepthRecord): RenderValue {
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
                throw new UnreachableCaseError('DSGFGFV27759', correctnessId);
        }

        return record.getRenderValue(this._id, this._sideId, dataCorrectnessAttribute);
    }

    compare(left: FullDepthRecord, right: FullDepthRecord): number {
        return FullDepthRecord.compareField(this._id, left, right);
    }

    compareDesc(left: FullDepthRecord, right: FullDepthRecord): number {
        return FullDepthRecord.compareFieldDesc(this._id, left, right);
    }
}

export namespace FullDepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    export function createAll(
        sideId: OrderSideId,
        getDataItemCorrectnessIdEvent: GetDataItemCorrectnessIdEventHandler
    ) {
        const idCount = FullDepthSideField.idCount;
        const fields = new Array<DepthSideGridField>(idCount);

        for (let id = 0; id < idCount; id++) {
            const field = new FullDepthSideGridField(id, sideId, getDataItemCorrectnessIdEvent);
            fields[id] = field;
        }

        return fields;
    }

    export function createAllowedFields(): readonly AllowedGridField[] {
        const idCount = FullDepthSideField.idCount;
        const fields = new Array<AllowedGridField>(idCount);

        for (let id = 0; id < idCount; id++) {
            const definition = createRevFieldDefinition(id);
            const field = new AllowedGridField(definition);
            fields[id] = field;
        }

        return fields;
    }

    export function createRevFieldDefinition(id: FullDepthSideFieldId): RevSourcedFieldDefinition {
        return new RevSourcedFieldDefinition(
            DepthSideGridField.sourceDefinition,
            FullDepthSideField.idToName(id),
            FullDepthSideField.idToDefaultHeading(id),
            FullDepthSideField.idToDefaultTextAlign(id),
        );
    }

    export function createDefaultColumnLayoutDefinition(sideId: OrderSideId) {
        const fieldIds: FullDepthSideFieldId[] = [
            FullDepthSideFieldId.PriceAndHasUndisclosed,
            FullDepthSideFieldId.Volume,
            FullDepthSideFieldId.CountXref,
        ];

        const fieldCount = fieldIds.length;
        const layoutDefinitionColumns = new Array<RevColumnLayoutDefinition.Column>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const sourceName = DepthSideGridField.sourceDefinition.name;
            const fieldId = fieldIds[i];
            const sourcelessFieldName = FullDepthSideField.idToName(fieldId);
            const fieldName = RevSourcedFieldDefinition.Name.compose(sourceName, sourcelessFieldName);
            const layoutDefinitionColumn: RevColumnLayoutDefinition.Column = {
                fieldName,
                visible: undefined,
                autoSizableWidth: undefined,
            };
            layoutDefinitionColumns[i] = layoutDefinitionColumn;
        }

        if (sideId === OrderSideId.Bid) {
            // Reverse the order of columns in the bid grid.
            layoutDefinitionColumns.reverse();
        }

        return new RevColumnLayoutDefinition(layoutDefinitionColumns);
    }

    // export function createAllFields(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField[] {
    //     const idCount = FullDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new FullDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //     }

    //     return fields;
    // }

    // export function createAllFieldsAndDefaults(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField.AllFieldsAndDefaults {
    //     const idCount = FullDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);
    //     const defaultStates = new Array<GridRecordFieldState>(idCount);
    //     const defaultVisibles = new Array<boolean>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new FullDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //         const defaultState: GridRecordFieldState = {
    //             header: FullDepthSideField.idToDefaultHeading(id),
    //             alignment: FullDepthSideField.idToDefaultTextAlign(id),
    //         };
    //         defaultStates[id] = defaultState;
    //         defaultVisibles[id] = FullDepthSideField.idToDefaultVisible(id);
    //     }

    //     return {
    //         fields,
    //         defaultStates,
    //         defaultVisibles,
    //     };
    // }
}
