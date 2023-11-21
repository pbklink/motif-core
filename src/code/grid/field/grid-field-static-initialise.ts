import { GridFieldModule } from './grid-field';

export namespace GridFieldStaticInitialise {
    export function initialise() {
        GridFieldModule.initialiseStatic();
    }
}
