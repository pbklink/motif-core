/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadingsService, RevTableRecordSource } from '@xilytix/rev-data-source';
import { RenderValue } from '../../../services/internal-api';
import { Badness, CorrectnessBadness, MultiEvent } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from '../field-source/internal-api';
import { TableRecordSourceDefinition } from './definition/internal-api';

export abstract class TableRecordSource extends RevTableRecordSource<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        private readonly _correctnessBadness: CorrectnessBadness,
        definition: TableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super(textFormatterService, gridFieldCustomHeadingsService, tableFieldSourceDefinitionCachingFactoryService, _correctnessBadness, definition, allowedFieldSourceDefinitionTypeIds);
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
