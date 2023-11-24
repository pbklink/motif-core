/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Badness,
    CorrectnessId,
    Integer,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '../sys/sys-internal-api';
import { Account } from './account';
import { BrokerageAccountsDataItem } from './brokerage-accounts-data-item';
import {
    BrokerageAccountSubscriptionDataDefinition,
    BrokerageAccountsDataDefinition,
    DataDefinition,
    FeedInfo,
    SubscribabilityExtentId
} from './common/adi-common-internal-api';
import { SubscribabilityExtentSubscriptionDataItem } from './publish-subscribe/internal-api';

export class BrokerageAccountSubscriptionDataItem extends SubscribabilityExtentSubscriptionDataItem {
    readonly accountKey: Account.Key;

    private _accountsDataItem: BrokerageAccountsDataItem;
    private _accountsCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _accountsListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _account: Account | undefined;
    private _accountCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(definition: DataDefinition) {
        super(definition);
        if (
            !(definition instanceof BrokerageAccountSubscriptionDataDefinition)
        ) {
            throw new AssertInternalError(
                'BASDIC08811695537',
                definition.description
            );
        } else {
            this.accountKey = new Account.Key(
                definition.accountId,
                definition.environmentId
            );
        }
    }

    get accountId() {
        return this.accountKey.id;
    }
    get account() {
        return this._account;
    } // not to be cached
    get accounts() {
        return this._accountsDataItem.records;
    }
    get accountsUsable() {
        return this._accountsDataItem.usable;
    }

    protected override start() {
        const accountsDataDefinition = new BrokerageAccountsDataDefinition();
        this._accountsDataItem = this.subscribeDataItem(
            accountsDataDefinition
        ) as BrokerageAccountsDataItem;

        this._accountsCorrectnessChangeSubscriptionId = this._accountsDataItem.subscribeCorrectnessChangedEvent(
            () => { this.handleAccountsCorrectnessChangedEvent(); }
        );

        this._accountsListChangeSubscriptionId = this._accountsDataItem.subscribeListChangeEvent(
            (listChangeType, index, count) => {
                this.handleAccountsListChangeEvent(listChangeType, index, count);
            }
        );

        super.start();

        if (this._accountsDataItem.usable) {
            this.processAccountsBecameUsable();
        } else {
            this.setAccountsUnusableBadness();
        }
    }

    protected override stop() {
        super.stop();

        this.clearAccount();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._accountsDataItem !== undefined) {
            this._accountsDataItem.unsubscribeListChangeEvent(
                this._accountsListChangeSubscriptionId
            );
            this._accountsDataItem.unsubscribeCorrectnessChangedEvent(
                this._accountsCorrectnessChangeSubscriptionId
            );
            this.unsubscribeDataItem(this._accountsDataItem);
            this._accountsDataItem = undefined as unknown as BrokerageAccountsDataItem;
        }
    }

    /** Give descendants an opportunity to process this as well */
    protected processAccountsBecameUsable() {
        this.checkAccount();
    }

    /** Give descendants an opportunity to initialise data using Feed */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected processAccountBecameAvailable() {

    }

    protected override calculateUsabilityBadness() {
        // Normally would priortise badness from base class.  However subscription cannot come online without Feed or Feed Data
        // So if Feed or Feed Data not available, prioritise this badness
        if (this._account === undefined) {
            if (!this._accountsDataItem.usable) {
                return this.calculateAccountsUnusableBadness();
            } else {
                return {
                    reasonId: Badness.ReasonId.BrokerageAccountNotAvailable,
                    reasonExtra: this.accountId,
                };
            }
        } else {
            if (!this._account.usable) {
                return this.calculateAccountUnusableBadness(this._account);
            } else {
                return super.calculateUsabilityBadness();
            }
        }
    }

    private handleAccountsCorrectnessChangedEvent() {
        if (!this._accountsDataItem.usable) {
            this.setAccountsUnusableBadness();
        }
    }

    private handleAccountsListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        this.processAccountsListChange(listChangeTypeId, index, count);
    }

    private handleAccountCorrectnessChangedEvent() {
        this.processAccountCorrectnessChanged();
    }

    private processAccountsListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._accountsDataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.clearAccount();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                // no action
                break;
            case UsableListChangeTypeId.Usable:
                this.processAccountsBecameUsable();
                break;
            case UsableListChangeTypeId.Insert:
                this.checkAccount();
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('BASDIPALCBR19662', this.definition.description);
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('BASDIPALCAR19662', this.definition.description);
            case UsableListChangeTypeId.Remove:
                this.checkClearAccount(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.clearAccount();
                break;
            default:
                throw new UnreachableCaseError(
                    'FSDIPMLCU10009134',
                    listChangeTypeId
                );
        }
    }

    private checkAccount() {
        if (this._account === undefined) {
            this._account = this._accountsDataItem.getAccountByKey(
                this.accountKey
            );
            if (this._account !== undefined) {
                this._accountCorrectnessChangedSubscriptionId = this._account.subscribeCorrectnessChangedEvent(
                    () => { this.handleAccountCorrectnessChangedEvent(); }
                );
                this.processAccountBecameAvailable();
                this.processAccountCorrectnessChanged();
            }
        }
    }

    private processAccountCorrectnessChanged() {
        if (this._account === undefined) {
            throw new AssertInternalError('BASDIPACC10055382');
        } else {
            if (!this._account.usable) {
                const badness = this.calculateAccountUnusableBadness(
                    this._account
                );
                this.setUnusable(badness);
            }
            this.updateSubscribabilityExtent();
        }
    }

    private clearAccount() {
        if (this._account !== undefined) {
            this._account.unsubscribeCorrectnessChangedEvent(
                this._accountCorrectnessChangedSubscriptionId
            );
            this._accountCorrectnessChangedSubscriptionId = undefined;
            this._account = undefined;
            this.setSubscribabilityExtent(SubscribabilityExtentId.None);
        }
    }

    private checkClearAccount(index: Integer, count: Integer) {
        if (this._account !== undefined) {
            for (let i = index; i < index + count; i++) {
                const account = this._accountsDataItem.records[i];
                if (account === this._account) {
                    this.clearAccount();
                    return;
                }
            }
        }
    }

    private updateSubscribabilityExtent() {
        if (this._account === undefined || !this._account.usable) {
            this.setSubscribabilityExtent(SubscribabilityExtentId.None);
        } else {
            this.setSubscribabilityExtent(SubscribabilityExtentId.All);
        }
    }

    private setAccountsUnusableBadness() {
        const badness = this.calculateAccountsUnusableBadness();
        this.setUnusable(badness);
    }

    private calculateAccountsUnusableBadness() {
        const accountsBadness = this._accountsDataItem.badness;
        const reasonExtra = Badness.generateText(accountsBadness);
        if (this._accountsDataItem.error) {
            return {
                reasonId: Badness.ReasonId.BrokerageAccountsError,
                reasonExtra,
            };
        } else {
            return {
                reasonId: Badness.ReasonId.BrokerageAccountsWaiting,
                reasonExtra,
            };
        }
    }

    private calculateAccountUnusableBadness(account: Account) {
        if (account.correctnessId === CorrectnessId.Error) {
            const orderStatusesBadness =
                account.tradingFeed.orderStatusesBadness;
            if (orderStatusesBadness.reasonId !== Badness.ReasonId.NotBad) {
                const badnessText = Badness.generateText(orderStatusesBadness);
                return {
                    reasonId: Badness.ReasonId.OrderStatusesError,
                    reasonExtra: `${FeedInfo.idToDisplay(
                        account.tradingFeed.id
                    )}: ${badnessText}`,
                };
            } else {
                return {
                    reasonId: Badness.ReasonId.BrokerageAccountError,
                    reasonExtra: this.accountId,
                };
            }
        } else {
            return {
                reasonId: Badness.ReasonId.BrokerageAccountWaiting,
                reasonExtra: this.accountId,
            };
        }
    }
}
