/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    CorrectnessBadness,
    Integer, LockOpenListItem,
    MultiEvent,
    Ok,
    Result,
    UsableListChangeTypeId
} from "../../../sys/sys-internal-api";
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridFieldCustomHeadingsService } from '../../field/grid-field-custom-headings-service';
import { AllowedGridField } from '../../field/grid-field-internal-api';
import { TableFieldSource, TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../field-source/grid-table-field-source-internal-api';
import { TableField } from '../field/grid-table-field-internal-api';
import { TableRecordDefinition } from '../record-definition/table-record-definition';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';

/** @public */
export abstract class TableRecordSource extends CorrectnessBadness {
    protected readonly _gridFieldCustomHeadingsService: GridFieldCustomHeadingsService;
    protected readonly _tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService;

    private _activeFieldSources: readonly TableFieldSource[] = [];
    private _fields: readonly TableField[] = [];

    private _opened = false;

    private _listChangeMultiEvent = new MultiEvent<TableRecordSource.ListChangeEventHandler>();
    private _beforeRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();
    private _afterRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();

    constructor(
        private readonly _textFormatterService: TextFormatterService,
        protected readonly tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        protected readonly definition: TableRecordSourceDefinition,
        readonly allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super();
        this._gridFieldCustomHeadingsService = tableRecordSourceDefinitionFactoryService.gridFieldCustomHeadingsService;
        this._tableFieldSourceDefinitionRegistryService = tableRecordSourceDefinitionFactoryService.tableFieldSourceDefinitionRegistryService;
    }

    get activeFieldSources() { return this._activeFieldSources; }
    get fields() { return this._fields; }

    get activated(): boolean { return this._opened; }

    get count(): Integer { return this.getCount(); }
    get AsArray(): TableRecordDefinition[] { return this.getAsArray(); }

    createAllowedFields(): readonly AllowedGridField[] {
        return this.definition.createAllowedFields();
    }

    // get changeDefinitionOrderAllowed(): boolean { return this._changeDefinitionOrderAllowed; }
    // get addDeleteDefinitionsAllowed(): boolean { return this.getAddDeleteDefinitionsAllowed(); }

    setActiveFieldSources(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[]) {
        // The following could be improved.  Faster if work out differences and then subtract and add
        if (fieldSourceTypeIds.length === 0) {
            this._activeFieldSources = [];
            this._fields = [];
        } else {
            this._activeFieldSources = this.createActiveSources(fieldSourceTypeIds);
            this._fields = this.createFields();
        }
    }

    tryLock(_locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return Ok.createResolvedPromise(undefined);
    }

    unlock(_locker: LockOpenListItem.Locker) {
        // descendants can override
    }

    openLocked(_opener: LockOpenListItem.Opener) {
        this._opened = true;
    }

    closeLocked(_opener: LockOpenListItem.Opener) {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        this._opened = false;
    }

    indexOf(value: TableRecordDefinition): Integer {
        for (let i = 0; i < this.count; i++) {
            const definition = this.createRecordDefinition(i);
            if (TableRecordDefinition.same(definition, value)) {
                return i;
            }
        }

        return -1;
    }

    subscribeListChangeEvent(handler: TableRecordSource.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecDefinitionChangeEvent(handler: TableRecordSource.RecDefinitionChangeEventHandler) {
        return this._beforeRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecDefinitionChangeEvent(handler: TableRecordSource.RecDefinitionChangeEventHandler) {
        return this._afterRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected notifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, recIdx, recCount);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, recIdx, recCount);
        }
    }

    protected notifyBeforeRecDefinitionChange(recIdx: Integer) {
        const handlers = this._beforeRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected notifyAfterRecDefinitionChange(recIdx: Integer) {
        const handlers = this._afterRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected createFields(): TableField[] {
        let result: TableField[] = [];
        for (const source of this._activeFieldSources) {
            const sourceFields = source.createTableFields();

            result = [...result, ...sourceFields];
        }
        return result;
    }

    protected getAsArray(): TableRecordDefinition[] {
        const result: TableRecordDefinition[] = [];
        for (let i = 0; i < this.getCount(); i++) {
            result.push(this.createRecordDefinition(i));
        }
        return result;
    }

    private createActiveSources(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[]): readonly TableFieldSource[] {
        const maxCount = this.allowedFieldSourceDefinitionTypeIds.length;
        if (fieldSourceTypeIds.length > maxCount) {
            throw new AssertInternalError('TRSCFSC34424');
        } else {
            const sources = new Array<TableFieldSource>(maxCount);
            let sourceCount = 0;
            let fieldCount = 0;
            for (const fieldSourceTypeId of fieldSourceTypeIds) {
                if (!this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceTypeId)) {
                    throw new AssertInternalError('TRSCFSA34424');
                } else {
                    const source = this.createFieldSource(fieldSourceTypeId, fieldCount);
                    sources[sourceCount++] = source;

                    fieldCount += source.fieldCount;
                }
            }
            sources.length = sourceCount;

            return sources;
        }
    }

    private createFieldSource(fieldSourceTypeId: TableFieldSourceDefinition.TypeId, fieldCount: Integer) {
        const definition = this._tableFieldSourceDefinitionRegistryService.get(fieldSourceTypeId);
        const source = new TableFieldSource(this._textFormatterService, this._gridFieldCustomHeadingsService, definition, '');
        source.fieldIndexOffset = fieldCount;
        source.nextFieldIndexOffset = source.fieldIndexOffset + source.fieldCount;
        return source;
    }

    abstract createDefinition(): TableRecordSourceDefinition;
    abstract createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord;
    abstract createRecordDefinition(recordIdx: Integer): TableRecordDefinition;

    protected abstract getCount(): Integer;
    protected abstract getDefaultFieldSourceDefinitionTypeIds(): TableFieldSourceDefinition.TypeId[];

}

/** @public */
export namespace TableRecordSource {

    export interface TryCreateResult {
        success: boolean;
        list: TableRecordSource | undefined;
        errorCode: string | undefined;
        errorText: string | undefined;
    }

    export type ListChangeEventHandler = (
        this: void,
        listChangeTypeId: UsableListChangeTypeId,
        itemIdx: Integer,
        itemCount: Integer
    ) => void;
    export type RecDefinitionChangeEventHandler = (this: void, itemIdx: Integer) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
    export type ModifiedEventHandler = (this: void, list: TableRecordSource) => void;
    export type RequestIsGroupSaveEnabledEventHandler = (this: void) => boolean;

}
