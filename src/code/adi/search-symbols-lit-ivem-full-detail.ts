/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/internal-api';
import {
    Decimal,
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    Integer,
    MultiEvent,
    SourceTzOffsetDate,
    isUndefinableArrayEqualUniquely,
    isUndefinableDecimalEqual
} from '../sys/internal-api';
import {
    CallOrPutId,
    DepthDirectionId,
    ExerciseTypeId,
    // LitIvemAlternateCodes,
    LitIvemAttributes,
    SymbolsDataMessage,
    TmcLegs
} from './common/internal-api';
import { SearchSymbolsLitIvemBaseDetail } from './search-symbols-lit-ivem-base-detail';

export class SearchSymbolsLitIvemFullDetail extends SearchSymbolsLitIvemBaseDetail {
    cfi: string | undefined;
    depthDirectionId: DepthDirectionId | undefined;
    isIndex: boolean | undefined;
    expiryDate: SourceTzOffsetDate | undefined;
    strikePrice: Decimal | undefined;
    exerciseTypeId: ExerciseTypeId | undefined;
    callOrPutId: CallOrPutId | undefined;
    contractSize: Decimal | undefined;
    lotSize: Integer | undefined;
    attributes: LitIvemAttributes | undefined;
    tmcLegs: TmcLegs | undefined;
    categories: readonly string[] | undefined;

    private _extendedChangeEvent = new MultiEvent<SearchSymbolsLitIvemFullDetail.ExtendedChangeEventHandler>();

    constructor(change: SymbolsDataMessage.AddChange) {
        super(change);

        this.cfi = change.cfi;
        this.depthDirectionId = change.depthDirectionId;
        this.isIndex = change.isIndex;
        this.expiryDate = change.expiryDate;
        this.strikePrice = change.strikePrice;
        this.exerciseTypeId = change.exerciseTypeId;
        this.callOrPutId = change.callOrPutId;
        this.contractSize = change.contractSize;
        this.lotSize = change.lotSize;
        this.attributes = change.attributes;
        this.tmcLegs = change.tmcLegs;
        this.categories = change.categories;
    }

    override update(change: SymbolsDataMessage.UpdateChange) {
        super.update(change);

        const changeableFieldCount = SearchSymbolsLitIvemFullDetail.ExtendedField.idCount - SearchSymbolsLitIvemFullDetail.Key.fieldCount;
        const changedFieldIds = new Array<SearchSymbolsLitIvemFullDetail.ExtendedField.Id>(changeableFieldCount); // won't include fields in key
        let changedCount = 0;

        if (change.cfi !== undefined) {
            const newCfi = change.cfi;
            if (newCfi !== this.cfi) {
                this.cfi = newCfi;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Cfi;
            }
        }
        if (change.depthDirectionId !== undefined) {
            const newDepthDirectionId = change.depthDirectionId ?? undefined;
            if (newDepthDirectionId !== this.depthDirectionId) {
                this.depthDirectionId = newDepthDirectionId;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.DepthDirectionId;
            }
        }
        if (change.isIndex !== undefined) {
            const newIsIndex = change.isIndex ?? undefined;
            if (newIsIndex !== this.isIndex) {
                this.isIndex = newIsIndex;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.IsIndex;
            }
        }
        if (change.expiryDate !== undefined) {
            const newExpiryDate = change.expiryDate ?? undefined;
            if (!SourceTzOffsetDate.isUndefinableEqual(newExpiryDate, this.expiryDate)) {
                this.expiryDate = newExpiryDate;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExpiryDate;
            }
        }
        if (change.strikePrice !== undefined) {
            const newStrikePrice = change.strikePrice ?? undefined;
            if (!isUndefinableDecimalEqual(newStrikePrice, this.strikePrice)) {
                this.strikePrice = newStrikePrice;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.StrikePrice;
            }
        }
        if (change.exerciseTypeId !== undefined) {
            const newExerciseTypeId = change.exerciseTypeId ?? undefined;
            if (newExerciseTypeId !== this.exerciseTypeId) {
                this.exerciseTypeId = newExerciseTypeId;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExerciseTypeId;
            }
        }
        if (change.callOrPutId !== undefined) {
            const newCallOrPutId = change.callOrPutId ?? undefined;
            if (newCallOrPutId !== this.callOrPutId) {
                this.callOrPutId = newCallOrPutId;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.CallOrPutId;
            }
        }
        if (change.contractSize !== undefined) {
            const newContractSize = change.contractSize ?? undefined;
            if (!isUndefinableDecimalEqual(newContractSize, this.contractSize)) {
                this.contractSize = newContractSize;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ContractSize;
            }
        }
        if (change.lotSize !== undefined) {
            const newLotSize = change.lotSize ?? undefined;
            if (newLotSize !== this.lotSize) {
                this.lotSize = newLotSize;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.LotSize;
            }
        }
        if (change.attributes !== undefined) {
            const newAttributes = change.attributes ?? undefined;
            if (!LitIvemAttributes.isUndefinableEqual(newAttributes, this.attributes)) {
                this.attributes = newAttributes;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Attributes;
            }
        }
        if (change.tmcLegs !== undefined) {
            const newTmcLegs = change.tmcLegs ?? undefined;
            if (!TmcLegs.isUndefinableEqualUniquely(newTmcLegs, this.tmcLegs)) {
                this.tmcLegs = newTmcLegs;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.TmcLegs;
            }
        }
        if (change.categories !== undefined) {
            const newCategories = change.categories ?? undefined;
            if (!isUndefinableArrayEqualUniquely(newCategories, this.categories)) {
                this.categories = newCategories;
                changedFieldIds[changedCount++] = SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Categories;
            }
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyExtendedChange(changedFieldIds);
        }
    }

    subscribeExtendedChangeEvent(handler: SearchSymbolsLitIvemFullDetail.ExtendedChangeEventHandler) {
        return this._extendedChangeEvent.subscribe(handler);
    }

    unsubscribeExtendedChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._extendedChangeEvent.unsubscribe(subscriptionId);
    }

    private notifyExtendedChange(changedFieldIds: SearchSymbolsLitIvemFullDetail.ExtendedField.Id[]) {
        const handlers = this._extendedChangeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(changedFieldIds);
        }
    }
}

export namespace SearchSymbolsLitIvemFullDetail {
    export type ExtendedChangeEventHandler = (this: void, changedFieldIds: ExtendedField.Id[]) => void;

    export namespace ExtendedField {
        export const enum Id {
            Cfi,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            DepthDirectionId,
            IsIndex,
            ExpiryDate,
            StrikePrice,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            ExerciseTypeId,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            CallOrPutId,
            ContractSize,
            LotSize,
            // AlternateCodes,
            Attributes,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            TmcLegs,
            Categories,
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Cfi: {
                id: Id.Cfi,
                name: 'Cfi',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.ExtendedLitIvemDetailDisplay_Cfi,
                headingId: StringId.ExtendedLitIvemDetailHeading_Cfi,
            },
            DepthDirectionId: {
                id: Id.DepthDirectionId,
                name: 'DepthDirectionId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.ExtendedLitIvemDetailDisplay_DepthDirectionId,
                headingId: StringId.ExtendedLitIvemDetailHeading_DepthDirectionId,
            },
            IsIndex: {
                id: Id.IsIndex,
                name: 'IsIndex',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.ExtendedLitIvemDetailDisplay_IsIndex,
                headingId: StringId.ExtendedLitIvemDetailHeading_IsIndex,
            },
            ExpiryDate: {
                id: Id.ExpiryDate,
                name: 'ExpiryDate',
                dataTypeId: FieldDataTypeId.Date,
                displayId: StringId.ExtendedLitIvemDetailDisplay_ExpiryDate,
                headingId: StringId.ExtendedLitIvemDetailHeading_ExpiryDate,
            },
            StrikePrice: {
                id: Id.StrikePrice,
                name: 'StrikePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.ExtendedLitIvemDetailDisplay_StrikePrice,
                headingId: StringId.ExtendedLitIvemDetailHeading_StrikePrice,
            },
            ExerciseTypeId: {
                id: Id.ExerciseTypeId,
                name: 'ExerciseTypeId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.ExtendedLitIvemDetailDisplay_ExerciseTypeId,
                headingId: StringId.ExtendedLitIvemDetailHeading_ExerciseTypeId,
            },
            CallOrPutId: {
                id: Id.CallOrPutId,
                name: 'CallOrPutId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.ExtendedLitIvemDetailDisplay_CallOrPutId,
                headingId: StringId.ExtendedLitIvemDetailHeading_CallOrPutId,
            },
            ContractSize: {
                id: Id.ContractSize,
                name: 'ContractSize',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.ExtendedLitIvemDetailDisplay_ContractSize,
                headingId: StringId.ExtendedLitIvemDetailHeading_ContractSize,
            },
            LotSize: {
                id: Id.LotSize,
                name: 'LotSize',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.ExtendedLitIvemDetailDisplay_LotSize,
                headingId: StringId.ExtendedLitIvemDetailHeading_LotSize,
            },
            Attributes: {
                id: Id.Attributes,
                name: 'Attributes',
                dataTypeId: FieldDataTypeId.Object,
                displayId: StringId.ExtendedLitIvemDetailDisplay_Attributes,
                headingId: StringId.ExtendedLitIvemDetailHeading_Attributes,
            },
            TmcLegs: {
                id: Id.TmcLegs,
                name: 'TmcLegs',
                dataTypeId: FieldDataTypeId.Object,
                displayId: StringId.ExtendedLitIvemDetailDisplay_TmcLegs,
                headingId: StringId.ExtendedLitIvemDetailHeading_TmcLegs,
            },
            Categories: {
                id: Id.Categories,
                name: 'Categories',
                dataTypeId: FieldDataTypeId.StringArray,
                displayId: StringId.ExtendedLitIvemDetailDisplay_Categories,
                headingId: StringId.ExtendedLitIvemDetailHeading_Categories,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export const allNames = new Array<string>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id as Id) {
                    throw new EnumInfoOutOfOrderError('MyxLitIvemAttribute.Field', id, infos[id].name);
                } else {
                    allNames[id] = idToName(id);
                }
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }
}

export namespace FullLitIvemDetailModule {
    export function initialiseStatic() {
        SearchSymbolsLitIvemFullDetail.ExtendedField.initialise();
    }
}
