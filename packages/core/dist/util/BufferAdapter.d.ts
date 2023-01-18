/**
 * Length in bytes of int16 data type
 */
export declare const INT16_LENGTH = 2;
/**
 * Length in bytes of float32 data type
 */
export declare const FLOAT32_LENGTH = 4;
/**
 * Length in bytes of int32 data type
 */
export declare const INT32_LENGTH = 4;
/**
 * Length in bytes of a byte data type (1 duh)
 */
export declare const BYTE_LENGTH = 1;
/**
 * OutOfBoundsException
 */
export declare class OutOfBoundsException extends Error {
}
/**
 * BufferAdapter class
 * @property {DataView} dataView
 * @property {boolean} endianness
 * @property {Number} position
 */
export declare class BufferAdapter {
    dataView: DataView;
    endianness: boolean;
    position: number;
    constructor(buffer: ArrayBufferLike, endianness?: boolean);
    /**
     * Checks if an offset and length are out of bounds in the DataView
     */
    isOutOfBounds(offset: number, length: number): boolean;
    /**
     * Obtains and returns the next byte from the dataView buffer
     */
    getNextByte(offset?: number): number;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     */
    getNextInt16(offset?: number): number;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     */
    getNextInt32(offset?: number): number;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     */
    getNextFloat32(offset?: number): number;
    /**
     * Skips a given amount n of bytes in the buffer
     */
    skipBytes(length: number, offset?: number): number;
}
//# sourceMappingURL=BufferAdapter.d.ts.map