/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, Badness, ErrorCode, Integer, UsableListChangeTypeId, ZenithDataError } from '../sys/internal-api';
import { Account } from './account';
import {
    BrokerageAccountId,
    BrokerageAccountsDataMessage,
    DataMessage,
    DataMessageTypeId,
    FeedClassId,
    FeedId,
    TradingEnvironment
} from './common/internal-api';
import { KeyedCorrectnessSettableListFeedSubscriptionDataItem, TradingFeed } from './feed/internal-api';

export class BrokerageAccountsDataItem extends KeyedCorrectnessSettableListFeedSubscriptionDataItem<Account> {

    getAccountById(accountId: BrokerageAccountId) {
        const mapKey = Account.Key.generateMapKey(accountId, TradingEnvironment.getDefaultId());
        return this.getRecordByMapKey(mapKey);
    }
    getAccountByKey(accountKey: Account.Key) {
        return this.getRecordByMapKey(accountKey.mapKey);
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.BrokerageAccounts) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const accountsMsg = msg as BrokerageAccountsDataMessage;
                this.processMessage_Accounts(accountsMsg);
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processFeedsBecameUsable() {
        let feedId: FeedId | undefined;
        for (const feed of this.feeds) {
            if (feed.classId === FeedClassId.Authority) {
                // For now, there should only be one Authority feed so use the first one found!
                feedId = feed.id;
                break;
            }
        }
        if (feedId === undefined) {
            const badness: Badness = {
                reasonId: Badness.ReasonId.NoAuthorityFeed,
                reasonExtra: '',
            };
            this.setUnusable(badness);
        } else {
            this.setFeedId(feedId);
        }

        super.processFeedsBecameUsable();
    }

    private createAccount(msgAccount: BrokerageAccountsDataMessage.Account) {
        const accountId = msgAccount.id;
        const name = msgAccount.name;
        if (name === undefined) {
            throw new ZenithDataError(ErrorCode.BADICAN402991273, accountId);
        } else {
            const tradingFeedId = msgAccount.tradingFeedId;
            if (tradingFeedId === undefined) {
                throw new ZenithDataError(ErrorCode.BADICAFI009922349, accountId);
            } else {
                const tradingFeed = this.getFeedById(tradingFeedId);
                if (!(tradingFeed instanceof TradingFeed)) {
                    throw new ZenithDataError(ErrorCode.BADICAFTF0109922349, `${accountId}: ${name}`);
                } else {
                    const result = new Account(accountId,
                        name,
                        msgAccount.environmentId,
                        tradingFeed,
                        msgAccount.brokerCode ?? undefined,
                        msgAccount.branchCode ?? undefined,
                        msgAccount.advisorCode ?? undefined,
                        this.correctnessId,
                    );

                    return result;
                }
            }
        }
    }

    private addRange(msgAccounts: BrokerageAccountsDataMessage.Accounts, rangeStartIdx: Integer, count: Integer) {
        const addStartIdx = this.extendRecordCount(count);
        let addIdx = addStartIdx;
        for (let i = rangeStartIdx; i < rangeStartIdx + count; i++) {
            const msgAccount = msgAccounts[i];
            const account = this.createAccount(msgAccount);
            this.setRecord(addIdx++, account);
        }
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, count);
    }

    private checkAddRange(msgAccounts: BrokerageAccountsDataMessage.Accounts, rangeStartIdx: Integer, rangeEndPlusOneIdx: Integer) {
        if (rangeStartIdx >= 0) {
            const count = rangeEndPlusOneIdx - rangeStartIdx;
            this.addRange(msgAccounts, rangeStartIdx, count);
        }
        return -1;
    }

    private processMessage_Accounts(msg: BrokerageAccountsDataMessage): void {
        assert(msg instanceof BrokerageAccountsDataMessage, 'ID:43212081047');

        const msgAccounts = msg.accounts;
        const msgAccountCount = msgAccounts.length;

        let addStartMsgIdx = -1;

        for (let i = 0; i < msgAccountCount; i++) {
            const msgAccount = msg.accounts[i];
            const key = new Account.Key(msgAccount.id, msgAccount.environmentId);
            const mapKey = key.mapKey;

            const account = this.getRecordByMapKey(mapKey);
            if (account !== undefined) {
                addStartMsgIdx = this.checkAddRange(msgAccounts, addStartMsgIdx, i);
                account.change(msgAccount);
            } else {
                if (addStartMsgIdx < 0) {
                    addStartMsgIdx = i;
                }
            }
        }

        this.checkAddRange(msgAccounts, addStartMsgIdx, msg.accounts.length);
    }
}

export namespace BrokerageAccountsDataItem {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
}
