/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService
} from "../../../../ranked-lit-ivem-id-list/internal-api";
import { ErrorCode, JsonElement, JsonElementErr, PickEnum, Result } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import {
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/internal-api";
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export abstract class RankedLitIvemIdListTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        readonly rankedLitIvemIdListDefinition: RankedLitIvemIdListDefinition
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdList,
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
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem |
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId
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
