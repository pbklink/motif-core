/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import { RankedLitIvemIdListFactoryService } from '../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { ScansService } from '../../../scan/scan-internal-api';
import { SymbolDetailCacheService } from '../../../services/symbol-detail-cache-service';
import { AssertInternalError, NotImplementedError, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { WatchmakerService } from '../../../watchmaker/watchmaker-internal-api';
import { BalancesTableRecordSource } from './balances-table-record-source';
import { BrokerageAccountTableRecordSource } from './brokerage-account-table-record-source';
import { CallPutFromUnderlyingTableRecordSource } from './call-put-from-underlying-table-record-source';
import {
    BalancesTableRecordSourceDefinition,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    EditableGridLayoutDefinitionColumnTableRecordSourceDefinition,
    FeedTableRecordSourceDefinition,
    GridFieldTableRecordSourceDefinition,
    HoldingTableRecordSourceDefinition,
    LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition,
    OrderTableRecordSourceDefinition,
    PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition,
    RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition,
    RankedLitIvemIdListTableRecordSourceDefinition,
    ScanTableRecordSourceDefinition,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService,
    TopShareholderTableRecordSourceDefinition,
} from './definition/grid-table-record-source-definition-internal-api';
import { EditableGridLayoutDefinitionColumnTableRecordSource } from './editable-grid-layout-definition-column-table-record-source';
import { FeedTableRecordSource } from './feed-table-record-source';
import { GridFieldTableRecordSource } from './grid-field-table-record-source';
import { HoldingTableRecordSource } from './holding-table-record-source';
import { LitIvemDetailFromSearchSymbolsTableRecordSource } from './lit-ivem-detail-from-search-symbols-table-record-source';
import { OrderTableRecordSource } from './order-table-record-source';
import { PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSource } from './promised-lit-ivem-base-detail-from-lit-ivem-id-list-table-record-source';
import { RankedLitIvemIdListDirectoryItemTableRecordSource } from './ranked-lit-ivem-id-list-directory-item-table-record-source';
import { RankedLitIvemIdListTableRecordSource } from './ranked-lit-ivem-id-list-table-record-source';
import { ScanTableRecordSource } from './scan-table-record-source';
import { TableRecordSource } from './table-record-source';
import { TopShareholderTableRecordSource } from './top-shareholder-table-record-source';

/** @public */
export class TableRecordSourceFactoryService {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _watchmakerService: WatchmakerService,
        private readonly _scansService: ScansService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
    ) { }

    createFromDefinition(definition: TableRecordSourceDefinition): TableRecordSource {
        switch (definition.typeId) {
            case TableRecordSourceDefinition.TypeId.Null: throw new NotImplementedError('TRSFCFDN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols: return this.createLitIvemDetailFromSearchSymbols(definition);
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdList: return this.createRankedLitIvemIdList(definition);
            case TableRecordSourceDefinition.TypeId.MarketMovers: throw new NotImplementedError('TRSFCFDMM3820');
            case TableRecordSourceDefinition.TypeId.Gics: throw new NotImplementedError('TRSFCFDG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRSFCFDP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding: throw new NotImplementedError('TRSFCFDC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRSFCFDI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRSFCFDT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg: throw new NotImplementedError('TRSFCFDT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRSFCFDT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: return this.createCallPutFromUnderlying(definition);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRSFCFDH22321');
            case TableRecordSourceDefinition.TypeId.Feed: return this.createFeed(definition);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: return this.createBrokerageAccount(definition);
            case TableRecordSourceDefinition.TypeId.Order: return this.createOrder(definition);
            case TableRecordSourceDefinition.TypeId.Holding: return this.createHolding(definition);
            case TableRecordSourceDefinition.TypeId.Balances: return this.createBalances(definition);
            case TableRecordSourceDefinition.TypeId.TopShareholder: return this.createTopShareholder(definition);
            case TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: return this.createGridLayoutDefinitionColumnEditRecord(definition);
            case TableRecordSourceDefinition.TypeId.Scan: return this.createScan(definition);
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: return this.createRankedLitIvemIdListDirectoryItem(definition);
            case TableRecordSourceDefinition.TypeId.GridField: return this.createGridField(definition);
            case TableRecordSourceDefinition.TypeId.PromisedLitIvemBaseDetailFromLitIvemIdList: return this.createPromisedLitIvemBaseDetailFromLitIvemIdList(definition);
            default: throw new UnreachableCaseError('TDLFCFTID17742', definition.typeId);
        }
    }

    createLitIvemDetailFromSearchSymbols(definition: TableRecordSourceDefinition) {
        if (definition instanceof LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition) {
            return new LitIvemDetailFromSearchSymbolsTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIIFSS21099');
        }
    }

    createRankedLitIvemIdList(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListTableRecordSourceDefinition) {
            return new RankedLitIvemIdListTableRecordSource(
                this._adiService,
                this._rankedLitIvemIdListFactoryService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIIFL21099');
        }
    }

    createFeed(definition: TableRecordSourceDefinition) {
        if (definition instanceof FeedTableRecordSourceDefinition) {
            return new FeedTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCF21099');
        }
    }

    createBrokerageAccount(definition: TableRecordSourceDefinition) {
        if (definition instanceof BrokerageAccountTableRecordSourceDefinition) {
            return new BrokerageAccountTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCBA21099');
        }
    }

    createOrder(definition: TableRecordSourceDefinition) {
        if (definition instanceof OrderTableRecordSourceDefinition) {
            return new OrderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCO21099');
        }
    }

    createHolding(definition: TableRecordSourceDefinition) {
        if (definition instanceof HoldingTableRecordSourceDefinition) {
            return new HoldingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCH21099');
        }
    }

    createBalances(definition: TableRecordSourceDefinition) {
        if (definition instanceof BalancesTableRecordSourceDefinition) {
            return new BalancesTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCB21099');
        }
    }

    createCallPutFromUnderlying(definition: TableRecordSourceDefinition) {
        if (definition instanceof CallPutFromUnderlyingTableRecordSourceDefinition) {
            return new CallPutFromUnderlyingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    createTopShareholder(definition: TableRecordSourceDefinition) {
        if (definition instanceof TopShareholderTableRecordSourceDefinition) {
            return new TopShareholderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    createGridLayoutDefinitionColumnEditRecord(definition: TableRecordSourceDefinition) {
        if (definition instanceof EditableGridLayoutDefinitionColumnTableRecordSourceDefinition) {
            return new EditableGridLayoutDefinitionColumnTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCGLDCER21099');
        }
    }

    createScan(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanTableRecordSourceDefinition) {
            return new ScanTableRecordSource(
                this._scansService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCS21099');
        }
    }

    createRankedLitIvemIdListDirectoryItem(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition) {
            return new RankedLitIvemIdListDirectoryItemTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCRLIILDI21099');
        }
    }

    createGridField(definition: TableRecordSourceDefinition) {
        if (definition instanceof GridFieldTableRecordSourceDefinition) {
            return new GridFieldTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFSCGF21099');
        }
    }

    createPromisedLitIvemBaseDetailFromLitIvemIdList(definition: TableRecordSourceDefinition) {
        if (definition instanceof PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSourceDefinition) {
            return new PromisedLitIvemBaseDetailFromLitIvemIdListTableRecordSource(
                this._symbolDetailCacheService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFSCPLIIDFLIIL21099');
        }
    }
}
