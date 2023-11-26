/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail, LitIvemId } from '../../../../adi/adi-internal-api';
import { ChangeSubscribableComparableList, Err, ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { FromUsableListTableRecordSourceDefinition } from './from-usable-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition extends FromUsableListTableRecordSourceDefinition<LitIvemId> {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        list: ChangeSubscribableComparableList<LitIvemId>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.PromisedLitIvemBaseDetailFromLitIvemIdList,
            PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list
        );
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const listElementArray = LitIvemId.createJsonElementArray(this.list.toArray());
        element.setElementArray(PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition.JsonName.list, listElementArray);
    }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemBaseDetail;

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Id));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Name));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
    ];

    export namespace JsonName {
        export const list = 'list';
    }

    export function tryCreateListFromElement(element: JsonElement): Result<ChangeSubscribableComparableList<LitIvemId>> {
        const elementArrayResult = element.tryGetElementArray(JsonName.list);
        if (elementArrayResult.isErr()) {
            const error = elementArrayResult.error;
            if (error === JsonElement.arrayErrorCode_NotSpecified) {
                return new Err(ErrorCode.PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdsNotSpecified);
            } else {
                return new Err(ErrorCode.PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdsIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdArrayIsInvalid);
            } else {
                const litIvemIds = litIvemIdsResult.value;
                const list = new ChangeSubscribableComparableList<LitIvemId>();
                list.addRange(litIvemIds);
                return new Ok(list);
            }
        }
    }
}
