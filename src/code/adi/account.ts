/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import {
    Correctness,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Err,
    ErrorCode,
    FieldDataTypeId,
    Integer,
    JsonElement,
    KeyedCorrectnessListItem,
    KeyedRecord,
    MapKey,
    MultiEvent,
    Ok,
    Result,
    ValueRecentChangeTypeId
} from "../sys/sys-internal-api";
import {
    BrokerageAccountId,
    BrokerageAccountsDataMessage,
    FeedStatus,
    TradingEnvironment,
    TradingEnvironmentId
} from './common/adi-common-internal-api';
import { TradingFeed } from './feed/internal-api';

export class Account implements KeyedCorrectnessListItem {
    private _upperId: string;
    private _upperName: string;
    private _mapKey: MapKey | undefined;

    private _usable = false;
    private _correctnessId = CorrectnessId.Suspect;

    private _tradingFeedCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _tradingFeedStatusChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _changeEvent = new MultiEvent<Account.ChangeEventHandler>();
    private _correctnessChangedEvent = new MultiEvent<Account.CorrectnessChangedEventHandler>();

    constructor(private _id: Account.Id,
        private _name: string,
        private _environmentId: TradingEnvironmentId,
        private _tradingFeed: TradingFeed,
        private _brokerCode: string | undefined,
        private _branchCode: string | undefined,
        private _advisorCode: string | undefined,
        private _listCorrectnessId: CorrectnessId,
    ) {
        this._upperId = this._id.toUpperCase();
        this._upperName = this._name.toUpperCase();
        // Need to get FeedStatus correctness information from TradingFeed as TradingFeed correctness not availabe from DataItem
        this._tradingFeedCorrectnessChangedSubscriptionId = this._tradingFeed.subscribeCorrectnessChangedEvent(
            () => { this.updateCorrectness(); }
        );
        this._tradingFeedStatusChangedSubscriptionId = this._tradingFeed.subscribeStatusChangedEvent(
            () => { this.updateCorrectness(); }
        );
        this.updateCorrectness();
    }

    get id() { return this._id; }
    get upperId() { return this._upperId; }
    get name() { return this._name; }
    get upperName() { return this._upperName; }
    get environmentId() { return this._environmentId; }
    get tradingFeed() { return this._tradingFeed; }
    get brokerCode() { return this._brokerCode; }
    get branchCode() { return this._branchCode; }
    get advisorCode() { return this._advisorCode; }

    get usable() { return this._usable; }
    get correctnessId() { return this._correctnessId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Account.Key.generateMapKey(this.id, this.environmentId);
        }
        return this._mapKey;
    }

    dispose() {
        this._tradingFeed.unsubscribeCorrectnessChangedEvent(this._tradingFeedCorrectnessChangedSubscriptionId);
        this._tradingFeed.unsubscribeStatusChangedEvent(this._tradingFeedStatusChangedSubscriptionId);
    }

    createKey(): Account.Key {
        return new Account.Key(this.id, this.environmentId);
    }

    setListCorrectness(value: CorrectnessId) {
        this._listCorrectnessId = value;
        this.updateCorrectness();
    }

    change(msgAccount: BrokerageAccountsDataMessage.Account) {
        const valueChanges = new Array<Account.ValueChange>(Account.Field.idCount - Account.Key.fieldCount); // won't include fields in key
        let changedCount = 0;

        const newName = msgAccount.name;
        if (newName !== undefined && newName !== this.name) {
            this._name = newName;
            this._upperName = newName.toUpperCase();
            valueChanges[changedCount++] = {
                fieldId: Account.FieldId.Name,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        const newBrokerCode = msgAccount.brokerCode;
        if (newBrokerCode !== undefined) {
            let resolvedBrokerCode: string | undefined;
            if (newBrokerCode === null) {
                resolvedBrokerCode = undefined;
            } else {
                resolvedBrokerCode = newBrokerCode
            }
            if (resolvedBrokerCode !== this.brokerCode) {
                this._brokerCode = resolvedBrokerCode;
                valueChanges[changedCount++] = {
                    fieldId: Account.FieldId.BrokerCode,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        const newBranchCode = msgAccount.branchCode;
        if (newBranchCode !== undefined) {
            let resolvedBranchCode: string | undefined;
            if (newBranchCode === null) {
                resolvedBranchCode = undefined;
            } else {
                resolvedBranchCode = newBranchCode
            }
            if (resolvedBranchCode !== this.branchCode) {
                this._branchCode = resolvedBranchCode;
                valueChanges[changedCount++] = {
                    fieldId: Account.FieldId.BranchCode,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        const newAdvisorCode = msgAccount.advisorCode;
        if (newAdvisorCode !== undefined) {
            let resolvedAdvisorCode: string | undefined;
            if (newAdvisorCode === null) {
                resolvedAdvisorCode = undefined;
            } else {
                resolvedAdvisorCode = newAdvisorCode
            }
            if (resolvedAdvisorCode !== this.advisorCode) {
                this._advisorCode = resolvedAdvisorCode;
                valueChanges[changedCount++] = {
                    fieldId: Account.FieldId.AdvisorCode,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        if (changedCount >= 0) {
            valueChanges.length = changedCount;
            this.notifyChange(valueChanges);
        }
    }

    subscribeChangeEvent(handler: Account.ChangeEventHandler) {
        return this._changeEvent.subscribe(handler);
    }

    unsubscribeChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changeEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Account.CorrectnessChangedEventHandler) {
        return this._correctnessChangedEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedEvent.unsubscribe(subscriptionId);
    }

    private notifyChange(valueChanges: Account.ValueChange[]) {
        const handlers = this._changeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private updateCorrectness() {
        // Note that there is not any FeedBrokerageAccountDataItem
        // BrokerageAccountDataItem correctness only takes into account Authority Feed - not Trading Feed
        // It is possible to get Trading Feed status from either Account messages or TradingFeed
        // Use TradingFeed status so all accounts are simultaneously updated if Trading Feed changes
        // Need to make sure that TradingFeed is usable.  This ensures that it also takes into account OrderStatuses being ready

        let correctnessId: CorrectnessId;
        if (this._tradingFeed.usable) {
            const tradingFeedStatusCorrectnessId = FeedStatus.idToCorrectnessId(this._tradingFeed.statusId);
            correctnessId = Correctness.merge2Ids(this._listCorrectnessId, tradingFeedStatusCorrectnessId);
        } else {
            correctnessId = Correctness.merge2Ids(this._listCorrectnessId, this._tradingFeed.correctnessId);
        }

        if (correctnessId !== this._correctnessId) {
            this._correctnessId = correctnessId;
            this._usable = Correctness.idIsUsable(correctnessId);
            this.notifyCorrectnessChanged();
        }
    }
}

export namespace Account {
    export type Id = BrokerageAccountId;
    export const NullId = '';

    export function isEqual(left: Account, right: Account): boolean {
        return BrokerageAccountId.isEqual(left.id, right.id);
    }

    export const enum FieldId {
        Id,
        EnvironmentId,
        Name,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        BrokerCode,
        BranchCode,
        AdvisorCode,
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId;
    }

    export type ChangeEventHandler = (this: void, valueChanges: Account.ValueChange[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export namespace Field {
        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObjects = { [id in keyof typeof FieldId]: Info };

        const infoObjects: InfoObjects = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_Code,
                headingId: StringId.BrokerageAccountFieldHeading_Code,
            },
            EnvironmentId: {
                id: FieldId.EnvironmentId,
                name: 'EnvironmentId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.BrokerageAccountFieldDisplay_EnvironmentId,
                headingId: StringId.BrokerageAccountFieldHeading_EnvironmentId,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_Name,
                headingId: StringId.BrokerageAccountFieldHeading_Name,
            },
            // FeedName: {
            //     id: FieldId.FeedName,
            //     name: 'FeedName',
            //     dataTypeId: FieldDataTypeId.String,
            //     displayId: StringId.BrokerageAccountFieldDisplay_TradingFeedName,
            //     headingId: StringId.BrokerageAccountFieldHeading_TradingFeedName,
            // },
            // FeedStatusId: {
            //     id: FieldId.FeedStatusId,
            //     name: 'FeedStatusId',
            //     dataTypeId: FieldDataTypeId.Enumeration,
            //     displayId: StringId.BrokerageAccountFieldDisplay_FeedStatusId,
            //     headingId: StringId.BrokerageAccountFieldHeading_FeedStatusId,
            // },
            BrokerCode: {
                id: FieldId.BrokerCode,
                name: 'BrokerCode',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_BrokerCode,
                headingId: StringId.BrokerageAccountFieldHeading_BrokerCode,
            },
            BranchCode: {
                id: FieldId.BranchCode,
                name: 'BranchCode',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_BranchCode,
                headingId: StringId.BrokerageAccountFieldHeading_BranchCode,
            },
            AdvisorCode: {
                id: FieldId.AdvisorCode,
                name: 'AdvisorCode',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_AdvisorCode,
                headingId: StringId.BrokerageAccountFieldHeading_AdvisorCode,
            },
        };

        export const idCount = Object.keys(infoObjects).length;
        const infos = Object.values(infoObjects);

        export function idToName(id: FieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: FieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: FieldId) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: FieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: FieldId) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('BrokerageAccountsDataItem.FieldId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key implements KeyedRecord.Key {
        static readonly JsonTag_Id = 'id';
        static readonly JsonTag_EnvironmentId = 'environmentId';

        private readonly _environmentId: TradingEnvironmentId;
        private _mapKey: MapKey;

        constructor(private readonly _id: Account.Id, environmentId?: TradingEnvironmentId) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            this._environmentId = environmentId === undefined ? TradingEnvironment.getDefaultId() : environmentId;
            this._mapKey = Key.generateMapKey(this.id, this.environmentId);
        }

        get id() { return this._id; }
        get environmentId() { return this._environmentId; }
        get mapKey() { return this._mapKey; }

        static createNull() {
            // will not match any valid holding
            return new Key(Account.NullId, TradingEnvironmentId.Demo);
        }

        compareTo(other: Key) {
            const result = BrokerageAccountId.compare(this.id, other.id);
            if (result === 0) {
                return TradingEnvironment.compareId(this.environmentId, other.environmentId);
            } else {
                return result;
            }
        }

        saveToJson(element: JsonElement, includeEnvironment = false) {
            element.setString(Key.JsonTag_Id, this.id);
            if (includeEnvironment) {
                element.setString(Key.JsonTag_EnvironmentId, TradingEnvironment.idToJsonValue(this.environmentId));
            }
        }
    }

    export namespace Key {
        export const fieldCount = 2; // uses 2 fields: id and environmentId

        export function generateMapKey(id: string, environmentId: TradingEnvironmentId): MapKey {
            return TradingEnvironment.idToCode(environmentId) + '|' + id;
        }

        export function toString(accountId: Account.Id): string {
            return accountId;
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: Key, right: Key) {
            return left.id === right.id &&
                left.environmentId === right.environmentId;
        }

        export function tryCreateFromJson(element: JsonElement): Result<Account.Key> {
            const idResult = element.tryGetString(Key.JsonTag_Id);
            if (idResult.isErr()) {
                return idResult.createOuter(ErrorCode.Account_IdNotSpecified);
            } else {
                const environmentResult = element.tryGetString(Key.JsonTag_EnvironmentId);
                if (environmentResult.isErr()) {
                    const key = new Key(idResult.value);
                    return new Ok(key);
                } else {
                    const environmentJsonValue = environmentResult.value;
                    const environmentId = TradingEnvironment.tryJsonToId(environmentJsonValue);
                    if (environmentId === undefined) {
                        return new Err(`${ErrorCode.Account_EnvironmentIdIsInvalid}(${environmentJsonValue})`);
                    } else {
                        const key = new Key(idResult.value, environmentId);
                        return new Ok(key);
                    }
                }
            }
        }
    }

    export function createNotFoundAccount(key: Account.Key) {
        const account = new Account(
            key.id,
            `<${Strings[StringId.BrokerageAccountNotFound]}!>`,
            key.environmentId,
            TradingFeed.nullFeed,
            undefined,
            undefined,
            undefined,
            CorrectnessId.Error,
        );
        return account;
    }
}
