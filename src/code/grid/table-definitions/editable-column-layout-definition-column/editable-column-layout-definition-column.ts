/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from '@xilytix/revgrid';
import { StringId, Strings } from '../../../res/internal-api';
import {
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    IndexedRecord,
    Integer,
    MultiEvent,
} from "../../../sys/internal-api";
import { GridField } from '../../field/internal-api';

export class EditableColumnLayoutDefinitionColumn implements IndexedRecord {
    index: Integer;

    private _width: Integer | undefined;
    private _visible = EditableColumnLayoutDefinitionColumn.defaultVisible;

    private _widthChangedMultiEvent = new MultiEvent<EditableColumnLayoutDefinitionColumn.WidthChangedEventHandler>();
    private _visibleChangedMultiEvent = new MultiEvent<EditableColumnLayoutDefinitionColumn.VisibleChangedEventHandler>();

    constructor(readonly field: GridField, readonly anchored: boolean, initialIndex: Integer) {
        this.index = initialIndex;
    }

    get fieldName() { return this.field.name }
    get fieldHeading() { return this.field.heading; }
    get fieldSourceName() { return this.field.definition.sourceDefinition.name; }
    get width() { return this._width; }
    set width(newWidth: Integer | undefined) {
        const oldWidth = this._width;
        if (newWidth !== oldWidth) {
            let recentChangeTypeId: RevRecordValueRecentChangeTypeId;
            if (newWidth === undefined || oldWidth === undefined) {
                recentChangeTypeId = RevRecordValueRecentChangeTypeId.Update;
            } else {
                recentChangeTypeId = newWidth > oldWidth ? RevRecordValueRecentChangeTypeId.Increase : RevRecordValueRecentChangeTypeId.Decrease;
            }
            this._width = newWidth;
            this.notifyWidthChanged({ fieldId: EditableColumnLayoutDefinitionColumn.FieldId.Width, recentChangeTypeId });
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get visible() { return this._visible; }
    set visible(newValue: boolean) {
        const oldValue = this._visible;
        if (newValue !== oldValue) {
            this._visible = newValue;
            this.notifyVisibleChanged();
        }
    }

    subscribeWidthChangedEvent(handler: EditableColumnLayoutDefinitionColumn.WidthChangedEventHandler) {
        return this._widthChangedMultiEvent.subscribe(handler);
    }

    unsubscribeWidthChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._widthChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeVisibleChangedEvent(handler: EditableColumnLayoutDefinitionColumn.VisibleChangedEventHandler) {
        return this._visibleChangedMultiEvent.subscribe(handler);
    }

    unsubscribeVisibleChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._visibleChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyWidthChanged(valueChange: EditableColumnLayoutDefinitionColumn.ValueChange) {
        const handlers = this._widthChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChange);
        }
    }

    private notifyVisibleChanged() {
        const handlers = this._visibleChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }
}

export namespace EditableColumnLayoutDefinitionColumn {
    export type WidthChangedEventHandler = (this: void, valueChange: ValueChange) => void;
    export type VisibleChangedEventHandler = (this: void) => void;

    export const defaultVisible = true;

    export const enum FieldId {
        FieldName,
        FieldSourceName,
        FieldHeading,
        Width,
        Visible,
    }

    export namespace FieldName {
        export const fieldName = 'FieldName';
        export const fieldSourceName = 'FieldSourceName';
        export const fieldHeading = 'FieldHeading';
        export const width = 'Width';
        export const visible = 'Visible';
    }

    export namespace Field {
        export type Id = FieldId;
        const unsupportedIds: FieldId[] = [];

        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly headingId: StringId;
            readonly descriptionId: StringId;
            readonly dataTypeId: FieldDataTypeId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            FieldName: {
                id: FieldId.FieldName,
                name: FieldName.fieldName,
                headingId: StringId.ColumnLayoutDefinitionColumnHeading_FieldName,
                descriptionId: StringId.ColumnLayoutDefinitionColumnDescription_FieldName,
                dataTypeId: FieldDataTypeId.String,
            },
            FieldSourceName: {
                id: FieldId.FieldSourceName,
                name: FieldName.fieldSourceName,
                headingId: StringId.ColumnLayoutDefinitionColumnHeading_FieldSourceName,
                descriptionId: StringId.ColumnLayoutDefinitionColumnDescription_FieldSourceName,
                dataTypeId: FieldDataTypeId.String,
            },
            FieldHeading: {
                id: FieldId.FieldHeading,
                name: FieldName.fieldHeading,
                headingId: StringId.ColumnLayoutDefinitionColumnHeading_FieldHeading,
                descriptionId: StringId.ColumnLayoutDefinitionColumnDescription_FieldHeading,
                dataTypeId: FieldDataTypeId.String,
            },
            Width: {
                id: FieldId.Width,
                name: FieldName.width,
                headingId: StringId.ColumnLayoutDefinitionColumnHeading_Width,
                descriptionId: StringId.ColumnLayoutDefinitionColumnDescription_Width,
                dataTypeId: FieldDataTypeId.Integer,
            },
            Visible: {
                id: FieldId.Visible,
                name: FieldName.visible,
                headingId: StringId.ColumnLayoutDefinitionColumnHeading_Visible,
                descriptionId: StringId.ColumnLayoutDefinitionColumnDescription_Visible,
                dataTypeId: FieldDataTypeId.Boolean,
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;
        export const count = idCount - unsupportedIds.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id as FieldId) {
                    throw new EnumInfoOutOfOrderError('ColumnLayoutDefinitionColumnEditRecord.Field', id, idToName(id));
                }
            }
        }
        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[infos[id].headingId];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id) {
            return Strings[infos[id].descriptionId];
        }

        export function idToDataTypeId(id: Id): FieldDataTypeId {
            return infos[id].dataTypeId;
        }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: RevRecordValueRecentChangeTypeId;
    }
}

export namespace EditableColumnLayoutDefinitionColumnModule {
    export function initialise() {
        EditableColumnLayoutDefinitionColumn.Field.initialise();
    }
}
