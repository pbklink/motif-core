/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService, RevTableRecordSource } from '../../../rev/internal-api';
import { RenderValue } from '../../../services/internal-api';
import { Badness, CorrectnessBadness, MultiEvent } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './definition/internal-api';

export abstract class TypedTableRecordSource extends RevTableRecordSource<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
    private _correctnessBadnessUsableChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        private readonly _correctnessBadness: CorrectnessBadness,
        definition: TypedTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: readonly TypedTableFieldSourceDefinition.TypeId[],
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
