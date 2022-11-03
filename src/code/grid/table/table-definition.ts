/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Guid, Integer, JsonElement, LockOpenListItem, UsableListChangeTypeId } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordListsService } from './table-record-lists-service';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export abstract class TableDefinition {
    private _fieldList = new TableFieldList();
    private _defaultLayout = new GridLayout();

    // holds either private or directory TableRecordDefinitionList
    private _recordDefinitionList: TableRecordSource;
    // specifies that TableDefinition uses a directory TableRecordDefinitionList
    private _recordDefinitionListDirectoryId: Guid | undefined;
    private _recordDefinitionListDirectoryLocked = false;
    private _recordDefinitionListDirectoryOpened = false;
    private _recordDefinitionListOpener: TableRecordSource.Opener;
    private _opened = false;

    constructor(
        protected readonly _textFormatterService: TextFormatterService,
        protected readonly _tableRecordListsService: TableRecordListsService,
        recordDefinitionListOrId: TableRecordSource | Guid
    ) {
        if (recordDefinitionListOrId instanceof TableRecordSource) {
            this._recordDefinitionList = recordDefinitionListOrId;
        } else {
            this._recordDefinitionListDirectoryId = recordDefinitionListOrId;
        }
        this._recordDefinitionListOpener = new TableRecordSource.Opener('Unnamed');
    }

    get opened() { return this._opened; }
    get fieldList() { return this._fieldList; }
    protected get recordDefinitionList() { return this._recordDefinitionList; }

    createDefaultLayout() {
        return this._defaultLayout.createCopy();
    }

    hasPrivateRecordDefinitionList() { return this._recordDefinitionListDirectoryId === undefined; }

    lockRecordDefinitionList(locker: LockOpenListItem.Locker): TableRecordSource {
        if (this._recordDefinitionList === undefined && this._recordDefinitionListDirectoryId !== undefined) {
            const idx = this._tableRecordListsService.lockItemById(this._recordDefinitionListDirectoryId, locker);
            if (idx === undefined) {
                throw new AssertInternalError('TSCCLI23239', this._recordDefinitionListDirectoryId);
            } else {
                this._recordDefinitionList = this._tableRecordListsService.getItemAtIndex(idx);
                this._recordDefinitionListDirectoryLocked = true;
            }
        }

        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSCCLR34449');
        } else {
            return this._recordDefinitionList;
        }
    }

    unlockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        if (this._recordDefinitionList !== undefined && this._recordDefinitionListDirectoryLocked) {
            this._tableRecordListsService.unlockItem(this._recordDefinitionList, locker);
            this._recordDefinitionListDirectoryLocked = false;
            this._recordDefinitionListDirectoryId = undefined;
        }
    }

    open() {
        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSO23857');
        } else {
            if (this._opened) {
                throw new AssertInternalError('TSA998437');
            } else {
                this.activate();

                // this._recordDefinitionListOpener = opener; // needs to be fixed when implementing watchlist
                this._opened = true;

                if (this._recordDefinitionListDirectoryId === undefined) {
                    this._recordDefinitionList.activate();
                } else {
                    if (this._recordDefinitionListDirectoryOpened) {
                        throw new AssertInternalError('TSA331751');
                    } else {
                        this._tableRecordListsService.openItemById(this._recordDefinitionListDirectoryId, this._recordDefinitionListOpener);
                        this._recordDefinitionListDirectoryOpened = true;
                    }
                }
            }
        }
    }

    checkClose() {
        if (this._opened) {
            if (this._recordDefinitionListDirectoryId === undefined) {
                this._recordDefinitionList.deactivate();
            } else {
                if (this._recordDefinitionListDirectoryOpened) {
                    const idx = this._recordDefinitionList.index;
                    if (idx === -1) {
                        throw new AssertInternalError('TSC99957', `${idx}`);
                    } else {
                        this._tableRecordListsService.closeItemAtIndex(idx, this._recordDefinitionListOpener);
                    }
                    this._recordDefinitionListDirectoryOpened = false;
                }
            }

            this.deactivate();

            this._opened = false;
        }
    }

    checkCloseAndUnlockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        this.checkClose();
        this.unlockRecordDefinitionList(locker);
    }

    loadFromJson(element: JsonElement) {
        // do not load recordDefinitionList. Done when source created

        const fieldListElement = element.tryGetElement(TableDefinition.jsonTag_FieldList, 'TableDefinition.loadFromJson: FieldList');
        if (fieldListElement === undefined) {
            this._fieldList = TableFieldList.createEmpty(); // won't show any columns but also will not crash
        } else {
            const listIgnored = new TableFieldList();
            // TODO
        }
    }

    saveToJson(element: JsonElement) {
        const fieldListElement = element.newElement(TableDefinition.jsonTag_FieldList);
        this.fieldList.saveToJson(fieldListElement);

        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TSSTJ77559');
        } else {
            if (this.hasPrivateRecordDefinitionList()) {
                const privateRecordDefinitionListElement = element.newElement(TableDefinition.jsonTag_PrivateTableRecordDefinitionList);
                this._recordDefinitionList.saveToJson(privateRecordDefinitionListElement);
            } else {
                element.setGuid(TableDefinition.jsonTag_TableRecordDefinitionListId, this._recordDefinitionList.id);
                element.setString(TableDefinition.jsonTag_TableRecordDefinitionListName, this._recordDefinitionList.name);
                element.setString(TableDefinition.jsonTag_TableRecordDefinitionListType,
                    TableRecordSource.Type.idToJson(this._recordDefinitionList.typeId));
            }
        }
    }

    protected addFieldToDefaultLayout(fieldName: string, visible: boolean) {
        this._defaultLayout.addField(fieldName, visible);
    }

    protected addMissingFieldsToDefaultLayout(visible: boolean) {
        this._fieldList.addMissingFieldsToLayout(this._defaultLayout, visible);
    }

    protected activate() {
        // available for override
    }

    protected deactivate() {
        // available for override
    }

    abstract createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList;
}

export namespace TableDefinition {
    export type BeginAllValuesChangingEventHandler = (this: void) => void;
    export type EndAllValuesChangingEventHandler = (this: void) => void;
    export type ListChangeEvent = (listChangeTypeId: UsableListChangeTypeId, itemIdx: Integer, itemCount: Integer) => void;
    export type AfterRecDefinitionChangeEvent = (recIdx: Integer, recCount: Integer) => void;

    export const jsonTag_FieldList = 'FieldList';
    export const jsonTag_TableRecordDefinitionListId = 'RecordDefinitionListId';
    export const jsonTag_TableRecordDefinitionListName = 'RecordDefinitionListName';
    export const jsonTag_TableRecordDefinitionListType = 'RecordDefinitionListTypeName';
    export const jsonTag_PrivateTableRecordDefinitionList = 'PrivateTableRecordDefinitionList';
}
