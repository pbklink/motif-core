/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { AdiService, LitIvemId } from '../../../adi/internal-api';
import { SymbolDetailCacheService } from '../../../services/internal-api';
import { CorrectnessBadness, Integer, UiComparableList, UnreachableCaseError } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService
} from "../field-source/internal-api";
import { LitIvemIdTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { LitIvemBaseDetailTableValueSource, LitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/internal-api';
import { BadnessListTableRecordSource } from './badness-comparable-list-table-record-source';
import { LitIvemIdComparableListTableRecordSourceDefinition } from './definition/internal-api';
import { PromisedLitIvemBaseDetail } from './promised-lit-ivem-base-detail';

export class LitIvemIdComparableListTableRecordSource extends BadnessListTableRecordSource<LitIvemId> {
    declare readonly definition: LitIvemIdComparableListTableRecordSourceDefinition;
    declare readonly list: UiComparableList<LitIvemId>;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: LitIvemIdComparableListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as UiComparableList<LitIvemId>; }

    override createDefinition(): LitIvemIdComparableListTableRecordSourceDefinition {
        const list = this.list.clone();
        return new LitIvemIdComparableListTableRecordSourceDefinition(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachingFactoryService,
            list,
        );
    }

    override createRecordDefinition(idx: Integer): LitIvemIdTableRecordDefinition {
        const litIvemId = this.list.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.LitIvemId,
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
