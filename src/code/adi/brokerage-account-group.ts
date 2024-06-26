/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    compareInteger,
    ComparisonResult,
    EnumInfoOutOfOrderError,
    Err,
    ErrorCode,
    Integer,
    JsonElement,
    JsonElementErr,
    Ok,
    Result
} from "../sys/internal-api";
import { Account } from './account';

export abstract class BrokerageAccountGroup {
    private _upperId: string;

    constructor(private _typeId: BrokerageAccountGroup.TypeId) { }

    get typeId() { return this._typeId; }

    get id() { return this.getId(); }
    get upperId() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._upperId === undefined) {
            this._upperId = this.id.toUpperCase();
        }
        return this._upperId;
    }

    saveToJson(element: JsonElement) {
        element.setString(BrokerageAccountGroup.JsonTag.TypeId, BrokerageAccountGroup.Type.idToJsonValue(this.typeId));
    }

    isSingle() {
        return this._typeId === BrokerageAccountGroup.TypeId.Single;
    }

    isAll() {
        return this._typeId === BrokerageAccountGroup.TypeId.All;
    }

    isEqualTo(other: BrokerageAccountGroup) {
        if (this.typeId !== other.typeId) {
            return false;
        } else {
            return this.isSameTypeEqualTo(other);
        }
    }

    compareTo(other: BrokerageAccountGroup): ComparisonResult {
        let result = BrokerageAccountGroup.Type.compareId(this.typeId, other.typeId);
        if (result === ComparisonResult.LeftEqualsRight) {
            result = this.sameTypeCompareTo(other);
        }
        return result;
    }

    protected abstract getId(): BrokerageAccountGroup.Id;
    protected abstract isSameTypeEqualTo(other: BrokerageAccountGroup): boolean;
    protected abstract sameTypeCompareTo(other: BrokerageAccountGroup): Integer;
}

export namespace BrokerageAccountGroup {
    export type Id = string;

    export const enum JsonTag {
        TypeId = 'typeId',
    }

    export const enum TypeId {
        Single,
        All,
    }

    export function createAll() {
        return new AllBrokerageAccountGroup();
    }

    export function createSingle(accountKey: Account.Key) {
        return new SingleBrokerageAccountGroup(accountKey);
    }

    export function isSingle(group: BrokerageAccountGroup): group is SingleBrokerageAccountGroup {
        return group.typeId === BrokerageAccountGroup.TypeId.Single;
    }

    export function isEqual(left: BrokerageAccountGroup, right: BrokerageAccountGroup) {
        return left.isEqualTo(right);
    }

    export function isUndefinableEqual(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            return right === undefined ? false : left.isEqualTo(right);
        }
    }

    export function compare(left: BrokerageAccountGroup, right: BrokerageAccountGroup) {
        return left.compareTo(right);
    }

    export function compareUndefinable(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined) {
        if (left === undefined) {
            return right === undefined ? 0 : -1;
        } else  {
            if (right === undefined) {
                return 1;
            } else {
                return left.compareTo(right);
            }
        }
    }

    export function tryCreateFromJson(element: JsonElement): Result<BrokerageAccountGroup> {
        const typeIdJsonValueResult = element.tryGetString(JsonTag.TypeId);
        if (typeIdJsonValueResult.isErr()) {
            return JsonElementErr.createOuter(typeIdJsonValueResult.error, ErrorCode.BrokerageAccountGroup_TypeIdIsInvalid);
        } else {
            const typeIdJsonValue = typeIdJsonValueResult.value;
            const typeId = Type.tryJsonValueToId(typeIdJsonValue);
            if (typeId === undefined) {
                return new Err(`${ErrorCode.BrokerageAccountGroup_TypeIdIsUnknown}(${typeIdJsonValue})`);
            } else {
                switch (typeId) {
                    case BrokerageAccountGroup.TypeId.Single: {
                        const singleResult = SingleBrokerageAccountGroup.tryCreateFromJson(element);
                        if (singleResult.isErr()) {
                            return singleResult.createOuter(ErrorCode.BrokerageAccountGroup_SingleInvalid);
                        } else {
                            return new Ok(singleResult.value);
                        }
                    }
                    case BrokerageAccountGroup.TypeId.All: {
                        const allGroup = new AllBrokerageAccountGroup();
                        return new Ok(allGroup);
                    }
                    default: {
                        const neverTypeIdIgnored: never = typeId;
                        return new Err(`${ErrorCode.BrokerageAccountGroup_TypeIdIsUnsupported}(${neverTypeIdIgnored as Integer})`);
                    }
                }
            }
        }
    }

    export namespace Type {
        interface Info {
            readonly id: BrokerageAccountGroup.TypeId;
            readonly name: string;
            readonly jsonValue: string;
        }

        type InfoObject = { [id in keyof typeof BrokerageAccountGroup.TypeId]: Info };

        const infoObject: InfoObject = {
            Single: {
                id: BrokerageAccountGroup.TypeId.Single,
                name: 'Account',
                jsonValue: 'account',
            },
            All: {
                id: BrokerageAccountGroup.TypeId.All,
                name: 'All',
                jsonValue: 'all',
            },
        };

        export const idCount = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id as TypeId !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('FieldDataTypeId', id, `${infos[id].name}`);
                }
            }
        }

        export function idToName(id: BrokerageAccountGroup.TypeId) {
            return infos[id].name;
        }

        export function idToJsonValue(id: BrokerageAccountGroup.TypeId) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string): BrokerageAccountGroup.TypeId | undefined {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].jsonValue === value) {
                    return i;
                }
            }
            return undefined;
        }

        export function compareId(left: BrokerageAccountGroup.TypeId, right: BrokerageAccountGroup.TypeId) {
            return compareInteger(left, right);
        }
    }
}

export class SingleBrokerageAccountGroup extends BrokerageAccountGroup {
    constructor(private _accountKey: Account.Key) {
        super(SingleBrokerageAccountGroup.typeId);
    }

    get accountKey() { return this._accountKey; }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const accountKeyElement = element.newElement(SingleBrokerageAccountGroup.SingleJsonTag.AccountKey);
        this.accountKey.saveToJson(accountKeyElement);
    }

    protected getId() {
        return this._accountKey.id;
    }

    protected isSameTypeEqualTo(other: BrokerageAccountGroup): boolean {
        if (other instanceof SingleBrokerageAccountGroup) {
            return Account.Key.isEqual(this.accountKey, other.accountKey);
        } else {
            throw new AssertInternalError('ABAGISTET3999830');
        }
    }

    protected sameTypeCompareTo(other: BrokerageAccountGroup): Integer {
        if (other instanceof SingleBrokerageAccountGroup) {
            return this.accountKey.compareTo(other.accountKey);
        } else {
            throw new AssertInternalError('ABAGISTET3999830');
        }
    }
}

export namespace SingleBrokerageAccountGroup {
    export const typeId = BrokerageAccountGroup.TypeId.Single;

    export const enum SingleJsonTag {
        AccountKey = 'accountKey'
    }

    export function tryCreateFromJson(element: JsonElement): Result<SingleBrokerageAccountGroup> {
        const elementResult = element.tryGetElement(SingleJsonTag.AccountKey);
        if (elementResult.isErr()) {
            return JsonElementErr.createOuter(elementResult.error, ErrorCode.SingleBrokerageAccountGroup_AccountKeyNotSpecified);
        } else {
            const accountKeyResult = Account.Key.tryCreateFromJson(elementResult.value);
            if (accountKeyResult.isErr()) {
                return accountKeyResult.createOuter(ErrorCode.SingleBrokerageAccountGroup_AccountKeyIsInvalid);
            } else {
                const group = new SingleBrokerageAccountGroup(accountKeyResult.value);
                return new Ok(group);
            }
        }
    }
}

export class AllBrokerageAccountGroup extends BrokerageAccountGroup {
    constructor() {
        super(AllBrokerageAccountGroup.typeId);
    }

    protected getId() {
        return AllBrokerageAccountGroup.id;
    }

    protected isSameTypeEqualTo(other: BrokerageAccountGroup) {
        return true;
    }

    protected sameTypeCompareTo(other: BrokerageAccountGroup) {
        return 0;
    }
}

export namespace AllBrokerageAccountGroup {
    export const typeId = BrokerageAccountGroup.TypeId.All;
    export const id = '<All>';
}

export namespace BrokerageAccountGroupModule {
    export function initialiseStatic() {
        BrokerageAccountGroup.Type.initialise();
    }
}
