/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../sys/json-element';
import { ErrorCode, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinitionImplementation } from './grid-layout-definition-implementation';
import { GridLayoutDefinitionImplementationOrReference } from './grid-layout-definition-implementation-or-reference';
import { NamedGridLayoutDefinitionImplementation } from './named-grid-layout-definition-implementation';
import { NamedGridLayoutDefinitionReference } from './named-grid-layout-definition-reference';
import { NamedGridLayoutDefinitionsService } from './named-grid-layout-definitions-service';

export class GridLayoutDefinitionOrReferenceFactoryService {
    constructor(private readonly _namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService) {

    }

    tryCreateFromJson(element: JsonElement): Result<GridLayoutDefinitionImplementationOrReference> {
        const isReferenceResult = GridLayoutDefinitionImplementationOrReference.tryGetIsReferenceFromJson(element);
        if (isReferenceResult.isErr()) {
            return isReferenceResult.createOuter(ErrorCode.GridLayoutDefinitionOrReferenceFactoryService_IsReferenceNotSpecified);
        } else {
            if (isReferenceResult.value) {
                return NamedGridLayoutDefinitionReference.tryCreateFromJson(this._namedGridLayoutDefinitionsService, element);
            } else {
                if (NamedGridLayoutDefinitionImplementation.isJson(element)) {
                    return NamedGridLayoutDefinitionImplementation.tryCreateFromJson(element);
                } else {
                    return GridLayoutDefinitionImplementation.tryCreateFromJson(element);
                }
            }
        }
    }
}
