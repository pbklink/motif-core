/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup, IvemId, LitIvemId, SearchSymbolsDataDefinition } from '../../../../adi/adi-internal-api';
import {
    LitIvemIdArrayRankedLitIvemIdListDefinition,
    LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListDirectory,
    ScanIdRankedLitIvemIdListDefinition,
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { AssertInternalError, ErrorCode, JsonElement, LockOpenListItem, NotImplementedError, Ok, Result, UiComparableList, UnreachableCaseError } from '../../../../sys/internal-api';
import { GridField, GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { TableFieldSourceDefinitionCachedFactoryService } from '../../field-source/grid-table-field-source-internal-api';
import { BalancesTableRecordSourceDefinition } from './balances-table-record-source-definition';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { BrokerageAccountTableRecordSourceDefinition } from './brokerage-account-table-record-source-definition';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './call-put-from-underlying-table-record-source-definition';
import { FeedTableRecordSourceDefinition } from './feed-table-record-source-definition';
import { GridFieldTableRecordSourceDefinition } from './grid-field-table-record-source-definition';
import { HoldingTableRecordSourceDefinition } from './holding-table-record-source-definition';
import { LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition } from './lit-ivem-detail-from-symbol-search-table-record-source-definition';
import { LitIvemIdComparableListTableRecordSourceDefinition } from './lit-ivem-id-comparable-list-table-record-source-definition';
import { OrderTableRecordSourceDefinition } from './order-table-record-source-definition';
import { RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-directory-item-table-record-source-definition';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';
import { ScanTableRecordSourceDefinition } from './scan-table-record-source-definition';
import { ScanTestTableRecordSourceDefinition } from './scan-test-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { TopShareholderTableRecordSourceDefinition } from './top-shareholder-table-record-source-definition';
import { WatchlistTableRecordSourceDefinition } from './watchlist-table-record-source-definition';

/** @public */
export class TableRecordSourceDefinitionFactoryService {
    constructor(
        private readonly _litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        readonly tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
    ) {

    }

    tryCreateFromJson(element: JsonElement): Result<TableRecordSourceDefinition> {
        const typeIdResult = TableRecordSourceDefinition.tryGetTypeIdFromJson(element);
        if (typeIdResult.isErr()) {
            return typeIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_TypeId);
        } else {
            const definitionResult = this.tryCreateTypedFromJson(element, typeIdResult.value);
            if (definitionResult.isErr()) {
                return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_Definition);
            } else {
                const definition = definitionResult.value;
                return new Ok(definition);
            }
        }
    }

    createLitIvemIdFromSearchSymbols(dataDefinition: SearchSymbolsDataDefinition) {
        return new LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            dataDefinition,
        );
    }

    createLitIvemIdComparableList(list: UiComparableList<LitIvemId>) {
        return new LitIvemIdComparableListTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            list,
        );
    }

    createRankedLitIvemIdList(definition: RankedLitIvemIdListDefinition) {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan:
                if (definition instanceof LitIvemIdExecuteScanRankedLitIvemIdListDefinition) {
                    return new ScanTestTableRecordSourceDefinition(
                        this.gridFieldCustomHeadingsService,
                        this.tableFieldSourceDefinitionCachedFactoryService,
                        definition,
                    );
                } else {
                    throw new AssertInternalError('TRSDFSCRLIILLIIES44456', definition.typeId.toString());
                }
            case RankedLitIvemIdListDefinition.TypeId.ScanId:
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray:
                return new WatchlistTableRecordSourceDefinition(
                    this.gridFieldCustomHeadingsService,
                    this.tableFieldSourceDefinitionCachedFactoryService,
                    definition as (LitIvemIdArrayRankedLitIvemIdListDefinition | ScanIdRankedLitIvemIdListDefinition),
                );
            case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                throw new NotImplementedError('TRSDFSCRLIILWLI44456');
            default:
                throw new UnreachableCaseError('TRSDFSCRLIILD44456', definition.typeId);
        }
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            underlyingIvemId
        );
    }

    createFeed() {
        return new FeedTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
        );
    }

    createBrokerageAccount() {
        return new BrokerageAccountTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
        );
    }

    createOrder(brokerageAccountGroup: BrokerageAccountGroup) {
        return new OrderTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            brokerageAccountGroup,
        );
    }

    createHolding(brokerageAccountGroup: BrokerageAccountGroup) {
        return new HoldingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            brokerageAccountGroup,
        );
    }

    createBalances(brokerageAccountGroup: BrokerageAccountGroup) {
        return new BalancesTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            brokerageAccountGroup,
        );
    }

    createTopShareholder(
        litIvemId: LitIvemId,
        tradingDate: Date | undefined,
        compareToTradingDate: Date | undefined
    ) {
        return new TopShareholderTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            litIvemId,
            tradingDate,
            compareToTradingDate,
        );
    }

    createGridField(gridFieldArray: GridField[]) {
        return new GridFieldTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            gridFieldArray,
        );
    }

    createScan() {
        return new ScanTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
        );
    }

    createRankedLitIvemIdListDirectoryItem(rankedLitIvemIdListDirectory: RankedLitIvemIdListDirectory) {
        return new RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            rankedLitIvemIdListDirectory,
        );
    }

    createScanTest(listDefinition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition) {
        return new ScanTestTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            listDefinition,
        );
    }

    // createLitIvemIdComparableList(list: UiComparableList<LitIvemId>) {
    //     return new LitIvemIdComparableListTableRecordSourceDefinition(
    //         this.gridFieldCustomHeadingsService,
    //         this.tableFieldSourceDefinitionCachedFactoryService,
    //         list,
    //     );
    // }

    private tryCreateTypedFromJson(element: JsonElement, typeId: TableRecordSourceDefinition.TypeId): Result<TableRecordSourceDefinition> {
        switch (typeId) {
            case TableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSDFTCTFJN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols: {
                const definitionResult = LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.tryCreateDataDefinitionFromJson(element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_LitIvemDetailsFromSearchSymbols_DataDefinitionCreateError);
                } else {
                    const definition = this.createLitIvemIdFromSearchSymbols(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.LitIvemIdComparableList: {
                const definitionResult = LitIvemIdComparableListTableRecordSourceDefinition.tryCreateListFromElement(element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_LitIvemIdComparableList_CreateListError);
                } else {
                    const definition = this.createLitIvemIdComparableList(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdList: {
                const rankedLitIvemIdListDefinitionResult = RankedLitIvemIdListTableRecordSourceDefinition.tryCreateDefinition(
                    this._litIvemIdListDefinitionFactoryService,
                    element
                );
                if (rankedLitIvemIdListDefinitionResult.isErr()) {
                    const errorCode = ErrorCode.TableRecordSourceDefinitionFactoryService_Watchlist_DefinitionOrNamedExplicitReferenceIsInvalid;
                    return rankedLitIvemIdListDefinitionResult.createOuter(errorCode);
                } else {
                    const rankedLitIvemIdListDefinition = rankedLitIvemIdListDefinitionResult.value;

                    switch (rankedLitIvemIdListDefinition.typeId) {
                        case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray: {
                            const definition = new WatchlistTableRecordSourceDefinition(
                                this.gridFieldCustomHeadingsService,
                                this.tableFieldSourceDefinitionCachedFactoryService,
                                rankedLitIvemIdListDefinition as LitIvemIdArrayRankedLitIvemIdListDefinition
                            )
                            return new Ok(definition);
                        }
                        case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                            throw new NotImplementedError('TRSDFSRLIILWLII78783');
                        case RankedLitIvemIdListDefinition.TypeId.ScanId:
                            throw new NotImplementedError('TRSDFSRLIILSI78783');
                        case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan: {
                            const definition = this.createScanTest(rankedLitIvemIdListDefinition as LitIvemIdExecuteScanRankedLitIvemIdListDefinition);
                            return new Ok(definition);
                        }
                        default:
                            throw new UnreachableCaseError('TRSDFSRLIILU78783', rankedLitIvemIdListDefinition.typeId);
                    }
                }
            }
            case TableRecordSourceDefinition.TypeId.MarketMovers:
                throw new NotImplementedError('TRSDFTCTFJMM3820');
            case TableRecordSourceDefinition.TypeId.Gics:
                throw new NotImplementedError('TRSDFTCTFJG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding:
                throw new NotImplementedError('TRSDFTCTFJP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding:
                throw new NotImplementedError('TRSDFTCTFJC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec:
                throw new NotImplementedError('TRSDFTCTFJI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs:
                throw new NotImplementedError('TRSDFTCTFJT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg:
                throw new NotImplementedError('TRSDFTCTFJT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying:
                throw new NotImplementedError('TRSDFTCTFJT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: {
                const underlyingIvemIdResult = CallPutFromUnderlyingTableRecordSourceDefinition.tryGetUnderlyingIvemIdFromJson(element);
                if (underlyingIvemIdResult.isErr()) {
                    return underlyingIvemIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_CallPutFromUnderlying_UnderlyingIvemIdIsInvalid);
                } else {
                    const definition = this.createCallPutFromUnderlying(underlyingIvemIdResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSDFTCTFJH22321');
            case TableRecordSourceDefinition.TypeId.Feed: {
                const definition = this.createFeed();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: {
                const definition = this.createBrokerageAccount();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Order: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createOrder(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Holding: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createHolding(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.Balances: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createBalances(group);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.TopShareholder: {
                const createParametersResult = TopShareholderTableRecordSourceDefinition.tryGetCreateParametersFromJson(element);
                if (createParametersResult.isErr()) {
                    return createParametersResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TopShareholder_CreateParametersError);
                } else {
                    const { litIvemId, tradingDate, compareToTradingDate } = createParametersResult.value;
                    const definition = this.createTopShareholder(litIvemId, tradingDate, compareToTradingDate);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: {
                throw new AssertInternalError('TRSDFSTCTFJEGLDC45550', 'outside');
            }
            case TableRecordSourceDefinition.TypeId.Scan: {
                const definition = this.createScan();
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: {
                // currently not supported
                const locker: LockOpenListItem.Locker = {
                    lockerName: 'Unsupport JSON TableRecordSourceDefinition'
                };
                const emptyRankedLitItemListDirectory = new RankedLitIvemIdListDirectory([], locker);
                const definition = this.createRankedLitIvemIdListDirectoryItem(emptyRankedLitItemListDirectory);
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.GridField: {
                const definition = this.createGridField([]); // persistence not implemented
                return new Ok(definition);
            }
            case TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: {
                throw new AssertInternalError('TRSDFSTCTFJSFEF45550', 'outside');
            }
            case TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: {
                throw new AssertInternalError('TRSDFSTCTFJSEANC45550', 'outside');
            }
            case TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: {
                throw new AssertInternalError('TRSDFSTCTFLONCL45550', 'outside');
            }
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}
