/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, JsonElement, Ok, Result, UnreachableCaseError } from '@xilytix/sysutils';
import { RevGridLayoutOrReferenceDefinition } from '../../grid-layout/internal-api';
import { RevTableRecordSourceDefinition, RevTableRecordSourceDefinitionFromJsonFactory } from '../../table/internal-api';
import { RevGridRowOrderDefinition } from './rev-grid-row-order-definition';

/** @public */
export class RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {
    constructor(
        public readonly tableRecordSourceDefinition: RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        public gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined,
        public rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(RevDataSourceDefinition.JsonName.tableRecordSource);
        this.tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        if (this.gridLayoutOrReferenceDefinition !== undefined) {
            const gridLayoutOrReferenceElement = element.newElement(RevDataSourceDefinition.JsonName.gridLayoutOrReference);
            this.gridLayoutOrReferenceDefinition.saveToJson(gridLayoutOrReferenceElement);
        }
        if (this.rowOrderDefinition !== undefined) {
            const rowOrderElement = element.newElement(RevDataSourceDefinition.JsonName.rowOrder);
            this.rowOrderDefinition.saveToJson(rowOrderElement);
        }
    }
}

/** @public */
export namespace RevDataSourceDefinition {
    export namespace JsonName {
        export const tableRecordSource = 'tableRecordSource';
        export const gridLayoutOrReference = 'gridLayoutOrReference';
        export const rowOrder = 'rowOrder';
    }

    export const enum CreateFromJsonErrorId {
        NotSpecified,
        InvalidJson,
        CreateFromJson
    }

    export interface ErrorIdPlusExtra {
        readonly errorId: CreateFromJsonErrorId;
        readonly extra: string | undefined;
    }

    export function tryCreateTableRecordSourceDefinitionFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement
    ): Result<RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>, ErrorIdPlusExtra> {
        const getElementResult = element.tryGetElement(JsonName.tableRecordSource);
        if (getElementResult.isErr()) {
            const getElementErrorId = getElementResult.error;
            let errorId: CreateFromJsonErrorId;
            let extra: string | undefined;
            if (getElementErrorId === JsonElement.ErrorId.ElementIsNotDefined) {
                errorId = CreateFromJsonErrorId.NotSpecified;
                extra = undefined;
            } else {
                errorId = CreateFromJsonErrorId.InvalidJson;
                extra = JSON.stringify(element.json).substring(0, 200);
            }
            return new Err({ errorId, extra });
        } else {
            const tableRecordSourceDefinitionElement = getElementResult.value;
            const createFromJsonResult = tableRecordSourceDefinitionFromJsonFactory.tryCreateFromJson(tableRecordSourceDefinitionElement);
            if (createFromJsonResult.isErr()) {
                return new Err({ errorId: CreateFromJsonErrorId.CreateFromJson, extra: createFromJsonResult.error });
            } else {
                const tableRecordSourceDefinition = createFromJsonResult.value;
                return new Ok(tableRecordSourceDefinition);
            }
        }
    }

    export function tryCreateGridLayoutOrReferenceDefinitionFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition, ErrorIdPlusExtra> {
        const getElementResult = element.tryGetElement(JsonName.gridLayoutOrReference);
        if (getElementResult.isErr()) {
            const getElementErrorId = getElementResult.error;
            let createFromJsonErrorId: CreateFromJsonErrorId;
            switch (getElementErrorId) {
                case JsonElement.ErrorId.ElementIsNotDefined:
                    createFromJsonErrorId = CreateFromJsonErrorId.ColumnsElementIsNotDefined;
                    break;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeObject:
                    createFromJsonErrorId = CreateFromJsonErrorId.ColumnsElementIsNotAnArray;
                    break;
                default:
                    throw new UnreachableCaseError('RGLDTCCFJ82834', getElementErrorId);
            }
            return new Err(createFromJsonErrorId);

            let errorId: CreateFromJsonErrorId;
            let extra: string | undefined;
            if (getElementErrorId === JsonElement.ErrorId.ElementIsNotDefined) {
                errorId = CreateFromJsonErrorId.NotSpecified;
                extra = undefined;
            } else {
                errorId = CreateFromJsonErrorId.InvalidJson;
                extra = JSON.stringify(element.json).substring(0, 200);
            }
            return new Err({ errorId, extra });
        } else {
            const gridLayoutOrReferenceDefinitionElement = getElementResult.value;
            const createFromJsonResult = RevGridLayoutOrReferenceDefinition.tryCreateFromJson(
                gridLayoutOrReferenceDefinitionElement
            );
            if (createFromJsonResult.isErr()) {
                const createFromJsonErrorIds = createFromJsonResult.error;
                switch (createFromJsonErrorIds.errorId) {
                    case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.GetElement:
                    case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.CreateDefinition:
                }
                return new Err({ errorId: CreateFromJsonErrorId.CreateFromJson, extra: createFromJsonResult.error });
            } else {
                const gridLayoutOrReferenceDefinition = createFromJsonResult.value;
                return new Ok(gridLayoutOrReferenceDefinition);
            }
        }
    }

    export function tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element: JsonElement): RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined {
        const rowOrderDefinitionElementResult = element.tryGetElement(JsonName.rowOrder);
        if (rowOrderDefinitionElementResult.isErr()) {
            return undefined;
        } else {
            const rowOrderDefinitionElement = rowOrderDefinitionElementResult.value;
            return RevGridRowOrderDefinition.createFromJson(rowOrderDefinitionElement);
        }
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement
    ): Result<RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>> {
        const tableRecordSourceDefinitionResult = RevDataSourceDefinition.tryCreateTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFromJsonFactory,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid);
        } else {
            const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;

            let gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined;
            const gridLayoutOReferenceDefinitionResult = RevDataSourceDefinition.tryCreateGridLayoutOrReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOReferenceDefinitionResult.isErr()) {
                gridLayoutOrReferenceDefinition = undefined;
            } else {
                gridLayoutOrReferenceDefinition = gridLayoutOReferenceDefinitionResult.value;
            }

            const rowOrderDefinition = tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

            const gridSourceDefinition = new RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
                tableRecordSourceDefinition,
                gridLayoutOrReferenceDefinition,
                rowOrderDefinition,
            );
            return new Ok(gridSourceDefinition);
        }
    }
}
