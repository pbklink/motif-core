/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, CorrectnessBadness, MultiEvent } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

export abstract class TypedTableRecordSource extends TableRecordSource<Badness> {
    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _correctnessBadness: CorrectnessBadness,
        definition: TableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super(textFormatterService, tableRecordSourceDefinitionFactoryService, _correctnessBadness, definition, allowedFieldSourceDefinitionTypeIds);
        this._correctnessBadnessUsableChangedSubscriptionId = this._correctnessBadness.subscribeUsableChangedEvent(() => this.processUsableChanged());
    }

    override finalise() {
        this._correctnessBadness.unsubscribeUsableChangedEvent(this._correctnessBadnessUsableChangedSubscriptionId);
        this._correctnessBadnessUsableChangedSubscriptionId = undefined;
    }

    protected processUsableChanged() {
        // descendants can override
    }
}
