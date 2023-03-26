/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    CorrectnessBadness, GridRecordInvalidatedValue, Integer, LockOpenListItem,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../../sys/sys-internal-api";
import { TableFieldSourceDefinition } from './field-source/grid-table-field-source-internal-api';
import { TableField } from './field/grid-table-field-internal-api';
// import { TableFieldAndStateArrays } from './field/grid-table-field-internal-api';
import { TableRecordDefinition } from './record-definition/grid-table-record-definition-internal-api';
import { TableRecordSource } from './record-source/grid-table-record-source-internal-api';
import { TableRecord } from './record/grid-table-record-internal-api';

export class Table extends CorrectnessBadness {
    // openEvent: Table.OpenEventHandler;
    // openChangeEvent: Table.OpenChangeEventHandler;
    // badnessChangeEvent: Table.BadnessChangeEventHandler;
    // recordsLoadedEvent: Table.RecordsLoadedEventHandler;
    // recordsInsertedEvent: Table.RecordsInsertedEventHandler;
    // recordsDeletedEvent: Table.RecordsDeletedEventHandler;
    // allRecordsDeletedEvent: Table.AllRecordsDeletedEventHandler;
    // recordValuesChangedEvent: Table.RecordValuesChangedEventHandler;
    // recordFieldsChangedEvent: Table.RecordFieldsChangedEventHandler;
    // recordChangedEvent: Table.RecordChangedEventHandler;
    // layoutChangedEvent: Table.LayoutChangedEventHandler;
    // recordDisplayOrderChangedEvent: Table.RecordDisplayOrderChangedEventHandler;
    // firstPreUsableEvent: Table.FirstPreUsableEventHandler;
    // recordDisplayOrderSetEvent: Table.RecordDisplayOrderSetEventHandler;

    private _records = new Array<TableRecord>();
    private _beenUsable: boolean;

    private _recordSourceBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordSourceListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordSourceAfterRecDefinitionChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordSourceBeforeRecDefinitionChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _fieldsChangedMultiEvent = new MultiEvent<Table.FieldsChangedEventHandler>();

    private _openMultiEvent = new MultiEvent<Table.OpenEventHandler>();
    private _openChangeMultiEvent = new MultiEvent<Table.OpenChangeEventHandler>();
    private _recordsLoadedMultiEvent = new MultiEvent<Table.RecordsLoadedEventHandler>();
    private _recordsInsertedMultiEvent = new MultiEvent<Table.RecordsInsertedEventHandler>();
    private _recordsReplacedMultiEvent = new MultiEvent<Table.RecordsReplacedEventHandler>();
    private _recordsDeletedMultiEvent = new MultiEvent<Table.RecordsDeletedEventHandler>();
    private _allRecordsDeletedMultiEvent = new MultiEvent<Table.AllRecordsDeletedEventHandler>();
    private _recordValuesChangedMultiEvent = new MultiEvent<Table.RecordValuesChangedEventHandler>();
    private _recordSequentialFieldValuesChangedMultiEvent = new MultiEvent<Table.RecordSequentialFieldValuesChangedEventHandler>();
    private _recordChangedMultiEvent = new MultiEvent<Table.RecordChangedEventHandler>();
    private _layoutChangedMultiEvent = new MultiEvent<Table.LayoutChangedEventHandler>();
    private _recordDisplayOrderChangedMultiEvent = new MultiEvent<Table.RecordDisplayOrderChangedEventHandler>();
    private _firstUsableMultiEvent = new MultiEvent<Table.FirstUsableEventHandler>();
    private _recordDisplayOrderSetMultiEvent = new MultiEvent<Table.RecordDisplayOrderSetEventHandler>();

    constructor(
        readonly recordSource: TableRecordSource,
        initialActiveFieldSources: TableFieldSourceDefinition.TypeId[],
    ) {
        super();

        this.setActiveFieldSources(initialActiveFieldSources, false);
    }

    get fields(): readonly TableField[] { return this.recordSource.activeFields; }

    get recordCount() { return this._records.length; }
    get records(): readonly TableRecord[] { return this._records; }
    get beenUsable() { return this._beenUsable; }

    setActiveFieldSources(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[], suppressGridSchemaUpdate: boolean) {
        if (!this.isFieldSourcesArrayEqual(fieldSourceTypeIds)) {
            this.recordSource.setActiveFieldSources(fieldSourceTypeIds);
            this.replaceAllRecords();
            this.notifyFieldsChanged(suppressGridSchemaUpdate);
        }
    }

    // userCanAdd(): boolean {
    //     return this.recordSource.userCanAdd();
    // }

    // userCanRemove(): boolean {
    //     return this.recordSource.userCanRemove();
    // }

    // userCanMove(): boolean {
    //     return this.recordSource.userCanMove();
    // }

    // userRemoveAt(idx: Integer, count: Integer) {
    //     this.recordSource.userRemoveAt(idx, count);
    // }

    // setDefinition(value: TableDefinition) {
    //     if (this._definition !== undefined) {
    //         this._definition.checkCloseAndUnlockRecordDefinitionList(this);
    //     }
    //     this._id = nanoid();

    //     this._definition = value;
    //     this._recordDefinitionList = this._definition.lockRecordDefinitionList(this);

    //     this._recordDefinitionListBadnessChangeSubscriptionId = this._recordDefinitionList.subscribeBadnessChangeEvent(
    //         () => this.handleRecordDefinitionListBadnessChangeEvent()
    //     );
    //     this._recordDefinitionListListChangeSubscriptionId = this._recordDefinitionList.subscribeListChangeEvent(
    //         (listChangeType, recordIdx, recordCount) =>
    //             this.handleRecordDefinitionListListChangeEvent(listChangeType, recordIdx, recordCount)
    //     );
    //     this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId =
    //         this._recordDefinitionList.subscribeBeforeRecDefinitionChangeEvent(
    //             (recordIdx) => this.handleRecordDefinitionListBeforeRecDefinitionChangeEvent(recordIdx)
    //         );
    //     this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId =
    //         this._recordDefinitionList.subscribeAfterRecDefinitionChangeEvent(
    //             (recordIdx) => this.handleRecordDefinitionListAfterRecDefinitionChangeEvent(recordIdx)
    //         );

    //     if (this._recordDefinitionList.usable) {
    //         const count = this._recordDefinitionList.count;
    //         if (count > 0) {
    //             this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
    //         }
    //         this.processRecordDefinitionListListChange(UsableListChangeTypeId.Usable, 0, 0);
    //     } else {
    //         this.processRecordDefinitionListListChange(UsableListChangeTypeId.Unusable, 0, 0);
    //     }
    // }

    // setName(value: string) {
    //     this._name = value;
    //     this._upperCaseName = value.toUpperCase();
    // }

    // setNameFromRecordDefinitionList() {
    //     if (this.recordDefinitionList === undefined) {
    //         throw new AssertInternalError('TSNFRDL75542');
    //     } else {
    //         this.setName(this.recordDefinitionList.name);
    //     }
    // }

    // loadFromJson(element: JsonElement /*, ScaleByMParam: Integer, ScaleByDParam: Integer*/) {
    //     // let modifiedIgnored = false; // may use this in future
    //     this.clearRecords();

    //     // const loadedId = element.tryGetGuid(Table.JsonTag.id, 'Table.loadFromJson: Id');
    //     // if (loadedId !== undefined) {
    //     //     this.id = loadedId;
    //     // } else {
    //     //     this.id = nanoid();
    //     //     modifiedIgnored = true;
    //     // }

    //     // const loadedName = element.tryGetString(Table.JsonTag.name, 'Table.loadFromJson: name');
    //     // if (loadedName !== undefined) {
    //     //     this.setName(loadedName);
    //     // } else {
    //     //     this.setName(Strings[StringId.Unnamed]);
    //     //     modifiedIgnored = true;
    //     // }

    //     // const sourceElement = element.tryGetElement(Table.JsonTag.source, 'Table.loadFromJson: source');
    //     // if (sourceElement === undefined) {
    //     //     return Logger.logPersistError('TLFJS28289', element.stringify());
    //     // } else {
    //     //     const definition = this._definitionFactory.tryCreateFromJson(sourceElement);
    //     //     if (definition === undefined) {
    //     //         return undefined;
    //     //     } else {
    //     //         this.setDefinition(definition);

    //     //         this.layout = this.createDefaultLayout();
    //     //         const layoutElement = element.tryGetElement(Table.JsonTag.layout, 'Table.loadFromJson: layout');
    //     //         const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
    //     //         if (serialisedColumns) {
    //     //             this.layout.deserialise(serialisedColumns);
    //     //         }
    //     //         return true;
    //     //     }
    //     // }

    //     return true; // remove when fixed
    // }

    // saveToJson(element: JsonElement /*, ScaleByMParam: Integer, ScaleByDParam: Integer*/) {
    //     element.setGuid(Table.JsonTag.id, this.id);
    //     element.setString(Table.JsonTag.name, this.name);
    //     const sourceElement = element.newElement(Table.JsonTag.source);
    //     this._definition.saveToJson(sourceElement);
    //     const layoutElement = element.newElement(Table.JsonTag.layout);
    //     const columns = this.layout.serialise();
    //     GridLayoutIO.saveLayout(columns, layoutElement);

    //     const orderedRecordDefinitionsElement = element.newElement(Table.JsonTag.orderedRecordDefinitions);
    //     for (let i = 0; i < this._orderedRecordDefinitions.length; i++) {
    //         const orderedRecordDefinitionElement = orderedRecordDefinitionsElement.newElement(Table.JsonTag.orderedRecordDefinition);
    //         this._orderedRecordDefinitions[i].saveKeyToJson(orderedRecordDefinitionElement);
    //     }
    // }

    open(opener: LockOpenListItem.Opener) {
        this.recordSource.openLocked(opener);

        if (this.recordSource.usable) {
            this._beenUsable = true;
            const count = this.recordSource.count;
            if (count > 0) {
                this.processRecordSourceListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.processRecordSourceListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this._beenUsable = false;
            this.processRecordSourceListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }

        this._recordSourceBadnessChangeSubscriptionId = this.recordSource.subscribeBadnessChangeEvent(
            () => this.handleRecordSourceBadnessChangeEvent()
        );
        this._recordSourceListChangeSubscriptionId = this.recordSource.subscribeListChangeEvent(
            (listChangeType, recordIdx, recordCount) =>
                this.handleRecordSourceListChangeEvent(listChangeType, recordIdx, recordCount)
        );
        this._recordSourceBeforeRecDefinitionChangeSubscriptionId =
            this.recordSource.subscribeBeforeRecDefinitionChangeEvent(
                (recordIdx) => this.handleRecordDefinitionListBeforeRecDefinitionChangeEvent(recordIdx)
            );
        this._recordSourceAfterRecDefinitionChangeSubscriptionId =
            this.recordSource.subscribeAfterRecDefinitionChangeEvent(
                (recordIdx) => this.handleRecordDefinitionListAfterRecDefinitionChangeEvent(recordIdx)
            );
    }

    close(opener: LockOpenListItem.Opener) {
        this.recordSource.unsubscribeBadnessChangeEvent(this._recordSourceBadnessChangeSubscriptionId);
        this._recordSourceBadnessChangeSubscriptionId = undefined;
        this.recordSource.unsubscribeListChangeEvent(this._recordSourceListChangeSubscriptionId);
        this._recordSourceListChangeSubscriptionId = undefined;
        this.recordSource.unsubscribeBeforeRecDefinitionChangeEvent(
            this._recordSourceBeforeRecDefinitionChangeSubscriptionId);
        this._recordSourceBeforeRecDefinitionChangeSubscriptionId = undefined;
        this.recordSource.unsubscribeAfterRecDefinitionChangeEvent(
            this._recordSourceAfterRecDefinitionChangeSubscriptionId);
        this._recordSourceAfterRecDefinitionChangeSubscriptionId = undefined;

        this.recordSource.closeLocked(opener);
    }

    // processFirstOpen(recordDefinitionListIdx?: Integer) {
    //     if (this.recordSource === undefined) {
    //         throw new AssertInternalError('TA299587');
    //     } else {
    //         this.processLastClose();

    //         this._definition.open();

    //         // this._definition.open(); will push definitionlist definitions
    //         // if (this._recordDefinitionList.usable) {
    //         //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
    //         //     const count = this._recordDefinitionList.count;
    //         //     if (count > 0) {
    //         //         this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
    //         //     }
    //         //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.Usable, 0, 0);
    //         // } else {
    //         //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.Unusable, 0, 0);
    //         // }

    //         this.notifyOpen(this.recordSource);
    //         this.notifyOpenChange(this.opened);
    //     }
    // }

    // close() {
    //     this.recordSource.unsubscribeBadnessChangeEvent(this._recordDefinitionListBadnessChangeSubscriptionId);
    //     this._recordDefinitionListBadnessChangeSubscriptionId = undefined;
    //     this.recordSource.unsubscribeListChangeEvent(this._recordDefinitionListListChangeSubscriptionId);
    //     this._recordDefinitionListListChangeSubscriptionId = undefined;
    //     this.recordSource.unsubscribeBeforeRecDefinitionChangeEvent(
    //         this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId);
    //     this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId = undefined;
    //     this.recordSource.unsubscribeAfterRecDefinitionChangeEvent(
    //         this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId);
    //     this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId = undefined;

    //     this.recordSource.closeLocked(opener);
    //     this.setUnusable(Badness.inactive);

    //     // this._orderedRecordDefinitionsValidated = false;
    //     this._firstUsable = false;
    // }

    // processLastClose() {
    //     if (this._definition !== undefined && this._definition.opened) {
    //         this.recordSource.unsubscribeBadnessChangeEvent(this._recordDefinitionListBadnessChangeSubscriptionId);
    //         this._recordDefinitionListBadnessChangeSubscriptionId = undefined;
    //         this.recordSource.unsubscribeListChangeEvent(this._recordDefinitionListListChangeSubscriptionId);
    //         this._recordDefinitionListListChangeSubscriptionId = undefined;
    //         this.recordSource.unsubscribeBeforeRecDefinitionChangeEvent(
    //             this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId);
    //         this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId = undefined;
    //         this.recordSource.unsubscribeAfterRecDefinitionChangeEvent(
    //             this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId);
    //         this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId = undefined;

    //         this.processRecordSourceListChange(UsableListChangeTypeId.Clear, 0, 0);
    //         this._definition.checkClose(); // change this

    //         this.setUnusable(Badness.inactive);

    //         this._orderedRecordDefinitionsValidated = false;
    //         this._firstUsable = false;

    //         this.notifyOpenChange(this.opened);
    //     }
    // }

    getRecord(idx: Integer) { return this._records[idx]; }

    createRecordDefinition(index: Integer) {
        return this.recordSource.createRecordDefinition(index);
    }

    findRecord(recordDefinition: TableRecordDefinition): Integer | undefined {
        for (let i = 0; i < this.recordCount; i++) {
            const sourceRecordDefinition = this.recordSource.createRecordDefinition(i);
            if (TableRecordDefinition.same(sourceRecordDefinition, recordDefinition)) {
                return i;
            }
        }
        return undefined;
    }

    clearRendering() {
        for (let i = 0; i < this.recordCount; i++) {
            const record = this._records[i];
            record.clearRendering();
        }
    }

    /*generateFieldNames(): string[] {
        return [];
        // todo
    }*/

    /*getFieldName(fieldIdx: Integer): string {
        return '';
        // todo
    }*/

    /*getFieldHeading(fieldIdx: Integer): string {
        return '';
        // todo
    }*/

    /*getAttributedFieldHeading(fieldIdx: Integer): string {
        return '';
        // todo
    }*/
    /*function FindSecurityDataItemField(SecurityFieldId: TSecurityFieldId; out FieldIdx: Integer): Boolean;
    function FindNewsField(FieldId: TWatchValueSource_News.TFieldId; out FieldIdx: Integer): Boolean;
    function FindAlertsField(FieldId: TWatchValueSource_Alerts.TFieldId; out FieldIdx: Integer): Boolean;
    function FindTmcDefinitionLegsField(FieldId: TWatchValueSource_TmcDefinitionLegs.TFieldId; out FieldIdx: Integer): Boolean;
    */

    // hasPrivateRecordDefinitionList(): boolean {
    //     return this._definition.hasPrivateRecordDefinitionList();
    // }

    /*newPrivateRecordDefinitionList() {
        this.close();
        this.open();
    }*/

    /*lockRecordDefinitionListById(id: Guid): boolean {
        const idx = tableRecordDefinitionListDirectory.indexOfId(id);
        if (idx < 0) {
            return false;
        } else {
            this.lockRecordDefinitionListByIndex(idx);
            return true;
        }
    }

    lockRecordDefinitionListByIndex(idx: Integer): TableRecordDefinitionList {
        this.closeRecordDefinitionList();
        this._recordDefinitionList = tableRecordDefinitionListDirectory.lock(idx, this);
        return this._recordDefinitionList;
    }*/

    // clearRecordDefinitions() {
    //     this.recordSource.clear();
    // }

    // canAddRecordDefinition(value: TableRecordDefinition): boolean {
    //     if (this.recordSource === undefined) {
    //         return false;
    //     } else {
    //         return this.recordSource.canAdd(value);
    //     }
    // }

    // canAddRecordDefinitions(definitions: TableRecordDefinitionArray): boolean {
    //     if (this.recordSource === undefined) {
    //         return false;
    //     } else {
    //         return this.recordSource.canAddArray(definitions);
    //     }
    // }

    // addRecordDefinition(value: TableRecordDefinition) {
    //     this.recordSource.add(value);
    // }

    // setRecordDefinition(idx: Integer, value: TableRecordDefinition) {
    //     this.recordSource.setDefinition(idx, value);
    // }

    // canMoveOrderedRecordDefinitions(srcIdx: Integer, srcCount: Integer, destIdx: Integer): boolean {
    //     return this.changeRecordDefinitionOrderAllowed
    //         &&
    //         ((destIdx < srcIdx) || (destIdx > (srcIdx + srcCount)));
    // }

    /*assign(src: Table) {
        this._fieldList = TableFieldList.createCopy(src._fieldList);
        this.orderedRecordDefinitions = new Array<ITableRecordDefinition>(src.orderedRecordDefinitions.length);
        for (let i = 0; i < src.orderedRecordDefinitions.length; i++) {
            this.orderedRecordDefinitions[i] = src.orderedRecordDefinitions[i].createCopy();
        }

        if (src.hasPrivateRecordDefinitionList()) {
            src.closeRecordDefinitionList();
            const newList = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(src.recordDefinitionList);
            this.bindPrivateRecordDefinitionList(newList);
        } else {
            if ((this._recordDefinitionList === undefined)
                || this.hasPrivateRecordDefinitionList()
                || (this.recordDefinitionList.id !== src.recordDefinitionList.id)) {
                this.closeRecordDefinitionList();
                this.lockRecordDefinitionListById(src.recordDefinitionList.id);
            }
        }

        this.layout = new GridLayout();
        this.layout.Deserialise(src.layout.Serialise());
    }

    convertToPrivateUserRecordDefinitionList() {
        const newList = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(this.recordDefinitionList);
        this.closeRecordDefinitionList();
        this.bindPrivateRecordDefinitionList(newList);
    }*/

    // compareNameTo(other: Table): Integer {
    //     return compareString(this.name, other.name);
    // }

    // adviseRecordDisplayOrderChanged(initiator: LockOpenListItem.Opener, newDisplayOrder: TableRecordDefinition[]) {
    //     this._orderedRecordDefinitions = newDisplayOrder;
    //     this.notifyRecordDisplayOrderChanged(initiator);
    // }

    // getGridFieldsAndInitialStates(): TableFieldAndStateArrays {
    //     return this.recordSource.fieldList.gridFieldsAndInitialStates;
    // }

    subscribeFieldsChangedEvent(handler: Table.FieldsChangedEventHandler) {
        return this._fieldsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeFieldsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeOpenEvent(handler: Table.OpenEventHandler) {
        return this._openMultiEvent.subscribe(handler);
    }
    unsubscribeOpenEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._openMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeOpenChangeEvent(handler: Table.OpenChangeEventHandler) {
        return this._openChangeMultiEvent.subscribe(handler);
    }
    unsubscribeOpenChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._openChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordsLoadedEvent(handler: Table.RecordsLoadedEventHandler) {
        return this._recordsLoadedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordsLoadedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordsLoadedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordsInsertedEvent(handler: Table.RecordsInsertedEventHandler) {
        return this._recordsInsertedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordsInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordsReplacedEvent(handler: Table.RecordsReplacedEventHandler) {
        return this._recordsReplacedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordsReplacedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordsReplacedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordsDeletedEvent(handler: Table.RecordsDeletedEventHandler) {
        return this._recordsDeletedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordsDeletedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordsDeletedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAllRecordsDeletedEvent(handler: Table.AllRecordsDeletedEventHandler) {
        return this._allRecordsDeletedMultiEvent.subscribe(handler);
    }
    unsubscribeAllRecordsDeletedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._allRecordsDeletedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordValuesChangedEvent(handler: Table.RecordValuesChangedEventHandler) {
        return this._recordValuesChangedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordValuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordSequentialFieldValuesChangedEvent(handler: Table.RecordSequentialFieldValuesChangedEventHandler) {
        return this._recordSequentialFieldValuesChangedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordSequentialFieldValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordSequentialFieldValuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordChangedEvent(handler: Table.RecordChangedEventHandler) {
        return this._recordChangedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeLayoutChangedEvent(handler: Table.LayoutChangedEventHandler) {
        return this._layoutChangedMultiEvent.subscribe(handler);
    }
    unsubscribeLayoutChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._layoutChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordDisplayOrderChangedEvent(handler: Table.RecordDisplayOrderChangedEventHandler) {
        return this._recordDisplayOrderChangedMultiEvent.subscribe(handler);
    }
    unsubscribeRecordDisplayOrderChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordDisplayOrderChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeFirstUsableEvent(handler: Table.FirstUsableEventHandler) {
        return this._firstUsableMultiEvent.subscribe(handler);
    }
    unsubscribeFirstUsableEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._firstUsableMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordDisplayOrderSetEvent(handler: Table.RecordDisplayOrderSetEventHandler) {
        return this._recordDisplayOrderSetMultiEvent.subscribe(handler);
    }
    unsubscribeRecordDisplayOrderSetEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordDisplayOrderSetMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processUsableChanged() {
        if (this.usable) {
            const recordCount = this.recordCount;
            if (recordCount > 0) {
                this.notifyRecordsInserted(0, recordCount);
            }

            if (!this._beenUsable) {
                const allRecordsBeenUsable = this.haveAllRecordsBeenIncubated();

                if (allRecordsBeenUsable) {
                    this._beenUsable = true;
                    this.notifyFirstUsable();
                }
            }
        }
    }

    private handleRecordSourceBadnessChangeEvent() {
        this.checkSetUnusable(this.recordSource.badness);
    }

    private handleRecordSourceListChangeEvent(
            listChangeTypeId: UsableListChangeTypeId,
            recordIdx: Integer,
            recordCount: Integer) {
        this.processRecordSourceListChange(listChangeTypeId, recordIdx, recordCount);
    }

    private handleRecordDefinitionListBeforeRecDefinitionChangeEvent(recordIdx: Integer) {
        this._records[recordIdx].deactivate();
    }

    private handleRecordDefinitionListAfterRecDefinitionChangeEvent(recordIdx: Integer) {
        const record = this.createRecord(recordIdx);
        this._records[recordIdx] = record;
        record.activate();

        this.notifyRecordChanged(recordIdx);
    }

    private handleRecordBecomeIncubatedEvent() {
        if (!this._beenUsable && this.recordSource.usable) {
            const allRecordsBeenIncubated = this.haveAllRecordsBeenIncubated();

            if (allRecordsBeenIncubated) {
                this._beenUsable = true;
                this.notifyFirstUsable();
            }
        }
    }

    private notifyFieldsChanged(suppressGridSchemaUpdate: boolean) {
        const handlers = this._fieldsChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](suppressGridSchemaUpdate);
        }
    }

    private notifyOpen(recordDefinitionList: TableRecordSource) {
        const handlers = this._openMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recordDefinitionList);
        }
    }

    private notifyOpenChange(opened: boolean) {
        const handlers = this._openChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](opened);
        }
    }

    private notifyRecordsLoaded() {
        const handlers = this._recordsLoadedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyRecordsInserted(firstRecordIdx: Integer, count: Integer) {
        const handlers = this._recordsInsertedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](firstRecordIdx, count);
        }
    }

    private notifyRecordsReplaced(firstRecordIdx: Integer, count: Integer) {
        const handlers = this._recordsReplacedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](firstRecordIdx, count);
        }
    }

    private notifyRecordsDeleted(firstRecordIdx: Integer, count: Integer) {
        const handlers = this._recordsDeletedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](firstRecordIdx, count);
        }
    }

    private notifyAllRecordsDeleted() {
        const handlers = this._allRecordsDeletedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyRecordValuesChanged(recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]) {
        const handlers = this._recordValuesChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recordIdx, invalidatedValues);
        }
    }

    private notifyRecordSequentialFieldValuesChanged(recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) {
        const handlers = this._recordSequentialFieldValuesChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recordIdx, fieldIdx, fieldCount);
        }
    }

    private notifyRecordChanged(recordIdx: Integer) {
        const handlers = this._recordChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recordIdx);
        }
    }

    private notifyLayoutChange(initiator: LockOpenListItem.Opener) {
        const handlers = this._layoutChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](initiator);
        }
    }

    private notifyRecordDisplayOrderChanged(initiator: LockOpenListItem.Opener) {
        const handlers = this._recordDisplayOrderChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](initiator);
        }
    }

    private notifyFirstUsable() {
        const handlers = this._firstUsableMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyRecordDisplayOrderSet(recordIndices: Integer[]) {
        const handlers = this._recordDisplayOrderSetMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recordIndices);
        }
    }

    private processRecordSourceListChange(listChangeTypeId: UsableListChangeTypeId, recordIdx: Integer, recordCount: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this.recordSource.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.clearRecords();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.insertRecords(recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this.recordSource.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(recordIdx, recordCount);
                this.notifyRecordsInserted(recordIdx, recordCount);
                // this.notifyListChange(UsableListChangeTypeId.Insert, recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.deactivateRecords(recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.AfterReplace:
                this.replaceRecords(recordIdx, recordCount);
                this.notifyRecordsReplaced(recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.Remove:
                // Delete records before notifying so that grid matches correctly
                this.deleteRecords(recordIdx, recordCount);
                this.notifyRecordsDeleted(recordIdx, recordCount);
                // this.notifyListChange(UsableListChangeTypeId.Remove, recordIdx, recordCount);
                break;
                case UsableListChangeTypeId.Clear:
                // Clear records before notifying so that grid matches correctly
                this.clearRecords();
                this.notifyAllRecordsDeleted();
                // this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.recordCount);
                break;
            default:
                throw new UnreachableCaseError('THTRDLLCE20098', listChangeTypeId);
        }
    }

    // private validateOrderedRecordDefinitions() {
    //     let recordIndices: Integer[];

    //     if (this.recordCount === 0) {
    //         this._orderedRecordDefinitions.length = 0;
    //         recordIndices = [];
    //     } else {
    //         const recordUsages = new Array<Table.RecordUsageRec>(this.recordCount);
    //         for (let i = 0; i < this.recordCount; i++) {
    //             recordUsages[i] = { record: this.getRecord(i), used: false };
    //         }

    //         const validatedDefinitions = new Array<TableRecordDefinition>(this.recordCount);
    //         recordIndices = new Array<Integer>(this.recordCount);

    //         let validatedCount = 0;

    //         for (let i = 0; i < this._orderedRecordDefinitions.length; i++) {
    //             const recordDefinition = this._orderedRecordDefinitions[i];
    //             const recordIdx = recordUsages.findIndex((usage: Table.RecordUsageRec) =>
    //                 !usage.used && usage.record.definition.sameAs(recordDefinition));

    //             if (recordIdx >= 0) {
    //                 validatedDefinitions[validatedCount] = recordDefinition;
    //                 recordIndices[validatedCount] = recordIdx;
    //                 validatedCount++;

    //                 if (validatedCount < this.recordCount) {
    //                     break;
    //                 }
    //             }
    //         }

    //         if (validatedCount < this.recordCount) {
    //             for (let i = 0; i < recordUsages.length; i++) {
    //                 if (!recordUsages[i].used) {
    //                     validatedDefinitions[validatedCount] = recordUsages[i].record.definition;
    //                     recordIndices[validatedCount] = i;
    //                     validatedCount++;

    //                     if (validatedCount === this.recordCount) {
    //                         break;
    //                     }
    //                 }
    //             }
    //         }

    //         this._orderedRecordDefinitions = validatedDefinitions;
    //     }

    //     this._orderedRecordDefinitionsValidated = true;
    //     this.notifyRecordDisplayOrderSet(recordIndices);
    // }

    private haveAllRecordsBeenIncubated() {
        return true; // do this for now - should really check all records
        // for (let i = 0; i < this._records.length; i++) {
        //     if (!this._records[i].beenIncubated) {
        //         return false;
        //     }
        // }

        // return true;
    }

    private isFieldSourcesArrayEqual(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[]) {
        const count = fieldSourceTypeIds.length;
        const activeFieldSources = this.recordSource.activeFieldSources;
        if (count !== activeFieldSources.length) {
            return false;
        } else {
            for (let i = 0; i < count; i++) {
                if (fieldSourceTypeIds[i] !== activeFieldSources[i].definition.typeId) {
                    return false;
                }
            }
            return true;
        }
    }

    private createRecord(recIdx: Integer) {
        const eventHandlers: TableRecord.EventHandlers = {
            valuesChanged: (recordIdx, invalidatedValues) => this.notifyRecordValuesChanged(recordIdx, invalidatedValues),
            sequentialfieldValuesChanged: (recordIdx, fieldIndex, fieldCount) => this.notifyRecordSequentialFieldValuesChanged(recordIdx, fieldIndex, fieldCount),
            recordChanged: (recordIdx) => this.notifyRecordChanged(recordIdx),
        }
        const record = this.recordSource.createTableRecord(recIdx, eventHandlers);
        return record;
    }

    private insertRecords(idx: Integer, insertCount: Integer) {
        const newRecordsArray = new Array<TableRecord>(insertCount);
        for (let i = 0; i < insertCount; i++) {
            const recIdx = idx + i;
            const record = this.createRecord(recIdx);
            newRecordsArray[i] = record;
        }

        this._records.splice(idx, 0, ...newRecordsArray);

        for (let i = idx + insertCount; i < this._records.length; i++) {
            this._records[i].index = i;
        }

        // this._valueChangedEventSuppressed = true;
        // try {
        for (let i = idx; i < idx + insertCount; i++) {
            this._records[i].activate();
        }
        // }
        // finally {
        //     this._valueChangedEventSuppressed = false;
        // }
    }

    private replaceAllRecords() {
        const count = this.recordCount;
        this.deactivateRecords(0, count);
        this.replaceRecords(0, count);
    }

    private deactivateRecords(idx: Integer, replaceCount: Integer) {
        for (let i = idx; i < idx + replaceCount; i++) {
            this._records[i].deactivate();
        }
    }

    private replaceRecords(idx: Integer, replaceCount: Integer) {
        for (let i = idx; i < idx + replaceCount; i++) {
            const recIdx = idx + i;
            this._records[i] = this.createRecord(recIdx);
        }

        for (let i = idx; i < idx + replaceCount; i++) {
            this._records[i].activate();
        }
    }

    private deleteRecords(idx: Integer, deleteCount: Integer) {
        for (let i = idx; i < idx + deleteCount; i++) {
            this._records[i].deactivate();
        }

        this._records.splice(idx, deleteCount);

        for (let i = idx; i < this._records.length; i++) {
            this._records[i].index = i;
        }
    }

    private clearRecords() {
        if (this.recordCount > 0) {
            for (let i = 0; i < this.recordCount; i++) {
                this._records[i].deactivate();
            }

            this._records.length = 0;
        }
    }

    private updateAllRecordValues() {
        for (let i = 0; i < this.recordCount; i++) {
            this._records[i].updateAllValues();
        }
    }

    /*function GetItems(Idx: Integer): TItem;
    function GetFieldNames(FieldIdx: Integer): string;
    function GetFieldHeadings(FieldIdx: Integer): string;
    function GetItemCount: Integer;
    function GetDefaultLayout: TGridXmlLayout;*/

    // private getStandardFieldListId(): TableFieldList.StandardId {
    //     if (this.fieldList === undefined) {
    //         return TableFieldList.StandardId.Null;
    //     } else {
    //         if (!this.fieldList.standard) {
    //             return TableFieldList.StandardId.Null;
    //         } else {
    //             return this.fieldList.standardId;
    //         }
    //     }
    // }
}

export namespace Table {
    export type FieldsChangedEventHandler = (this: void, suppressGridSchemaUpdate: boolean) => void;

    export namespace JsonTag {
        export const id = 'id';
        export const name = 'name';
        export const source = 'source';
        export const layout = 'layout';
        export const columns = 'columns';
        export const column = 'column';
        export const orderedRecordDefinitions = 'orderedRecordDefinitions';
        export const orderedRecordDefinition = 'orderedRecordDefinition';

        export namespace SerialisedColumn {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const name = 'name';
            export const show = 'show';
            export const width = 'width';
            export const priority = 'priority';
            export const ascending = 'ascending';
        }
    }

    // export interface Locker extends LockOpenListItem.Locker {
    // }

    // export interface Opener extends LockOpenListItem.Opener {
    //     isTableGrid(): boolean;

    //     notifyTableOpen(recordDefinitionList: TableRecordDefinitionList): void;
    //     notifyTableOpenChange(opened: boolean): void;
    //     notifyTableRecordsLoaded(): void;
    //     notifyTableRecordsInserted(index: Integer, count: Integer): void;
    //     notifyTableRecordsDeleted(index: Integer, count: Integer): void;
    //     notifyTableAllRecordsDeleted(): void;
    //     // notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, recordIdx: Integer, changeCount: Integer): void;
    //     notifyTableBadnessChange(): void;
    //     notifyTableRecordValuesChanged(recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]): void;
    //     notifyTableRecordFieldsChanged(recordIdx: number, fieldIndex: number, fieldCount: number): void;
    //     notifyTableRecordChanged(recordIdx: Integer): void;
    //     notifyTableLayoutUpdated(): void;
    //     notifyTableRecordDisplayOrderChanged(recordIndices: Integer[]): void;
    //     notifyTableFirstPreUsable(): void;

    //     getOrderedGridRecIndices(): Integer[];
    // }

    export interface RecordUsageRec {
        record: TableRecord;
        used: boolean;
    }

    export type ExclusiveUnlockedEventer = (this: void) => void;

    export type OpenEventHandler = (this: void, recordDefinitionList: TableRecordSource) => void;
    export type OpenChangeEventHandler = (this: void, opened: boolean) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
    export type RecordsLoadedEventHandler = (this: void) => void;
    export type RecordsInsertedEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type RecordsReplacedEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type RecordsDeletedEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type AllRecordsDeletedEventHandler = (this: void) => void;
    // export type ListChangeEvent = (this: void, listChangeType: UsableListChangeTypeId, recordIdx: Integer, recordCount: Integer) => void;
    export type RecordValuesChangedEventHandler = (this: void, recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]) => void;
    export type RecordSequentialFieldValuesChangedEventHandler = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    export type RecordChangedEventHandler = (this: void, recordIdx: Integer) => void;
    export type LayoutChangedEventHandler = (this: void, initiator: LockOpenListItem.Opener) => void;
    export type RecordDisplayOrderChangedEventHandler = (this: void, initiator: LockOpenListItem.Opener) => void;
    export type FirstUsableEventHandler = (this: void) => void;
    export type RecordDisplayOrderSetEventHandler = (this: void, recordIndices: Integer[]) => void;

    // export function createFromJson(element: JsonElement, definitionFactory: TableDefinitionFactory, ) {
    //     let id: string;
    //     id = element.tryGetGuid(Table.JsonTag.id, 'TCFJG10852');
    //     if (id === undefined) {
    //         id = nanoid();
    //     }

    //     let name = element.tryGetString(Table.JsonTag.name, 'Table.loadFromJson: name');
    //     if (name !== undefined) {
    //         name = Strings[StringId.Unnamed];
    //     }

    //     const sourceElement = element.tryGetElement(Table.JsonTag.source, 'Table.loadFromJson: source');
    //     if (sourceElement === undefined) {
    //         return Logger.logPersistError('TLFJS28289', element.stringify());
    //     } else {
    //         const definition = definitionFactory.tryCreateFromJson(sourceElement);
    //         if (definition === undefined) {
    //             return undefined;
    //         } else {
    //             this.setDefinition(definition);

    //             this.layout = this.createDefaultLayout();
    //             const layoutElement = element.tryGetElement(Table.JsonTag.layout, 'Table.loadFromJson: layout');
    //             const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
    //             if (serialisedColumns) {
    //                 this.layout.deserialise(serialisedColumns);
    //             }
    //             return true;
    //         }
    //     }

    //     return true; // remove when fixed
    // }


    export function moveRecordDefinitionsInArray(anArray: TableRecordDefinition[],
        srcIdx: Integer, srcCount: Integer, destIdx: Integer) {
        const srcBuffer = anArray.slice(srcIdx, srcIdx + srcCount);

        if (destIdx < srcIdx) {
            // Shuffle up
            let shuffleUpDestIdx = srcIdx + srcCount - 1;
            for (let shuffleSrcIdx = srcIdx - 1; shuffleSrcIdx >= destIdx; shuffleSrcIdx--) {
                anArray[shuffleUpDestIdx] = anArray[shuffleSrcIdx];
                shuffleUpDestIdx--;
            }
        } else {
            let shuffleDownDestIdx = srcIdx;
            for (let shuffleSrcIdx = srcIdx + srcCount; shuffleSrcIdx < destIdx - srcCount; shuffleSrcIdx++) {
                anArray[shuffleDownDestIdx] = anArray[shuffleSrcIdx];
                shuffleDownDestIdx++;
            }
        }

        let shuffleDestIdx = destIdx;
        for (let shuffleSrcIdx = 0; shuffleSrcIdx < srcBuffer.length; shuffleSrcIdx++) {
            anArray[shuffleDestIdx] = srcBuffer[shuffleSrcIdx];
            shuffleDestIdx++;
        }
    }
}

// export class TableList extends ComparableList<Table> {

//     compareName(leftIdx: Integer, rightIdx: Integer): Integer {
//         return this.getItem(leftIdx).compareNameTo(this.getItem(rightIdx));
//     }

//     find(name: string, ignoreCase: boolean): Integer | undefined {
//         return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
//     }

//     findCaseSensitive(name: string): Integer | undefined {
//         for (let i = 0; i < this.count; i++) {
//             if (this.getItem(i).name === name) {
//                 return i;
//             }
//         }
//         return undefined;
//     }

//     findIgnoreCase(name: string): Integer | undefined {
//         const upperName = name.toUpperCase();
//         for (let i = 0; i < this.count; i++) {
//             if (this.getItem(i).upperCaseName === upperName) {
//                 return i;
//             }
//         }
//         return undefined;
//     }
// }

// export class OpenedTable extends Table {
//     private opener: Table.Opener;

//     constructor(tableDefinitionFactoryService: TableDefinitionFactory, opener: Table.Opener) {
//         super(tableDefinitionFactoryService);

//         this.opener = opener;
//         this.openEvent = (recordDefinitionList) => this.opener.notifyTableOpen(recordDefinitionList);
//         this.openChangeEvent = (opened) => this.opener.notifyTableOpenChange(opened);
//         this.badnessChangeEvent = () => this.opener.notifyTableBadnessChange();
//         this.recordsLoadedEvent = () => this.opener.notifyTableRecordsLoaded();
//         this.recordsInsertedEvent = (index, count) => this.opener.notifyTableRecordsInserted(index, count);
//         this.recordsDeletedEvent = (index, count) => this.opener.notifyTableRecordsDeleted(index, count);
//         this.allRecordsDeletedEvent = () => this.opener.notifyTableAllRecordsDeleted();
//         // this.listChangeEvent =
//         //     (listChangeTypeId, recordIdx, recordCount) =>
//         //         this.opener.notifyTableRecordListChange(listChangeTypeId, recordIdx, recordCount);
//         this.recordValuesChangedEvent = (recordIdx, invalidatedValues) =>
//             this.opener.notifyTableRecordValuesChanged(recordIdx, invalidatedValues);
//         this.recordFieldsChangedEvent = (recordIdx, fieldIndex, fieldCount) =>
//             this.opener.notifyTableRecordFieldsChanged(recordIdx, fieldIndex, fieldCount);
//         this.recordChangedEvent = (recordIdx) => this.opener.notifyTableRecordChanged(recordIdx);
//         this.layoutChangedEvent = (subscriber) => this.handleLayoutChangedEvent(subscriber);
//         this.recordDisplayOrderChangedEvent = (subscriber) => this.handleRecordDisplayOrderChangedEvent(subscriber);
//         this.firstPreUsableEvent = () => this.opener.notifyTableFirstPreUsable();
//         this.recordDisplayOrderSetEvent = (recordIndices) => this.opener.notifyTableRecordDisplayOrderChanged(recordIndices);
//     }

//     private handleLayoutChangedEvent(subscriber: Table.Opener) {
//         // no code
//     }

//     private handleRecordDisplayOrderChangedEvent(subscriber: Table.Opener) {
//         // no code
//     }
// }
