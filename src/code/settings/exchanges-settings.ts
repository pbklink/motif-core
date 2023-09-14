/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, ExchangeInfo, SymbolFieldId } from '../adi/adi-internal-api';
import { ExchangeSettings } from './exchange-settings';
import { TypedKeyValueArraySettingsGroup } from './typed-key-value-array-settings-group';

export class ExchangesSettings extends TypedKeyValueArraySettingsGroup {
    readonly exchanges = new Array<ExchangeSettings>(ExchangeInfo.idCount);

    constructor() {
        super(ExchangesSettings.groupName);

        const exchangeCount = ExchangeInfo.idCount;
        for (let id = 0; id < exchangeCount; id++) {
            this.exchanges[id] = new ExchangeSettings(id, (settingId) => this.handleExchangeSettingChangedEvent(settingId) );
        }
    }

    getSymbolNameFieldId(exchangeId: ExchangeId) {
        return this.exchanges[exchangeId].symbolNameFieldId;
    }

    setSymbolNameField(exchangeId: ExchangeId, value: SymbolFieldId) {
        this.exchanges[exchangeId].symbolNameFieldId = value;
    }

    getSymbolSearchFieldIds(exchangeId: ExchangeId) {
        return this.exchanges[exchangeId].symbolSearchFieldIds;
    }

    setSymbolSearchFieldIds(exchangeId: ExchangeId, value: SymbolFieldId[]) {
        this.exchanges[exchangeId].symbolSearchFieldIds = value;
    }

    protected getNamedInfoArrays(operator: boolean) {
        if (operator !== ExchangeSettings.operator) {
            return [];
        } else {
            const count = this.exchanges.length;
            const result = new Array<TypedKeyValueArraySettingsGroup.NamedInfoArray>(count);
            for (let i = 0; i < count; i++) {
                const exchange = this.exchanges[i];
                const namedInfoArray: TypedKeyValueArraySettingsGroup.NamedInfoArray = {
                    name: ExchangeInfo.idToJsonValue(exchange.exchangeId),
                    operator: ExchangeSettings.operator,
                    infoArray: exchange.infos,
                };
                result[i] = namedInfoArray;
            }

            return result;
        }
    }

    private handleExchangeSettingChangedEvent(settingId: ExchangeSettings.Id) {
        this.settingChangedEvent(settingId);
    }
}

export namespace ExchangesSettings {
    export const groupName = 'exchanges';
}
