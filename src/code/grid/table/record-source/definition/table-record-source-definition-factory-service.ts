/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup, IvemId, LitIvemId, SearchSymbolsDataDefinition } from '../../../../adi/adi-internal-api';
import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListDirectory
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ErrorCode, JsonElement, LockOpenListItem, NotImplementedError, Ok, Result, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { GridField, GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { BalancesTableRecordSourceDefinition } from './balances-table-record-source-definition';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { BrokerageAccountTableRecordSourceDefinition } from './brokerage-account-table-record-source-definition';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './call-put-from-underlying-table-record-source-definition';
import { EditableGridLayoutDefinitionColumnList } from './editable-grid-layout-definition-column-list';
import { EditableGridLayoutDefinitionColumnTableRecordSourceDefinition } from './editable-grid-layout-definition-column-table-record-source-definition';
import { FeedTableRecordSourceDefinition } from './feed-table-record-source-definition';
import { GridFieldTableRecordSourceDefinition } from './grid-field-table-record-source-definition';
import { HoldingTableRecordSourceDefinition } from './holding-table-record-source-definition';
import { LitIvemIdFromSearchSymbolsTableRecordSourceDefinition } from './lit-ivem-id-from-symbol-search-table-record-source-definition';
import { OrderTableRecordSourceDefinition } from './order-table-record-source-definition';
import { RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-directory-item-table-record-source-definition';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';
import { ScanTableRecordSourceDefinition } from './scan-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { TopShareholderTableRecordSourceDefinition } from './top-shareholder-table-record-source-definition';

/** @public */
export class TableRecordSourceDefinitionFactoryService {
    constructor(
        private readonly _litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        readonly tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
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
        return new LitIvemIdFromSearchSymbolsTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            dataDefinition,
        );
    }

    createRankedLitIvemIdList(definition: RankedLitIvemIdListDefinition) {
        return new RankedLitIvemIdListTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            definition,
        );
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            underlyingIvemId
        );
    }

    createFeed() {
        return new FeedTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
        );
    }

    createBrokerageAccount() {
        return new BrokerageAccountTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
        );
    }

    createOrder(brokerageAccountGroup: BrokerageAccountGroup) {
        return new OrderTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            brokerageAccountGroup,
        );
    }

    createHolding(brokerageAccountGroup: BrokerageAccountGroup) {
        return new HoldingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            brokerageAccountGroup,
        );
    }

    createBalances(brokerageAccountGroup: BrokerageAccountGroup) {
        return new BalancesTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
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
            this.tableFieldSourceDefinitionRegistryService,
            litIvemId,
            tradingDate,
            compareToTradingDate,
        );
    }

    createEditableGridLayoutDefinitionColumn(list: EditableGridLayoutDefinitionColumnList) {
        return new EditableGridLayoutDefinitionColumnTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            list
        );
    }

    createGridField(gridFieldArray: GridField[]) {
        return new GridFieldTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            gridFieldArray,
        );
    }

    createScan() {
        return new ScanTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
        );
    }

    createRankedLitIvemIdListDirectoryItem(rankedLitIvemIdListDirectory: RankedLitIvemIdListDirectory) {
        return new RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
            rankedLitIvemIdListDirectory,
        );
    }

    private tryCreateTypedFromJson(element: JsonElement, typeId: TableRecordSourceDefinition.TypeId): Result<TableRecordSourceDefinition> {
        switch (typeId) {
            case TableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSDFTCTFJN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols: {
                const definitionResult = LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateDataDefinitionFromJson(element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.LitIvemIdFromSearchSymbolsTableRecordSourceDefinition_DataDefinitionCreateError);
                } else {
                    const definition = this.createLitIvemIdFromSearchSymbols(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdList: {
                const rankedLitIvemIdListDefinitionResult = RankedLitIvemIdListTableRecordSourceDefinition.tryCreateDefinition(
                    this._litIvemIdListDefinitionFactoryService,
                    element
                );
                if (rankedLitIvemIdListDefinitionResult.isErr()) {
                    const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionOrNamedExplicitReferenceIsInvalid;
                    return rankedLitIvemIdListDefinitionResult.createOuter(errorCode);
                } else {
                    const rankedLitIvemIdListDefinition = rankedLitIvemIdListDefinitionResult.value;

                    const definition = new RankedLitIvemIdListTableRecordSourceDefinition(
                        this.gridFieldCustomHeadingsService,
                        this.tableFieldSourceDefinitionRegistryService,
                        rankedLitIvemIdListDefinition
                    )
                    return new Ok(definition);
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
                    return underlyingIvemIdResult.createOuter(ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdIsInvalid);
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
                    return createParametersResult.createOuter(ErrorCode.TopShareholderTableRecordSourceDefinition_CreateParametersError);
                } else {
                    const { litIvemId, tradingDate, compareToTradingDate } = createParametersResult.value;
                    const definition = this.createTopShareholder(litIvemId, tradingDate, compareToTradingDate);
                    return new Ok(definition);
                }
            }
            case TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: {
                const list = new EditableGridLayoutDefinitionColumnList();
                const definition = this.createEditableGridLayoutDefinitionColumn(list); // persistence not implemented
                return new Ok(definition);
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
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}
