/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, CorrectnessBadness, MultiEvent } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { GridFieldCustomHeadingsService } from '../../field/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './definition/internal-api';
import { TableRecordSource } from './table-record-source';

export abstract class TypedTableRecordSource extends TableRecordSource<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {
    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        private readonly _correctnessBadness: CorrectnessBadness,
        definition: TypedTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: readonly TypedTableFieldSourceDefinition.TypeId[],
    ) {
        super(textFormatterService, gridFieldCustomHeadingsService, tableFieldSourceDefinitionCachingFactoryService, _correctnessBadness, definition, allowedFieldSourceDefinitionTypeIds);
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
