/**
 * Length in bytes of int16 data type
 * @type {number}
 */
export const INT16_LENGTH = 2;

/**
 * Length in bytes of float32 data type
 * @type {number}
 */
export const FLOAT32_LENGTH = 4;

/**
 * Length in bytes of int32 data type
 * @type {number}
 */
export const INT32_LENGTH = 4;

/**
 * Length in bytes of a byte data type (1 duh)
 * @type {number}
 */
export const BYTE_LENGTH = 1;

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
  constructor(buffer, endianness = true) {
    this.dataView = new DataView(buffer);
    this.endianness = endianness;
    this.position = 0;
  }


  /**
   * Checks if an offset and length are out of bounds in the DataView
   * @param offset
   * @param length
   * @returns {boolean}
   */
  isOutOfBounds(offset, length) {
    return (offset + length > this.dataView.byteLength);
  }

  /**
   * Obtains and returns the next byte from the dataView buffer
   * @param {Number} offset
   * @returns {Number|boolean}
   */
  getNextByte(offset = this.position) {
    if (this.isOutOfBounds(offset, BYTE_LENGTH)) return false;

    const data = this.dataView.getInt8(offset);
    this.position += BYTE_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   * @param {Number} offset
   * @returns {Number|boolean}
   */
  getNextInt16(offset = this.position) {
    if (this.isOutOfBounds(offset, INT16_LENGTH)) return false;

    const data = this.dataView.getInt16(offset, this.endianness);
    this.position += INT16_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   * @param {Number} offset
   * @returns {Number|boolean}
   */
  getNextInt32(offset = this.position) {
    if (this.isOutOfBounds(offset, INT32_LENGTH)) return false;

    const data = this.dataView.getInt32(offset, this.endianness);
    this.position += INT32_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   * @param {Number} [offset=undefined]
   * @returns {Number|boolean}
   */
  getNextFloat32(offset = this.position) {
    if (this.isOutOfBounds(offset, FLOAT32_LENGTH)) return false;

    const data = this.dataView.getFloat32(offset, this.endianness);
    this.position += FLOAT32_LENGTH;

    return data;
  }

  /**
   * Skips a given amount n of bytes in the buffer
   * @param {Number} length
   * @param {Number} offset
   * @returns {Number|boolean}
   */
  skipBytes(length, offset = this.position) {
    if (this.isOutOfBounds(offset, length)) return false;
    return this.position += length;
  }
}
