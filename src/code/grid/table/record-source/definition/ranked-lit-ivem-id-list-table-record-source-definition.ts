/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ErrorCode, JsonElement, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachedFactoryService
} from "../../field-source/grid-table-field-source-internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export abstract class RankedLitIvemIdListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        readonly rankedLitIvemIdListDefinition: RankedLitIvemIdListDefinition
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachedFactoryService,
            TableRecordSourceDefinition.TypeId.RankedLitIvemIdList,
            allowedFieldSourceDefinitionTypeIds,
        );
    }

    abstract get defaultFieldSourceDefinitionTypeIds(): RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[];

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementName = RankedLitIvemIdListTableRecordSourceDefinition.JsonName.definition;
        const litIvemIdListElement = element.newElement(elementName);
        this.rankedLitIvemIdListDefinition.saveToJson(litIvemIdListElement);
    }
}

/** @public */
export namespace RankedLitIvemIdListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.SecurityDataItem |
        TableFieldSourceDefinition.TypeId.RankedLitIvemId
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export namespace JsonName {
        export const definition = 'definition';
    }

    export function tryCreateDefinition(
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListDefinition> {
        const definitionElementResult = element.tryGetDefinedElement(JsonName.definition);
        if (definitionElementResult.isErr()) {
            const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionElementNotSpecified;
            return definitionElementResult.createOuter(errorCode);
        } else {
            const definitionElement = definitionElementResult.value;

            const definitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(definitionElement);
            if (definitionResult.isErr()) {
                return definitionResult.createOuter(ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionJsonIsInvalid);
            } else {
                return definitionResult;
            }
        }
    }
}
