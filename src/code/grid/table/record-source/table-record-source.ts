/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings, RevTableRecordSource } from '@xilytix/revgrid';
import { TextFormattableValue, TextFormatter } from '../../../services/internal-api';
import { Badness, CorrectnessBadness, MultiEvent } from '../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../field-source/internal-api';
import { TableRecordSourceDefinition } from './definition/internal-api';

export abstract class TableRecordSource extends RevTableRecordSource<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {
    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        private readonly _correctnessBadness: CorrectnessBadness,
        definition: TableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super(textFormatter, customHeadings, tableFieldSourceDefinitionCachingFactory, _correctnessBadness, definition, allowedFieldSourceDefinitionTypeIds);
        this._correctnessBadnessUsableChangedSubscriptionId = this._correctnessBadness.subscribeUsableChangedEvent(() => this.processUsableChanged());
    }

    // get activated(): boolean { return this._opened; }

    override finalise() {
        this._correctnessBadness.unsubscribeUsableChangedEvent(this._correctnessBadnessUsableChangedSubscriptionId);
        this._correctnessBadnessUsableChangedSubscriptionId = undefined;
    }

    protected processUsableChanged() {
        // descendants can override
    }
}
