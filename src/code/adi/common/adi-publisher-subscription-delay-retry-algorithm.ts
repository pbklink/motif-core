/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, mSecsPerMin, mSecsPerSec, UnreachableCaseError } from '../../sys/sys-internal-api';

export const enum AdiPublisherSubscriptionDelayRetryAlgorithmId {
    Never,
    Default,
    Referencable,
    NonReferencable,
}

export namespace AdiPublisherSubscriptionDelayRetryAlgorithm {
    export function calculateDelayTickSpan(algorithmId: AdiPublisherSubscriptionDelayRetryAlgorithmId, attemptCount: Integer) {
        switch (algorithmId) {
            case AdiPublisherSubscriptionDelayRetryAlgorithmId.Never:
                throw new AssertInternalError('PSDRACDTSN277788822123');

            case AdiPublisherSubscriptionDelayRetryAlgorithmId.Default:
                return calculateDefaultDelayTickSpan(attemptCount);

            case AdiPublisherSubscriptionDelayRetryAlgorithmId.Referencable:
                return calculateReferencableDelayTickSpan(attemptCount);

            case AdiPublisherSubscriptionDelayRetryAlgorithmId.NonReferencable:
                return calculateNonReferencableDelayTickSpan(attemptCount);

            default:
                throw new UnreachableCaseError('PSDRACDTSU77788822123', algorithmId);
        }
    }

    function calculateDefaultDelayTickSpan(attemptCount: Integer) {
        if (attemptCount <= 0) {
            throw new AssertInternalError('PSDRACSDTSZ', attemptCount.toString());
        } else {
            if (attemptCount === 1) {
                return 8 * mSecsPerSec;
            } else if (attemptCount === 2) {
                return 16 * mSecsPerSec;
            } else if (attemptCount <= 6) {
                return 40 * mSecsPerSec;
            } else {
                return 5 * mSecsPerMin;
            }
        }
    }

    function calculateReferencableDelayTickSpan(attemptCount: Integer) {
        if (attemptCount <= 0) {
            throw new AssertInternalError('PSDRACSDTSZ', attemptCount.toString());
        } else {
            if (attemptCount === 1) {
                return 8 * mSecsPerSec;
            } else if (attemptCount === 2) {
                return 16 * mSecsPerSec;
            } else if (attemptCount <= 6) {
                return 40 * mSecsPerSec;
            } else {
                return 5 * mSecsPerMin;
            }
        }
    }

    function calculateNonReferencableDelayTickSpan(attemptCount: Integer) {
        if (attemptCount <= 0) {
            throw new AssertInternalError('PSDRACSDTSZ', attemptCount.toString());
        } else {
            if (attemptCount === 1) {
                return 5 * mSecsPerSec;
            } else if (attemptCount === 2) {
                return 16 * mSecsPerSec;
            } else if (attemptCount <= 6) {
                return 40 * mSecsPerSec;
            } else {
                return 8 * mSecsPerMin;
            }
        }
    }
}
