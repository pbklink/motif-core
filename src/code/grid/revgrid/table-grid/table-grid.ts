import { RevColumnLayout, RevColumnLayoutOrReferenceDefinition, RevRecordRowOrderDefinition, RevSourcedFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { Subgrid } from '@xilytix/revgrid';
import { AssertInternalError, CorrectnessState, Integer, LockOpenListItem, MultiEvent, Ok, Result } from '@xilytix/sysutils';
import { SettingsService } from '../../../services/internal-api';
import { Badness } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { AllowedSourcedFieldsColumnLayoutDefinition, ReferenceableColumnLayoutsService } from '../../layout/internal-api';
import { Table, TableFieldSourceDefinitionCachingFactoryService, TableRecordDefinition, TableRecordSource, TableRecordSourceDefinition, TableRecordStore } from '../../table/internal-api';
import { DataSource, DataSourceOrReference, DataSourceOrReferenceDefinition, ReferenceableDataSourcesService, TableRecordSourceDefinitionFromJsonFactory, TableRecordSourceFactory } from '../../typed/internal-api';
import { AdaptedRevgrid } from '../adapted-revgrid/internal-api';
import { CellPainterFactoryService } from '../cell-painters/internal-api';
import { RecordGrid } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';

export class TableGrid extends RecordGrid {
    opener: LockOpenListItem.Opener;
    keepPreviousLayoutIfPossible = false;
    keptColumnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined;

    openedEventer: TableGrid.OpenedEventer | undefined;
    columnLayoutSetEventer: TableGrid.ColumnLayoutSetEventer | undefined;

    private readonly _recordStore: TableRecordStore;

    private _lockedGridSourceOrReference: DataSourceOrReference | undefined;
    private _openedDataSource: DataSource | undefined;
    private _openedTable: Table | undefined;

    private _keptRowOrderDefinition: RevRecordRowOrderDefinition | undefined;
    private _keptGridRowAnchor: RecordGrid.ViewAnchor | undefined;

    private _autoSizeAllColumnWidthsOnFirstUsable: boolean;

    private _tableFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _tableFirstUsableSubscriptionId: MultiEvent.SubscriptionId;
    private _gridSourceColumnLayoutSetSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        readonly gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadingsService,
        private readonly _referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        readonly tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        readonly tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFromJsonFactory,
        private readonly _tableRecordSourceFactory: TableRecordSourceFactory,
        private readonly _referenceableGridSourcesService: ReferenceableDataSourcesService,
        readonly cellPainterFactoryService: CellPainterFactoryService,
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        customGridSettings: AdaptedRevgrid.CustomGridSettings,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        externalParent: unknown,
    ) {
        const recordStore = new TableRecordStore();
        super(settingsService, gridHostElement, recordStore, customGridSettings, customiseSettingsForNewColumnEventer, getMainCellPainterEventer, getHeaderCellPainterEventer, externalParent);
        this._recordStore = recordStore;
    }

    get recordCount(): Integer { return this._openedTable === undefined ? 0 : this._openedTable.recordCount; }
    get opened(): boolean { return this._openedTable !== undefined; }
    get openedTable() {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('TGGOT32072');
        } else {
            return this._openedTable;
        }
    }
    get openedRecordSource(): TableRecordSource {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('TGGORS32072');
        } else {
            return this._openedTable.recordSource as TableRecordSource;
        }
    }
    get badness(): Badness {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('TGGG32072');
        } else {
            return this._openedTable.badness;
        }
    }

    tryOpenGridSource(definition: DataSourceOrReferenceDefinition, keepView: boolean): Promise<Result<DataSourceOrReference>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<DataSourceOrReference>) => void;
        const resultPromise = new Promise<Result<DataSourceOrReference>>((res) => {
            resolve = res;
        });

        this.closeGridSource(keepView);

        if (definition.canUpdateColumnLayoutDefinitionOrReference() &&
            this.keepPreviousLayoutIfPossible &&
            this.keptColumnLayoutOrReferenceDefinition !== undefined
        ) {
            definition.updateColumnLayoutDefinitionOrReference(this.keptColumnLayoutOrReferenceDefinition);
        }
        const gridSourceOrReference = new DataSourceOrReference(
            this._referenceableColumnLayoutsService,
            this.tableFieldSourceDefinitionCachingFactoryService.definitionFactory,
            this._tableRecordSourceFactory,
            this._referenceableGridSourcesService,
            definition
        );

        const dataSourceOrReferenceLockPromise = DataSourceOrReference.tryLock(gridSourceOrReference, this.opener);
        dataSourceOrReferenceLockPromise.then(
            (lockResult) => {
                if (lockResult.isErr()) {
                    resolve(lockResult.createType());
                } else {
                    const gridSource = gridSourceOrReference.lockedDataSource;
                    if (gridSource === undefined) {
                        throw new AssertInternalError('GSFOGSL22209');
                    } else {
                        gridSource.openLocked(this.opener);
                        const table = gridSource.table;
                        if (table === undefined) {
                            throw new AssertInternalError('GSFOGSTA22209');
                        } else {
                            const layout = gridSource.lockedColumnLayout;
                            if (layout === undefined) {
                                throw new AssertInternalError('GSFOGSGL22209');
                            } else {
                                this._lockedGridSourceOrReference = gridSourceOrReference;
                                this._openedDataSource = gridSource;
                                this._openedTable = table;

                                this.notifyOpened(/*gridSourceOrReference*/);

                                this._gridSourceColumnLayoutSetSubscriptionId = this._openedDataSource.subscribeColumnLayoutSetEvent(
                                    () => this.handleGridSourceColumnLayoutSetEvent()
                                );

                                this._recordStore.setTable(table);
                                this._tableFieldsChangedSubscriptionId = table.subscribeFieldsChangedEvent(
                                    () => super.updateAllowedFields(table.fields)
                                );

                                super.initialiseAllowedFields(table.fields);

                                if (table.beenUsable) {
                                    this.applyFirstUsableFromLayout(layout);
                                } else {
                                    this._tableFirstUsableSubscriptionId = table.subscribeFirstUsableEvent(() => {
                                        table.unsubscribeFirstUsableEvent(this._tableFirstUsableSubscriptionId);
                                        this.applyFirstUsableFromLayout(layout);
                                    });
                                }

                                this.notifyColumnLayoutSet(layout);

                                resolve(new Ok(gridSourceOrReference));
                            }
                        }
                    }
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'TGTOGS35791'); }
        );

        return resultPromise;
    }

    closeGridSource(keepView: boolean) {
        if (this._lockedGridSourceOrReference !== undefined) {
            const openedTable = this._openedTable;
            if (openedTable === undefined || this._openedDataSource === undefined) {
                throw new AssertInternalError('GSF22209');
            } else {
                openedTable.unsubscribeFieldsChangedEvent(this._tableFieldsChangedSubscriptionId);
                this._tableFieldsChangedSubscriptionId = undefined;
                openedTable.unsubscribeFirstUsableEvent(this._tableFirstUsableSubscriptionId); // may not be subscribed
                this._tableFirstUsableSubscriptionId = undefined;
                this._tableFieldsChangedSubscriptionId = undefined;
                this._openedDataSource.unsubscribeColumnLayoutSetEvent(this._gridSourceColumnLayoutSetSubscriptionId);
                this._gridSourceColumnLayoutSetSubscriptionId = undefined;
                if (this.keepPreviousLayoutIfPossible) {
                    this.keptColumnLayoutOrReferenceDefinition = this.createColumnLayoutOrReferenceDefinition();
                } else {
                    this.keptColumnLayoutOrReferenceDefinition = undefined;
                }
                if (keepView) {
                    this._keptRowOrderDefinition = super.getRowOrderDefinition();
                    this._keptGridRowAnchor = super.getViewAnchor();
                } else {
                    this._keptRowOrderDefinition = undefined;
                    this._keptGridRowAnchor = undefined;
                }
                const opener = this.opener;
                this._openedDataSource.closeLocked(opener);
                this._lockedGridSourceOrReference.unlock(opener);
                this._lockedGridSourceOrReference = undefined;
                this._openedTable = undefined;
            }

            super.setActiveColumns([]);
        }
    }

    createGridSourceOrReferenceDefinition(): DataSourceOrReferenceDefinition {
        if (this._lockedGridSourceOrReference === undefined) {
            throw new AssertInternalError('GSFCGSONRD22209');
        } else {
            const rowOrderDefinition = super.getRowOrderDefinition();
            return this._lockedGridSourceOrReference.createDefinition(rowOrderDefinition);
        }
    }

    createColumnLayoutOrReferenceDefinition() {
        if (this._openedDataSource === undefined) {
            throw new AssertInternalError('GSFCCGLONRD22209');
        } else {
            return this._openedDataSource.createColumnLayoutOrReferenceDefinition();
        }
    }

    createTableRecordSourceDefinition(): TableRecordSourceDefinition {
        if (this._openedDataSource === undefined) {
            throw new AssertInternalError('GSFCGSONRD22209');
        } else {
            return this._openedDataSource.createTableRecordSourceDefinition();
        }
    }

    tryOpenColumnLayoutOrReferenceDefinition(columnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition) {
        if (this._openedDataSource === undefined) {
            throw new AssertInternalError('GSFOGLONRD22209');
        } else {
            return DataSource.tryOpenColumnLayoutOrReferenceDefinition(this._openedDataSource, columnLayoutOrReferenceDefinition, this.opener);
        }
    }

    applyColumnLayoutOrReferenceDefinition(definition: RevColumnLayoutOrReferenceDefinition) {
        if (this._openedDataSource === undefined) {
            throw new AssertInternalError('GSFAGLD22209');
        } else {
            const promise = this._openedDataSource.tryOpenColumnLayoutOrReferenceDefinition(definition, this.opener);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'GSFIG81190', this.opener.lockerName);
        }
    }

    createRecordDefinition(index: Integer): TableRecordDefinition {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('GSFCRD89981');
        } else {
            return this._openedTable.createRecordDefinition(index);
        }
    }

    canCreateAllowedSourcedFieldsColumnLayoutDefinition() {
        return this._openedTable !== undefined;
    }

    clearRendering() {
        if (this._openedTable !== undefined) {
            this._openedTable.clearRendering();
        }
    }

    subscribeBadnessChangedEvent(handler: CorrectnessState.BadnessChangedEventHandler) {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('TGSBCE35791');
        } else {
            return this._openedTable.subscribeBadnessChangedEvent(handler);
        }
    }

    unsubscribeBadnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('TGUBCE35791');
        } else {
            this._openedTable.unsubscribeBadnessChangedEvent(subscriptionId);
        }
    }

    override createAllowedSourcedFieldsColumnLayoutDefinition(): AllowedSourcedFieldsColumnLayoutDefinition {
        if (this._openedTable === undefined) {
            throw new AssertInternalError('GSFCAFALD56678');
        } else {
            const allowedFields = this._openedTable.createAllowedFields();
            return super.createAllowedSourcedFieldsColumnLayoutDefinition(allowedFields);
        }
    }

    private applyFirstUsableFromLayout(layout: RevColumnLayout) {
        let rowOrderDefinition = this._keptRowOrderDefinition;
        this._keptRowOrderDefinition = undefined;
        if (rowOrderDefinition === undefined) {
            if (this._openedDataSource === undefined) {
                throw new AssertInternalError('GSFAFU22209');
            } else {
                rowOrderDefinition = this._openedDataSource.initialRowOrderDefinition;
            }
        }
        const viewAnchor = this._keptGridRowAnchor;
        this._keptGridRowAnchor = undefined;
        super.applyFirstUsable(rowOrderDefinition, viewAnchor, layout);
    }

    private handleGridSourceColumnLayoutSetEvent() {
        if (this._openedDataSource === undefined) {
            throw new AssertInternalError('GSFHGSGLSE22209');
        } else {
            const newLayout = this._openedDataSource.lockedColumnLayout;
            if (newLayout === undefined) {
                throw new AssertInternalError('GSFHGSGLCE22202');
            } else {
                super.updateColumnLayout(newLayout);
                this.notifyColumnLayoutSet(newLayout);
            }
        }
    }

    private notifyOpened() {
        if (this.openedEventer !== undefined) {
            this.openedEventer();
        }
    }

    private notifyColumnLayoutSet(layout: RevColumnLayout) {
        if (this.columnLayoutSetEventer !== undefined) {
            this.columnLayoutSetEventer(layout);
        }
    }
}

export namespace TableGrid {
    export type OpenedEventer = (this: void) => void;
    export type ColumnLayoutSetEventer = (this: void, layout: RevColumnLayout) => void;
}
