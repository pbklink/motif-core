/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, LockOpenListItem, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridLayoutDefinitionColumnEditRecordList } from '../../layout/grid-layout-internal-api';
import {
    TableFieldCustomHeadingsService,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService
} from "../field-source/grid-table-field-source-internal-api";
import { GridLayoutDefinitionColumnEditRecordTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { GridLayoutDefinitionColumnEditRecordTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

/** @public */
export class GridLayoutDefinitionColumnEditRecordTableRecordSource extends TableRecordSource {
    private readonly _list: GridLayoutDefinitionColumnEditRecordList;
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatterService: TextFormatterService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        tableFieldCustomHeadingsService: TableFieldCustomHeadingsService,
        definition: GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            tableFieldCustomHeadingsService,
            definition.typeId,
            GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._list = definition.list;
    }

    override openLocked(opener: LockOpenListItem.Opener) {
        this._listChangeEventSubscriptionId = this._list.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.processListChange(listChangeTypeId, idx, count)
        );

        super.openLocked(opener);

        const newCount = this._list.count;
        if (newCount > 0) {
            this.processListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
        }
        this.processListChange(UsableListChangeTypeId.Usable, 0, 0);
    }

    override closeLocked(opener: LockOpenListItem.Opener) {
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        }

        this._list.unsubscribeListChangeEvent(this._listChangeEventSubscriptionId);

        super.closeLocked(opener);
    }

    override getCount() { return this._list.count; }

    override createDefinition(): GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition {
        return new GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition(
            this.tableFieldSourceDefinitionRegistryService,
            this._list
        );
    }

    override createRecordDefinition(idx: Integer): GridLayoutDefinitionColumnEditRecordTableRecordDefinition {
        const record = this._list.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
            mapKey: record.fieldName,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const record = this._list.records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord: {
                    const valueSource = new GridLayoutDefinitionColumnEditRecordTableValueSource(result.fieldCount, record);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('GLDCERTRSCTR77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    private processListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                throw new AssertInternalError('GLDCERTRSPLCUU07721')
            case UsableListChangeTypeId.PreUsableClear:
                throw new AssertInternalError('GLDCERTRSPLCPC07721')
            case UsableListChangeTypeId.PreUsableAdd:
                throw new AssertInternalError('GLDCERTRSPLCPA07721')
            case UsableListChangeTypeId.Usable:
                throw new AssertInternalError('GLDCERTRSPLCA07721')
            case UsableListChangeTypeId.Insert:
                this.notifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.notifyListChange(UsableListChangeTypeId.BeforeReplace, idx, count);
                break;
            case UsableListChangeTypeId.AfterReplace:
                this.notifyListChange(UsableListChangeTypeId.AfterReplace, idx, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.notifyListChange(UsableListChangeTypeId.Remove, idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, count);
                break;
            default:
                throw new UnreachableCaseError('GLDCERTRSPLCUCE07721', listChangeTypeId);
        }
    }
}
