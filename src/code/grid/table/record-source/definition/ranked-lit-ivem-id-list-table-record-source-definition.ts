/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService
} from "../../../../ranked-lit-ivem-id-list/internal-api";
import { ErrorCode, JsonElement, JsonElementErr, PickEnum, Result } from '../../../../sys/internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export abstract class RankedLitIvemIdListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        readonly rankedLitIvemIdListDefinition: RankedLitIvemIdListDefinition
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
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
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export namespace JsonName {
        export const definition = 'definition';
    }

    export function tryCreateDefinition(
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListDefinition> {
        const definitionElementResult = element.tryGetElement(JsonName.definition);
        if (definitionElementResult.isErr()) {
            const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionElementNotSpecified;
            return JsonElementErr.createOuter(definitionElementResult.error, errorCode);
        } else {
            const definitionElement = definitionElementResult.value;

            const definitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(definitionElement);
            if (definitionResult.isErr()) {
                const errorCode = definitionResult.error as ErrorCode;
                if (errorCode === ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonNotSpecified) {
                    return definitionResult.createOuter(ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionJsonNotSpecified);
                } else {
                    return definitionResult.createOuter(ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionJsonIsInvalid);
                }
            } else {
                return definitionResult;
            }
        }
    }
}
