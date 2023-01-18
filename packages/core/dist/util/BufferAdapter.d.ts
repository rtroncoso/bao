/**
 * Length in bytes of int16 data type
 * @type {number}
 */
export const INT16_LENGTH: number;
/**
 * Length in bytes of float32 data type
 * @type {number}
 */
export const FLOAT32_LENGTH: number;
/**
 * Length in bytes of int32 data type
 * @type {number}
 */
export const INT32_LENGTH: number;
/**
 * Length in bytes of a byte data type (1 duh)
 * @type {number}
 */
export const BYTE_LENGTH: number;
/**
 * BufferAdapter class
 * @property {DataView} dataView
 * @property {boolean} endianness
 * @property {Number} position
 */
export default class BufferAdapter {
    /**
     * @param {ArrayBuffer} buffer
     * @param {boolean} endianness
     */
    constructor(buffer: ArrayBuffer, endianness?: boolean);
    dataView: DataView;
    endianness: boolean;
    position: number;
    /**
     * Checks if an offset and length are out of bounds in the DataView
     * @param offset
     * @param length
     * @returns {boolean}
     */
    isOutOfBounds(offset: any, length: any): boolean;
    /**
     * Obtains and returns the next byte from the dataView buffer
     * @param {Number} offset
     * @returns {Number|boolean}
     */
    getNextByte(offset?: number): number | boolean;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     * @param {Number} offset
     * @returns {Number|boolean}
     */
    getNextInt16(offset?: number): number | boolean;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     * @param {Number} offset
     * @returns {Number|boolean}
     */
    getNextInt32(offset?: number): number | boolean;
    /**
     * Obtains and returns the next int16 from the dataView buffer
     * @param {Number} [offset=undefined]
     * @returns {Number|boolean}
     */
    getNextFloat32(offset?: number): number | boolean;
    /**
     * Skips a given amount n of bytes in the buffer
     * @param {Number} length
     * @param {Number} offset
     * @returns {Number|boolean}
     */
    skipBytes(length: number, offset?: number): number | boolean;
}
//# sourceMappingURL=BufferAdapter.d.ts.map