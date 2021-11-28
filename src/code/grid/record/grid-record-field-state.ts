import { GridHalign } from 'grid-revgrid-types';

/** Defines the display details of a Field */
export interface GridRecordFieldState {
    /** Determines the header text of a Field. Undefined to use the raw field name */
    header?: string;
    /** Determines the width of a Field. Undefined to auto-size */
    width?: number;
    /** The text alignment within a cell */
    alignment?: GridHalign;
}

