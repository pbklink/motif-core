/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemId } from '../../../adi/adi-internal-api';
import { SymbolDetailCacheService } from '../../../services/services-internal-api';
import { Integer, UiBadnessComparableList, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { LitIvemIdTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { LitIvemBaseDetailTableValueSource, LitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BadnessListTableRecordSource } from './badness-comparable-list-table-record-source';
import { LitIvemIdComparableListTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { PromisedLitIvemBaseDetail } from './promised-lit-ivem-base-detail';

export class LitIvemIdComparableListTableRecordSource extends BadnessListTableRecordSource<LitIvemId> {
    declare readonly definition: LitIvemIdComparableListTableRecordSourceDefinition;
    declare readonly list: UiBadnessComparableList<LitIvemId>;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: LitIvemIdComparableListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as UiBadnessComparableList<LitIvemId>; }

    override createDefinition(): LitIvemIdComparableListTableRecordSourceDefinition {
        const list = this.list.clone();
        return this.tableRecordSourceDefinitionFactoryService.createLitIvemIdComparableList(list);
    }

    override createRecordDefinition(idx: Integer): LitIvemIdTableRecordDefinition {
        const litIvemId = this.list.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.LitIvemId,
            mapKey: litIvemId.mapKey,
            litIvemId,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const litIvemId = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as LitIvemIdComparableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail: {
                        const litIvemBaseDetail = new PromisedLitIvemBaseDetail(this._symbolDetailCacheService, litIvemId);
                        const valueSource = new LitIvemBaseDetailTableValueSource(
                            result.fieldCount,
                            litIvemBaseDetail,
                            this.list,
                        );
                        result.addSource(valueSource);
                        break;
                    }

                    case TableFieldSourceDefinition.TypeId.SecurityDataItem: {
                        const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, litIvemId, this._adiService);
                        result.addSource(valueSource);
                        break;
                    }
                    case TableFieldSourceDefinition.TypeId.LitIvemId: {
                        const valueSource = new LitIvemIdTableValueSource(result.fieldCount, litIvemId);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('LIITRSCTVK19909', fieldSourceDefinitionTypeId);
                }
            }
        }

        return result;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return LitIvemIdComparableListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
