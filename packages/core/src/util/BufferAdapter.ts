/**
 * Length in bytes of int16 data type
 */
export const INT16_LENGTH = 2;

/**
 * Length in bytes of float32 data type
 */
export const FLOAT32_LENGTH = 4;

/**
 * Length in bytes of int32 data type
 */
export const INT32_LENGTH = 4;

/**
 * Length in bytes of a byte data type (1 duh)
 */
export const BYTE_LENGTH = 1;

/**
 * OutOfBoundsException
 */
export class OutOfBoundsException extends Error {}

/**
 * BufferAdapter class
 * @property {DataView} dataView
 * @property {boolean} endianness
 * @property {Number} position
 */
export class BufferAdapter {
  dataView: DataView;
  endianness: boolean;
  position: number;

  constructor(buffer: ArrayBufferLike, endianness: boolean = true) {
    this.dataView = new DataView(buffer);
    this.endianness = endianness;
    this.position = 0;
  }

  /**
   * Checks if an offset and length are out of bounds in the DataView
   */
  isOutOfBounds(offset: number, length: number) {
    return (offset + length > this.dataView.byteLength);
  }

  /**
   * Obtains and returns the next byte from the dataView buffer
   */
  getNextByte(offset: number = this.position) {
    if (this.isOutOfBounds(offset, BYTE_LENGTH)) throw new OutOfBoundsException();

    const data = this.dataView.getInt8(offset);
    this.position += BYTE_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   */
  getNextInt16(offset: number = this.position) {
    if (this.isOutOfBounds(offset, INT16_LENGTH)) throw new OutOfBoundsException();

    const data = this.dataView.getInt16(offset, this.endianness);
    this.position += INT16_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   */
  getNextInt32(offset: number = this.position) {
    if (this.isOutOfBounds(offset, INT32_LENGTH)) throw new OutOfBoundsException();

    const data = this.dataView.getInt32(offset, this.endianness);
    this.position += INT32_LENGTH;

    return data;
  }

  /**
   * Obtains and returns the next int16 from the dataView buffer
   */
  getNextFloat32(offset: number = this.position) {
    if (this.isOutOfBounds(offset, FLOAT32_LENGTH)) throw new OutOfBoundsException();

    const data = this.dataView.getFloat32(offset, this.endianness);
    this.position += FLOAT32_LENGTH;

    return data;
  }

  /**
   * Skips a given amount n of bytes in the buffer
   */
  skipBytes(length: number, offset: number = this.position) {
    if (this.isOutOfBounds(offset, length)) throw new OutOfBoundsException();
    return this.position += length;
  }
}
