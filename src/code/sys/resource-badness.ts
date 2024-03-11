import { Badness } from './badness';
import { CommaText } from './comma-text';
import { CorrectnessId } from './correctness';
import { UnreachableCaseError } from './xiltyix-sysutils';

export interface ResourceBadness extends Badness {
    resourceName: string;
}

export namespace ResourceBadness {
    export function create(badness: Badness, resourceName: string): ResourceBadness {
        return {
            reasonId: badness.reasonId,
            reasonExtra: badness.reasonExtra,
            resourceName,
        };
    }
    export function consolidate(resourceBadnesses: readonly ResourceBadness[]): Badness {
        let badResourceBadnesses: ResourceBadness[] | undefined;
        let badCount = 0;
        let commonBadReasonId: Badness.ReasonId | undefined;
        for (const resourceBadness of resourceBadnesses) {
            const reasonId = resourceBadness.reasonId;
            if (reasonId !== Badness.ReasonId.NotBad) {
                if (badResourceBadnesses === undefined) {
                    badResourceBadnesses = new Array<ResourceBadness>(resourceBadnesses.length);
                    commonBadReasonId = reasonId;
                } else {
                    if (commonBadReasonId !== undefined && reasonId !== commonBadReasonId) {
                        commonBadReasonId = undefined;
                    }
                }
                badResourceBadnesses[badCount++] = resourceBadness;
            }
        }

        switch (badCount) {
            case 0: return Badness.notBad;
            case 1: return createSingleResourceBadness(resourceBadnesses[0]);
            default: {
                if (commonBadReasonId === undefined) {
                    return createMultipleReasonBadness(resourceBadnesses, badCount);
                } else {
                    return createCommonReasonBadness(resourceBadnesses, badCount, commonBadReasonId);
                }
            }
        }
    }

    function createSingleResourceBadness(resourceBadness: ResourceBadness): Badness {
        return {
            reasonId: resourceBadness.reasonId,
            reasonExtra: `${resourceBadness.resourceName}: ${resourceBadness.reasonExtra}`,
        };
    }

    function createCommonReasonBadness(resourceBadnesses: readonly ResourceBadness[], count: number, commonBadReasonId: Badness.ReasonId): Badness {
        const firstReasonExtra = resourceBadnesses[0].reasonExtra;
        let allReasonExtraSame = true;
        for (let i = 1; i < count; i++) {
            const badness = resourceBadnesses[i];
            const reasonExtra = badness.reasonExtra;
            if (reasonExtra !== firstReasonExtra) {
                allReasonExtraSame = false;
                break;
            }
        }

        let newReasonExtra: string;
        if (allReasonExtraSame) {
            const resourceNames = new Array<string>(count);
            for (let i = 0; i < count; i++) {
                const badness = resourceBadnesses[i];
                resourceNames[i] = badness.resourceName;
            }
            const resourceNamesCommaText = CommaText.fromStringArray(resourceNames);
            if (firstReasonExtra.length === 0) {
                newReasonExtra = resourceNamesCommaText;
            } else {
                newReasonExtra = `${resourceNamesCommaText}: ${firstReasonExtra}`;
            }
        } else {
            const individualReasonExtras = new Array<string>(count);
            for (let i = 0; i < count; i++) {
                const badness = resourceBadnesses[i];
                const resourceName = badness.resourceName;
                const reasonExtra = badness.reasonExtra;
                if (reasonExtra.length === 0) {
                    individualReasonExtras[i] = resourceName
                } else {
                    individualReasonExtras[i] = `${resourceName}: ${reasonExtra}`;
                }
            }

            newReasonExtra = CommaText.fromStringArray(individualReasonExtras);
        }

        return {
            reasonId: commonBadReasonId,
            reasonExtra: newReasonExtra,
        };
    }

    function createMultipleReasonBadness(resourceBadnesses: readonly ResourceBadness[], count: number): Badness {
        let correctnessId = CorrectnessId.Usable;

        const individualReasonExtras = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const badness = resourceBadnesses[i];
            const resourceName = badness.resourceName;
            const reasonId = badness.reasonId;
            const reasonDisplay = Badness.Reason.idToDisplay(reasonId);
            const reasonExtra = badness.reasonExtra;
            if (reasonExtra.length === 0) {
                individualReasonExtras[i] = `${resourceName}: ${reasonDisplay}`;
            } else {
                individualReasonExtras[i] = `${resourceName}: ${reasonDisplay}: ${reasonExtra}`;
            }

            const resourceCorrectnessId = Badness.Reason.idToCorrectnessId(reasonId);
            switch (resourceCorrectnessId) {
                case CorrectnessId.Suspect:
                    if (correctnessId !== CorrectnessId.Error) {
                        correctnessId = CorrectnessId.Suspect;
                    }
                    break;
                case CorrectnessId.Error:
                    correctnessId = CorrectnessId.Error;
                    break;
            }
        }

        let newReasonId: Badness.ReasonId;
        switch (correctnessId) {
            case CorrectnessId.Usable:
                newReasonId = Badness.ReasonId.MultipleUsable;
                break;
            case CorrectnessId.Suspect:
                newReasonId = Badness.ReasonId.MultipleSuspect;
                break;
            case CorrectnessId.Error:
                newReasonId = Badness.ReasonId.MultipleError;
                break;
            default:
                throw new UnreachableCaseError('RBCMRB21187', correctnessId);
        }


        return {
            reasonId: newReasonId,
            reasonExtra: CommaText.fromStringArray(individualReasonExtras)
        };
    }
}
