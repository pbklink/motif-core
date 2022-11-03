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
    BrokerageAccountGroupBalancesList,
    BrokerageAccountGroupRecordList,
    SingleBrokerageAccountGroup
} from "../../adi/adi-internal-api";
import { AssertInternalError, Integer, PickEnum, UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { BalancesTableFieldSourceDefinition } from './balances-table-field-source-definition';
import { BalancesTableRecordDefinition } from './balances-table-record-definition';
import { BalancesTableValueSource } from './balances-table-value-source';
import {
    BrokerageAccountGroupRecordTableRecordSource
} from './brokerage-account-group-record-table-record-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class BalancesTableRecordSource extends BrokerageAccountGroupRecordTableRecordSource<Balances> {
    protected override readonly allowedFieldDefinitionSourceTypeIds: BalancesTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BalancesDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(
        private readonly _adi: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService
    ) {
        super(TableRecordSource.TypeId.Balances);
        this.setName(BalancesTableRecordSource.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    override get recordList() { return super.recordList as BrokerageAccountGroupBalancesList; }

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
                    const balancesValueSource = new BalancesTableValueSource(result.fieldCount, balances);
                    result.addSource(balancesValueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccounts: {
                    const brokerageAccountValueSource = new BrokerageAccountTableValueSource(result.fieldCount, balances.account);
                    result.addSource(brokerageAccountValueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('BTRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createRecordDefinition(recordIdx: Integer): BalancesTableRecordDefinition {
        const record = this.recordList.records[recordIdx];
        return {
            typeId: TableRecordDefinition.TypeId.Balances,
            mapKey: record.mapKey,
            record,
        };
    }

    override createDefaultlayout() {
        const result = new GridLayout();

        const balancesFieldSourceDefinition = this._tableFieldSourceDefinitionsService.balances;
        const brokerageAccountsFieldSourceDefinition = this._tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.AccountId));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Currency));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NetBalance));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Trading));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NonTrading));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.UnfilledBuys));
        result.addField(balancesFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Margin));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }

    private static createName() {
        return BalancesTableRecordSource.baseName + (++BalancesTableRecordSource._constructCount).toString(10);
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Balances> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountBalancesDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adi.subscribe(definition) as BrokerageAccountBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllBalancesDataDefinition();
                const dataItem = this._adi.subscribe(definition) as AllBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('BTRDLSDI199990834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupRecordList<Balances>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Balances): BalancesTableRecordDefinition {
        return {
            typeId: TableRecordDefinition.TypeId.Balances,
            mapKey:record.mapKey,
            record,
        };
    }

    private getBalancesFieldNameById(definitionSource: BalancesTableFieldSourceDefinition,
        fieldId: Balances.FieldId) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            throw new AssertInternalError('BTRSGBFNBI30299');
        } else {
            return definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
        }
    }
}

export namespace BalancesTableRecordSource {
    export const baseName = 'Balances';

    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BalancesDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;
}
