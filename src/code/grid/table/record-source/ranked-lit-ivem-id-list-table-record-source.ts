/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import { RankedLitIvemId, RankedLitIvemIdList, RankedLitIvemIdListFactoryService } from '../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { AssertInternalError, Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/sys-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { RankedLitIvemIdTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { RankedLitIvemIdTableValueSource, SecurityDataItemTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BadnessListTableRecordSource } from './badness-list-table-record-source';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';

export class RankedLitIvemIdListTableRecordSource extends BadnessListTableRecordSource<RankedLitIvemId, RankedLitIvemIdList> {
    private readonly _lockedList: RankedLitIvemIdList;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _litIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        definition: RankedLitIvemIdListTableRecordSourceDefinition,
    ) {
        super(definition);
    }

    override tryLock(): Result<void> {
        this._lockedList = this._litIvemIdListFactoryService.createFromDefinition(definition.lockedLitIvemIdListDefinition);

    }

    override open(opener: LockOpenListItem.Opener) {
        this._lockedList.openLocked(opener);
    }

    override close(opener: LockOpenListItem.Opener) {
        this._lockedList.closeLocked(opener);
    }

    override createRecordDefinition(idx: Integer): RankedLitIvemIdTableRecordDefinition {
        const rankedLitIvemId = this._lockedList.getAt(idx);
        const litIvemId = rankedLitIvemId.litIvemId;
        return {
            typeId: TableRecordDefinition.TypeId.RankedLitIvemId,
            mapKey: litIvemId.mapKey,
            rankedLitIvemId,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const rankedLitIvemId = this._lockedList.getAt(recordIndex);

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId =
                fieldDefinitionSource.typeId as RankedLitIvemIdListTableRecordSourceDefinition.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.SecurityDataItem: {
                    const valueSource = new SecurityDataItemTableValueSource(result.fieldCount, rankedLitIvemId.litIvemId, this._adiService);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.RankedLitIvemId: {
                    const valueSource = new RankedLitIvemIdTableValueSource(result.fieldCount, rankedLitIvemId);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('LIITRSCTVK19909', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    // override loadFromJson(element: JsonElement) {
    //     super.loadFromJson(element);

    //     this._list.clear();

    //     const definitionElementArray = element.tryGetElementArray(LitIvemIdTableRecordSource.jsonTag_DefinitionKeys);

    //     if (definitionElementArray !== undefined && definitionElementArray.length > 0) {
    //         this._list.capacity = definitionElementArray.length;
    //         for (const definitionElement of definitionElementArray) {
    //             const definition = LitIvemIdTableRecordDefinition.tryCreateFromJson(definitionElement);
    //             if (definition === undefined) {
    //                 Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: ' +
    //                     `Could not create definition from JSON element: ${definitionElement}`, 100);
    //             } else {
    //                 const typeId = definition.typeId;
    //                 if (typeId !== LitIvemIdTableRecordSource.definitionTypeId) {
    //                     Logger.logError(`LitIvemIdTableRecordDefinitionList.loadFromJson: Incorrect definition type: ${typeId}`);
    //                 } else {
    //                     if (!LitIvemIdTableRecordDefinition.is(definition)) {
    //                         Logger.logError('LitIvemIdTableRecordDefinitionList.loadFromJson: Interface missing');
    //                     } else {
    //                         this._list.add(definition);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // override saveToJson(element: JsonElement) {
    //     super.saveToJson(element);

    //     const keyElementArray = new Array<JsonElement>(this._list.count);

    //     for (let i = 0; i < this._list.count; i++) {
    //         const definition = this._list.getItem(i);
    //         const keyElement = new JsonElement();
    //         definition.saveKeyToJson(keyElement);
    //         keyElementArray[i] = keyElement;
    //     }

    //     element.setElementArray(LitIvemIdTableRecordSource.jsonTag_DefinitionKeys, keyElementArray);
    // }

    override userCanAdd() {
        return this._lockedList.userCanAdd;
    }

    override userCanRemove() {
        return this._lockedList.userCanRemove;
    }

    override userCanMove() {
        return this._lockedList.userCanMove;
    }

    override userAdd(recordDefinition: TableRecordDefinition) {
        if (RankedLitIvemIdTableRecordDefinition.is(recordDefinition)) {
            this._lockedList.userAdd(recordDefinition.rankedLitIvemId.litIvemId);
        } else {
            throw new AssertInternalError('LIITRSUA44490');
        }
    }

    override userAddArray(recordDefinitions: TableRecordDefinition[]) {
        const litIvemIds = recordDefinitions.map((definition) => {
            if (RankedLitIvemIdTableRecordDefinition.is(definition)) {
                return definition.rankedLitIvemId.litIvemId;
            } else {
                throw new AssertInternalError('LIITRSUAA44490');
            }
        });
        this._lockedList.userAddArray(litIvemIds);
    }

    override userRemoveAt(recordIndex: Integer, removeCount: Integer) {
        this._lockedList.userRemoveAt(recordIndex, removeCount);
    }

    override userMoveAt(fromIndex: Integer, moveCount: Integer, toIndex: Integer) {
        this._lockedList.userMoveAt(fromIndex, moveCount, toIndex);
    }

    protected override getCount() { return this._lockedList.count; }
    protected override subscribeList(opener: LockOpenListItem.Opener) {
        this._lockedList.openLocked(opener);
        return this._lockedList;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        this._lockedList.closeLocked(opener);
    }
}
