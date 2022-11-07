/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AllBalancesDataDefinition,
    AllBalancesDataItem,
    Balances,
    BrokerageAccountBalancesDataDefinition,
    BrokerageAccountBalancesDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    SingleBrokerageAccountGroup
} from '../../../adi/adi-internal-api';
import { Integer, PickEnum, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { BalancesTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableValueList } from '../record/grid-table-record-internal-api';
import { BalancesTableValueSource, BrokerageAccountTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import {
    BrokerageAccountGroupTableRecordSource
} from './brokerage-account-group-table-record-source';
import { BalancesTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';

export class BalancesTableRecordSource
    extends BrokerageAccountGroupTableRecordSource<Balances, BrokerageAccountGroupRecordList<Balances>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: BalancesTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BalancesDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        definition: BalancesTableRecordSourceDefinition,
    ) {
        super(definition);
    }

    override createRecordDefinition(idx: Integer): BalancesTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.Balances,
            mapKey: record.mapKey,
            record,
        }
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const balances = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId = fieldDefinitionSource.typeId as BalancesTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.BalancesDataItem: {
                    const valueSource = new BalancesTableValueSource(result.fieldCount, balances);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccounts: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, balances.account);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('BTRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultLayout() {
        const result = new GridLayout();

        const balancesDataItemFieldSourceDefinition = this._tableFieldSourceDefinitionsService.balances;
        const brokerageAccountsFieldSourceDefinition = this._tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.AccountId));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Currency));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NetBalance));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Trading));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NonTrading));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.UnfilledBuys));
        result.addField(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Margin));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Balances> {
        switch (this._brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this._brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountBalancesDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adiService.subscribe(definition) as BrokerageAccountBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllBalancesDataDefinition();
                const dataItem = this._adiService.subscribe(definition) as AllBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('BTRDLSDI199990834346', this._brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(_list: BrokerageAccountGroupRecordList<Balances>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}

export namespace BalancesTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BalancesDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;
}
