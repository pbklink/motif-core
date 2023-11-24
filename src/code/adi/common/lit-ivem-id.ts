/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, compareString, Err, ErrorCode, JsonElement, Mappable, Ok, Result } from '../../sys/sys-internal-api';
import { DataEnvironment, DataEnvironmentId, ExchangeId, ExchangeInfo, MarketId, MarketInfo } from './data-types';
import { IvemId } from './ivem-id';

export class LitIvemId implements Mappable {

    private _environmentId: DataEnvironmentId;
    // Normally this is left undefined.  If undefined then default Exchange EnvironmentId is used.
    // Only use in scenarios where (for example), default is delayed and you want a real time price for trading
    // Do not persist _environmentId so that persisted can move between environment.  Persist _explicitEnvironmentId
    private _mapKey: string | undefined;

    constructor(private _code: string, private _litId: MarketId, private _explicitEnvironmentId?: DataEnvironmentId) {
        if (this._explicitEnvironmentId !== undefined) {
            this._environmentId = this._explicitEnvironmentId;
        } else {
            this._environmentId = ExchangeInfo.getDefaultDataEnvironmentId(this.exchangeId);
        }
    }

    get code() { return this._code; }
    get litId() { return this._litId; }
    get environmentId() { return this._environmentId; }

    // get persistKey() {
    //     if (this._mapKey === undefined) {
    //         this._mapKey = LitIvemId.generatePersistKey(this);
    //     }
    //     return this._mapKey;
    // }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = LitIvemId.createMapKey(this);
        }
        return this._mapKey;
    }

    get name(): string {
        return this.code + '.' + MarketInfo.idToName(this.litId);
    }

    get exchangeId(): ExchangeId {
        return MarketInfo.idToExchangeId(this.litId);
    }

    get ivemId() {
        return new IvemId(this.code, this.exchangeId);
    }

    get explicitEnvironmentId() { return this._explicitEnvironmentId; }
    set explicitEnvironmentId(value: DataEnvironmentId | undefined) {
        this.explicitEnvironmentId = value;
        if (value === undefined) {
            this._environmentId = ExchangeInfo.getDefaultDataEnvironmentId(this.exchangeId);
        } else {
            this._environmentId = value;
        }
    }

    createCopy() {
        return new LitIvemId(this.code, this.litId, this._explicitEnvironmentId);
    }

    saveToJson(element: JsonElement) {
        element.setString(LitIvemId.JsonName.Code, this.code);
        element.setString(LitIvemId.JsonName.Market, MarketInfo.idToJsonValue(this.litId));
        if (this.explicitEnvironmentId !== undefined) {
            element.setString(LitIvemId.JsonName.Environment, DataEnvironment.idToJsonValue(this.explicitEnvironmentId));
        }
    }
}

export namespace LitIvemId {

    export const enum JsonName {
        Code = 'code',
        Market = 'market',
        Environment = 'environment',
    }

    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    export interface BaseJson {
        [name: string]: string;
    }

    export interface UnenvironmentedJson extends BaseJson {
        code: string;
        market: string;
    }

    export interface EnvironmentedJson extends BaseJson {
        code: string;
        market: string;
        environment: string;
    }

    export type Json = UnenvironmentedJson | EnvironmentedJson;

    export namespace Json {
        export function isEnvironmented(value: Json): value is EnvironmentedJson {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return (value as EnvironmentedJson).environment !== undefined;
        }
    }

    export const nullCode = '';

    export function createMapKey(litIvemId: LitIvemId) {
        if (litIvemId.code === nullCode) {
            return '';
        } else {
            let environmentPart: string;
            if (litIvemId.explicitEnvironmentId === undefined) {
                environmentPart = '';
            } else {
                environmentPart = DataEnvironment.idToJsonValue(litIvemId.explicitEnvironmentId);
            }
            const marketPart = MarketInfo.idToJsonValue(litIvemId.litId);
            const codePart = litIvemId.code.toUpperCase();

            return environmentPart + '|' + marketPart + '|' + codePart;
        }
    }

    export function isUndefinableEqual(left: LitIvemId | undefined, right: LitIvemId | undefined): boolean {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }

    export function isEqual(left: LitIvemId, right: LitIvemId): boolean {
        return (left.code === right.code) && (left.litId === right.litId) && (left.environmentId === right.environmentId);
    }

    export function compare(left: LitIvemId, right: LitIvemId): number {
        let result = MarketInfo.compareId(left.litId, right.litId);
        if (result === 0) {
            result = compareString(left.code, right.code);
        }
        return result;
    }

    export function tryCreateFromJson(element: JsonElement): Result<LitIvemId> {
        const marketResult = element.tryGetString(JsonName.Market);
        if (marketResult.isErr()) {
            return marketResult.createOuter(ErrorCode.LitIvemId_TryCreateFromJsonMarketNotSpecified);
        } else {
            const marketId = MarketInfo.tryJsonValueToId(marketResult.value);
            if (marketId === undefined) {
                return new Err(ErrorCode.LitIvemId_TryCreateFromJsonMarketIsInvalid);
            } else {
                const codeResult = element.tryGetString(JsonName.Code);
                if (codeResult.isErr()) {
                    return codeResult.createOuter(ErrorCode.LitIvemId_TryCreateFromJsonCodeNotSpecified);
                } else {
                    const code = codeResult.value;
                    const environmentResult = element.tryGetString(JsonName.Environment);
                    if (environmentResult.isErr()) {
                        if (JsonElement.isUndefinedError(environmentResult.error)) {
                            const litIvemId = new LitIvemId(code, marketId);
                            return new Ok(litIvemId);
                        } else {
                            return environmentResult.createOuter(ErrorCode.LitIvemId_TryCreateFromJsonEnvironmentNotSpecified);
                        }
                    } else {
                        const explicitEnvironmentId = DataEnvironment.tryJsonToId(environmentResult.value);
                        if (explicitEnvironmentId === undefined) {
                            return new Err(ErrorCode.LitIvemId_TryCreateFromJsonEnvironmentIsInvalid);
                        } else {
                            const litIvemId = new LitIvemId(code, marketId, explicitEnvironmentId);
                            return new Ok(litIvemId);
                        }
                    }
                }
            }
        }
        // function checkLogConfigError(code: string, text: string, maxTextLength: Integer) {
        //     if (configErrorLoggingActive) {
        //         Logger.logConfigError(code, text, maxTextLength);
        //     }
        // }

        // const marketJsonValue = json[JsonName.Market];
        // if (marketJsonValue === undefined) {
        //     checkLogConfigError('LIITCFJMU23300192993', JSON.stringify(json), 200);
        //     return undefined;
        // } else {
        //     const marketId = MarketInfo.tryJsonValueToId(marketJsonValue);
        //     if (marketId === undefined) {
        //         checkLogConfigError('LIITCFJM2300192993', JSON.stringify(json), 200);
        //         return undefined;
        //     } else {
        //         const code = json[JsonName.Code];
        //         if (code === undefined || code === '') {
        //             checkLogConfigError('LIITCFJC2300192994', JSON.stringify(json), 200);
        //             return undefined;
        //         } else {
        //             const environmentJsonValue = json[JsonName.Environment];
        //             if (environmentJsonValue === undefined) {
        //                 return new LitIvemId(code, marketId); // no explicit environmentId
        //             } else {
        //                 const explicitEnvironmentId = DataEnvironment.tryJsonToId(environmentJsonValue);
        //                 if (explicitEnvironmentId === undefined) {
        //                     checkLogConfigError('LIITCFJE2300192995', JSON.stringify(json), 200);
        //                     return undefined;
        //                 } else {
        //                     return new LitIvemId(code, marketId, explicitEnvironmentId);
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    export function createJsonElementArray(litIvemIds: readonly LitIvemId[]) {
        const litIvemIdCount = litIvemIds.length;
        const litIvemIdElements = new Array<JsonElement>(litIvemIdCount);

        for (let i = 0; i < litIvemIdCount; i++) {
            const litIvemId = litIvemIds[i];
            const jsonElement = new JsonElement();
            litIvemId.saveToJson(jsonElement);
            litIvemIdElements[i] = jsonElement;
        }
        return litIvemIdElements;
    }

    export function tryCreateArrayFromJsonElementArray(elements: JsonElement[]): Result<LitIvemId[]> {
        const count = elements.length;
        const litIvemIds = new Array<LitIvemId>(count);
        for (let i = 0; i < count; i++) {
            const element = elements[i];
            const litIvemIdResult = tryCreateFromJson(element);
            if (litIvemIdResult.isErr()) {
                return litIvemIdResult.createOuter(`${ErrorCode.LitIvemId_TryCreateArrayFromJsonElementArray}(${i})`);
            } else {
                litIvemIds[i] = litIvemIdResult.value;
            }
        }
        return new Ok(litIvemIds);
    }

    // export function arrayToJson(arrayValue: LitIvemId[]) {
    //     const count = arrayValue.length;
    //     const jsonArray = new Array<Json>(count);
    //     for (let i = 0; i < count; i++) {
    //         jsonArray[i] = arrayValue[i].saveToJson();
    //     }

    //     return jsonArray;
    // }

    // export function tryCreateArrayFromJson(jsonArray: Json[], configErrorLoggingActive = true) {
    //     const count = jsonArray.length;
    //     const resultArray = new Array<LitIvemId>(count);
    //     for (let I = 0; I < count; I++) {
    //         const litIvemId = tryCreateFromJson(jsonArray[I], configErrorLoggingActive);
    //         if (litIvemId === undefined) {
    //             return undefined;
    //         } else {
    //             resultArray[I] = litIvemId;
    //         }
    //     }

    //     return resultArray;
    // }

    export class List extends ComparableList<LitIvemId> {
        constructor() {
            super(List.compareItems);
        }
    }

    export namespace List {
        export function compareItems(left: LitIvemId, right: LitIvemId) {
            return LitIvemId.compare(left, right);
        }
    }

    // export function tryGetFromJsonElement(element: JsonElement, name: string, context?: string): LitIvemId | undefined {
    //     const jsonValue = element.tryGetNativeObject(name);
    //     if (jsonValue === undefined || jsonValue === null) {
    //         return undefined;
    //     } else {
    //         if (typeof (jsonValue) !== 'object' || Array.isArray(jsonValue)) {
    //             const errorText = JsonElement.generateGetErrorText(StringId.LitIvemIdNotJsonObject, jsonValue, context);
    //             Logger.logError(errorText);
    //             return undefined;
    //         } else {
    //             const jsonObject = jsonValue as LitIvemId.Json;
    //             const result = LitIvemId.tryCreateFromJson(jsonObject);
    //             if (result !== undefined) {
    //                 return result;
    //             } else {
    //                 const errorText = JsonElement.generateGetErrorText(StringId.InvalidLitIvemIdJson, jsonValue, context);
    //                 Logger.logError(errorText);
    //                 return undefined;
    //             }
    //         }
    //     }
    // }

    // export function getFromJsonElement(element: JsonElement, name: string, defaultValue: LitIvemId, context?: string) {
    //     const tryResult = tryGetFromJsonElement(element, name, context);
    //     return (tryResult === undefined) ? defaultValue : tryResult;
    // }
}
