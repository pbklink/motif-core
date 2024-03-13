/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemBaseDetail, RankedLitIvemId } from '../../../adi/adi-internal-api';
import { SymbolDetailCacheService } from '../../../services/symbol-detail-cache-service';
import { Badness, BadnessComparableList, Integer, NotImplementedError, UnreachableCaseError, UsableListChangeType, UsableListChangeTypeId, moveElementsInArray } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { RankedLitIvemIdTableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { LitIvemBaseDetailTableValueSource, RankedLitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/internal-api';
import {
    RankedLitIvemIdUsableListTableRecordSourceDefinition,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService
} from './definition/grid-table-record-source-definition-internal-api';
import { PromisedLitIvemBaseDetail } from './promised-lit-ivem-base-detail';
import { UsableListTableRecordSource } from './usable-list-table-record-source';

export class RankedLitIvemIdUsableListTableRecordSource extends UsableListTableRecordSource<RankedLitIvemId> {
    declare readonly definition: RankedLitIvemIdUsableListTableRecordSourceDefinition;
    declare readonly list: BadnessComparableList<RankedLitIvemId>;

    readonly records = new Array<RankedLitIvemIdUsableListTableRecordSource.Record>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: RankedLitIvemIdUsableListTableRecordSourceDefinition,
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
        throw new NotImplementedError('RLIIULTRS31311');
    }

    override createRecordDefinition(recordIdx: number): RankedLitIvemIdTableRecordDefinition {
        const record = this.records[recordIdx];
        const rankedLitIvemId = record.rankedLitIvemId.createCopy();
        return {
            typeId: TableFieldSourceDefinition.TypeId.RankedLitIvemId,
            mapKey: RankedLitIvemIdTableRecordDefinition.createMapKey(rankedLitIvemId),
            rankedLitIvemId,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const record = this.records[recordIndex];
        const rankedLitIvemId = record.rankedLitIvemId;

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail: {
                        let litIvemBaseDetail: LitIvemBaseDetail;
                        if (record.litIvemBaseDetail !== undefined) {
                            litIvemBaseDetail = record.litIvemBaseDetail;
                        } else {
                            litIvemBaseDetail = new PromisedLitIvemBaseDetail(this._symbolDetailCacheService, rankedLitIvemId.litIvemId);
                            record.litIvemBaseDetail = litIvemBaseDetail;
                        }
                        const valueSource = new LitIvemBaseDetailTableValueSource(
                            result.fieldCount,
                            litIvemBaseDetail,
                            this.list,
                        );
                        result.addSource(valueSource);
                        break;
                    }

                    case TableFieldSourceDefinition.TypeId.RankedLitIvemId: {
                        const valueSource = new RankedLitIvemIdTableValueSource(result.fieldCount, rankedLitIvemId);
                        result.addSource(valueSource);
                        break;
                    }

                    case TableFieldSourceDefinition.TypeId.SecurityDataItem: {
                        const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, rankedLitIvemId.litIvemId, this._adiService);
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
        }

        return result;
    }

    protected override getCount(): Integer {
        return this.records.length;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds(): TableFieldSourceDefinition.TypeId[] {
        return this.definition.defaultFieldSourceDefinitionTypeIds;
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
            case UsableListChangeTypeId.BeforeMove:
                this.notifyListChange(UsableListChangeTypeId.BeforeMove, idx, count);
                break;
            case UsableListChangeTypeId.AfterMove: {
                const moveParameters = UsableListChangeType.getMoveParameters(idx);
                moveElementsInArray(this.records, moveParameters.fromIndex, moveParameters.toIndex, moveParameters.count);
                this.notifyListChange(UsableListChangeTypeId.AfterMove, idx, count);
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
        const newRecords = new Array<RankedLitIvemIdUsableListTableRecordSource.Record>(count);
        for (let i = 0; i < count; i++) {
            newRecords[i] = this.createRecordFromList(idx + i);
        }
        this.records.splice(idx, 0, ...newRecords);
    }

    private createRecordFromList(index: Integer): RankedLitIvemIdUsableListTableRecordSource.Record {
        const rankedLitIvemId = this.list.getAt(index);
        return {
            rankedLitIvemId,
        };
    }
}

export namespace RankedLitIvemIdUsableListTableRecordSource {
    export interface Record {
        readonly rankedLitIvemId: RankedLitIvemId,
        litIvemBaseDetail?: LitIvemBaseDetail;
    }
}
