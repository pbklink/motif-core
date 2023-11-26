/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../adi/adi-internal-api';
import { SymbolDetailCacheService } from '../../../services/symbol-detail-cache-service';
import { Badness, ChangeSubscribableComparableList, Integer, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { LitIvemBaseDetailTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { LitIvemBaseDetailTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import {
    PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService
} from './definition/grid-table-record-source-definition-internal-api';
import { FromUsableListTableRecordSource } from './from-usable-list-table-record-source';
import { PromisedLitIvemBaseDetail } from './promised-lit-ivem-base-detail';

export class PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSource extends FromUsableListTableRecordSource<LitIvemId> {
    declare readonly list: ChangeSubscribableComparableList<LitIvemId>;

    readonly records = new Array<PromisedLitIvemBaseDetail>();

    constructor(
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
        );

        const list = this.list;
        if (!list.usable) {
            this.processListChange(UsableListChangeTypeId.Unusable, 0, list.count);
        } else {
            this.processListChange(UsableListChangeTypeId.Usable, 0, list.count);
        }
    }

    override createDefinition(): TableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createPromisedLitIvemBaseDetailFromLitIvemIdList(this.list.clone());
    }

    override createRecordDefinition(recordIdx: number): LitIvemBaseDetailTableRecordDefinition {
        const record = this.records[recordIdx];
        return {
            typeId: TableRecordDefinition.TypeId.LitIvemBaseDetail,
            mapKey: record.key.mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: number, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const litIvemBaseDetail = this.records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail: {
                    const valueSource = new LitIvemBaseDetailTableValueSource(
                        result.fieldCount,
                        litIvemBaseDetail,
                        this.list,
                    );
                    result.addSource(valueSource);
                    break;
                }
                // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
                // case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes: {
                //     const altCodesSource =
                //         new LitIvemAlternateCodesTableValueSource(
                //             result.fieldCount,
                //             litIvemBaseDetail,
                //             this.list
                //         );
                //     result.addSource(altCodesSource);
                //     break;
                // }
                default:
                    throw new UnreachableCaseError('PLIBDFLIILTRS41032', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getCount(): Integer {
        return this.records.length;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds(): TableFieldSourceDefinition.TypeId[] {
        return PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    protected override processListChange(listChangeTypeId: UsableListChangeTypeId, idx: number, count: number): void {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(Badness.inactive); // hack - list does not support badness
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.records.length = 0;
                this.setUnusable(Badness.preUsableClear);
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.insertRecordsFromList(idx, count);
                this.setUnusable(Badness.preUsableAdd);
                break;
            case UsableListChangeTypeId.Usable: {
                const recordCount = this.count;
                this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, recordCount);
                this.setUsable(Badness.notBad);
                this.notifyListChange(UsableListChangeTypeId.Usable, 0, recordCount);
                break;
            }
            case UsableListChangeTypeId.Insert:
                this.insertRecordsFromList(idx, count);
                this.notifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.notifyListChange(UsableListChangeTypeId.BeforeReplace, idx, count);
                break;
            case UsableListChangeTypeId.AfterReplace: {
                const afterRangeIndex = idx + count;
                for (let i = idx; i < afterRangeIndex; i++) {
                    this.records[i] = this.createRecordFromList(i);
                }
                this.notifyListChange(UsableListChangeTypeId.AfterReplace, idx, count);
                break;
            }
            case UsableListChangeTypeId.Remove:
                this.records.splice(idx, count);
                this.notifyListChange(UsableListChangeTypeId.Remove, idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.records.length = 0;
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, count);
                break;
            default:
                throw new UnreachableCaseError('RTRSPLLC12487', listChangeTypeId);
        }
    }

    private insertRecordsFromList(idx: Integer, count: Integer) {
        const newRecords = new Array<PromisedLitIvemBaseDetail>(count);
        for (let i = 0; i < count; i++) {
            newRecords[i] = this.createRecordFromList(idx + i);
        }
        this.records.splice(idx, 0, ...newRecords);
    }

    private createRecordFromList(index: Integer) {
        const litIvemId = this.list.getAt(index);
        return new PromisedLitIvemBaseDetail(this._symbolDetailCacheService, litIvemId);
    }
}
