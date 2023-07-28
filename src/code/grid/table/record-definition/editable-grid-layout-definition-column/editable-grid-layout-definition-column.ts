/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../../../res/res-internal-api';
import {
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    IndexedRecord,
    Integer,
    MultiEvent,
    ValueRecentChangeTypeId
} from "../../../../sys/sys-internal-api";
import { GridField } from '../../../field/grid-field-internal-api';

export class EditableGridLayoutDefinitionColumn implements IndexedRecord {
    index: Integer;

    private _width: Integer | undefined;
    private _visible: boolean;

    private _widthChangedMultiEvent = new MultiEvent<EditableGridLayoutDefinitionColumn.WidthChangedEventHandler>();
    private _visibleChangedMultiEvent = new MultiEvent<EditableGridLayoutDefinitionColumn.VisibleChangedEventHandler>();

    constructor(private readonly _field: GridField, initialIndex: Integer) {
        this.index = initialIndex;
    }

    get fieldName() { return this._field.name }
    get fieldHeading() { return this._field.heading; }
    get fieldSourceName() { return this._field.definition.source.name; }
    get width() { return this._width; }
    set width(newWidth: Integer | undefined) {
        const oldWidth = this._width;
        if (newWidth !== oldWidth) {
            let recentChangeTypeId: ValueRecentChangeTypeId;
            if (newWidth === undefined || oldWidth === undefined) {
                recentChangeTypeId = ValueRecentChangeTypeId.Update;
            } else {
                recentChangeTypeId = newWidth > oldWidth ? ValueRecentChangeTypeId.Increase : ValueRecentChangeTypeId.Decrease;
            }
            this._width = newWidth;
            this.notifyWidthChanged({ fieldId: EditableGridLayoutDefinitionColumn.FieldId.Width, recentChangeTypeId });
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

    subscribeWidthChangedEvent(handler: EditableGridLayoutDefinitionColumn.WidthChangedEventHandler) {
        return this._widthChangedMultiEvent.subscribe(handler);
    }

    unsubscribeWidthChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._widthChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeVisibleChangedEvent(handler: EditableGridLayoutDefinitionColumn.VisibleChangedEventHandler) {
        return this._visibleChangedMultiEvent.subscribe(handler);
    }

    unsubscribeVisibleChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._visibleChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyWidthChanged(valueChange: EditableGridLayoutDefinitionColumn.ValueChange) {
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

export namespace EditableGridLayoutDefinitionColumn {
    export type WidthChangedEventHandler = (this: void, valueChange: ValueChange) => void;
    export type VisibleChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        FieldName,
        FieldSourceName,
        FieldHeading,
        Width,
        Visible,
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
                name: 'FieldName',
                headingId: StringId.GridLayoutDefinitionColumnHeading_FieldName,
                descriptionId: StringId.GridLayoutDefinitionColumnDescription_FieldName,
                dataTypeId: FieldDataTypeId.String,
            },
            FieldSourceName: {
                id: FieldId.FieldSourceName,
                name: 'FieldSourceName',
                headingId: StringId.GridLayoutDefinitionColumnHeading_FieldSourceName,
                descriptionId: StringId.GridLayoutDefinitionColumnDescription_FieldSourceName,
                dataTypeId: FieldDataTypeId.String,
            },
            FieldHeading: {
                id: FieldId.FieldHeading,
                name: 'FieldHeading',
                headingId: StringId.GridLayoutDefinitionColumnHeading_FieldHeading,
                descriptionId: StringId.GridLayoutDefinitionColumnDescription_FieldHeading,
                dataTypeId: FieldDataTypeId.String,
            },
            Width: {
                id: FieldId.Width,
                name: 'Width',
                headingId: StringId.GridLayoutDefinitionColumnHeading_Width,
                descriptionId: StringId.GridLayoutDefinitionColumnDescription_Width,
                dataTypeId: FieldDataTypeId.Integer,
            },
            Visible: {
                id: FieldId.Visible,
                name: 'Visible',
                headingId: StringId.GridLayoutDefinitionColumnHeading_Visible,
                descriptionId: StringId.GridLayoutDefinitionColumnDescription_Visible,
                dataTypeId: FieldDataTypeId.Boolean,
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;
        export const count = idCount - unsupportedIds.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('GridLayoutDefinitionColumnEditRecord.Field', id, idToName(id));
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
        recentChangeTypeId: ValueRecentChangeTypeId;
    }
}

export namespace EditableGridLayoutDefinitionColumnModule {
    export function initialise() {
        EditableGridLayoutDefinitionColumn.Field.initialise();
    }
}
