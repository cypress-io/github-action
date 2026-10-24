"use strict";
exports.id = 835;
exports.ids = [835];
exports.modules = {

/***/ 87071:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Builder = void 0;
const byte_buffer_js_1 = __webpack_require__(84503);
const constants_js_1 = __webpack_require__(32957);
class Builder {
    /**
     * Create a FlatBufferBuilder.
     */
    constructor(opt_initial_size) {
        /** Minimum alignment encountered so far. */
        this.minalign = 1;
        /** The vtable for the current table. */
        this.vtable = null;
        /** The amount of fields we're actually using. */
        this.vtable_in_use = 0;
        /** Whether we are currently serializing a table. */
        this.isNested = false;
        /** Starting offset of the current struct/table. */
        this.object_start = 0;
        /** List of offsets of all vtables. */
        this.vtables = [];
        /** For the current vector being built. */
        this.vector_num_elems = 0;
        /** False omits default values from the serialized data */
        this.force_defaults = false;
        this.string_maps = null;
        this.text_encoder = new TextEncoder();
        let initial_size;
        if (!opt_initial_size) {
            initial_size = 1024;
        }
        else {
            initial_size = opt_initial_size;
        }
        /**
         * @type {ByteBuffer}
         * @private
         */
        this.bb = byte_buffer_js_1.ByteBuffer.allocate(initial_size);
        this.space = initial_size;
    }
    clear() {
        this.bb.clear();
        this.space = this.bb.capacity();
        this.minalign = 1;
        this.vtable = null;
        this.vtable_in_use = 0;
        this.isNested = false;
        this.object_start = 0;
        this.vtables = [];
        this.vector_num_elems = 0;
        this.force_defaults = false;
        this.string_maps = null;
    }
    /**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */
    forceDefaults(forceDefaults) {
        this.force_defaults = forceDefaults;
    }
    /**
     * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
     * called finish(). The actual data starts at the ByteBuffer's current position,
     * not necessarily at 0.
     */
    dataBuffer() {
        return this.bb;
    }
    /**
     * Get the bytes representing the FlatBuffer. Only call this after you've
     * called finish().
     */
    asUint8Array() {
        return this.bb
            .bytes()
            .subarray(this.bb.position(), this.bb.position() + this.offset());
    }
    /**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */
    prep(size, additional_bytes) {
        // Track the biggest thing we've ever aligned to.
        if (size > this.minalign) {
            this.minalign = size;
        }
        // Find the amount of alignment needed such that `size` is properly
        // aligned after `additional_bytes`
        const align_size = (~(this.bb.capacity() - this.space + additional_bytes) + 1) & (size - 1);
        // Reallocate the buffer if needed.
        while (this.space < align_size + size + additional_bytes) {
            const old_buf_size = this.bb.capacity();
            this.bb = Builder.growByteBuffer(this.bb);
            this.space += this.bb.capacity() - old_buf_size;
        }
        this.pad(align_size);
    }
    pad(byte_size) {
        for (let i = 0; i < byte_size; i++) {
            this.bb.writeInt8(--this.space, 0);
        }
    }
    writeInt8(value) {
        this.bb.writeInt8((this.space -= 1), value);
    }
    writeInt16(value) {
        this.bb.writeInt16((this.space -= 2), value);
    }
    writeInt32(value) {
        this.bb.writeInt32((this.space -= 4), value);
    }
    writeInt64(value) {
        this.bb.writeInt64((this.space -= 8), value);
    }
    writeFloat32(value) {
        this.bb.writeFloat32((this.space -= 4), value);
    }
    writeFloat64(value) {
        this.bb.writeFloat64((this.space -= 8), value);
    }
    /**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */
    addInt8(value) {
        this.prep(1, 0);
        this.writeInt8(value);
    }
    /**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */
    addInt16(value) {
        this.prep(2, 0);
        this.writeInt16(value);
    }
    /**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */
    addInt32(value) {
        this.prep(4, 0);
        this.writeInt32(value);
    }
    /**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */
    addInt64(value) {
        this.prep(8, 0);
        this.writeInt64(value);
    }
    /**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */
    addFloat32(value) {
        this.prep(4, 0);
        this.writeFloat32(value);
    }
    /**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */
    addFloat64(value) {
        this.prep(8, 0);
        this.writeFloat64(value);
    }
    addFieldInt8(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt8(value);
            this.slot(voffset);
        }
    }
    addFieldInt16(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt16(value);
            this.slot(voffset);
        }
    }
    addFieldInt32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt32(value);
            this.slot(voffset);
        }
    }
    addFieldInt64(voffset, value, defaultValue) {
        if (this.force_defaults || value !== defaultValue) {
            this.addInt64(value);
            this.slot(voffset);
        }
    }
    addFieldFloat32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat32(value);
            this.slot(voffset);
        }
    }
    addFieldFloat64(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat64(value);
            this.slot(voffset);
        }
    }
    addFieldOffset(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addOffset(value);
            this.slot(voffset);
        }
    }
    /**
     * Structs are stored inline, so nothing additional is being added. `d` is always 0.
     */
    addFieldStruct(voffset, value, defaultValue) {
        if (value != defaultValue) {
            this.nested(value);
            this.slot(voffset);
        }
    }
    /**
     * Structures are always stored inline, they need to be created right
     * where they're used.  You'll get this assertion failure if you
     * created it elsewhere.
     */
    nested(obj) {
        if (obj != this.offset()) {
            throw new TypeError('FlatBuffers: struct must be serialized inline.');
        }
    }
    /**
     * Should not be creating any other object, string or vector
     * while an object is being constructed
     */
    notNested() {
        if (this.isNested) {
            throw new TypeError('FlatBuffers: object serialization must not be nested.');
        }
    }
    /**
     * Set the current vtable at `voffset` to the current location in the buffer.
     */
    slot(voffset) {
        if (this.vtable !== null)
            this.vtable[voffset] = this.offset();
    }
    /**
     * @returns Offset relative to the end of the buffer.
     */
    offset() {
        return this.bb.capacity() - this.space;
    }
    /**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */
    static growByteBuffer(bb) {
        const old_buf_size = bb.capacity();
        // Ensure we don't grow beyond what fits in an int.
        if (old_buf_size & 0xc0000000) {
            throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
        }
        const new_buf_size = old_buf_size << 1;
        const nbb = byte_buffer_js_1.ByteBuffer.allocate(new_buf_size);
        nbb.setPosition(new_buf_size - old_buf_size);
        nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
        return nbb;
    }
    /**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */
    addOffset(offset) {
        this.prep(constants_js_1.SIZEOF_INT, 0); // Ensure alignment is already done.
        this.writeInt32(this.offset() - offset + constants_js_1.SIZEOF_INT);
    }
    /**
     * Start encoding a new object in the buffer.  Users will not usually need to
     * call this directly. The FlatBuffers compiler will generate helper methods
     * that call this method internally.
     */
    startObject(numfields) {
        this.notNested();
        if (this.vtable == null) {
            this.vtable = [];
        }
        this.vtable_in_use = numfields;
        for (let i = 0; i < numfields; i++) {
            this.vtable[i] = 0; // This will push additional elements as needed
        }
        this.isNested = true;
        this.object_start = this.offset();
    }
    /**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */
    endObject() {
        if (this.vtable == null || !this.isNested) {
            throw new Error('FlatBuffers: endObject called without startObject');
        }
        this.addInt32(0);
        const vtableloc = this.offset();
        // Trim trailing zeroes.
        let i = this.vtable_in_use - 1;
        // eslint-disable-next-line no-empty
        for (; i >= 0 && this.vtable[i] == 0; i--) { }
        const trimmed_size = i + 1;
        // Write out the current vtable.
        for (; i >= 0; i--) {
            // Offset relative to the start of the table.
            this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
        }
        const standard_fields = 2; // The fields below:
        this.addInt16(vtableloc - this.object_start);
        const len = (trimmed_size + standard_fields) * constants_js_1.SIZEOF_SHORT;
        this.addInt16(len);
        // Search for an existing vtable that matches the current one.
        let existing_vtable = 0;
        const vt1 = this.space;
        outer_loop: for (i = 0; i < this.vtables.length; i++) {
            const vt2 = this.bb.capacity() - this.vtables[i];
            if (len == this.bb.readInt16(vt2)) {
                for (let j = constants_js_1.SIZEOF_SHORT; j < len; j += constants_js_1.SIZEOF_SHORT) {
                    if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
                        continue outer_loop;
                    }
                }
                existing_vtable = this.vtables[i];
                break;
            }
        }
        if (existing_vtable) {
            // Found a match:
            // Remove the current vtable.
            this.space = this.bb.capacity() - vtableloc;
            // Point table to existing vtable.
            this.bb.writeInt32(this.space, existing_vtable - vtableloc);
        }
        else {
            // No match:
            // Add the location of the current vtable to the list of vtables.
            this.vtables.push(this.offset());
            // Point table to current vtable.
            this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
        }
        this.isNested = false;
        return vtableloc;
    }
    /**
     * Finalize a buffer, poiting to the given `root_table`.
     */
    finish(root_table, opt_file_identifier, opt_size_prefix) {
        const size_prefix = opt_size_prefix ? constants_js_1.SIZE_PREFIX_LENGTH : 0;
        if (opt_file_identifier) {
            const file_identifier = opt_file_identifier;
            this.prep(this.minalign, constants_js_1.SIZEOF_INT + constants_js_1.FILE_IDENTIFIER_LENGTH + size_prefix);
            if (file_identifier.length != constants_js_1.FILE_IDENTIFIER_LENGTH) {
                throw new TypeError('FlatBuffers: file identifier must be length ' +
                    constants_js_1.FILE_IDENTIFIER_LENGTH);
            }
            for (let i = constants_js_1.FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
                this.writeInt8(file_identifier.charCodeAt(i));
            }
        }
        this.prep(this.minalign, constants_js_1.SIZEOF_INT + size_prefix);
        this.addOffset(root_table);
        if (size_prefix) {
            this.addInt32(this.bb.capacity() - this.space);
        }
        this.bb.setPosition(this.space);
    }
    /**
     * Finalize a size prefixed buffer, pointing to the given `root_table`.
     */
    finishSizePrefixed(root_table, opt_file_identifier) {
        this.finish(root_table, opt_file_identifier, true);
    }
    /**
     * This checks a required field has been set in a given table that has
     * just been constructed.
     */
    requiredField(table, field) {
        const table_start = this.bb.capacity() - table;
        const vtable_start = table_start - this.bb.readInt32(table_start);
        const ok = field < this.bb.readInt16(vtable_start) &&
            this.bb.readInt16(vtable_start + field) != 0;
        // If this fails, the caller will show what field needs to be set.
        if (!ok) {
            throw new TypeError('FlatBuffers: field ' + field + ' must be set');
        }
    }
    /**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */
    startVector(elem_size, num_elems, alignment) {
        this.notNested();
        this.vector_num_elems = num_elems;
        this.prep(constants_js_1.SIZEOF_INT, elem_size * num_elems);
        this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
    }
    /**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */
    endVector() {
        this.writeInt32(this.vector_num_elems);
        return this.offset();
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createSharedString(s) {
        if (!s) {
            return 0;
        }
        if (!this.string_maps) {
            this.string_maps = new Map();
        }
        if (this.string_maps.has(s)) {
            return this.string_maps.get(s);
        }
        const offset = this.createString(s);
        this.string_maps.set(s, offset);
        return offset;
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createString(s) {
        if (s === null || s === undefined) {
            return 0;
        }
        let utf8;
        if (s instanceof Uint8Array) {
            utf8 = s;
        }
        else {
            utf8 = this.text_encoder.encode(s);
        }
        this.addInt8(0);
        this.startVector(1, utf8.length, 1);
        this.bb.setPosition((this.space -= utf8.length));
        this.bb.bytes().set(utf8, this.space);
        return this.endVector();
    }
    /**
     * Create a byte vector.
     *
     * @param v The bytes to add
     * @returns The offset in the buffer where the byte vector starts
     */
    createByteVector(v) {
        if (v === null || v === undefined) {
            return 0;
        }
        this.startVector(1, v.length, 1);
        this.bb.setPosition((this.space -= v.length));
        this.bb.bytes().set(v, this.space);
        return this.endVector();
    }
    /**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */
    createObjectOffset(obj) {
        if (obj === null) {
            return 0;
        }
        if (typeof obj === 'string') {
            return this.createString(obj);
        }
        else {
            return obj.pack(this);
        }
    }
    /**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */
    createObjectOffsetList(list) {
        const ret = [];
        for (let i = 0; i < list.length; ++i) {
            const val = list[i];
            if (val !== null) {
                ret.push(this.createObjectOffset(val));
            }
            else {
                throw new TypeError('FlatBuffers: Argument for createObjectOffsetList cannot contain null.');
            }
        }
        return ret;
    }
    createStructOffsetList(list, startFunc) {
        startFunc(this, list.length);
        this.createObjectOffsetList(list.slice().reverse());
        return this.endVector();
    }
}
exports.Builder = Builder;


/***/ }),

/***/ 84503:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ByteBuffer = void 0;
const constants_js_1 = __webpack_require__(32957);
const encoding_js_1 = __webpack_require__(92631);
const utils_js_1 = __webpack_require__(78321);
class ByteBuffer {
    /**
     * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
     */
    constructor(bytes_) {
        this.bytes_ = bytes_;
        this.position_ = 0;
        this.text_decoder_ = new TextDecoder();
    }
    /**
     * Create and allocate a new ByteBuffer with a given size.
     */
    static allocate(byte_size) {
        return new ByteBuffer(new Uint8Array(byte_size));
    }
    clear() {
        this.position_ = 0;
    }
    /**
     * Get the underlying `Uint8Array`.
     */
    bytes() {
        return this.bytes_;
    }
    /**
     * Get the buffer's position.
     */
    position() {
        return this.position_;
    }
    /**
     * Set the buffer's position.
     */
    setPosition(position) {
        this.position_ = position;
    }
    /**
     * Get the buffer's capacity.
     */
    capacity() {
        return this.bytes_.length;
    }
    readInt8(offset) {
        return (this.readUint8(offset) << 24) >> 24;
    }
    readUint8(offset) {
        return this.bytes_[offset];
    }
    readInt16(offset) {
        return (this.readUint16(offset) << 16) >> 16;
    }
    readUint16(offset) {
        return this.bytes_[offset] | (this.bytes_[offset + 1] << 8);
    }
    readInt32(offset) {
        return (this.bytes_[offset] |
            (this.bytes_[offset + 1] << 8) |
            (this.bytes_[offset + 2] << 16) |
            (this.bytes_[offset + 3] << 24));
    }
    readUint32(offset) {
        return this.readInt32(offset) >>> 0;
    }
    readInt64(offset) {
        return BigInt.asIntN(64, BigInt(this.readUint32(offset)) +
            (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readUint64(offset) {
        return BigInt.asUintN(64, BigInt(this.readUint32(offset)) +
            (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readFloat32(offset) {
        utils_js_1.int32[0] = this.readInt32(offset);
        return utils_js_1.float32[0];
    }
    readFloat64(offset) {
        utils_js_1.int32[utils_js_1.isLittleEndian ? 0 : 1] = this.readInt32(offset);
        utils_js_1.int32[utils_js_1.isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
        return utils_js_1.float64[0];
    }
    writeInt8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeUint8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeInt16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeUint16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeInt32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeUint32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeInt64(offset, value) {
        this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
        this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
    }
    writeUint64(offset, value) {
        this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
        this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
    }
    writeFloat32(offset, value) {
        utils_js_1.float32[0] = value;
        this.writeInt32(offset, utils_js_1.int32[0]);
    }
    writeFloat64(offset, value) {
        utils_js_1.float64[0] = value;
        this.writeInt32(offset, utils_js_1.int32[utils_js_1.isLittleEndian ? 0 : 1]);
        this.writeInt32(offset + 4, utils_js_1.int32[utils_js_1.isLittleEndian ? 1 : 0]);
    }
    /**
     * Return the file identifier.   Behavior is undefined for FlatBuffers whose
     * schema does not include a file_identifier (likely points at padding or the
     * start of a the root vtable).
     */
    getBufferIdentifier() {
        if (this.bytes_.length <
            this.position_ + constants_js_1.SIZEOF_INT + constants_js_1.FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: ByteBuffer is too short to contain an identifier.');
        }
        let result = '';
        for (let i = 0; i < constants_js_1.FILE_IDENTIFIER_LENGTH; i++) {
            result += String.fromCharCode(this.readInt8(this.position_ + constants_js_1.SIZEOF_INT + i));
        }
        return result;
    }
    /**
     * Look up a field in the vtable, return an offset into the object, or 0 if the
     * field is not present.
     */
    __offset(bb_pos, vtable_offset) {
        const vtable = bb_pos - this.readInt32(bb_pos);
        return vtable_offset < this.readInt16(vtable)
            ? this.readInt16(vtable + vtable_offset)
            : 0;
    }
    /**
     * Initialize any Table-derived type to point to the union at the given offset.
     */
    __union(t, offset) {
        t.bb_pos = offset + this.readInt32(offset);
        t.bb = this;
        return t;
    }
    /**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */
    __string(offset, opt_encoding) {
        offset += this.readInt32(offset);
        const length = this.readInt32(offset);
        offset += constants_js_1.SIZEOF_INT;
        const utf8bytes = this.bytes_.subarray(offset, offset + length);
        if (opt_encoding === encoding_js_1.Encoding.UTF8_BYTES)
            return utf8bytes;
        else
            return this.text_decoder_.decode(utf8bytes);
    }
    /**
     * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
     * if a string then return a new one
     *
     * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
     * makes the behaviour of __union_with_string different compared to __union
     */
    __union_with_string(o, offset) {
        if (typeof o === 'string') {
            return this.__string(offset);
        }
        return this.__union(o, offset);
    }
    /**
     * Retrieve the relative offset stored at "offset"
     */
    __indirect(offset) {
        return offset + this.readInt32(offset);
    }
    /**
     * Get the start of data of a vector whose offset is stored at "offset" in this object.
     */
    __vector(offset) {
        return offset + this.readInt32(offset) + constants_js_1.SIZEOF_INT; // data starts after the length
    }
    /**
     * Get the length of a vector whose offset is stored at "offset" in this object.
     */
    __vector_len(offset) {
        return this.readInt32(offset + this.readInt32(offset));
    }
    __has_identifier(ident) {
        if (ident.length != constants_js_1.FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: file identifier must be length ' + constants_js_1.FILE_IDENTIFIER_LENGTH);
        }
        for (let i = 0; i < constants_js_1.FILE_IDENTIFIER_LENGTH; i++) {
            if (ident.charCodeAt(i) != this.readInt8(this.position() + constants_js_1.SIZEOF_INT + i)) {
                return false;
            }
        }
        return true;
    }
    /**
     * A helper function for generating list for obj api
     */
    createScalarList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val);
            }
        }
        return ret;
    }
    /**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */
    createObjList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val.unpack());
            }
        }
        return ret;
    }
}
exports.ByteBuffer = ByteBuffer;


/***/ }),

/***/ 32957:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SIZE_PREFIX_LENGTH = exports.FILE_IDENTIFIER_LENGTH = exports.SIZEOF_INT = exports.SIZEOF_SHORT = void 0;
exports.SIZEOF_SHORT = 2;
exports.SIZEOF_INT = 4;
exports.FILE_IDENTIFIER_LENGTH = 4;
exports.SIZE_PREFIX_LENGTH = 4;


/***/ }),

/***/ 92631:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Encoding = void 0;
var Encoding;
(function (Encoding) {
    Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
    Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (exports.Encoding = Encoding = {}));


/***/ }),

/***/ 96558:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
__webpack_unused_export__ = exports.$F = exports.M$ = __webpack_unused_export__ = __webpack_unused_export__ = __webpack_unused_export__ = __webpack_unused_export__ = exports.kc = __webpack_unused_export__ = __webpack_unused_export__ = __webpack_unused_export__ = void 0;
var constants_js_1 = __webpack_require__(32957);
__webpack_unused_export__ = ({ enumerable: true, get: function () { return constants_js_1.FILE_IDENTIFIER_LENGTH; } });
__webpack_unused_export__ = ({ enumerable: true, get: function () { return constants_js_1.SIZEOF_INT; } });
__webpack_unused_export__ = ({ enumerable: true, get: function () { return constants_js_1.SIZEOF_SHORT; } });
Object.defineProperty(exports, "kc", ({ enumerable: true, get: function () { return constants_js_1.SIZE_PREFIX_LENGTH; } }));
var utils_js_1 = __webpack_require__(78321);
__webpack_unused_export__ = ({ enumerable: true, get: function () { return utils_js_1.float32; } });
__webpack_unused_export__ = ({ enumerable: true, get: function () { return utils_js_1.float64; } });
__webpack_unused_export__ = ({ enumerable: true, get: function () { return utils_js_1.int32; } });
__webpack_unused_export__ = ({ enumerable: true, get: function () { return utils_js_1.isLittleEndian; } });
var builder_js_1 = __webpack_require__(87071);
Object.defineProperty(exports, "M$", ({ enumerable: true, get: function () { return builder_js_1.Builder; } }));
var byte_buffer_js_1 = __webpack_require__(84503);
Object.defineProperty(exports, "$F", ({ enumerable: true, get: function () { return byte_buffer_js_1.ByteBuffer; } }));
var encoding_js_1 = __webpack_require__(92631);
__webpack_unused_export__ = ({ enumerable: true, get: function () { return encoding_js_1.Encoding; } });


/***/ }),

/***/ 78321:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isLittleEndian = exports.float64 = exports.float32 = exports.int32 = void 0;
exports.int32 = new Int32Array(2);
exports.float32 = new Float32Array(exports.int32.buffer);
exports.float64 = new Float64Array(exports.int32.buffer);
exports.isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;


/***/ }),

/***/ 91835:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  tableFromIPC: () => (/* reexport */ tableFromIPC)
});

// UNUSED EXPORTS: AsyncByteQueue, AsyncByteStream, AsyncMessageReader, AsyncRecordBatchFileReader, AsyncRecordBatchStreamReader, Binary, BinaryBuilder, BinaryView, BinaryViewBuilder, Bool, BoolBuilder, BufferType, Builder, ByteStream, CompressionType, Data, DataType, DateBuilder, DateDay, DateDayBuilder, DateMillisecond, DateMillisecondBuilder, DateUnit, Date_, Decimal, DecimalBuilder, DenseUnion, DenseUnionBuilder, Dictionary, DictionaryBuilder, Duration, DurationBuilder, DurationMicrosecond, DurationMicrosecondBuilder, DurationMillisecond, DurationMillisecondBuilder, DurationNanosecond, DurationNanosecondBuilder, DurationSecond, DurationSecondBuilder, Field, FixedSizeBinary, FixedSizeBinaryBuilder, FixedSizeList, FixedSizeListBuilder, Float, Float16, Float16Builder, Float32, Float32Builder, Float64, Float64Builder, FloatBuilder, Int, Int16, Int16Builder, Int32, Int32Builder, Int64, Int64Builder, Int8, Int8Builder, IntBuilder, Interval, IntervalBuilder, IntervalDayTime, IntervalDayTimeBuilder, IntervalMonthDayNano, IntervalMonthDayNanoBuilder, IntervalUnit, IntervalYearMonth, IntervalYearMonthBuilder, JSONMessageReader, LargeBinary, LargeBinaryBuilder, LargeList, LargeListBuilder, LargeUtf8, LargeUtf8Builder, List, ListBuilder, MapBuilder, MapRow, Map_, Message, MessageHeader, MessageReader, MetadataVersion, Null, NullBuilder, Precision, RecordBatch, RecordBatchFileReader, RecordBatchFileWriter, RecordBatchJSONWriter, RecordBatchReader, RecordBatchStreamReader, RecordBatchStreamWriter, RecordBatchWriter, Schema, SparseUnion, SparseUnionBuilder, Struct, StructBuilder, StructRow, Table, Time, TimeBuilder, TimeMicrosecond, TimeMicrosecondBuilder, TimeMillisecond, TimeMillisecondBuilder, TimeNanosecond, TimeNanosecondBuilder, TimeSecond, TimeSecondBuilder, TimeUnit, Timestamp, TimestampBuilder, TimestampMicrosecond, TimestampMicrosecondBuilder, TimestampMillisecond, TimestampMillisecondBuilder, TimestampNanosecond, TimestampNanosecondBuilder, TimestampSecond, TimestampSecondBuilder, Type, Uint16, Uint16Builder, Uint32, Uint32Builder, Uint64, Uint64Builder, Uint8, Uint8Builder, Union, UnionBuilder, UnionMode, Utf8, Utf8Builder, Utf8View, Utf8ViewBuilder, Vector, Visitor, builderThroughAsyncIterable, builderThroughIterable, compressionRegistry, isArrowData, isArrowDataType, isArrowField, isArrowRecordBatch, isArrowSchema, isArrowTable, isArrowVector, makeBuilder, makeData, makeTable, makeVector, tableFromArrays, tableFromJSON, tableToIPC, util, vectorFromArray

// EXTERNAL MODULE: ./node_modules/tslib/tslib.js
var tslib_tslib = __webpack_require__(61860);
;// CONCATENATED MODULE: ./node_modules/tslib/modules/index.js

const {
    __extends,
    __assign,
    __rest,
    __decorate,
    __param,
    __esDecorate,
    __runInitializers,
    __propKey,
    __setFunctionName,
    __metadata,
    __awaiter,
    __generator,
    __exportStar,
    __createBinding,
    __values,
    __read,
    __spread,
    __spreadArrays,
    __spreadArray,
    __await: modules_await,
    __asyncGenerator: modules_asyncGenerator,
    __asyncDelegator,
    __asyncValues: modules_asyncValues,
    __makeTemplateObject,
    __importStar,
    __importDefault,
    __classPrivateFieldGet,
    __classPrivateFieldSet,
    __classPrivateFieldIn,
    __addDisposableResource,
    __disposeResources,
    __rewriteRelativeImportExtension,
} = tslib_tslib;

/* harmony default export */ const modules = ((/* unused pure expression or super */ null && (tslib)));

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/utf8.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const decoder = new TextDecoder('utf-8');
/** @ignore */
const decodeUtf8 = decoder.decode.bind(decoder);
const encoder = new TextEncoder();
/** @ignore */
const encodeUtf8 = (value) => encoder.encode(value);

//# sourceMappingURL=utf8.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/compat.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/** @ignore */ const isNumber = (x) => typeof x === 'number';
/** @ignore */ const isBoolean = (x) => typeof x === 'boolean';
/** @ignore */ const isFunction = (x) => typeof x === 'function';
/** @ignore */
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
const isObject = (x) => x != null && Object(x) === x;
/** @ignore */
const isPromise = (x) => {
    return isObject(x) && isFunction(x.then);
};
/** @ignore */
const isObservable = (x) => {
    return isObject(x) && isFunction(x.subscribe);
};
/** @ignore */
const isIterable = (x) => {
    return isObject(x) && isFunction(x[Symbol.iterator]);
};
/** @ignore */
const isAsyncIterable = (x) => {
    return isObject(x) && isFunction(x[Symbol.asyncIterator]);
};
/** @ignore */
const isArrowJSON = (x) => {
    return isObject(x) && isObject(x['schema']);
};
/** @ignore */
const isArrayLike = (x) => {
    return isObject(x) && isNumber(x['length']);
};
/** @ignore */
const isIteratorResult = (x) => {
    return isObject(x) && ('done' in x) && ('value' in x);
};
/** @ignore */
const isUnderlyingSink = (x) => {
    return isObject(x) &&
        isFunction(x['abort']) &&
        isFunction(x['close']) &&
        isFunction(x['start']) &&
        isFunction(x['write']);
};
/** @ignore */
const isFileHandle = (x) => {
    return isObject(x) && isFunction(x['stat']) && isNumber(x['fd']);
};
/** @ignore */
const isFSReadStream = (x) => {
    return isReadableNodeStream(x) && isNumber(x['bytesRead']);
};
/** @ignore */
const isFetchResponse = (x) => {
    return isObject(x) && isReadableDOMStream(x['body']);
};
const isReadableInterop = (x) => ('_getDOMStream' in x && '_getNodeStream' in x);
/** @ignore */
const isWritableDOMStream = (x) => {
    return isObject(x) &&
        isFunction(x['abort']) &&
        isFunction(x['getWriter']) &&
        !isReadableInterop(x);
};
/** @ignore */
const isReadableDOMStream = (x) => {
    return isObject(x) &&
        isFunction(x['cancel']) &&
        isFunction(x['getReader']) &&
        !isReadableInterop(x);
};
/** @ignore */
const isWritableNodeStream = (x) => {
    return isObject(x) &&
        isFunction(x['end']) &&
        isFunction(x['write']) &&
        isBoolean(x['writable']) &&
        !isReadableInterop(x);
};
/** @ignore */
const isReadableNodeStream = (x) => {
    return isObject(x) &&
        isFunction(x['read']) &&
        isFunction(x['pipe']) &&
        isBoolean(x['readable']) &&
        !isReadableInterop(x);
};
/** @ignore */
const isFlatbuffersByteBuffer = (x) => {
    return isObject(x) &&
        isFunction(x['clear']) &&
        isFunction(x['bytes']) &&
        isFunction(x['position']) &&
        isFunction(x['setPosition']) &&
        isFunction(x['capacity']) &&
        isFunction(x['getBufferIdentifier']) &&
        isFunction(x['createLong']);
};

//# sourceMappingURL=compat.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/buffer.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
const SharedArrayBuf = (typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : ArrayBuffer);
/** @ignore */
function collapseContiguousByteRanges(chunks) {
    const result = chunks[0] ? [chunks[0]] : [];
    let xOffset, yOffset, xLen, yLen;
    for (let x, y, i = 0, j = 0, n = chunks.length; ++i < n;) {
        x = result[j];
        y = chunks[i];
        // continue if x and y don't share the same underlying ArrayBuffer, or if x isn't before y
        if (!x || !y || x.buffer !== y.buffer || y.byteOffset < x.byteOffset) {
            y && (result[++j] = y);
            continue;
        }
        ({ byteOffset: xOffset, byteLength: xLen } = x);
        ({ byteOffset: yOffset, byteLength: yLen } = y);
        // continue if the byte ranges of x and y aren't contiguous
        if ((xOffset + xLen) < yOffset || (yOffset + yLen) < xOffset) {
            y && (result[++j] = y);
            continue;
        }
        result[j] = new Uint8Array(x.buffer, xOffset, yOffset - xOffset + yLen);
    }
    return result;
}
/** @ignore */
function memcpy(target, source, targetByteOffset = 0, sourceByteLength = source.byteLength) {
    const targetByteLength = target.byteLength;
    const dst = new Uint8Array(target.buffer, target.byteOffset, targetByteLength);
    const src = new Uint8Array(source.buffer, source.byteOffset, Math.min(sourceByteLength, targetByteLength));
    dst.set(src, targetByteOffset);
    return target;
}
/** @ignore */
function joinUint8Arrays(chunks, size) {
    // collapse chunks that share the same underlying ArrayBuffer and whose byte ranges overlap,
    // to avoid unnecessarily copying the bytes to do this buffer join. This is a common case during
    // streaming, where we may be reading partial byte ranges out of the same underlying ArrayBuffer
    const result = collapseContiguousByteRanges(chunks);
    const byteLength = result.reduce((x, b) => x + b.byteLength, 0);
    let source, sliced, buffer;
    let offset = 0, index = -1;
    const length = Math.min(size || Number.POSITIVE_INFINITY, byteLength);
    for (const n = result.length; ++index < n;) {
        source = result[index];
        sliced = source.subarray(0, Math.min(source.length, length - offset));
        if (length <= (offset + sliced.length)) {
            if (sliced.length < source.length) {
                result[index] = source.subarray(sliced.length);
            }
            else if (sliced.length === source.length) {
                index++;
            }
            buffer ? memcpy(buffer, sliced, offset) : (buffer = sliced);
            break;
        }
        memcpy(buffer || (buffer = new Uint8Array(length)), sliced, offset);
        offset += sliced.length;
    }
    return [buffer || new Uint8Array(0), result.slice(index), byteLength - (buffer ? buffer.byteLength : 0)];
}
/** @ignore */
function toArrayBufferView(ArrayBufferViewCtor, input) {
    let value = isIteratorResult(input) ? input.value : input;
    if (value instanceof ArrayBufferViewCtor) {
        if (ArrayBufferViewCtor === Uint8Array) {
            // Node's `Buffer` class passes the `instanceof Uint8Array` check, but we need
            // a real Uint8Array, since Buffer#slice isn't the same as Uint8Array#slice :/
            return new ArrayBufferViewCtor(value.buffer, value.byteOffset, value.byteLength);
        }
        return value;
    }
    if (!value) {
        return new ArrayBufferViewCtor(0);
    }
    if (typeof value === 'string') {
        value = encodeUtf8(value);
    }
    if (value instanceof ArrayBuffer) {
        return new ArrayBufferViewCtor(value);
    }
    if (value instanceof SharedArrayBuf) {
        return new ArrayBufferViewCtor(value);
    }
    if (isFlatbuffersByteBuffer(value)) {
        return toArrayBufferView(ArrayBufferViewCtor, value.bytes());
    }
    return !ArrayBuffer.isView(value) ? ArrayBufferViewCtor.from(value) : (value.byteLength <= 0 ? new ArrayBufferViewCtor(0)
        : new ArrayBufferViewCtor(value.buffer, value.byteOffset, value.byteLength / ArrayBufferViewCtor.BYTES_PER_ELEMENT));
}
/** @ignore */ const toInt8Array = (input) => toArrayBufferView(Int8Array, input);
/** @ignore */ const toInt16Array = (input) => toArrayBufferView(Int16Array, input);
/** @ignore */ const toInt32Array = (input) => toArrayBufferView(Int32Array, input);
/** @ignore */ const toBigInt64Array = (input) => toArrayBufferView(BigInt64Array, input);
/** @ignore */ const toUint8Array = (input) => toArrayBufferView(Uint8Array, input);
/** @ignore */ const toUint16Array = (input) => toArrayBufferView(Uint16Array, input);
/** @ignore */ const toUint32Array = (input) => toArrayBufferView(Uint32Array, input);
/** @ignore */ const toBigUint64Array = (input) => toArrayBufferView(BigUint64Array, input);
/** @ignore */ const toFloat32Array = (input) => toArrayBufferView(Float32Array, input);
/** @ignore */ const toFloat64Array = (input) => toArrayBufferView(Float64Array, input);
/** @ignore */ const toUint8ClampedArray = (input) => toArrayBufferView(Uint8ClampedArray, input);
/** @ignore */
const pump = (iterator) => { iterator.next(); return iterator; };
/** @ignore */
function* toArrayBufferViewIterator(ArrayCtor, source) {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const wrap = function* (x) { yield x; };
    const buffers = (typeof source === 'string') ? wrap(source)
        : (ArrayBuffer.isView(source)) ? wrap(source)
            : (source instanceof ArrayBuffer) ? wrap(source)
                : (source instanceof SharedArrayBuf) ? wrap(source)
                    : !isIterable(source) ? wrap(source) : source;
    yield* pump((function* (it) {
        let r = null;
        do {
            r = it.next(yield toArrayBufferView(ArrayCtor, r));
        } while (!r.done);
    })(buffers[Symbol.iterator]()));
    return new ArrayCtor();
}
/** @ignore */ const toInt8ArrayIterator = (input) => toArrayBufferViewIterator(Int8Array, input);
/** @ignore */ const toInt16ArrayIterator = (input) => toArrayBufferViewIterator(Int16Array, input);
/** @ignore */ const toInt32ArrayIterator = (input) => toArrayBufferViewIterator(Int32Array, input);
/** @ignore */ const toUint8ArrayIterator = (input) => toArrayBufferViewIterator(Uint8Array, input);
/** @ignore */ const toUint16ArrayIterator = (input) => toArrayBufferViewIterator(Uint16Array, input);
/** @ignore */ const toUint32ArrayIterator = (input) => toArrayBufferViewIterator(Uint32Array, input);
/** @ignore */ const toFloat32ArrayIterator = (input) => toArrayBufferViewIterator(Float32Array, input);
/** @ignore */ const toFloat64ArrayIterator = (input) => toArrayBufferViewIterator(Float64Array, input);
/** @ignore */ const toUint8ClampedArrayIterator = (input) => toArrayBufferViewIterator(Uint8ClampedArray, input);
/** @ignore */
function toArrayBufferViewAsyncIterator(ArrayCtor, source) {
    return modules_asyncGenerator(this, arguments, function* toArrayBufferViewAsyncIterator_1() {
        // if a Promise, unwrap the Promise and iterate the resolved value
        if (isPromise(source)) {
            return yield modules_await(yield modules_await(yield* __asyncDelegator(modules_asyncValues(toArrayBufferViewAsyncIterator(ArrayCtor, yield modules_await(source))))));
        }
        // eslint-disable-next-line unicorn/consistent-function-scoping
        const wrap = function (x) { return modules_asyncGenerator(this, arguments, function* () { yield yield modules_await(yield modules_await(x)); }); };
        const emit = function (source) {
            return modules_asyncGenerator(this, arguments, function* () {
                yield modules_await(yield* __asyncDelegator(modules_asyncValues(pump((function* (it) {
                    let r = null;
                    do {
                        r = it.next(yield r === null || r === void 0 ? void 0 : r.value);
                    } while (!r.done);
                })(source[Symbol.iterator]())))));
            });
        };
        const buffers = (typeof source === 'string') ? wrap(source) // if string, wrap in an AsyncIterableIterator
            : (ArrayBuffer.isView(source)) ? wrap(source) // if TypedArray, wrap in an AsyncIterableIterator
                : (source instanceof ArrayBuffer) ? wrap(source) // if ArrayBuffer, wrap in an AsyncIterableIterator
                    : (source instanceof SharedArrayBuf) ? wrap(source) // if SharedArrayBuffer, wrap in an AsyncIterableIterator
                        : isIterable(source) ? emit(source) // If Iterable, wrap in an AsyncIterableIterator and compose the `next` values
                            : !isAsyncIterable(source) ? wrap(source) // If not an AsyncIterable, treat as a sentinel and wrap in an AsyncIterableIterator
                                : source; // otherwise if AsyncIterable, use it
        yield modules_await(// otherwise if AsyncIterable, use it
        yield* __asyncDelegator(modules_asyncValues(pump((function (it) {
            return modules_asyncGenerator(this, arguments, function* () {
                let r = null;
                do {
                    r = yield modules_await(it.next(yield yield modules_await(toArrayBufferView(ArrayCtor, r))));
                } while (!r.done);
            });
        })(buffers[Symbol.asyncIterator]())))));
        return yield modules_await(new ArrayCtor());
    });
}
/** @ignore */ const toInt8ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int8Array, input);
/** @ignore */ const toInt16ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int16Array, input);
/** @ignore */ const toInt32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int32Array, input);
/** @ignore */ const toUint8ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint8Array, input);
/** @ignore */ const toUint16ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint16Array, input);
/** @ignore */ const toUint32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint32Array, input);
/** @ignore */ const toFloat32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Float32Array, input);
/** @ignore */ const toFloat64ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Float64Array, input);
/** @ignore */ const toUint8ClampedArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint8ClampedArray, input);
function rebaseValueOffsets(offset, length, valueOffsets) {
    // If we have a non-zero offset, create a new offsets array with the values
    // shifted by the start offset, such that the new start offset is 0
    if (offset !== 0) {
        valueOffsets = valueOffsets.slice(0, length);
        const delta = typeof valueOffsets[0] === 'bigint' ? BigInt(offset) : offset;
        for (let i = -1, n = valueOffsets.length; ++i < n;) {
            valueOffsets[i] += delta;
        }
    }
    return valueOffsets.subarray(0, length);
}
/** @ignore */
function compareArrayLike(a, b) {
    let i = 0;
    const n = a.length;
    if (n !== b.length) {
        return false;
    }
    if (n > 0) {
        do {
            if (a[i] !== b[i]) {
                return false;
            }
        } while (++i < n);
    }
    return true;
}

//# sourceMappingURL=buffer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/adapters.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
/* harmony default export */ const adapters = ({
    fromIterable(source) {
        return adapters_pump(fromIterable(source));
    },
    fromAsyncIterable(source) {
        return adapters_pump(fromAsyncIterable(source));
    },
    fromDOMStream(source) {
        return adapters_pump(fromDOMStream(source));
    },
    fromNodeStream(stream) {
        return adapters_pump(fromNodeStream(stream));
    },
    // @ts-ignore
    toDOMStream(source, options) {
        throw new Error(`"toDOMStream" not available in this environment`);
    },
    // @ts-ignore
    toNodeStream(source, options) {
        throw new Error(`"toNodeStream" not available in this environment`);
    },
});
/** @ignore */
const adapters_pump = (iterator) => { iterator.next(); return iterator; };
/** @ignore */
function* fromIterable(source) {
    let done, threw = false;
    let buffers = [], buffer;
    let cmd, size, bufferLength = 0;
    function byteRange() {
        if (cmd === 'peek') {
            return joinUint8Arrays(buffers, size)[0];
        }
        [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
        return buffer;
    }
    // Yield so the caller can inject the read command before creating the source Iterator
    ({ cmd, size } = (yield (() => null)()) || { cmd: 'read', size: 0 });
    // initialize the iterator
    const it = toUint8ArrayIterator(source)[Symbol.iterator]();
    try {
        do {
            // read the next value
            ({ done, value: buffer } = Number.isNaN(size - bufferLength) ?
                it.next() : it.next(size - bufferLength));
            // if chunk is not null or empty, push it onto the queue
            if (!done && buffer.byteLength > 0) {
                buffers.push(buffer);
                bufferLength += buffer.byteLength;
            }
            // If we have enough bytes in our buffer, yield chunks until we don't
            if (done || size <= bufferLength) {
                do {
                    ({ cmd, size } = yield byteRange());
                } while (size < bufferLength);
            }
        } while (!done);
    }
    catch (e) {
        threw = true;
        (typeof it.throw === 'function') && (it.throw(e));
    }
    finally {
        (threw === false) && (typeof it.return === 'function') && (it.return(null));
    }
    return null;
}
/** @ignore */
function fromAsyncIterable(source) {
    return modules_asyncGenerator(this, arguments, function* fromAsyncIterable_1() {
        let done, threw = false;
        let buffers = [], buffer;
        let cmd, size, bufferLength = 0;
        function byteRange() {
            if (cmd === 'peek') {
                return joinUint8Arrays(buffers, size)[0];
            }
            [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
            return buffer;
        }
        // Yield so the caller can inject the read command before creating the source AsyncIterator
        ({ cmd, size } = (yield yield modules_await((() => null)())) || { cmd: 'read', size: 0 });
        // initialize the iterator
        const it = toUint8ArrayAsyncIterator(source)[Symbol.asyncIterator]();
        try {
            do {
                // read the next value
                ({ done, value: buffer } = Number.isNaN(size - bufferLength)
                    ? yield modules_await(it.next())
                    : yield modules_await(it.next(size - bufferLength)));
                // if chunk is not null or empty, push it onto the queue
                if (!done && buffer.byteLength > 0) {
                    buffers.push(buffer);
                    bufferLength += buffer.byteLength;
                }
                // If we have enough bytes in our buffer, yield chunks until we don't
                if (done || size <= bufferLength) {
                    do {
                        ({ cmd, size } = yield yield modules_await(byteRange()));
                    } while (size < bufferLength);
                }
            } while (!done);
        }
        catch (e) {
            threw = true;
            (typeof it.throw === 'function') && (yield modules_await(it.throw(e)));
        }
        finally {
            (threw === false) && (typeof it.return === 'function') && (yield modules_await(it.return(new Uint8Array(0))));
        }
        return yield modules_await(null);
    });
}
// All this manual Uint8Array chunk management can be avoided if/when engines
// add support for ArrayBuffer.transfer() or ArrayBuffer.prototype.realloc():
// https://github.com/domenic/proposal-arraybuffer-transfer
/** @ignore */
function fromDOMStream(source) {
    return modules_asyncGenerator(this, arguments, function* fromDOMStream_1() {
        let done = false, threw = false;
        let buffers = [], buffer;
        let cmd, size, bufferLength = 0;
        function byteRange() {
            if (cmd === 'peek') {
                return joinUint8Arrays(buffers, size)[0];
            }
            [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
            return buffer;
        }
        // Yield so the caller can inject the read command before we establish the ReadableStream lock
        ({ cmd, size } = (yield yield modules_await((() => null)())) || { cmd: 'read', size: 0 });
        // initialize the reader and lock the stream
        const it = new AdaptiveByteReader(source);
        try {
            do {
                // read the next value
                ({ done, value: buffer } = Number.isNaN(size - bufferLength)
                    ? yield modules_await(it['read']())
                    : yield modules_await(it['read'](size - bufferLength)));
                // if chunk is not null or empty, push it onto the queue
                if (!done && buffer.byteLength > 0) {
                    buffers.push(toUint8Array(buffer));
                    bufferLength += buffer.byteLength;
                }
                // If we have enough bytes in our buffer, yield chunks until we don't
                if (done || size <= bufferLength) {
                    do {
                        ({ cmd, size } = yield yield modules_await(byteRange()));
                    } while (size < bufferLength);
                }
            } while (!done);
        }
        catch (e) {
            threw = true;
            yield modules_await(it['cancel'](e));
        }
        finally {
            (threw === false) ? (yield modules_await(it['cancel']()))
                : source['locked'] && it.releaseLock();
        }
        return yield modules_await(null);
    });
}
/** @ignore */
class AdaptiveByteReader {
    constructor(source) {
        this.source = source;
        this.reader = null;
        this.reader = this.source['getReader']();
        // We have to catch and swallow errors here to avoid uncaught promise rejection exceptions
        // that seem to be raised when we call `releaseLock()` on this reader. I'm still mystified
        // about why these errors are raised, but I'm sure there's some important spec reason that
        // I haven't considered. I hate to employ such an anti-pattern here, but it seems like the
        // only solution in this case :/
        this.reader['closed'].catch(() => { });
    }
    get closed() {
        return this.reader ? this.reader['closed'].catch(() => { }) : Promise.resolve();
    }
    releaseLock() {
        if (this.reader) {
            this.reader.releaseLock();
        }
        this.reader = null;
    }
    cancel(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reader, source } = this;
            reader && (yield reader['cancel'](reason).catch(() => { }));
            source && (source['locked'] && this.releaseLock());
        });
    }
    read(size) {
        return __awaiter(this, void 0, void 0, function* () {
            if (size === 0) {
                return { done: this.reader == null, value: new Uint8Array(0) };
            }
            const result = yield this.reader.read();
            !result.done && (result.value = toUint8Array(result));
            return result;
        });
    }
}
/** @ignore */
const onEvent = (stream, event) => {
    const handler = (_) => resolve([event, _]);
    let resolve;
    return [event, handler, new Promise((r) => (resolve = r) && stream['once'](event, handler))];
};
/** @ignore */
function fromNodeStream(stream) {
    return modules_asyncGenerator(this, arguments, function* fromNodeStream_1() {
        const events = [];
        let event = 'error';
        let done = false, err = null;
        let cmd, size, bufferLength = 0;
        let buffers = [], buffer;
        function byteRange() {
            if (cmd === 'peek') {
                return joinUint8Arrays(buffers, size)[0];
            }
            [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
            return buffer;
        }
        // Yield so the caller can inject the read command before we
        // add the listener for the source stream's 'readable' event.
        ({ cmd, size } = (yield yield modules_await((() => null)())) || { cmd: 'read', size: 0 });
        // ignore stdin if it's a TTY
        if (stream['isTTY']) {
            yield yield modules_await(new Uint8Array(0));
            return yield modules_await(null);
        }
        try {
            // initialize the stream event handlers
            events[0] = onEvent(stream, 'end');
            events[1] = onEvent(stream, 'error');
            do {
                events[2] = onEvent(stream, 'readable');
                // wait on the first message event from the stream
                [event, err] = yield modules_await(Promise.race(events.map((x) => x[2])));
                // if the stream emitted an Error, rethrow it
                if (event === 'error') {
                    break;
                }
                if (!(done = event === 'end')) {
                    // If the size is NaN, request to read everything in the stream's internal buffer
                    if (!Number.isFinite(size - bufferLength)) {
                        buffer = toUint8Array(stream['read']());
                    }
                    else {
                        buffer = toUint8Array(stream['read'](size - bufferLength));
                        // If the byteLength is 0, then the requested amount is more than the stream has
                        // in its internal buffer. In this case the stream needs a "kick" to tell it to
                        // continue emitting readable events, so request to read everything the stream
                        // has in its internal buffer right now.
                        if (buffer.byteLength < (size - bufferLength)) {
                            buffer = toUint8Array(stream['read']());
                        }
                    }
                    // if chunk is not null or empty, push it onto the queue
                    if (buffer.byteLength > 0) {
                        buffers.push(buffer);
                        bufferLength += buffer.byteLength;
                    }
                }
                // If we have enough bytes in our buffer, yield chunks until we don't
                if (done || size <= bufferLength) {
                    do {
                        ({ cmd, size } = yield yield modules_await(byteRange()));
                    } while (size < bufferLength);
                }
            } while (!done);
        }
        finally {
            yield modules_await(cleanup(events, event === 'error' ? err : null));
        }
        return yield modules_await(null);
        function cleanup(events, err) {
            buffer = buffers = null;
            return new Promise((resolve, reject) => {
                for (const [evt, fn] of events) {
                    stream['off'](evt, fn);
                }
                try {
                    // Some stream implementations don't call the destroy callback,
                    // because it's really a node-internal API. Just calling `destroy`
                    // here should be enough to conform to the ReadableStream contract
                    const destroy = stream['destroy'];
                    destroy && destroy.call(stream, err);
                    err = undefined;
                }
                catch (e) {
                    err = e || err;
                }
                finally {
                    err != null ? reject(err) : resolve();
                }
            });
        }
    });
}

//# sourceMappingURL=adapters.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/enum.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.







/**
 * Main data type enumeration.
 *
 * Data types in this library are all *logical*. They can be expressed as
 * either a primitive physical type (bytes or bits of some fixed size), a
 * nested type consisting of other data types, or another data type (e.g. a
 * timestamp encoded as an int64).
 *
 * **Note**: Only non-negative enum values are written to an Arrow IPC payload.
 *
 * The rest of the values are specified here so TypeScript can narrow the type
 * signatures further beyond the base Arrow Types. The Arrow DataTypes include
 * metadata like `bitWidth` that impact the type signatures of the values we
 * accept and return.
 *
 * For example, the `Int8Vector` reads 1-byte numbers from an `Int8Array`, an
 * `Int32Vector` reads a 4-byte number from an `Int32Array`, and an `Int64Vector`
 * reads a pair of 4-byte lo, hi 32-bit integers as a zero-copy slice from the
 * underlying `Int32Array`.
 *
 * Library consumers benefit by knowing the narrowest type, since we can ensure
 * the types across all public methods are propagated, and never bail to `any`.
 * These values are _never_ used at runtime, and they will _never_ be written
 * to the flatbuffers metadata of serialized Arrow IPC payloads.
 */
var Type;
(function (Type) {
    Type[Type["NONE"] = 0] = "NONE";
    Type[Type["Null"] = 1] = "Null";
    Type[Type["Int"] = 2] = "Int";
    Type[Type["Float"] = 3] = "Float";
    Type[Type["Binary"] = 4] = "Binary";
    Type[Type["Utf8"] = 5] = "Utf8";
    Type[Type["Bool"] = 6] = "Bool";
    Type[Type["Decimal"] = 7] = "Decimal";
    Type[Type["Date"] = 8] = "Date";
    Type[Type["Time"] = 9] = "Time";
    Type[Type["Timestamp"] = 10] = "Timestamp";
    Type[Type["Interval"] = 11] = "Interval";
    Type[Type["List"] = 12] = "List";
    Type[Type["Struct"] = 13] = "Struct";
    Type[Type["Union"] = 14] = "Union";
    Type[Type["FixedSizeBinary"] = 15] = "FixedSizeBinary";
    Type[Type["FixedSizeList"] = 16] = "FixedSizeList";
    Type[Type["Map"] = 17] = "Map";
    Type[Type["Duration"] = 18] = "Duration";
    Type[Type["LargeBinary"] = 19] = "LargeBinary";
    Type[Type["LargeUtf8"] = 20] = "LargeUtf8";
    Type[Type["LargeList"] = 21] = "LargeList";
    Type[Type["BinaryView"] = 23] = "BinaryView";
    Type[Type["Utf8View"] = 24] = "Utf8View";
    Type[Type["Dictionary"] = -1] = "Dictionary";
    Type[Type["Int8"] = -2] = "Int8";
    Type[Type["Int16"] = -3] = "Int16";
    Type[Type["Int32"] = -4] = "Int32";
    Type[Type["Int64"] = -5] = "Int64";
    Type[Type["Uint8"] = -6] = "Uint8";
    Type[Type["Uint16"] = -7] = "Uint16";
    Type[Type["Uint32"] = -8] = "Uint32";
    Type[Type["Uint64"] = -9] = "Uint64";
    Type[Type["Float16"] = -10] = "Float16";
    Type[Type["Float32"] = -11] = "Float32";
    Type[Type["Float64"] = -12] = "Float64";
    Type[Type["DateDay"] = -13] = "DateDay";
    Type[Type["DateMillisecond"] = -14] = "DateMillisecond";
    Type[Type["TimestampSecond"] = -15] = "TimestampSecond";
    Type[Type["TimestampMillisecond"] = -16] = "TimestampMillisecond";
    Type[Type["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
    Type[Type["TimestampNanosecond"] = -18] = "TimestampNanosecond";
    Type[Type["TimeSecond"] = -19] = "TimeSecond";
    Type[Type["TimeMillisecond"] = -20] = "TimeMillisecond";
    Type[Type["TimeMicrosecond"] = -21] = "TimeMicrosecond";
    Type[Type["TimeNanosecond"] = -22] = "TimeNanosecond";
    Type[Type["DenseUnion"] = -23] = "DenseUnion";
    Type[Type["SparseUnion"] = -24] = "SparseUnion";
    Type[Type["IntervalDayTime"] = -25] = "IntervalDayTime";
    Type[Type["IntervalYearMonth"] = -26] = "IntervalYearMonth";
    Type[Type["DurationSecond"] = -27] = "DurationSecond";
    Type[Type["DurationMillisecond"] = -28] = "DurationMillisecond";
    Type[Type["DurationMicrosecond"] = -29] = "DurationMicrosecond";
    Type[Type["DurationNanosecond"] = -30] = "DurationNanosecond";
    Type[Type["IntervalMonthDayNano"] = -31] = "IntervalMonthDayNano";
})(Type || (Type = {}));
var BufferType;
(function (BufferType) {
    /**
     * used in List type, Dense Union and variable length primitive types (String, Binary)
     */
    BufferType[BufferType["OFFSET"] = 0] = "OFFSET";
    /**
     * actual data, either fixed width primitive types in slots or variable width delimited by an OFFSET vector
     */
    BufferType[BufferType["DATA"] = 1] = "DATA";
    /**
     * Bit vector indicating if each value is null
     */
    BufferType[BufferType["VALIDITY"] = 2] = "VALIDITY";
    /**
     * Type vector used in Union type
     */
    BufferType[BufferType["TYPE"] = 3] = "TYPE";
})(BufferType || (BufferType = {}));

//# sourceMappingURL=enum.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/pretty.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/** @ignore */ const undf = void (0);
/** @ignore */
function valueToString(x) {
    if (x === null) {
        return 'null';
    }
    if (x === undf) {
        return 'undefined';
    }
    switch (typeof x) {
        case 'number': return `${x}`;
        case 'bigint': return `${x}`;
        case 'string': return `"${x}"`;
    }
    // If [Symbol.toPrimitive] is implemented (like in BN)
    // use it instead of JSON.stringify(). This ensures we
    // print BigInts, Decimals, and Binary in their native
    // representation
    if (typeof x[Symbol.toPrimitive] === 'function') {
        return x[Symbol.toPrimitive]('string');
    }
    if (ArrayBuffer.isView(x)) {
        if (x instanceof BigInt64Array || x instanceof BigUint64Array) {
            return `[${[...x].map(x => valueToString(x))}]`;
        }
        return `[${x}]`;
    }
    return ArrayBuffer.isView(x) ? `[${x}]` : JSON.stringify(x, (_, y) => typeof y === 'bigint' ? `${y}` : y);
}

//# sourceMappingURL=pretty.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/bigint.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/**
 * Converts an integer as a number or bigint to a number, throwing an error if the input cannot safely be represented as a number.
 */
function bigIntToNumber(number) {
    if (typeof number === 'bigint' && (number < Number.MIN_SAFE_INTEGER || number > Number.MAX_SAFE_INTEGER)) {
        throw new TypeError(`${number} is not safe to convert to a number.`);
    }
    return Number(number);
}
/**
 * Duivides the bigint number by the divisor and returns the result as a number.
 * Dividing bigints always results in bigints so we don't get the remainder.
 * This function gives us the remainder but assumes that the result fits into a number.
 *
 * @param number The number to divide.
 * @param divisor The divisor.
 * @returns The result of the division as a number.
 */
function divideBigInts(number, divisor) {
    return bigIntToNumber(number / divisor) + bigIntToNumber(number % divisor) / bigIntToNumber(divisor);
}

//# sourceMappingURL=bigint.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/bn.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
const isArrowBigNumSymbol = Symbol.for('isArrowBigNum');
/** @ignore */
function BigNum(x, ...xs) {
    if (xs.length === 0) {
        return Object.setPrototypeOf(toArrayBufferView(this['TypedArray'], x), this.constructor.prototype);
    }
    return Object.setPrototypeOf(new this['TypedArray'](x, ...xs), this.constructor.prototype);
}
BigNum.prototype[isArrowBigNumSymbol] = true;
BigNum.prototype.toJSON = function () { return `"${bigNumToString(this)}"`; };
BigNum.prototype.valueOf = function (scale) { return bigNumToNumber(this, scale); };
BigNum.prototype.toString = function () { return bigNumToString(this); };
BigNum.prototype[Symbol.toPrimitive] = function (hint = 'default') {
    switch (hint) {
        case 'number': return bigNumToNumber(this);
        case 'string': return bigNumToString(this);
        case 'default': return bigNumToBigInt(this);
    }
    // @ts-ignore
    return bigNumToString(this);
};
/** @ignore */
function SignedBigNum(...args) { return BigNum.apply(this, args); }
/** @ignore */
function UnsignedBigNum(...args) { return BigNum.apply(this, args); }
/** @ignore */
function DecimalBigNum(...args) { return BigNum.apply(this, args); }
Object.setPrototypeOf(SignedBigNum.prototype, Object.create(Int32Array.prototype));
Object.setPrototypeOf(UnsignedBigNum.prototype, Object.create(Uint32Array.prototype));
Object.setPrototypeOf(DecimalBigNum.prototype, Object.create(Uint32Array.prototype));
Object.assign(SignedBigNum.prototype, BigNum.prototype, { 'constructor': SignedBigNum, 'signed': true, 'TypedArray': Int32Array, 'BigIntArray': BigInt64Array });
Object.assign(UnsignedBigNum.prototype, BigNum.prototype, { 'constructor': UnsignedBigNum, 'signed': false, 'TypedArray': Uint32Array, 'BigIntArray': BigUint64Array });
Object.assign(DecimalBigNum.prototype, BigNum.prototype, { 'constructor': DecimalBigNum, 'signed': true, 'TypedArray': Uint32Array, 'BigIntArray': BigUint64Array });
//FOR ES2020 COMPATIBILITY
const TWO_TO_THE_64 = BigInt(4294967296) * BigInt(4294967296); // 2^64 = 0x10000000000000000n
const TWO_TO_THE_64_MINUS_1 = TWO_TO_THE_64 - BigInt(1); // (2^32 * 2^32) - 1 = 0xFFFFFFFFFFFFFFFFn
/** @ignore */
function bigNumToNumber(bn, scale) {
    const { buffer, byteOffset, byteLength, 'signed': signed } = bn;
    const words = new BigUint64Array(buffer, byteOffset, byteLength / 8);
    const negative = signed && words.at(-1) & (BigInt(1) << BigInt(63));
    let number = BigInt(0);
    let i = 0;
    if (negative) {
        for (const word of words) {
            number |= (word ^ TWO_TO_THE_64_MINUS_1) * (BigInt(1) << BigInt(64 * i++));
        }
        number *= BigInt(-1);
        number -= BigInt(1);
    }
    else {
        for (const word of words) {
            number |= word * (BigInt(1) << BigInt(64 * i++));
        }
    }
    if (typeof scale === 'number' && scale > 0) {
        const denominator = BigInt('1'.padEnd(scale + 1, '0'));
        const quotient = number / denominator;
        const remainder = negative ? -(number % denominator) : number % denominator;
        const integerPart = bigIntToNumber(quotient);
        const fractionPart = `${remainder}`.padStart(scale, '0');
        const sign = negative && integerPart === 0 ? '-' : '';
        return +`${sign}${integerPart}.${fractionPart}`;
    }
    return bigIntToNumber(number);
}
/** @ignore */
function bigNumToString(a) {
    // use BigInt native implementation
    if (a.byteLength === 8) {
        const bigIntArray = new a['BigIntArray'](a.buffer, a.byteOffset, 1);
        return `${bigIntArray[0]}`;
    }
    // unsigned numbers
    if (!a['signed']) {
        return unsignedBigNumToString(a);
    }
    let array = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
    // detect positive numbers
    const highOrderWord = new Int16Array([array.at(-1)])[0];
    if (highOrderWord >= 0) {
        return unsignedBigNumToString(a);
    }
    // flip the negative value
    array = array.slice();
    let carry = 1;
    for (let i = 0; i < array.length; i++) {
        const elem = array[i];
        const updated = ~elem + carry;
        array[i] = updated;
        carry &= elem === 0 ? 1 : 0;
    }
    const negated = unsignedBigNumToString(array);
    return `-${negated}`;
}
/** @ignore */
function bigNumToBigInt(a) {
    if (a.byteLength === 8) {
        const bigIntArray = new a['BigIntArray'](a.buffer, a.byteOffset, 1);
        return bigIntArray[0];
    }
    else {
        return bigNumToString(a);
    }
}
/** @ignore */
function unsignedBigNumToString(a) {
    let digits = '';
    const base64 = new Uint32Array(2);
    let base32 = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
    const checks = new Uint32Array((base32 = new Uint16Array(base32).reverse()).buffer);
    let i = -1;
    const n = base32.length - 1;
    do {
        for (base64[0] = base32[i = 0]; i < n;) {
            base32[i++] = base64[1] = base64[0] / 10;
            base64[0] = ((base64[0] - base64[1] * 10) << 16) + base32[i];
        }
        base32[i] = base64[1] = base64[0] / 10;
        base64[0] = base64[0] - base64[1] * 10;
        digits = `${base64[0]}${digits}`;
    } while (checks[0] || checks[1] || checks[2] || checks[3]);
    return digits !== null && digits !== void 0 ? digits : `0`;
}
/** @ignore */
class BN {
    /** @nocollapse */
    static new(num, isSigned) {
        switch (isSigned) {
            case true: return new SignedBigNum(num);
            case false: return new UnsignedBigNum(num);
        }
        switch (num.constructor) {
            case Int8Array:
            case Int16Array:
            case Int32Array:
            case BigInt64Array:
                return new SignedBigNum(num);
        }
        if (num.byteLength === 16) {
            return new DecimalBigNum(num);
        }
        return new UnsignedBigNum(num);
    }
    /** @nocollapse */
    static signed(num) {
        return new SignedBigNum(num);
    }
    /** @nocollapse */
    static unsigned(num) {
        return new UnsignedBigNum(num);
    }
    /** @nocollapse */
    static decimal(num) {
        return new DecimalBigNum(num);
    }
    constructor(num, isSigned) {
        return BN.new(num, isSigned);
    }
}

//# sourceMappingURL=bn.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/precision.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var Precision;
(function (Precision) {
    Precision[Precision["HALF"] = 0] = "HALF";
    Precision[Precision["SINGLE"] = 1] = "SINGLE";
    Precision[Precision["DOUBLE"] = 2] = "DOUBLE";
})(Precision || (Precision = {}));

//# sourceMappingURL=precision.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/time-unit.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["SECOND"] = 0] = "SECOND";
    TimeUnit[TimeUnit["MILLISECOND"] = 1] = "MILLISECOND";
    TimeUnit[TimeUnit["MICROSECOND"] = 2] = "MICROSECOND";
    TimeUnit[TimeUnit["NANOSECOND"] = 3] = "NANOSECOND";
})(TimeUnit || (TimeUnit = {}));

//# sourceMappingURL=time-unit.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/date-unit.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var DateUnit;
(function (DateUnit) {
    DateUnit[DateUnit["DAY"] = 0] = "DAY";
    DateUnit[DateUnit["MILLISECOND"] = 1] = "MILLISECOND";
})(DateUnit || (DateUnit = {}));

//# sourceMappingURL=date-unit.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/interval-unit.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var IntervalUnit;
(function (IntervalUnit) {
    IntervalUnit[IntervalUnit["YEAR_MONTH"] = 0] = "YEAR_MONTH";
    IntervalUnit[IntervalUnit["DAY_TIME"] = 1] = "DAY_TIME";
    IntervalUnit[IntervalUnit["MONTH_DAY_NANO"] = 2] = "MONTH_DAY_NANO";
})(IntervalUnit || (IntervalUnit = {}));

//# sourceMappingURL=interval-unit.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/union-mode.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var UnionMode;
(function (UnionMode) {
    UnionMode[UnionMode["Sparse"] = 0] = "Sparse";
    UnionMode[UnionMode["Dense"] = 1] = "Dense";
})(UnionMode || (UnionMode = {}));

//# sourceMappingURL=union-mode.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/type.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;


/** @ignore */
const kDataTypeSymbol = Symbol.for('apache-arrow/DataType');
/**
 * An abstract base class for classes that encapsulate metadata about each of
 * the logical types that Arrow can represent.
 */
class type_DataType {
    /**
     * Check if an object is an instance of DataType.
     * This works across different instances of the Arrow library.
     *
     * Note: We intentionally do NOT implement Symbol.hasInstance here because
     * it would break instanceof checks for subclasses like Struct, Dictionary, etc.
     * Use DataType.isDataType() for cross-library type checking instead.
     * @nocollapse
     */
    static isDataType(x) {
        return (x === null || x === void 0 ? void 0 : x[kDataTypeSymbol]) === true;
    }
    /** @nocollapse */ static isNull(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Null; }
    /** @nocollapse */ static isInt(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Int; }
    /** @nocollapse */ static isFloat(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Float; }
    /** @nocollapse */ static isBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Binary; }
    /** @nocollapse */ static isBinaryView(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.BinaryView; }
    /** @nocollapse */ static isLargeBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.LargeBinary; }
    /** @nocollapse */ static isUtf8(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Utf8; }
    /** @nocollapse */ static isUtf8View(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Utf8View; }
    /** @nocollapse */ static isLargeUtf8(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.LargeUtf8; }
    /** @nocollapse */ static isBool(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Bool; }
    /** @nocollapse */ static isDecimal(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Decimal; }
    /** @nocollapse */ static isDate(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Date; }
    /** @nocollapse */ static isTime(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Time; }
    /** @nocollapse */ static isTimestamp(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Timestamp; }
    /** @nocollapse */ static isInterval(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Interval; }
    /** @nocollapse */ static isDuration(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Duration; }
    /** @nocollapse */ static isList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.List; }
    /** @nocollapse */ static isLargeList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.LargeList; }
    // TODO: Implement ListView type
    //     /** @nocollapse */ static isListView(x: any): x is ListView { return x?.typeId === Type.ListView; }
    /** @nocollapse */ static isStruct(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Struct; }
    /** @nocollapse */ static isUnion(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Union; }
    /** @nocollapse */ static isFixedSizeBinary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.FixedSizeBinary; }
    /** @nocollapse */ static isFixedSizeList(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.FixedSizeList; }
    /** @nocollapse */ static isMap(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Map; }
    /** @nocollapse */ static isDictionary(x) { return (x === null || x === void 0 ? void 0 : x.typeId) === Type.Dictionary; }
    /** @nocollapse */ static isDenseUnion(x) { return type_DataType.isUnion(x) && x.mode === UnionMode.Dense; }
    /** @nocollapse */ static isSparseUnion(x) { return type_DataType.isUnion(x) && x.mode === UnionMode.Sparse; }
    constructor(typeId) {
        this.typeId = typeId;
    }
}
_a = Symbol.toStringTag;
type_DataType[_a] = ((proto) => {
    proto.children = null;
    proto.ArrayType = Array;
    proto.OffsetArrayType = Int32Array;
    proto[kDataTypeSymbol] = true;
    return proto[Symbol.toStringTag] = 'DataType';
})(type_DataType.prototype);
/** @ignore */
class type_Null extends type_DataType {
    constructor() {
        super(Type.Null);
    }
    toString() { return `Null`; }
}
_b = Symbol.toStringTag;
type_Null[_b] = ((proto) => proto[Symbol.toStringTag] = 'Null')(type_Null.prototype);
/** @ignore */
class Int_ extends type_DataType {
    constructor(isSigned, bitWidth) {
        super(Type.Int);
        this.isSigned = isSigned;
        this.bitWidth = bitWidth;
    }
    get ArrayType() {
        switch (this.bitWidth) {
            case 8: return this.isSigned ? Int8Array : Uint8Array;
            case 16: return this.isSigned ? Int16Array : Uint16Array;
            case 32: return this.isSigned ? Int32Array : Uint32Array;
            case 64: return this.isSigned ? BigInt64Array : BigUint64Array;
        }
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
    toString() { return `${this.isSigned ? `I` : `Ui`}nt${this.bitWidth}`; }
}
_c = Symbol.toStringTag;
Int_[_c] = ((proto) => {
    proto.isSigned = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = 'Int';
})(Int_.prototype);

/** @ignore */
class Int8 extends Int_ {
    constructor() { super(true, 8); }
    get ArrayType() { return Int8Array; }
}
/** @ignore */
class Int16 extends Int_ {
    constructor() { super(true, 16); }
    get ArrayType() { return Int16Array; }
}
/** @ignore */
class Int32 extends Int_ {
    constructor() { super(true, 32); }
    get ArrayType() { return Int32Array; }
}
/** @ignore */
class Int64 extends Int_ {
    constructor() { super(true, 64); }
    get ArrayType() { return BigInt64Array; }
}
/** @ignore */
class Uint8 extends Int_ {
    constructor() { super(false, 8); }
    get ArrayType() { return Uint8Array; }
}
/** @ignore */
class Uint16 extends Int_ {
    constructor() { super(false, 16); }
    get ArrayType() { return Uint16Array; }
}
/** @ignore */
class Uint32 extends Int_ {
    constructor() { super(false, 32); }
    get ArrayType() { return Uint32Array; }
}
/** @ignore */
class Uint64 extends Int_ {
    constructor() { super(false, 64); }
    get ArrayType() { return BigUint64Array; }
}
Object.defineProperty(Int8.prototype, 'ArrayType', { value: Int8Array });
Object.defineProperty(Int16.prototype, 'ArrayType', { value: Int16Array });
Object.defineProperty(Int32.prototype, 'ArrayType', { value: Int32Array });
Object.defineProperty(Int64.prototype, 'ArrayType', { value: BigInt64Array });
Object.defineProperty(Uint8.prototype, 'ArrayType', { value: Uint8Array });
Object.defineProperty(Uint16.prototype, 'ArrayType', { value: Uint16Array });
Object.defineProperty(Uint32.prototype, 'ArrayType', { value: Uint32Array });
Object.defineProperty(Uint64.prototype, 'ArrayType', { value: BigUint64Array });
/** @ignore */
class Float extends type_DataType {
    constructor(precision) {
        super(Type.Float);
        this.precision = precision;
    }
    get ArrayType() {
        switch (this.precision) {
            case Precision.HALF: return Uint16Array;
            case Precision.SINGLE: return Float32Array;
            case Precision.DOUBLE: return Float64Array;
        }
        // @ts-ignore
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
    toString() { return `Float${(this.precision << 5) || 16}`; }
}
_d = Symbol.toStringTag;
Float[_d] = ((proto) => {
    proto.precision = null;
    return proto[Symbol.toStringTag] = 'Float';
})(Float.prototype);
/** @ignore */
class Float16 extends Float {
    constructor() { super(Precision.HALF); }
}
/** @ignore */
class Float32 extends Float {
    constructor() { super(Precision.SINGLE); }
}
/** @ignore */
class Float64 extends Float {
    constructor() { super(Precision.DOUBLE); }
}
Object.defineProperty(Float16.prototype, 'ArrayType', { value: Uint16Array });
Object.defineProperty(Float32.prototype, 'ArrayType', { value: Float32Array });
Object.defineProperty(Float64.prototype, 'ArrayType', { value: Float64Array });
/** @ignore */
class type_Binary extends type_DataType {
    constructor() {
        super(Type.Binary);
    }
    toString() { return `Binary`; }
}
_e = Symbol.toStringTag;
type_Binary[_e] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Binary';
})(type_Binary.prototype);
/** @ignore */
class type_BinaryView extends type_DataType {
    constructor() {
        super(Type.BinaryView);
    }
    toString() { return `BinaryView`; }
}
_f = Symbol.toStringTag;
type_BinaryView.ELEMENT_WIDTH = 16;
type_BinaryView.INLINE_CAPACITY = 12;
type_BinaryView.LENGTH_OFFSET = 0;
type_BinaryView.INLINE_OFFSET = 4;
type_BinaryView.BUFFER_INDEX_OFFSET = 8;
type_BinaryView.BUFFER_OFFSET_OFFSET = 12;
type_BinaryView[_f] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'BinaryView';
})(type_BinaryView.prototype);
/** @ignore */
class type_LargeBinary extends type_DataType {
    constructor() {
        super(Type.LargeBinary);
    }
    toString() { return `LargeBinary`; }
}
_g = Symbol.toStringTag;
type_LargeBinary[_g] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeBinary';
})(type_LargeBinary.prototype);
/** @ignore */
class type_Utf8 extends type_DataType {
    constructor() {
        super(Type.Utf8);
    }
    toString() { return `Utf8`; }
}
_h = Symbol.toStringTag;
type_Utf8[_h] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Utf8';
})(type_Utf8.prototype);
/** @ignore */
class type_Utf8View extends type_DataType {
    constructor() {
        super(Type.Utf8View);
    }
    toString() { return `Utf8View`; }
}
_j = Symbol.toStringTag;
type_Utf8View.ELEMENT_WIDTH = type_BinaryView.ELEMENT_WIDTH;
type_Utf8View.INLINE_CAPACITY = type_BinaryView.INLINE_CAPACITY;
type_Utf8View[_j] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Utf8View';
})(type_Utf8View.prototype);
/** @ignore */
class type_LargeUtf8 extends type_DataType {
    constructor() {
        super(Type.LargeUtf8);
    }
    toString() { return `LargeUtf8`; }
}
_k = Symbol.toStringTag;
type_LargeUtf8[_k] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeUtf8';
})(type_LargeUtf8.prototype);
/** @ignore */
class type_Bool extends type_DataType {
    constructor() {
        super(Type.Bool);
    }
    toString() { return `Bool`; }
}
_l = Symbol.toStringTag;
type_Bool[_l] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'Bool';
})(type_Bool.prototype);
/** @ignore */
class type_Decimal extends type_DataType {
    constructor(scale, precision, bitWidth = 128) {
        super(Type.Decimal);
        this.scale = scale;
        this.precision = precision;
        this.bitWidth = bitWidth;
    }
    toString() { return `Decimal[${this.precision}e${this.scale > 0 ? `+` : ``}${this.scale}]`; }
}
_m = Symbol.toStringTag;
type_Decimal[_m] = ((proto) => {
    proto.scale = null;
    proto.precision = null;
    proto.ArrayType = Uint32Array;
    return proto[Symbol.toStringTag] = 'Decimal';
})(type_Decimal.prototype);
/** @ignore */
class Date_ extends type_DataType {
    constructor(unit) {
        super(Type.Date);
        this.unit = unit;
    }
    toString() { return `Date${(this.unit + 1) * 32}<${DateUnit[this.unit]}>`; }
    get ArrayType() {
        return this.unit === DateUnit.DAY ? Int32Array : BigInt64Array;
    }
}
_o = Symbol.toStringTag;
Date_[_o] = ((proto) => {
    proto.unit = null;
    return proto[Symbol.toStringTag] = 'Date';
})(Date_.prototype);
/** @ignore */
class DateDay extends Date_ {
    constructor() { super(DateUnit.DAY); }
}
/**
 * A signed 64-bit date representing the elapsed time since UNIX epoch (1970-01-01) in milliseconds.
 * According to the specification, this should be treated as the number of days, in milliseconds,  since the UNIX epoch.
 * Therefore, values must be evenly divisible by `86_400_000` (the number of milliseconds in a standard day).
 *
 * Practically, validation that values of this type are evenly divisible by `86_400_000` is not enforced by this library
 * for performance and usability reasons.
 *
 * Users should prefer to use {@link DateDay} to cleanly represent the number of days. For JS dates,
 * {@link TimestampMillisecond} is the preferred type.
 *
 * @ignore
 */
class DateMillisecond extends Date_ {
    constructor() { super(DateUnit.MILLISECOND); }
}
/** @ignore */
class Time_ extends type_DataType {
    constructor(unit, bitWidth) {
        super(Type.Time);
        this.unit = unit;
        this.bitWidth = bitWidth;
    }
    toString() { return `Time${this.bitWidth}<${TimeUnit[this.unit]}>`; }
    get ArrayType() {
        switch (this.bitWidth) {
            case 32: return Int32Array;
            case 64: return BigInt64Array;
        }
        // @ts-ignore
        throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
    }
}
_p = Symbol.toStringTag;
Time_[_p] = ((proto) => {
    proto.unit = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = 'Time';
})(Time_.prototype);

/** @ignore */
class TimeSecond extends Time_ {
    constructor() { super(TimeUnit.SECOND, 32); }
}
/** @ignore */
class TimeMillisecond extends Time_ {
    constructor() { super(TimeUnit.MILLISECOND, 32); }
}
/** @ignore */
class TimeMicrosecond extends Time_ {
    constructor() { super(TimeUnit.MICROSECOND, 64); }
}
/** @ignore */
class TimeNanosecond extends Time_ {
    constructor() { super(TimeUnit.NANOSECOND, 64); }
}
/** @ignore */
class Timestamp_ extends type_DataType {
    constructor(unit, timezone) {
        super(Type.Timestamp);
        this.unit = unit;
        this.timezone = timezone;
    }
    toString() { return `Timestamp<${TimeUnit[this.unit]}${this.timezone ? `, ${this.timezone}` : ``}>`; }
}
_q = Symbol.toStringTag;
Timestamp_[_q] = ((proto) => {
    proto.unit = null;
    proto.timezone = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'Timestamp';
})(Timestamp_.prototype);

/** @ignore */
class TimestampSecond extends Timestamp_ {
    constructor(timezone) { super(TimeUnit.SECOND, timezone); }
}
/** @ignore */
class TimestampMillisecond extends Timestamp_ {
    constructor(timezone) { super(TimeUnit.MILLISECOND, timezone); }
}
/** @ignore */
class TimestampMicrosecond extends Timestamp_ {
    constructor(timezone) { super(TimeUnit.MICROSECOND, timezone); }
}
/** @ignore */
class TimestampNanosecond extends Timestamp_ {
    constructor(timezone) { super(TimeUnit.NANOSECOND, timezone); }
}
/** @ignore */
class Interval_ extends type_DataType {
    constructor(unit) {
        super(Type.Interval);
        this.unit = unit;
    }
    toString() { return `Interval<${IntervalUnit[this.unit]}>`; }
}
_r = Symbol.toStringTag;
Interval_[_r] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = Int32Array;
    return proto[Symbol.toStringTag] = 'Interval';
})(Interval_.prototype);

/** @ignore */
class IntervalDayTime extends Interval_ {
    constructor() { super(IntervalUnit.DAY_TIME); }
}
/** @ignore */
class IntervalYearMonth extends Interval_ {
    constructor() { super(IntervalUnit.YEAR_MONTH); }
}
/** @ignore */
class IntervalMonthDayNano extends Interval_ {
    constructor() { super(IntervalUnit.MONTH_DAY_NANO); }
}
/** @ignore */
class type_Duration extends type_DataType {
    constructor(unit) {
        super(Type.Duration);
        this.unit = unit;
    }
    toString() { return `Duration<${TimeUnit[this.unit]}>`; }
}
_s = Symbol.toStringTag;
type_Duration[_s] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'Duration';
})(type_Duration.prototype);
/** @ignore */
class DurationSecond extends type_Duration {
    constructor() { super(TimeUnit.SECOND); }
}
/** @ignore */
class DurationMillisecond extends type_Duration {
    constructor() { super(TimeUnit.MILLISECOND); }
}
/** @ignore */
class DurationMicrosecond extends type_Duration {
    constructor() { super(TimeUnit.MICROSECOND); }
}
/** @ignore */
class DurationNanosecond extends type_Duration {
    constructor() { super(TimeUnit.NANOSECOND); }
}
/** @ignore */
class type_List extends type_DataType {
    constructor(child) {
        super(Type.List);
        this.children = [child];
    }
    toString() { return `List<${this.valueType}>`; }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
}
_t = Symbol.toStringTag;
type_List[_t] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = 'List';
})(type_List.prototype);
/**
 * Like `List`, but with 64-bit value offsets — use this when a list column's
 * cumulative child-element count would exceed `List`'s 32-bit offset ceiling
 * of `2^31 - 1`. Otherwise prefer `List`.
 *
 * Values round-trip losslessly through Arrow IPC at any 64-bit offset magnitude.
 * In-process JavaScript APIs (`.get(i)`, slicing, builders) narrow offsets to a
 * JS `number` and are therefore bounded by `Number.MAX_SAFE_INTEGER`
 * (`2^53 - 1`, about 9×10^15) cumulative child elements per column. If an
 * operation would cross that ceiling, it throws a `TypeError` rather than
 * silently returning data at a truncated index. This matches the behavior of
 * `LargeUtf8` and `LargeBinary`.
 *
 * @ignore
 */
class type_LargeList extends type_DataType {
    constructor(child) {
        super(Type.LargeList);
        this.children = [child];
    }
    toString() { return `LargeList<${this.valueType}>`; }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
}
_u = Symbol.toStringTag;
type_LargeList[_u] = ((proto) => {
    proto.children = null;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = 'LargeList';
})(type_LargeList.prototype);
/** @ignore */
class Struct extends type_DataType {
    constructor(children) {
        super(Type.Struct);
        this.children = children;
    }
    toString() { return `Struct<{${this.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`; }
}
_v = Symbol.toStringTag;
Struct[_v] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = 'Struct';
})(Struct.prototype);
/** @ignore */
class Union_ extends type_DataType {
    constructor(mode, typeIds, children) {
        super(Type.Union);
        this.mode = mode;
        this.children = children;
        this.typeIds = typeIds = Int32Array.from(typeIds);
        this.typeIdToChildIndex = typeIds.reduce((typeIdToChildIndex, typeId, idx) => (typeIdToChildIndex[typeId] = idx) && typeIdToChildIndex || typeIdToChildIndex, Object.create(null));
    }
    toString() {
        return `${this[Symbol.toStringTag]}<${this.children.map((x) => `${x.type}`).join(` | `)}>`;
    }
}
_w = Symbol.toStringTag;
Union_[_w] = ((proto) => {
    proto.mode = null;
    proto.typeIds = null;
    proto.children = null;
    proto.typeIdToChildIndex = null;
    proto.ArrayType = Int8Array;
    return proto[Symbol.toStringTag] = 'Union';
})(Union_.prototype);

/** @ignore */
class DenseUnion extends Union_ {
    constructor(typeIds, children) {
        super(UnionMode.Dense, typeIds, children);
    }
}
/** @ignore */
class SparseUnion extends Union_ {
    constructor(typeIds, children) {
        super(UnionMode.Sparse, typeIds, children);
    }
}
/** @ignore */
class type_FixedSizeBinary extends type_DataType {
    constructor(byteWidth) {
        super(Type.FixedSizeBinary);
        this.byteWidth = byteWidth;
    }
    toString() { return `FixedSizeBinary[${this.byteWidth}]`; }
}
_x = Symbol.toStringTag;
type_FixedSizeBinary[_x] = ((proto) => {
    proto.byteWidth = null;
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = 'FixedSizeBinary';
})(type_FixedSizeBinary.prototype);
/** @ignore */
class type_FixedSizeList extends type_DataType {
    constructor(listSize, child) {
        super(Type.FixedSizeList);
        this.listSize = listSize;
        this.children = [child];
    }
    get valueType() { return this.children[0].type; }
    get valueField() { return this.children[0]; }
    get ArrayType() { return this.valueType.ArrayType; }
    toString() { return `FixedSizeList[${this.listSize}]<${this.valueType}>`; }
}
_y = Symbol.toStringTag;
type_FixedSizeList[_y] = ((proto) => {
    proto.children = null;
    proto.listSize = null;
    return proto[Symbol.toStringTag] = 'FixedSizeList';
})(type_FixedSizeList.prototype);
/** @ignore */
class Map_ extends type_DataType {
    constructor(entries, keysSorted = false) {
        var _1, _2, _3;
        super(Type.Map);
        this.children = [entries];
        this.keysSorted = keysSorted;
        // ARROW-8716
        // https://github.com/apache/arrow/issues/17168
        if (entries) {
            entries['name'] = 'entries';
            if ((_1 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _1 === void 0 ? void 0 : _1.children) {
                const key = (_2 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _2 === void 0 ? void 0 : _2.children[0];
                if (key) {
                    key['name'] = 'key';
                }
                const val = (_3 = entries === null || entries === void 0 ? void 0 : entries.type) === null || _3 === void 0 ? void 0 : _3.children[1];
                if (val) {
                    val['name'] = 'value';
                }
            }
        }
    }
    get keyType() { return this.children[0].type.children[0].type; }
    get valueType() { return this.children[0].type.children[1].type; }
    get childType() { return this.children[0].type; }
    toString() { return `Map<{${this.children[0].type.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`; }
}
_z = Symbol.toStringTag;
Map_[_z] = ((proto) => {
    proto.children = null;
    proto.keysSorted = null;
    return proto[Symbol.toStringTag] = 'Map_';
})(Map_.prototype);
/** @ignore */
const getId = ((atomicDictionaryId) => () => ++atomicDictionaryId)(-1);
/** @ignore */
class Dictionary extends type_DataType {
    constructor(dictionary, indices, id, isOrdered) {
        super(Type.Dictionary);
        this.indices = indices;
        this.dictionary = dictionary;
        this.isOrdered = isOrdered || false;
        this.id = id == null ? getId() : bigIntToNumber(id);
    }
    get children() { return this.dictionary.children; }
    get valueType() { return this.dictionary; }
    get ArrayType() { return this.dictionary.ArrayType; }
    toString() { return `Dictionary<${this.indices}, ${this.dictionary}>`; }
}
_0 = Symbol.toStringTag;
Dictionary[_0] = ((proto) => {
    proto.id = null;
    proto.indices = null;
    proto.isOrdered = null;
    proto.dictionary = null;
    return proto[Symbol.toStringTag] = 'Dictionary';
})(Dictionary.prototype);
/** @ignore */
function strideForType(type) {
    const t = type;
    switch (type.typeId) {
        case Type.Decimal: return type.bitWidth / 32;
        case Type.Interval: {
            if (t.unit === IntervalUnit.MONTH_DAY_NANO) {
                return 4;
            }
            return 1 + t.unit;
        }
        // case Type.Int: return 1 + +((t as Int_).bitWidth > 32);
        // case Type.Time: return 1 + +((t as Time_).bitWidth > 32);
        case Type.BinaryView:
        case Type.Utf8View: return 16;
        case Type.FixedSizeList: return t.listSize;
        case Type.FixedSizeBinary: return t.byteWidth;
        default: return 1;
    }
}

//# sourceMappingURL=type.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


class Visitor {
    visitMany(nodes, ...args) {
        return nodes.map((node, i) => this.visit(node, ...args.map((x) => x[i])));
    }
    visit(...args) {
        return this.getVisitFn(args[0], false).apply(this, args);
    }
    getVisitFn(node, throwIfNotFound = true) {
        return getVisitFn(this, node, throwIfNotFound);
    }
    getVisitFnByTypeId(typeId, throwIfNotFound = true) {
        return getVisitFnByTypeId(this, typeId, throwIfNotFound);
    }
    visitNull(_node, ..._args) { return null; }
    visitBool(_node, ..._args) { return null; }
    visitInt(_node, ..._args) { return null; }
    visitFloat(_node, ..._args) { return null; }
    visitUtf8(_node, ..._args) { return null; }
    visitLargeUtf8(_node, ..._args) { return null; }
    visitUtf8View(_node, ..._args) { return null; }
    visitBinary(_node, ..._args) { return null; }
    visitLargeBinary(_node, ..._args) { return null; }
    visitBinaryView(_node, ..._args) { return null; }
    visitFixedSizeBinary(_node, ..._args) { return null; }
    visitDate(_node, ..._args) { return null; }
    visitTimestamp(_node, ..._args) { return null; }
    visitTime(_node, ..._args) { return null; }
    visitDecimal(_node, ..._args) { return null; }
    visitList(_node, ..._args) { return null; }
    visitLargeList(_node, ..._args) { return null; }
    visitStruct(_node, ..._args) { return null; }
    visitUnion(_node, ..._args) { return null; }
    visitDictionary(_node, ..._args) { return null; }
    visitInterval(_node, ..._args) { return null; }
    visitDuration(_node, ..._args) { return null; }
    visitFixedSizeList(_node, ..._args) { return null; }
    visitMap(_node, ..._args) { return null; }
}
/** @ignore */
function getVisitFn(visitor, node, throwIfNotFound = true) {
    if (typeof node === 'number') {
        return getVisitFnByTypeId(visitor, node, throwIfNotFound);
    }
    if (typeof node === 'string' && (node in Type)) {
        return getVisitFnByTypeId(visitor, Type[node], throwIfNotFound);
    }
    if (node && (node instanceof type_DataType)) {
        return getVisitFnByTypeId(visitor, inferDType(node), throwIfNotFound);
    }
    if ((node === null || node === void 0 ? void 0 : node.type) && (node.type instanceof type_DataType)) {
        return getVisitFnByTypeId(visitor, inferDType(node.type), throwIfNotFound);
    }
    return getVisitFnByTypeId(visitor, Type.NONE, throwIfNotFound);
}
/** @ignore */
function getVisitFnByTypeId(visitor, dtype, throwIfNotFound = true) {
    let fn = null;
    switch (dtype) {
        case Type.Null:
            fn = visitor.visitNull;
            break;
        case Type.Bool:
            fn = visitor.visitBool;
            break;
        case Type.Int:
            fn = visitor.visitInt;
            break;
        case Type.Int8:
            fn = visitor.visitInt8 || visitor.visitInt;
            break;
        case Type.Int16:
            fn = visitor.visitInt16 || visitor.visitInt;
            break;
        case Type.Int32:
            fn = visitor.visitInt32 || visitor.visitInt;
            break;
        case Type.Int64:
            fn = visitor.visitInt64 || visitor.visitInt;
            break;
        case Type.Uint8:
            fn = visitor.visitUint8 || visitor.visitInt;
            break;
        case Type.Uint16:
            fn = visitor.visitUint16 || visitor.visitInt;
            break;
        case Type.Uint32:
            fn = visitor.visitUint32 || visitor.visitInt;
            break;
        case Type.Uint64:
            fn = visitor.visitUint64 || visitor.visitInt;
            break;
        case Type.Float:
            fn = visitor.visitFloat;
            break;
        case Type.Float16:
            fn = visitor.visitFloat16 || visitor.visitFloat;
            break;
        case Type.Float32:
            fn = visitor.visitFloat32 || visitor.visitFloat;
            break;
        case Type.Float64:
            fn = visitor.visitFloat64 || visitor.visitFloat;
            break;
        case Type.Utf8:
            fn = visitor.visitUtf8;
            break;
        case Type.LargeUtf8:
            fn = visitor.visitLargeUtf8;
            break;
        case Type.Utf8View:
            fn = visitor.visitUtf8View || visitor.visitUtf8;
            break;
        case Type.Binary:
            fn = visitor.visitBinary;
            break;
        case Type.LargeBinary:
            fn = visitor.visitLargeBinary;
            break;
        case Type.BinaryView:
            fn = visitor.visitBinaryView || visitor.visitBinary;
            break;
        case Type.FixedSizeBinary:
            fn = visitor.visitFixedSizeBinary;
            break;
        case Type.Date:
            fn = visitor.visitDate;
            break;
        case Type.DateDay:
            fn = visitor.visitDateDay || visitor.visitDate;
            break;
        case Type.DateMillisecond:
            fn = visitor.visitDateMillisecond || visitor.visitDate;
            break;
        case Type.Timestamp:
            fn = visitor.visitTimestamp;
            break;
        case Type.TimestampSecond:
            fn = visitor.visitTimestampSecond || visitor.visitTimestamp;
            break;
        case Type.TimestampMillisecond:
            fn = visitor.visitTimestampMillisecond || visitor.visitTimestamp;
            break;
        case Type.TimestampMicrosecond:
            fn = visitor.visitTimestampMicrosecond || visitor.visitTimestamp;
            break;
        case Type.TimestampNanosecond:
            fn = visitor.visitTimestampNanosecond || visitor.visitTimestamp;
            break;
        case Type.Time:
            fn = visitor.visitTime;
            break;
        case Type.TimeSecond:
            fn = visitor.visitTimeSecond || visitor.visitTime;
            break;
        case Type.TimeMillisecond:
            fn = visitor.visitTimeMillisecond || visitor.visitTime;
            break;
        case Type.TimeMicrosecond:
            fn = visitor.visitTimeMicrosecond || visitor.visitTime;
            break;
        case Type.TimeNanosecond:
            fn = visitor.visitTimeNanosecond || visitor.visitTime;
            break;
        case Type.Decimal:
            fn = visitor.visitDecimal;
            break;
        case Type.List:
            fn = visitor.visitList;
            break;
        case Type.LargeList:
            fn = visitor.visitLargeList;
            break;
        case Type.Struct:
            fn = visitor.visitStruct;
            break;
        case Type.Union:
            fn = visitor.visitUnion;
            break;
        case Type.DenseUnion:
            fn = visitor.visitDenseUnion || visitor.visitUnion;
            break;
        case Type.SparseUnion:
            fn = visitor.visitSparseUnion || visitor.visitUnion;
            break;
        case Type.Dictionary:
            fn = visitor.visitDictionary;
            break;
        case Type.Interval:
            fn = visitor.visitInterval;
            break;
        case Type.IntervalDayTime:
            fn = visitor.visitIntervalDayTime || visitor.visitInterval;
            break;
        case Type.IntervalYearMonth:
            fn = visitor.visitIntervalYearMonth || visitor.visitInterval;
            break;
        case Type.IntervalMonthDayNano:
            fn = visitor.visitIntervalMonthDayNano || visitor.visitInterval;
            break;
        case Type.Duration:
            fn = visitor.visitDuration;
            break;
        case Type.DurationSecond:
            fn = visitor.visitDurationSecond || visitor.visitDuration;
            break;
        case Type.DurationMillisecond:
            fn = visitor.visitDurationMillisecond || visitor.visitDuration;
            break;
        case Type.DurationMicrosecond:
            fn = visitor.visitDurationMicrosecond || visitor.visitDuration;
            break;
        case Type.DurationNanosecond:
            fn = visitor.visitDurationNanosecond || visitor.visitDuration;
            break;
        case Type.FixedSizeList:
            fn = visitor.visitFixedSizeList;
            break;
        case Type.Map:
            fn = visitor.visitMap;
            break;
    }
    if (typeof fn === 'function')
        return fn;
    if (!throwIfNotFound)
        return () => null;
    throw new Error(`Unrecognized type '${Type[dtype]}'`);
}
/** @ignore */
function inferDType(type) {
    switch (type.typeId) {
        case Type.Null: return Type.Null;
        case Type.Int: {
            const { bitWidth, isSigned } = type;
            switch (bitWidth) {
                case 8: return isSigned ? Type.Int8 : Type.Uint8;
                case 16: return isSigned ? Type.Int16 : Type.Uint16;
                case 32: return isSigned ? Type.Int32 : Type.Uint32;
                case 64: return isSigned ? Type.Int64 : Type.Uint64;
            }
            // @ts-ignore
            return Type.Int;
        }
        case Type.Float:
            switch (type.precision) {
                case Precision.HALF: return Type.Float16;
                case Precision.SINGLE: return Type.Float32;
                case Precision.DOUBLE: return Type.Float64;
            }
            // @ts-ignore
            return Type.Float;
        case Type.Binary: return Type.Binary;
        case Type.LargeBinary: return Type.LargeBinary;
        case Type.BinaryView: return Type.BinaryView;
        case Type.Utf8: return Type.Utf8;
        case Type.LargeUtf8: return Type.LargeUtf8;
        case Type.Utf8View: return Type.Utf8View;
        case Type.Bool: return Type.Bool;
        case Type.Decimal: return Type.Decimal;
        case Type.Time:
            switch (type.unit) {
                case TimeUnit.SECOND: return Type.TimeSecond;
                case TimeUnit.MILLISECOND: return Type.TimeMillisecond;
                case TimeUnit.MICROSECOND: return Type.TimeMicrosecond;
                case TimeUnit.NANOSECOND: return Type.TimeNanosecond;
            }
            // @ts-ignore
            return Type.Time;
        case Type.Timestamp:
            switch (type.unit) {
                case TimeUnit.SECOND: return Type.TimestampSecond;
                case TimeUnit.MILLISECOND: return Type.TimestampMillisecond;
                case TimeUnit.MICROSECOND: return Type.TimestampMicrosecond;
                case TimeUnit.NANOSECOND: return Type.TimestampNanosecond;
            }
            // @ts-ignore
            return Type.Timestamp;
        case Type.Date:
            switch (type.unit) {
                case DateUnit.DAY: return Type.DateDay;
                case DateUnit.MILLISECOND: return Type.DateMillisecond;
            }
            // @ts-ignore
            return Type.Date;
        case Type.Interval:
            switch (type.unit) {
                case IntervalUnit.DAY_TIME: return Type.IntervalDayTime;
                case IntervalUnit.YEAR_MONTH: return Type.IntervalYearMonth;
                case IntervalUnit.MONTH_DAY_NANO: return Type.IntervalMonthDayNano;
            }
            // @ts-ignore
            return Type.Interval;
        case Type.Duration:
            switch (type.unit) {
                case TimeUnit.SECOND: return Type.DurationSecond;
                case TimeUnit.MILLISECOND: return Type.DurationMillisecond;
                case TimeUnit.MICROSECOND: return Type.DurationMicrosecond;
                case TimeUnit.NANOSECOND: return Type.DurationNanosecond;
            }
            // @ts-ignore
            return Type.Duration;
        case Type.Map: return Type.Map;
        case Type.List: return Type.List;
        case Type.LargeList: return Type.LargeList;
        case Type.Struct: return Type.Struct;
        case Type.Union:
            switch (type.mode) {
                case UnionMode.Dense: return Type.DenseUnion;
                case UnionMode.Sparse: return Type.SparseUnion;
            }
            // @ts-ignore
            return Type.Union;
        case Type.FixedSizeBinary: return Type.FixedSizeBinary;
        case Type.FixedSizeList: return Type.FixedSizeList;
        case Type.Dictionary: return Type.Dictionary;
    }
    throw new Error(`Unrecognized type '${Type[type.typeId]}'`);
}
// Add these here so they're picked up by the externs creator
// in the build, and closure-compiler doesn't minify them away
Visitor.prototype.visitInt8 = null;
Visitor.prototype.visitInt16 = null;
Visitor.prototype.visitInt32 = null;
Visitor.prototype.visitInt64 = null;
Visitor.prototype.visitUint8 = null;
Visitor.prototype.visitUint16 = null;
Visitor.prototype.visitUint32 = null;
Visitor.prototype.visitUint64 = null;
Visitor.prototype.visitFloat16 = null;
Visitor.prototype.visitFloat32 = null;
Visitor.prototype.visitFloat64 = null;
Visitor.prototype.visitDateDay = null;
Visitor.prototype.visitDateMillisecond = null;
Visitor.prototype.visitTimestampSecond = null;
Visitor.prototype.visitTimestampMillisecond = null;
Visitor.prototype.visitTimestampMicrosecond = null;
Visitor.prototype.visitTimestampNanosecond = null;
Visitor.prototype.visitTimeSecond = null;
Visitor.prototype.visitTimeMillisecond = null;
Visitor.prototype.visitTimeMicrosecond = null;
Visitor.prototype.visitTimeNanosecond = null;
Visitor.prototype.visitDenseUnion = null;
Visitor.prototype.visitSparseUnion = null;
Visitor.prototype.visitIntervalDayTime = null;
Visitor.prototype.visitIntervalYearMonth = null;
Visitor.prototype.visitIntervalMonthDayNano = null;
Visitor.prototype.visitDuration = null;
Visitor.prototype.visitDurationSecond = null;
Visitor.prototype.visitDurationMillisecond = null;
Visitor.prototype.visitDurationMicrosecond = null;
Visitor.prototype.visitDurationNanosecond = null;

//# sourceMappingURL=visitor.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/math.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const f64 = new Float64Array(1);
const u32 = new Uint32Array(f64.buffer);
/**
 * Convert uint16 (logically a float16) to a JS float64. Inspired by numpy's `npy_half_to_double`:
 * https://github.com/numpy/numpy/blob/5a5987291dc95376bb098be8d8e5391e89e77a2c/numpy/core/src/npymath/halffloat.c#L29
 * @param h {number} the uint16 to convert
 * @private
 * @ignore
 */
function uint16ToFloat64(h) {
    const expo = (h & 0x7C00) >> 10;
    const sigf = (h & 0x03FF) / 1024;
    const sign = Math.pow((-1), ((h & 0x8000) >> 15));
    switch (expo) {
        case 0x1F: return sign * (sigf ? Number.NaN : 1 / 0);
        case 0x00: return sign * (sigf ? 6.103515625e-5 * sigf : 0);
    }
    return sign * (Math.pow(2, (expo - 15))) * (1 + sigf);
}
/**
 * Convert a float64 to uint16 (assuming the float64 is logically a float16). Inspired by numpy's `npy_double_to_half`:
 * https://github.com/numpy/numpy/blob/5a5987291dc95376bb098be8d8e5391e89e77a2c/numpy/core/src/npymath/halffloat.c#L43
 * @param d {number} The float64 to convert
 * @private
 * @ignore
 */
function float64ToUint16(d) {
    if (d !== d) {
        return 0x7E00;
    } // NaN
    f64[0] = d;
    // Magic numbers:
    // 0x80000000 = 10000000 00000000 00000000 00000000 -- masks the 32nd bit
    // 0x7ff00000 = 01111111 11110000 00000000 00000000 -- masks the 21st-31st bits
    // 0x000fffff = 00000000 00001111 11111111 11111111 -- masks the 1st-20th bit
    const sign = (u32[1] & 0x80000000) >> 16 & 0xFFFF;
    let expo = (u32[1] & 0x7FF00000), sigf = 0x0000;
    if (expo >= 0x40F00000) {
        //
        // If exponent overflowed, the float16 is either NaN or Infinity.
        // Rules to propagate the sign bit: mantissa > 0 ? NaN : +/-Infinity
        //
        // Magic numbers:
        // 0x40F00000 = 01000000 11110000 00000000 00000000 -- 6-bit exponent overflow
        // 0x7C000000 = 01111100 00000000 00000000 00000000 -- masks the 27th-31st bits
        //
        // returns:
        // qNaN, aka 32256 decimal, 0x7E00 hex, or 01111110 00000000 binary
        // sNaN, aka 32000 decimal, 0x7D00 hex, or 01111101 00000000 binary
        // +inf, aka 31744 decimal, 0x7C00 hex, or 01111100 00000000 binary
        // -inf, aka 64512 decimal, 0xFC00 hex, or 11111100 00000000 binary
        //
        // If mantissa is greater than 23 bits, set to +Infinity like numpy
        if (u32[0] > 0) {
            expo = 0x7C00;
        }
        else {
            expo = (expo & 0x7C000000) >> 16;
            sigf = (u32[1] & 0x000FFFFF) >> 10;
        }
    }
    else if (expo <= 0x3F000000) {
        //
        // If exponent underflowed, the float is either signed zero or subnormal.
        //
        // Magic numbers:
        // 0x3F000000 = 00111111 00000000 00000000 00000000 -- 6-bit exponent underflow
        //
        sigf = 0x100000 + (u32[1] & 0x000FFFFF);
        sigf = 0x100000 + (sigf << ((expo >> 20) - 998)) >> 21;
        expo = 0;
    }
    else {
        //
        // No overflow or underflow, rebase the exponent and round the mantissa
        // Magic numbers:
        // 0x200 = 00000010 00000000 -- masks off the 10th bit
        //
        // Ensure the first mantissa bit (the 10th one) is 1 and round
        expo = (expo - 0x3F000000) >> 10;
        sigf = ((u32[1] & 0x000FFFFF) + 0x200) >> 10;
    }
    return sign | expo | sigf & 0xFFFF;
}

//# sourceMappingURL=math.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/set.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.







/** @ignore */
class SetVisitor extends Visitor {
}
/** @ignore */
function wrapSet(fn) {
    return (data, _1, _2) => {
        if (data.setValid(_1, _2 != null)) {
            return fn(data, _1, _2);
        }
    };
}
/** @ignore */
const setEpochMsToDays = (data, index, epochMs) => { data[index] = Math.floor(epochMs / 86400000); };
/** @ignore */
const setVariableWidthBytes = (values, valueOffsets, index, value) => {
    if (index + 1 < valueOffsets.length) {
        const x = bigIntToNumber(valueOffsets[index]);
        const y = bigIntToNumber(valueOffsets[index + 1]);
        values.set(value.subarray(0, y - x), x);
    }
};
/** @ignore */
const setBool = ({ offset, values }, index, val) => {
    const idx = offset + index;
    val ? (values[idx >> 3] |= (1 << (idx % 8))) // true
        : (values[idx >> 3] &= ~(1 << (idx % 8))); // false
};
/** @ignore */
const setInt = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setFloat = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setFloat16 = ({ values }, index, value) => { values[index] = float64ToUint16(value); };
/* istanbul ignore next */
/** @ignore */
const setAnyFloat = (data, index, value) => {
    switch (data.type.precision) {
        case Precision.HALF:
            return setFloat16(data, index, value);
        case Precision.SINGLE:
        case Precision.DOUBLE:
            return setFloat(data, index, value);
    }
};
/** @ignore */
const setDateDay = ({ values }, index, value) => { setEpochMsToDays(values, index, value.valueOf()); };
/** @ignore */
const setDateMillisecond = ({ values }, index, value) => { values[index] = BigInt(value); };
/** @ignore */
const setFixedSizeBinary = ({ stride, values }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
const setBinary = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, value);
/** @ignore */
const ensureWritableVariadicBuffers = (data) => {
    let buffers = data.variadicBuffers;
    if (!Array.isArray(buffers) || Object.isFrozen(buffers)) {
        buffers = Array.from(buffers);
        data.variadicBuffers = buffers;
    }
    return buffers;
};
/** @ignore */
const setBinaryViewBytes = (data, index, bytes) => {
    var _a, _b, _c, _d;
    const views = data.values;
    if (!views) {
        throw new Error('BinaryView data is missing view buffer');
    }
    const elementWidth = type_BinaryView.ELEMENT_WIDTH;
    const viewOffset = index * elementWidth;
    const end = viewOffset + elementWidth;
    if (viewOffset < 0 || end > views.length) {
        throw new RangeError(`BinaryView index ${index} out of bounds`);
    }
    views.fill(0, viewOffset, end);
    const view = new DataView(views.buffer, views.byteOffset + viewOffset, elementWidth);
    const length = bytes.length;
    view.setInt32(type_BinaryView.LENGTH_OFFSET, length, true);
    if (length <= type_BinaryView.INLINE_CAPACITY) {
        views.set(bytes, viewOffset + type_BinaryView.INLINE_OFFSET);
        return;
    }
    const prefix = ((_a = bytes[0]) !== null && _a !== void 0 ? _a : 0) |
        (((_b = bytes[1]) !== null && _b !== void 0 ? _b : 0) << 8) |
        (((_c = bytes[2]) !== null && _c !== void 0 ? _c : 0) << 16) |
        (((_d = bytes[3]) !== null && _d !== void 0 ? _d : 0) << 24);
    view.setUint32(type_BinaryView.INLINE_OFFSET, prefix >>> 0, true);
    const buffers = ensureWritableVariadicBuffers(data);
    const copy = bytes.slice();
    const bufferIndex = buffers.push(copy) - 1;
    view.setInt32(type_BinaryView.BUFFER_INDEX_OFFSET, bufferIndex, true);
    view.setInt32(type_BinaryView.BUFFER_OFFSET_OFFSET, 0, true);
};
/** @ignore */
const setBinaryView = (data, index, value) => {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    setBinaryViewBytes(data, index, bytes);
};
/** @ignore */
const setUtf8 = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, encodeUtf8(value));
/** @ignore */
const setUtf8View = (data, index, value) => {
    const bytes = encodeUtf8(value);
    setBinaryViewBytes(data, index, bytes);
};
/* istanbul ignore next */
const setDate = (data, index, value) => {
    data.type.unit === DateUnit.DAY
        ? setDateDay(data, index, value)
        : setDateMillisecond(data, index, value);
};
/** @ignore */
const setTimestampSecond = ({ values }, index, value) => { values[index] = BigInt(value / 1000); };
/** @ignore */
const setTimestampMillisecond = ({ values }, index, value) => { values[index] = BigInt(value); };
/** @ignore */
const setTimestampMicrosecond = ({ values }, index, value) => { values[index] = BigInt(value * 1000); };
/** @ignore */
const setTimestampNanosecond = ({ values }, index, value) => { values[index] = BigInt(value * 1000000); };
/* istanbul ignore next */
/** @ignore */
const setTimestamp = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setTimestampSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setTimestampMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setTimestampMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setTimestampNanosecond(data, index, value);
    }
};
/** @ignore */
const setTimeSecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setTimeMillisecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setTimeMicrosecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setTimeNanosecond = ({ values }, index, value) => { values[index] = value; };
/* istanbul ignore next */
/** @ignore */
const setTime = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setTimeSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setTimeMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setTimeMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setTimeNanosecond(data, index, value);
    }
};
/** @ignore */
const setDecimal = ({ values, stride }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
const setList = (data, index, value) => {
    const values = data.children[0];
    const valueOffsets = data.valueOffsets;
    const set = instance.getVisitFn(values);
    const begin = bigIntToNumber(valueOffsets[index]);
    const end = bigIntToNumber(valueOffsets[index + 1]);
    if (Array.isArray(value)) {
        for (let idx = -1, itr = begin; itr < end;) {
            set(values, itr++, value[++idx]);
        }
    }
    else {
        for (let idx = -1, itr = begin; itr < end;) {
            set(values, itr++, value.get(++idx));
        }
    }
};
/** @ignore */
const setMap = (data, index, value) => {
    const values = data.children[0];
    const { valueOffsets } = data;
    const set = instance.getVisitFn(values);
    let { [index]: idx, [index + 1]: end } = valueOffsets;
    const entries = value instanceof Map ? value.entries() : Object.entries(value);
    for (const val of entries) {
        set(values, idx, val);
        if (++idx >= end)
            break;
    }
};
/** @ignore */ const _setStructArrayValue = (o, v) => (set, c, _, i) => c && set(c, o, v[i]);
/** @ignore */ const _setStructVectorValue = (o, v) => (set, c, _, i) => c && set(c, o, v.get(i));
/** @ignore */ const _setStructMapValue = (o, v) => (set, c, f, _) => c && set(c, o, v.get(f.name));
/** @ignore */ const _setStructObjectValue = (o, v) => (set, c, f, _) => c && set(c, o, v[f.name]);
/** @ignore */
const setStruct = (data, index, value) => {
    const childSetters = data.type.children.map((f) => instance.getVisitFn(f.type));
    const set = value instanceof Map ? _setStructMapValue(index, value) :
        value instanceof vector_Vector ? _setStructVectorValue(index, value) :
            Array.isArray(value) ? _setStructArrayValue(index, value) :
                _setStructObjectValue(index, value);
    // eslint-disable-next-line unicorn/no-array-for-each
    data.type.children.forEach((f, i) => set(childSetters[i], data.children[i], f, i));
};
/* istanbul ignore next */
/** @ignore */
const setUnion = (data, index, value) => {
    data.type.mode === UnionMode.Dense ?
        setDenseUnion(data, index, value) :
        setSparseUnion(data, index, value);
};
/** @ignore */
const setDenseUnion = (data, index, value) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    instance.visit(child, data.valueOffsets[index], value);
};
/** @ignore */
const setSparseUnion = (data, index, value) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    instance.visit(child, index, value);
};
/** @ignore */
const setDictionary = (data, index, value) => {
    var _a;
    (_a = data.dictionary) === null || _a === void 0 ? void 0 : _a.set(data.values[index], value);
};
/* istanbul ignore next */
/** @ignore */
const setIntervalValue = (data, index, value) => {
    switch (data.type.unit) {
        case IntervalUnit.YEAR_MONTH: return setIntervalYearMonth(data, index, value);
        case IntervalUnit.DAY_TIME: return setIntervalDayTime(data, index, value);
        case IntervalUnit.MONTH_DAY_NANO: return setIntervalMonthDayNano(data, index, value);
    }
};
/** @ignore */
const setIntervalDayTime = ({ values }, index, value) => { values.set(value.subarray(0, 2), 2 * index); };
/** @ignore */
const setIntervalYearMonth = ({ values }, index, value) => { values[index] = (value[0] * 12) + (value[1] % 12); };
/** @ignore */
const setIntervalMonthDayNano = ({ values, stride }, index, value) => { values.set(value.subarray(0, stride), stride * index); };
/** @ignore */
const setDurationSecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setDurationMillisecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setDurationMicrosecond = ({ values }, index, value) => { values[index] = value; };
/** @ignore */
const setDurationNanosecond = ({ values }, index, value) => { values[index] = value; };
/* istanbul ignore next */
/** @ignore */
const setDuration = (data, index, value) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return setDurationSecond(data, index, value);
        case TimeUnit.MILLISECOND: return setDurationMillisecond(data, index, value);
        case TimeUnit.MICROSECOND: return setDurationMicrosecond(data, index, value);
        case TimeUnit.NANOSECOND: return setDurationNanosecond(data, index, value);
    }
};
/** @ignore */
const setFixedSizeList = (data, index, value) => {
    const { stride } = data;
    const child = data.children[0];
    const set = instance.getVisitFn(child);
    if (Array.isArray(value)) {
        for (let idx = -1, offset = index * stride; ++idx < stride;) {
            set(child, offset + idx, value[idx]);
        }
    }
    else {
        for (let idx = -1, offset = index * stride; ++idx < stride;) {
            set(child, offset + idx, value.get(idx));
        }
    }
};
SetVisitor.prototype.visitBool = wrapSet(setBool);
SetVisitor.prototype.visitInt = wrapSet(setInt);
SetVisitor.prototype.visitInt8 = wrapSet(setInt);
SetVisitor.prototype.visitInt16 = wrapSet(setInt);
SetVisitor.prototype.visitInt32 = wrapSet(setInt);
SetVisitor.prototype.visitInt64 = wrapSet(setInt);
SetVisitor.prototype.visitUint8 = wrapSet(setInt);
SetVisitor.prototype.visitUint16 = wrapSet(setInt);
SetVisitor.prototype.visitUint32 = wrapSet(setInt);
SetVisitor.prototype.visitUint64 = wrapSet(setInt);
SetVisitor.prototype.visitFloat = wrapSet(setAnyFloat);
SetVisitor.prototype.visitFloat16 = wrapSet(setFloat16);
SetVisitor.prototype.visitFloat32 = wrapSet(setFloat);
SetVisitor.prototype.visitFloat64 = wrapSet(setFloat);
SetVisitor.prototype.visitUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitLargeUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitUtf8View = wrapSet(setUtf8View);
SetVisitor.prototype.visitBinary = wrapSet(setBinary);
SetVisitor.prototype.visitLargeBinary = wrapSet(setBinary);
SetVisitor.prototype.visitBinaryView = wrapSet(setBinaryView);
SetVisitor.prototype.visitFixedSizeBinary = wrapSet(setFixedSizeBinary);
SetVisitor.prototype.visitDate = wrapSet(setDate);
SetVisitor.prototype.visitDateDay = wrapSet(setDateDay);
SetVisitor.prototype.visitDateMillisecond = wrapSet(setDateMillisecond);
SetVisitor.prototype.visitTimestamp = wrapSet(setTimestamp);
SetVisitor.prototype.visitTimestampSecond = wrapSet(setTimestampSecond);
SetVisitor.prototype.visitTimestampMillisecond = wrapSet(setTimestampMillisecond);
SetVisitor.prototype.visitTimestampMicrosecond = wrapSet(setTimestampMicrosecond);
SetVisitor.prototype.visitTimestampNanosecond = wrapSet(setTimestampNanosecond);
SetVisitor.prototype.visitTime = wrapSet(setTime);
SetVisitor.prototype.visitTimeSecond = wrapSet(setTimeSecond);
SetVisitor.prototype.visitTimeMillisecond = wrapSet(setTimeMillisecond);
SetVisitor.prototype.visitTimeMicrosecond = wrapSet(setTimeMicrosecond);
SetVisitor.prototype.visitTimeNanosecond = wrapSet(setTimeNanosecond);
SetVisitor.prototype.visitDecimal = wrapSet(setDecimal);
SetVisitor.prototype.visitList = wrapSet(setList);
SetVisitor.prototype.visitLargeList = wrapSet(setList);
SetVisitor.prototype.visitStruct = wrapSet(setStruct);
SetVisitor.prototype.visitUnion = wrapSet(setUnion);
SetVisitor.prototype.visitDenseUnion = wrapSet(setDenseUnion);
SetVisitor.prototype.visitSparseUnion = wrapSet(setSparseUnion);
SetVisitor.prototype.visitDictionary = wrapSet(setDictionary);
SetVisitor.prototype.visitInterval = wrapSet(setIntervalValue);
SetVisitor.prototype.visitIntervalDayTime = wrapSet(setIntervalDayTime);
SetVisitor.prototype.visitIntervalYearMonth = wrapSet(setIntervalYearMonth);
SetVisitor.prototype.visitIntervalMonthDayNano = wrapSet(setIntervalMonthDayNano);
SetVisitor.prototype.visitDuration = wrapSet(setDuration);
SetVisitor.prototype.visitDurationSecond = wrapSet(setDurationSecond);
SetVisitor.prototype.visitDurationMillisecond = wrapSet(setDurationMillisecond);
SetVisitor.prototype.visitDurationMicrosecond = wrapSet(setDurationMicrosecond);
SetVisitor.prototype.visitDurationNanosecond = wrapSet(setDurationNanosecond);
SetVisitor.prototype.visitFixedSizeList = wrapSet(setFixedSizeList);
SetVisitor.prototype.visitMap = wrapSet(setMap);
/** @ignore */
const instance = new SetVisitor();

//# sourceMappingURL=set.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/row/struct.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */ const kParent = Symbol.for('parent');
/** @ignore */ const kRowIndex = Symbol.for('rowIndex');
class StructRow {
    constructor(parent, rowIndex) {
        this[kParent] = parent;
        this[kRowIndex] = rowIndex;
        return new Proxy(this, structRowProxyHandler);
    }
    toArray() { return Object.values(this.toJSON()); }
    toJSON() {
        const i = this[kRowIndex];
        const parent = this[kParent];
        const keys = parent.type.children;
        const json = {};
        for (let j = -1, n = keys.length; ++j < n;) {
            json[keys[j].name] = get_instance.visit(parent.children[j], i);
        }
        return json;
    }
    toString() {
        return `{${[...this].map(([key, val]) => `${valueToString(key)}: ${valueToString(val)}`).join(', ')}}`;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
    [Symbol.iterator]() {
        return new StructRowIterator(this[kParent], this[kRowIndex]);
    }
}
class StructRowIterator {
    constructor(data, rowIndex) {
        this.childIndex = 0;
        this.children = data.children;
        this.rowIndex = rowIndex;
        this.childFields = data.type.children;
        this.numChildren = this.childFields.length;
    }
    [Symbol.iterator]() { return this; }
    next() {
        const i = this.childIndex;
        if (i < this.numChildren) {
            this.childIndex = i + 1;
            return {
                done: false,
                value: [
                    this.childFields[i].name,
                    get_instance.visit(this.children[i], this.rowIndex)
                ]
            };
        }
        return { done: true, value: null };
    }
}
Object.defineProperties(StructRow.prototype, {
    [Symbol.toStringTag]: { enumerable: false, configurable: false, value: 'Row' },
    [kParent]: { writable: true, enumerable: false, configurable: false, value: null },
    [kRowIndex]: { writable: true, enumerable: false, configurable: false, value: -1 },
});
class StructRowProxyHandler {
    isExtensible() { return false; }
    deleteProperty() { return false; }
    preventExtensions() { return true; }
    ownKeys(row) {
        return row[kParent].type.children.map((f) => f.name);
    }
    has(row, key) {
        return row[kParent].type.children.some((f) => f.name === key);
    }
    getOwnPropertyDescriptor(row, key) {
        if (row[kParent].type.children.some((f) => f.name === key)) {
            return { writable: true, enumerable: true, configurable: true };
        }
        return;
    }
    get(row, key) {
        // Look up key in row first
        if (Reflect.has(row, key)) {
            return row[key];
        }
        const idx = row[kParent].type.children.findIndex((f) => f.name === key);
        if (idx !== -1) {
            const val = get_instance.visit(row[kParent].children[idx], row[kRowIndex]);
            // Cache key/val lookups
            Reflect.set(row, key, val);
            return val;
        }
    }
    set(row, key, val) {
        const idx = row[kParent].type.children.findIndex((f) => f.name === key);
        if (idx !== -1) {
            instance.visit(row[kParent].children[idx], row[kRowIndex], val);
            // Cache key/val lookups
            return Reflect.set(row, key, val);
        }
        else if (Reflect.has(row, key) || typeof key === 'symbol') {
            return Reflect.set(row, key, val);
        }
        return false;
    }
}
const structRowProxyHandler = new StructRowProxyHandler();

//# sourceMappingURL=struct.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/get.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.









/** @ignore */
class GetVisitor extends Visitor {
}
/** @ignore */
function wrapGet(fn) {
    return (data, _1) => data.getValid(_1) ? fn(data, _1) : null;
}
/** @ignore */ const epochDaysToMs = (data, index) => 86400000 * data[index];
const BINARY_VIEW_SIZE = 16;
const BINARY_VIEW_INLINE_CAPACITY = 12;
/** @ignore */
const getNull = (_data, _index) => null;
/** @ignore */
const getVariableWidthBytes = (values, valueOffsets, index) => {
    if (index + 1 >= valueOffsets.length) {
        return null;
    }
    const x = bigIntToNumber(valueOffsets[index]);
    const y = bigIntToNumber(valueOffsets[index + 1]);
    return values.subarray(x, y);
};
/** @ignore */
const getBool = ({ offset, values }, index) => {
    const idx = offset + index;
    const byte = values[idx >> 3];
    return (byte & 1 << (idx % 8)) !== 0;
};
/** @ignore */
const getDateDay = ({ values }, index) => epochDaysToMs(values, index);
/** @ignore */
const getDateMillisecond = ({ values }, index) => bigIntToNumber(values[index]);
/** @ignore */
const getNumeric = ({ stride, values }, index) => values[stride * index];
/** @ignore */
const getFloat16 = ({ stride, values }, index) => uint16ToFloat64(values[stride * index]);
/** @ignore */
const getBigInts = ({ values }, index) => values[index];
/** @ignore */
const getFixedSizeBinary = ({ stride, values }, index) => values.subarray(stride * index, stride * (index + 1));
/** @ignore */
const getBinary = ({ values, valueOffsets }, index) => getVariableWidthBytes(values, valueOffsets, index);
/** @ignore */
const getBinaryViewBytes = (data, index) => {
    var _a;
    const values = data.values;
    if (!values) {
        throw new Error('BinaryView data is missing view buffer');
    }
    const viewOffset = index * BINARY_VIEW_SIZE;
    const end = viewOffset + BINARY_VIEW_SIZE;
    if (viewOffset < 0 || end > values.length) {
        throw new Error(`BinaryView data buffer is too short: expected ${BINARY_VIEW_SIZE} bytes, got ${Math.max(0, values.length - viewOffset)}`);
    }
    // Get the 16-byte view struct from the values array
    const viewStruct = values.subarray(viewOffset, end);
    if (viewStruct.length < BINARY_VIEW_SIZE) {
        throw new Error(`BinaryView data buffer is too short: expected ${BINARY_VIEW_SIZE} bytes, got ${viewStruct.length}`);
    }
    const view = new DataView(values.buffer, viewStruct.byteOffset, BINARY_VIEW_SIZE);
    const size = view.getInt32(0, true);
    if (size <= 0) {
        return new Uint8Array(0);
    }
    if (size <= BINARY_VIEW_INLINE_CAPACITY) {
        // Inline data is in bytes 4-15 of the view struct
        return viewStruct.subarray(4, 4 + size);
    }
    const bufferIndex = view.getInt32(8, true);
    const offset = view.getInt32(12, true);
    const variadicBuffer = (_a = data.variadicBuffers) === null || _a === void 0 ? void 0 : _a[bufferIndex];
    if (!variadicBuffer) {
        throw new Error(`BinaryView variadic buffer ${bufferIndex} is missing`);
    }
    return variadicBuffer.subarray(offset, offset + size);
};
/** @ignore */
const getBinaryViewValue = (data, index) => {
    return getBinaryViewBytes(data, index);
};
/** @ignore */
const getUtf8 = ({ values, valueOffsets }, index) => {
    const bytes = getVariableWidthBytes(values, valueOffsets, index);
    return bytes !== null ? decodeUtf8(bytes) : null;
};
/** @ignore */
const getUtf8ViewValue = (data, index) => {
    const bytes = getBinaryViewBytes(data, index);
    return decodeUtf8(bytes);
};
/* istanbul ignore next */
/** @ignore */
const getInt = ({ values }, index) => values[index];
/* istanbul ignore next */
/** @ignore */
const getFloat = ({ type, values }, index) => (type.precision !== Precision.HALF ? values[index] : uint16ToFloat64(values[index]));
/* istanbul ignore next */
/** @ignore */
const getDate = (data, index) => (data.type.unit === DateUnit.DAY
    ? getDateDay(data, index)
    : getDateMillisecond(data, index));
/** @ignore */
const getTimestampSecond = ({ values }, index) => 1000 * bigIntToNumber(values[index]);
/** @ignore */
const getTimestampMillisecond = ({ values }, index) => bigIntToNumber(values[index]);
/** @ignore */
const getTimestampMicrosecond = ({ values }, index) => divideBigInts(values[index], BigInt(1000));
/** @ignore */
const getTimestampNanosecond = ({ values }, index) => divideBigInts(values[index], BigInt(1000000));
/* istanbul ignore next */
/** @ignore */
const getTimestamp = (data, index) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return getTimestampSecond(data, index);
        case TimeUnit.MILLISECOND: return getTimestampMillisecond(data, index);
        case TimeUnit.MICROSECOND: return getTimestampMicrosecond(data, index);
        case TimeUnit.NANOSECOND: return getTimestampNanosecond(data, index);
    }
};
/** @ignore */
const getTimeSecond = ({ values }, index) => values[index];
/** @ignore */
const getTimeMillisecond = ({ values }, index) => values[index];
/** @ignore */
const getTimeMicrosecond = ({ values }, index) => values[index];
/** @ignore */
const getTimeNanosecond = ({ values }, index) => values[index];
/* istanbul ignore next */
/** @ignore */
const getTime = (data, index) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return getTimeSecond(data, index);
        case TimeUnit.MILLISECOND: return getTimeMillisecond(data, index);
        case TimeUnit.MICROSECOND: return getTimeMicrosecond(data, index);
        case TimeUnit.NANOSECOND: return getTimeNanosecond(data, index);
    }
};
/** @ignore */
const getDecimal = ({ values, stride }, index) => BN.decimal(values.subarray(stride * index, stride * (index + 1)));
/** @ignore */
const getList = (data, index) => {
    const { valueOffsets, stride, children } = data;
    const begin = bigIntToNumber(valueOffsets[index * stride]);
    const end = bigIntToNumber(valueOffsets[index * stride + 1]);
    const child = children[0];
    const slice = child.slice(begin, end - begin);
    return new vector_Vector([slice]);
};
/** @ignore */
const getMap = (data, index) => {
    const { valueOffsets, children } = data;
    const { [index]: begin, [index + 1]: end } = valueOffsets;
    const child = children[0];
    return new MapRow(child.slice(begin, end - begin));
};
/** @ignore */
const getStruct = (data, index) => {
    return new StructRow(data, index);
};
/* istanbul ignore next */
/** @ignore */
const getUnion = (data, index) => {
    return data.type.mode === UnionMode.Dense ?
        getDenseUnion(data, index) :
        getSparseUnion(data, index);
};
/** @ignore */
const getDenseUnion = (data, index) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    return get_instance.visit(child, data.valueOffsets[index]);
};
/** @ignore */
const getSparseUnion = (data, index) => {
    const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
    const child = data.children[childIndex];
    return get_instance.visit(child, index);
};
/** @ignore */
const getDictionary = (data, index) => {
    var _a;
    return (_a = data.dictionary) === null || _a === void 0 ? void 0 : _a.get(data.values[index]);
};
/* istanbul ignore next */
/** @ignore */
const getInterval = (data, index) => (data.type.unit === IntervalUnit.MONTH_DAY_NANO)
    ? getIntervalMonthDayNano(data, index)
    : (data.type.unit === IntervalUnit.DAY_TIME)
        ? getIntervalDayTime(data, index)
        : getIntervalYearMonth(data, index);
/** @ignore */
const getIntervalDayTime = ({ values }, index) => values.subarray(2 * index, 2 * (index + 1));
/** @ignore */
const getIntervalYearMonth = ({ values }, index) => {
    const interval = values[index];
    const int32s = new Int32Array(2);
    int32s[0] = Math.trunc(interval / 12); /* years */
    int32s[1] = Math.trunc(interval % 12); /* months */
    return int32s;
};
/** @ignore */
const getIntervalMonthDayNano = ({ values }, index) => values.subarray(4 * index, 4 * (index + 1));
/** @ignore */
const getDurationSecond = ({ values }, index) => values[index];
/** @ignore */
const getDurationMillisecond = ({ values }, index) => values[index];
/** @ignore */
const getDurationMicrosecond = ({ values }, index) => values[index];
/** @ignore */
const getDurationNanosecond = ({ values }, index) => values[index];
/* istanbul ignore next */
/** @ignore */
const getDuration = (data, index) => {
    switch (data.type.unit) {
        case TimeUnit.SECOND: return getDurationSecond(data, index);
        case TimeUnit.MILLISECOND: return getDurationMillisecond(data, index);
        case TimeUnit.MICROSECOND: return getDurationMicrosecond(data, index);
        case TimeUnit.NANOSECOND: return getDurationNanosecond(data, index);
    }
};
/** @ignore */
const getFixedSizeList = (data, index) => {
    const { stride, children } = data;
    const child = children[0];
    const slice = child.slice(index * stride, stride);
    return new vector_Vector([slice]);
};
GetVisitor.prototype.visitNull = wrapGet(getNull);
GetVisitor.prototype.visitBool = wrapGet(getBool);
GetVisitor.prototype.visitInt = wrapGet(getInt);
GetVisitor.prototype.visitInt8 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt16 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt32 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt64 = wrapGet(getBigInts);
GetVisitor.prototype.visitUint8 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint16 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint32 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint64 = wrapGet(getBigInts);
GetVisitor.prototype.visitFloat = wrapGet(getFloat);
GetVisitor.prototype.visitFloat16 = wrapGet(getFloat16);
GetVisitor.prototype.visitFloat32 = wrapGet(getNumeric);
GetVisitor.prototype.visitFloat64 = wrapGet(getNumeric);
GetVisitor.prototype.visitUtf8 = wrapGet(getUtf8);
GetVisitor.prototype.visitLargeUtf8 = wrapGet(getUtf8);
GetVisitor.prototype.visitUtf8View = wrapGet(getUtf8ViewValue);
GetVisitor.prototype.visitBinary = wrapGet(getBinary);
GetVisitor.prototype.visitLargeBinary = wrapGet(getBinary);
GetVisitor.prototype.visitBinaryView = wrapGet(getBinaryViewValue);
GetVisitor.prototype.visitFixedSizeBinary = wrapGet(getFixedSizeBinary);
GetVisitor.prototype.visitDate = wrapGet(getDate);
GetVisitor.prototype.visitDateDay = wrapGet(getDateDay);
GetVisitor.prototype.visitDateMillisecond = wrapGet(getDateMillisecond);
GetVisitor.prototype.visitTimestamp = wrapGet(getTimestamp);
GetVisitor.prototype.visitTimestampSecond = wrapGet(getTimestampSecond);
GetVisitor.prototype.visitTimestampMillisecond = wrapGet(getTimestampMillisecond);
GetVisitor.prototype.visitTimestampMicrosecond = wrapGet(getTimestampMicrosecond);
GetVisitor.prototype.visitTimestampNanosecond = wrapGet(getTimestampNanosecond);
GetVisitor.prototype.visitTime = wrapGet(getTime);
GetVisitor.prototype.visitTimeSecond = wrapGet(getTimeSecond);
GetVisitor.prototype.visitTimeMillisecond = wrapGet(getTimeMillisecond);
GetVisitor.prototype.visitTimeMicrosecond = wrapGet(getTimeMicrosecond);
GetVisitor.prototype.visitTimeNanosecond = wrapGet(getTimeNanosecond);
GetVisitor.prototype.visitDecimal = wrapGet(getDecimal);
GetVisitor.prototype.visitList = wrapGet(getList);
GetVisitor.prototype.visitLargeList = wrapGet(getList);
GetVisitor.prototype.visitStruct = wrapGet(getStruct);
GetVisitor.prototype.visitUnion = wrapGet(getUnion);
GetVisitor.prototype.visitDenseUnion = wrapGet(getDenseUnion);
GetVisitor.prototype.visitSparseUnion = wrapGet(getSparseUnion);
GetVisitor.prototype.visitDictionary = wrapGet(getDictionary);
GetVisitor.prototype.visitInterval = wrapGet(getInterval);
GetVisitor.prototype.visitIntervalDayTime = wrapGet(getIntervalDayTime);
GetVisitor.prototype.visitIntervalYearMonth = wrapGet(getIntervalYearMonth);
GetVisitor.prototype.visitIntervalMonthDayNano = wrapGet(getIntervalMonthDayNano);
GetVisitor.prototype.visitDuration = wrapGet(getDuration);
GetVisitor.prototype.visitDurationSecond = wrapGet(getDurationSecond);
GetVisitor.prototype.visitDurationMillisecond = wrapGet(getDurationMillisecond);
GetVisitor.prototype.visitDurationMicrosecond = wrapGet(getDurationMicrosecond);
GetVisitor.prototype.visitDurationNanosecond = wrapGet(getDurationNanosecond);
GetVisitor.prototype.visitFixedSizeList = wrapGet(getFixedSizeList);
GetVisitor.prototype.visitMap = wrapGet(getMap);
/** @ignore */
const get_instance = new GetVisitor();

//# sourceMappingURL=get.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/row/map.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */ const kKeys = Symbol.for('keys');
/** @ignore */ const kVals = Symbol.for('vals');
/** @ignore */ const kKeysAsStrings = Symbol.for('kKeysAsStrings');
/** @ignore */ const _kKeysAsStrings = Symbol.for('_kKeysAsStrings');
class MapRow {
    constructor(slice) {
        this[kKeys] = new vector_Vector([slice.children[0]]).memoize();
        this[kVals] = slice.children[1];
        return new Proxy(this, new MapRowProxyHandler());
    }
    /** @ignore */
    get [kKeysAsStrings]() {
        return this[_kKeysAsStrings] || (this[_kKeysAsStrings] = Array.from(this[kKeys].toArray(), String));
    }
    [Symbol.iterator]() {
        return new MapRowIterator(this[kKeys], this[kVals]);
    }
    get size() { return this[kKeys].length; }
    toArray() { return Object.values(this.toJSON()); }
    toJSON() {
        const keys = this[kKeys];
        const vals = this[kVals];
        const json = {};
        for (let i = -1, n = keys.length; ++i < n;) {
            json[keys.get(i)] = get_instance.visit(vals, i);
        }
        return json;
    }
    toString() {
        return `{${[...this].map(([key, val]) => `${valueToString(key)}: ${valueToString(val)}`).join(', ')}}`;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
}
class MapRowIterator {
    constructor(keys, vals) {
        this.keys = keys;
        this.vals = vals;
        this.keyIndex = 0;
        this.numKeys = keys.length;
    }
    [Symbol.iterator]() { return this; }
    next() {
        const i = this.keyIndex;
        if (i === this.numKeys) {
            return { done: true, value: null };
        }
        this.keyIndex++;
        return {
            done: false,
            value: [
                this.keys.get(i),
                get_instance.visit(this.vals, i),
            ]
        };
    }
}
/** @ignore */
class MapRowProxyHandler {
    isExtensible() { return false; }
    deleteProperty() { return false; }
    preventExtensions() { return true; }
    ownKeys(row) {
        return row[kKeysAsStrings];
    }
    has(row, key) {
        return row[kKeysAsStrings].includes(key);
    }
    getOwnPropertyDescriptor(row, key) {
        const idx = row[kKeysAsStrings].indexOf(key);
        if (idx !== -1) {
            return { writable: true, enumerable: true, configurable: true };
        }
        return;
    }
    get(row, key) {
        // Look up key in row first
        if (Reflect.has(row, key)) {
            return row[key];
        }
        const idx = row[kKeysAsStrings].indexOf(key);
        if (idx !== -1) {
            const val = get_instance.visit(Reflect.get(row, kVals), idx);
            // Cache key/val lookups
            Reflect.set(row, key, val);
            return val;
        }
    }
    set(row, key, val) {
        const idx = row[kKeysAsStrings].indexOf(key);
        if (idx !== -1) {
            instance.visit(Reflect.get(row, kVals), idx, val);
            // Cache key/val lookups
            return Reflect.set(row, key, val);
        }
        else if (Reflect.has(row, key)) {
            return Reflect.set(row, key, val);
        }
        return false;
    }
}
Object.defineProperties(MapRow.prototype, {
    [Symbol.toStringTag]: { enumerable: false, configurable: false, value: 'Row' },
    [kKeys]: { writable: true, enumerable: false, configurable: false, value: null },
    [kVals]: { writable: true, enumerable: false, configurable: false, value: null },
    [_kKeysAsStrings]: { writable: true, enumerable: false, configurable: false, value: null },
});

//# sourceMappingURL=map.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/vector.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
let tmp;
/** @ignore */
function clampRange(source, begin, end, then) {
    // Adjust args similar to Array.prototype.slice. Normalize begin/end to
    // clamp between 0 and length, and wrap around on negative indices, e.g.
    // slice(-1, 5) or slice(5, -1)
    const { length: len = 0 } = source;
    let lhs = typeof begin !== 'number' ? 0 : begin;
    let rhs = typeof end !== 'number' ? len : end;
    // wrap around on negative start/end positions
    (lhs < 0) && (lhs = ((lhs % len) + len) % len);
    (rhs < 0) && (rhs = ((rhs % len) + len) % len);
    // ensure lhs <= rhs
    (rhs < lhs) && (tmp = lhs, lhs = rhs, rhs = tmp);
    // ensure rhs <= length
    (rhs > len) && (rhs = len);
    return then ? then(source, lhs, rhs) : [lhs, rhs];
}
/** @ignore */
const wrapIndex = (index, len) => index < 0 ? (len + index) : index;
const isNaNFast = (value) => value !== value;
/** @ignore */
function createElementComparator(search) {
    const typeofSearch = typeof search;
    // Compare primitives
    if (typeofSearch !== 'object' || search === null) {
        // Compare NaN
        if (isNaNFast(search)) {
            return isNaNFast;
        }
        return (value) => value === search;
    }
    // Compare Dates
    if (search instanceof Date) {
        const valueOfSearch = search.valueOf();
        return (value) => value instanceof Date ? (value.valueOf() === valueOfSearch) : false;
    }
    // Compare TypedArrays
    if (ArrayBuffer.isView(search)) {
        return (value) => value ? compareArrayLike(search, value) : false;
    }
    // Compare Maps and Rows
    if (search instanceof Map) {
        return createMapComparator(search);
    }
    // Compare Array-likes
    if (Array.isArray(search)) {
        return createArrayLikeComparator(search);
    }
    // Compare Vectors
    if (search instanceof vector_Vector) {
        return createVectorComparator(search);
    }
    return createObjectComparator(search, true);
    // Compare non-empty Objects
    // return createObjectComparator(search, search instanceof Proxy);
}
/** @ignore */
function createArrayLikeComparator(lhs) {
    const comparators = [];
    for (let i = -1, n = lhs.length; ++i < n;) {
        comparators[i] = createElementComparator(lhs[i]);
    }
    return createSubElementsComparator(comparators);
}
/** @ignore */
function createMapComparator(lhs) {
    let i = -1;
    const comparators = [];
    for (const v of lhs.values())
        comparators[++i] = createElementComparator(v);
    return createSubElementsComparator(comparators);
}
/** @ignore */
function createVectorComparator(lhs) {
    const comparators = [];
    for (let i = -1, n = lhs.length; ++i < n;) {
        comparators[i] = createElementComparator(lhs.get(i));
    }
    return createSubElementsComparator(comparators);
}
/** @ignore */
function createObjectComparator(lhs, allowEmpty = false) {
    const keys = Object.keys(lhs);
    // Only compare non-empty Objects
    if (!allowEmpty && keys.length === 0) {
        return () => false;
    }
    const comparators = [];
    for (let i = -1, n = keys.length; ++i < n;) {
        comparators[i] = createElementComparator(lhs[keys[i]]);
    }
    return createSubElementsComparator(comparators, keys);
}
function createSubElementsComparator(comparators, keys) {
    return (rhs) => {
        if (!rhs || typeof rhs !== 'object') {
            return false;
        }
        switch (rhs.constructor) {
            case Array: return compareArray(comparators, rhs);
            case Map:
                return compareObject(comparators, rhs, rhs.keys());
            case MapRow:
            case StructRow:
            case Object:
            case undefined: // support `Object.create(null)` objects
                return compareObject(comparators, rhs, keys || Object.keys(rhs));
        }
        return rhs instanceof vector_Vector ? compareVector(comparators, rhs) : false;
    };
}
function compareArray(comparators, arr) {
    const n = comparators.length;
    if (arr.length !== n) {
        return false;
    }
    for (let i = -1; ++i < n;) {
        if (!(comparators[i](arr[i]))) {
            return false;
        }
    }
    return true;
}
function compareVector(comparators, vec) {
    const n = comparators.length;
    if (vec.length !== n) {
        return false;
    }
    for (let i = -1; ++i < n;) {
        if (!(comparators[i](vec.get(i)))) {
            return false;
        }
    }
    return true;
}
function compareObject(comparators, obj, keys) {
    const lKeyItr = keys[Symbol.iterator]();
    const rKeyItr = obj instanceof Map ? obj.keys() : Object.keys(obj)[Symbol.iterator]();
    const rValItr = obj instanceof Map ? obj.values() : Object.values(obj)[Symbol.iterator]();
    let i = 0;
    const n = comparators.length;
    let rVal = rValItr.next();
    let lKey = lKeyItr.next();
    let rKey = rKeyItr.next();
    for (; i < n && !lKey.done && !rKey.done && !rVal.done; ++i, lKey = lKeyItr.next(), rKey = rKeyItr.next(), rVal = rValItr.next()) {
        if (lKey.value !== rKey.value || !comparators[i](rVal.value)) {
            break;
        }
    }
    if (i === n && lKey.done && rKey.done && rVal.done) {
        return true;
    }
    lKeyItr.return && lKeyItr.return();
    rKeyItr.return && rKeyItr.return();
    rValItr.return && rValItr.return();
    return false;
}

//# sourceMappingURL=vector.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/bit.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/** @ignore */
function bit_getBool(_data, _index, byte, bit) {
    return (byte & 1 << bit) !== 0;
}
/** @ignore */
function getBit(_data, _index, byte, bit) {
    return (byte & 1 << bit) >> bit;
}
/** @ignore */
function bit_setBool(bytes, index, value) {
    return value ?
        !!(bytes[index >> 3] |= (1 << (index % 8))) || true :
        !(bytes[index >> 3] &= ~(1 << (index % 8))) && false;
}
/** @ignore */
function truncateBitmap(offset, length, bitmap) {
    const alignedSize = (bitmap.byteLength + 7) & ~7;
    if (offset > 0 || bitmap.byteLength < alignedSize) {
        const bytes = new Uint8Array(alignedSize);
        // If the offset is a multiple of 8 bits, it's safe to slice the bitmap
        bytes.set(offset % 8 === 0 ? bitmap.subarray(offset >> 3) :
            // Otherwise iterate each bit from the offset and return a new one
            packBools(new BitIterator(bitmap, offset, length, null, bit_getBool)).subarray(0, alignedSize));
        return bytes;
    }
    return bitmap;
}
/** @ignore */
function packBools(values) {
    const xs = [];
    let i = 0, bit = 0, byte = 0;
    for (const value of values) {
        value && (byte |= 1 << bit);
        if (++bit === 8) {
            xs[i++] = byte;
            byte = bit = 0;
        }
    }
    if (i === 0 || bit > 0) {
        xs[i++] = byte;
    }
    const b = new Uint8Array((xs.length + 7) & ~7);
    b.set(xs);
    return b;
}
/** @ignore */
class BitIterator {
    constructor(bytes, begin, length, context, get) {
        this.bytes = bytes;
        this.length = length;
        this.context = context;
        this.get = get;
        this.bit = begin % 8;
        this.byteIndex = begin >> 3;
        this.byte = bytes[this.byteIndex++];
        this.index = 0;
    }
    next() {
        if (this.index < this.length) {
            if (this.bit === 8) {
                this.bit = 0;
                this.byte = this.bytes[this.byteIndex++];
            }
            return {
                value: this.get(this.context, this.index++, this.byte, this.bit++)
            };
        }
        return { done: true, value: null };
    }
    [Symbol.iterator]() {
        return this;
    }
}
/**
 * Compute the population count (the number of bits set to 1) for a range of bits in a Uint8Array.
 * @param vector The Uint8Array of bits for which to compute the population count.
 * @param lhs The range's left-hand side (or start) bit
 * @param rhs The range's right-hand side (or end) bit
 */
/** @ignore */
function popcnt_bit_range(data, lhs, rhs) {
    if (rhs - lhs <= 0) {
        return 0;
    }
    // If the bit range is less than one byte, sum the 1 bits in the bit range
    if (rhs - lhs < 8) {
        let sum = 0;
        for (const bit of new BitIterator(data, lhs, rhs - lhs, data, getBit)) {
            sum += bit;
        }
        return sum;
    }
    // Get the next lowest multiple of 8 from the right hand side
    const rhsInside = rhs >> 3 << 3;
    // Get the next highest multiple of 8 from the left hand side
    const lhsInside = lhs + (lhs % 8 === 0 ? 0 : 8 - lhs % 8);
    return (
    // Get the popcnt of bits between the left hand side, and the next highest multiple of 8
    popcnt_bit_range(data, lhs, lhsInside) +
        // Get the popcnt of bits between the right hand side, and the next lowest multiple of 8
        popcnt_bit_range(data, rhsInside, rhs) +
        // Get the popcnt of all bits between the left and right hand sides' multiples of 8
        popcnt_array(data, lhsInside >> 3, (rhsInside - lhsInside) >> 3));
}
/** @ignore */
function popcnt_array(arr, byteOffset, byteLength) {
    let cnt = 0, pos = Math.trunc(byteOffset);
    const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    const len = byteLength === void 0 ? arr.byteLength : pos + byteLength;
    while (len - pos >= 4) {
        cnt += popcnt_uint32(view.getUint32(pos));
        pos += 4;
    }
    while (len - pos >= 2) {
        cnt += popcnt_uint32(view.getUint16(pos));
        pos += 2;
    }
    while (len - pos >= 1) {
        cnt += popcnt_uint32(view.getUint8(pos));
        pos += 1;
    }
    return cnt;
}
/** @ignore */
function popcnt_uint32(uint32) {
    let i = Math.trunc(uint32);
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    return (((i + (i >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

//# sourceMappingURL=bit.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/data.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */ const kUnknownNullCount = -1;
/** @ignore */
const kDataSymbol = Symbol.for('apache-arrow/Data');
/**
 * Data structure underlying {@link Vector}s. Use the convenience method {@link makeData}.
 */
class data_Data {
    /**
     * Check if an object is an instance of Data.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isData(x) {
        return (x === null || x === void 0 ? void 0 : x[kDataSymbol]) === true;
    }
    get typeId() { return this.type.typeId; }
    get ArrayType() { return this.type.ArrayType; }
    get buffers() {
        return [this.valueOffsets, this.values, this.nullBitmap, this.typeIds];
    }
    get nullable() {
        if (this._nullCount !== 0) {
            const { type } = this;
            if (type_DataType.isSparseUnion(type)) {
                return this.children.some((child) => child.nullable);
            }
            else if (type_DataType.isDenseUnion(type)) {
                return this.children.some((child) => child.nullable);
            }
            return this.nullBitmap && this.nullBitmap.byteLength > 0;
        }
        return true;
    }
    get byteLength() {
        let byteLength = 0;
        const { valueOffsets, values, nullBitmap, typeIds } = this;
        valueOffsets && (byteLength += valueOffsets.byteLength);
        values && (byteLength += values.byteLength);
        nullBitmap && (byteLength += nullBitmap.byteLength);
        typeIds && (byteLength += typeIds.byteLength);
        byteLength += this.variadicBuffers.reduce((size, data) => { var _a; return size + ((_a = data === null || data === void 0 ? void 0 : data.byteLength) !== null && _a !== void 0 ? _a : 0); }, 0);
        return this.children.reduce((byteLength, child) => byteLength + child.byteLength, byteLength);
    }
    get nullCount() {
        if (type_DataType.isUnion(this.type)) {
            return this.children.reduce((nullCount, child) => nullCount + child.nullCount, 0);
        }
        let nullCount = this._nullCount;
        let nullBitmap;
        if (nullCount <= kUnknownNullCount && (nullBitmap = this.nullBitmap)) {
            this._nullCount = nullCount = nullBitmap.length === 0 ?
                // no null bitmap, so all values are valid
                0 :
                this.length - popcnt_bit_range(nullBitmap, this.offset, this.offset + this.length);
        }
        return nullCount;
    }
    constructor(type, offset, length, nullCount, buffers, children = [], dictionary, variadicBuffers = []) {
        var _a;
        this.type = type;
        this.children = children;
        this.dictionary = dictionary;
        this.offset = Math.floor(Math.max(offset || 0, 0));
        this.length = Math.floor(Math.max(length || 0, 0));
        this._nullCount = Math.floor(Math.max(nullCount || 0, -1));
        let buffer;
        if (buffers instanceof data_Data) {
            this.stride = buffers.stride;
            this.values = buffers.values;
            this.typeIds = buffers.typeIds;
            this.nullBitmap = buffers.nullBitmap;
            this.valueOffsets = buffers.valueOffsets;
            this.variadicBuffers = buffers.variadicBuffers;
        }
        else {
            this.stride = strideForType(type);
            if (buffers) {
                (buffer = buffers[0]) && (this.valueOffsets = buffer);
                (buffer = buffers[1]) && (this.values = buffer);
                (buffer = buffers[2]) && (this.nullBitmap = buffer);
                (buffer = buffers[3]) && (this.typeIds = buffer);
            }
            this.variadicBuffers = variadicBuffers;
        }
        (_a = this.variadicBuffers) !== null && _a !== void 0 ? _a : (this.variadicBuffers = []);
    }
    getValid(index) {
        const { type } = this;
        if (type_DataType.isUnion(type)) {
            const union = type;
            const typeId = this.typeIds[index];
            const childIndex = union.typeIdToChildIndex[typeId];
            const child = this.children[childIndex];
            const valueOffsets = this.valueOffsets;
            const indexInChild = union.mode === UnionMode.Dense && valueOffsets
                ? Number(valueOffsets[index])
                : index;
            return child.getValid(indexInChild);
        }
        if (this.nullable && this.nullCount > 0) {
            const pos = this.offset + index;
            const val = this.nullBitmap[pos >> 3];
            return (val & (1 << (pos % 8))) !== 0;
        }
        return true;
    }
    setValid(index, value) {
        let prev;
        const { type } = this;
        if (type_DataType.isUnion(type)) {
            const union = type;
            const typeId = this.typeIds[index];
            const childIndex = union.typeIdToChildIndex[typeId];
            const child = this.children[childIndex];
            const valueOffsets = this.valueOffsets;
            const indexInChild = union.mode === UnionMode.Dense && valueOffsets
                ? Number(valueOffsets[index])
                : index;
            prev = child.getValid(indexInChild);
            child.setValid(indexInChild, value);
        }
        else {
            let { nullBitmap } = this;
            const { offset, length } = this;
            const idx = offset + index;
            const mask = 1 << (idx % 8);
            const byteOffset = idx >> 3;
            // If no null bitmap, initialize one on the fly
            if (!nullBitmap || nullBitmap.byteLength <= byteOffset) {
                nullBitmap = new Uint8Array((((offset + length) + 63) & ~63) >> 3).fill(255);
                // if we have a nullBitmap, truncate + slice and set it over the pre-filled 1s
                if (this.nullCount > 0) {
                    nullBitmap.set(truncateBitmap(offset, length, this.nullBitmap), 0);
                    Object.assign(this, { nullBitmap });
                }
                else {
                    Object.assign(this, { nullBitmap, _nullCount: 0 });
                }
            }
            const byte = nullBitmap[byteOffset];
            prev = (byte & mask) !== 0;
            nullBitmap[byteOffset] = value ? (byte | mask) : (byte & ~mask);
        }
        if (prev !== !!value) {
            // Update `_nullCount` if the new value is different from the old value.
            this._nullCount = this.nullCount + (value ? -1 : 1);
        }
        return value;
    }
    clone(type = this.type, offset = this.offset, length = this.length, nullCount = this._nullCount, buffers = this, children = this.children, variadicBuffers = this.variadicBuffers) {
        return new data_Data(type, offset, length, nullCount, buffers, children, this.dictionary, variadicBuffers);
    }
    slice(offset, length) {
        const { stride, typeId, children } = this;
        // +true === 1, +false === 0, so this means
        // we keep nullCount at 0 if it's already 0,
        // otherwise set to the invalidated flag -1
        const nullCount = +(this._nullCount === 0) - 1;
        const childStride = typeId === 16 /* FixedSizeList */ ? stride : 1;
        const buffers = this._sliceBuffers(offset, length, stride, typeId);
        return this.clone(this.type, this.offset + offset, length, nullCount, buffers, 
        // Don't slice children if we have value offsets (the variable-width types)
        (children.length === 0 || this.valueOffsets) ? children : this._sliceChildren(children, childStride * offset, childStride * length), this.variadicBuffers);
    }
    _changeLengthAndBackfillNullBitmap(newLength) {
        if (this.typeId === Type.Null) {
            return this.clone(this.type, 0, newLength, 0, this.buffers, this.children, this.variadicBuffers);
        }
        const { length, nullCount } = this;
        // start initialized with 0s (nulls), then fill from 0 to length with 1s (not null)
        const bitmap = new Uint8Array(((newLength + 63) & ~63) >> 3).fill(255, 0, length >> 3);
        // set all the bits in the last byte (up to bit `length - length % 8`) to 1 (not null)
        bitmap[length >> 3] = (1 << (length - (length & ~7))) - 1;
        // if we have a nullBitmap, truncate + slice and set it over the pre-filled 1s
        if (nullCount > 0) {
            bitmap.set(truncateBitmap(this.offset, length, this.nullBitmap), 0);
        }
        const buffers = this.buffers;
        buffers[BufferType.VALIDITY] = bitmap;
        return this.clone(this.type, 0, newLength, nullCount + (newLength - length), buffers, this.children, this.variadicBuffers);
    }
    _sliceBuffers(offset, length, stride, typeId) {
        let arr;
        const { buffers } = this;
        // If typeIds exist, slice the typeIds buffer
        (arr = buffers[BufferType.TYPE]) && (buffers[BufferType.TYPE] = arr.subarray(offset, offset + length));
        if (type_DataType.isBinaryView(this.type) || type_DataType.isUtf8View(this.type)) {
            const width = type_BinaryView.ELEMENT_WIDTH;
            (arr = buffers[BufferType.DATA]) && (buffers[BufferType.DATA] = arr.subarray(offset * width, (offset + length) * width));
        }
        else {
            // If offsets exist, only slice the offsets buffer
            (arr = buffers[BufferType.OFFSET]) && (buffers[BufferType.OFFSET] = arr.subarray(offset, offset + length + 1)) ||
                // Otherwise if no offsets, slice the data buffer. Don't slice the data vector for Booleans, since the offset goes by bits not bytes
                (arr = buffers[BufferType.DATA]) && (buffers[BufferType.DATA] = typeId === 6 ? arr : arr.subarray(stride * offset, stride * (offset + length)));
        }
        return buffers;
    }
    _sliceChildren(children, offset, length) {
        return children.map((child) => child.slice(offset, length));
    }
}
data_Data.prototype.children = Object.freeze([]);
data_Data.prototype[kDataSymbol] = true;
Object.defineProperty(data_Data, Symbol.hasInstance, {
    value: function isDataInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === data_Data && data_Data.isData(instance));
    },
});



class MakeDataVisitor extends Visitor {
    visit(props) {
        return this.getVisitFn(props['type']).call(this, props);
    }
    visitNull(props) {
        const { ['type']: type, ['offset']: offset = 0, ['length']: length = 0, } = props;
        return new data_Data(type, offset, length, length);
    }
    visitBool(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length >> 3, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitInt(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitFloat(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitUtf8(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const data = toUint8Array(props['data']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toInt32Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
    }
    visitUtf8View(props) {
        var _a;
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const views = toArrayBufferView(type.ArrayType, props['views']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const variadicBuffers = (props['variadicBuffers'] || []).map((buffer) => toUint8Array(buffer));
        const length = (_a = props['length']) !== null && _a !== void 0 ? _a : Math.trunc(views.length / type_Utf8View.ELEMENT_WIDTH);
        const nullCount = props['nullBitmap'] ? -1 : 0;
        return new data_Data(type, offset, length, nullCount, [undefined, views, nullBitmap], [], undefined, variadicBuffers);
    }
    visitLargeUtf8(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const data = toUint8Array(props['data']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toBigInt64Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
    }
    visitBinary(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const data = toUint8Array(props['data']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toInt32Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
    }
    visitBinaryView(props) {
        var _a;
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const views = toArrayBufferView(type.ArrayType, props['views']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const variadicBuffers = (props['variadicBuffers'] || []).map((buffer) => toUint8Array(buffer));
        const length = (_a = props['length']) !== null && _a !== void 0 ? _a : Math.trunc(views.length / type_BinaryView.ELEMENT_WIDTH);
        const nullCount = props['nullBitmap'] ? -1 : 0;
        return new data_Data(type, offset, length, nullCount, [undefined, views, nullBitmap], [], undefined, variadicBuffers);
    }
    visitLargeBinary(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const data = toUint8Array(props['data']);
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toBigInt64Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
    }
    visitFixedSizeBinary(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitDate(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitTimestamp(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitTime(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitDecimal(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitList(props) {
        const { ['type']: type, ['offset']: offset = 0, ['child']: child } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toInt32Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, undefined, nullBitmap], [child]);
    }
    visitLargeList(props) {
        const { ['type']: type, ['offset']: offset = 0, ['child']: child } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toBigInt64Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, undefined, nullBitmap], [child]);
    }
    visitStruct(props) {
        const { ['type']: type, ['offset']: offset = 0, ['children']: children = [] } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const { length = children.reduce((len, { length }) => Math.max(len, length), 0), nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, undefined, nullBitmap], children);
    }
    visitUnion(props) {
        const { ['type']: type, ['offset']: offset = 0, ['children']: children = [] } = props;
        const typeIds = toArrayBufferView(type.ArrayType, props['typeIds']);
        const { ['length']: length = typeIds.length, ['nullCount']: nullCount = -1, } = props;
        if (type_DataType.isSparseUnion(type)) {
            return new data_Data(type, offset, length, nullCount, [undefined, undefined, undefined, typeIds], children);
        }
        const valueOffsets = toInt32Array(props['valueOffsets']);
        return new data_Data(type, offset, length, nullCount, [valueOffsets, undefined, undefined, typeIds], children);
    }
    visitDictionary(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.indices.ArrayType, props['data']);
        const { ['dictionary']: dictionary = new vector_Vector([new MakeDataVisitor().visit({ type: type.dictionary })]) } = props;
        const { ['length']: length = data.length, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap], [], dictionary);
    }
    visitInterval(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitDuration(props) {
        const { ['type']: type, ['offset']: offset = 0 } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const data = toArrayBufferView(type.ArrayType, props['data']);
        const { ['length']: length = data.length, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, data, nullBitmap]);
    }
    visitFixedSizeList(props) {
        const { ['type']: type, ['offset']: offset = 0, ['child']: child = new MakeDataVisitor().visit({ type: type.valueType }) } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const { ['length']: length = child.length / strideForType(type), ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0 } = props;
        return new data_Data(type, offset, length, nullCount, [undefined, undefined, nullBitmap], [child]);
    }
    visitMap(props) {
        const { ['type']: type, ['offset']: offset = 0, ['child']: child = new MakeDataVisitor().visit({ type: type.childType }) } = props;
        const nullBitmap = toUint8Array(props['nullBitmap']);
        const valueOffsets = toInt32Array(props['valueOffsets']);
        const { ['length']: length = valueOffsets.length - 1, ['nullCount']: nullCount = props['nullBitmap'] ? -1 : 0, } = props;
        return new data_Data(type, offset, length, nullCount, [valueOffsets, undefined, nullBitmap], [child]);
    }
}
const makeDataVisitor = new MakeDataVisitor();
function data_makeData(props) {
    return makeDataVisitor.visit(props);
}

//# sourceMappingURL=data.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/chunk.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/** @ignore */
class ChunkedIterator {
    constructor(numChunks = 0, getChunkIterator) {
        this.numChunks = numChunks;
        this.getChunkIterator = getChunkIterator;
        this.chunkIndex = 0;
        this.chunkIterator = this.getChunkIterator(0);
    }
    next() {
        while (this.chunkIndex < this.numChunks) {
            const next = this.chunkIterator.next();
            if (!next.done) {
                return next;
            }
            if (++this.chunkIndex < this.numChunks) {
                this.chunkIterator = this.getChunkIterator(this.chunkIndex);
            }
        }
        return { done: true, value: null };
    }
    [Symbol.iterator]() {
        return this;
    }
}
/** @ignore */
function computeChunkNullable(chunks) {
    return chunks.some(chunk => chunk.nullable);
}
/** @ignore */
function computeChunkNullCounts(chunks) {
    return chunks.reduce((nullCount, chunk) => nullCount + chunk.nullCount, 0);
}
/** @ignore */
function computeChunkOffsets(chunks) {
    return chunks.reduce((offsets, chunk, index) => {
        offsets[index + 1] = offsets[index] + chunk.length;
        return offsets;
    }, new Uint32Array(chunks.length + 1));
}
/** @ignore */
function sliceChunks(chunks, offsets, begin, end) {
    const slices = [];
    for (let i = -1, n = chunks.length; ++i < n;) {
        const chunk = chunks[i];
        const offset = offsets[i];
        const { length } = chunk;
        // Stop if the child is to the right of the slice boundary
        if (offset >= end) {
            break;
        }
        // Exclude children to the left of of the slice boundary
        if (begin >= offset + length) {
            continue;
        }
        // Include entire child if between both left and right boundaries
        if (offset >= begin && (offset + length) <= end) {
            slices.push(chunk);
            continue;
        }
        // Include the child slice that overlaps one of the slice boundaries
        const from = Math.max(0, begin - offset);
        const to = Math.min(end - offset, length);
        slices.push(chunk.slice(from, to - from));
    }
    if (slices.length === 0) {
        slices.push(chunks[0].slice(0, 0));
    }
    return slices;
}
/** @ignore */
function binarySearch(chunks, offsets, idx, fn) {
    let lhs = 0, mid = 0, rhs = offsets.length - 1;
    do {
        if (lhs >= rhs - 1) {
            return (idx < offsets[rhs]) ? fn(chunks, lhs, idx - offsets[lhs]) : null;
        }
        mid = lhs + (Math.trunc((rhs - lhs) * .5));
        idx < offsets[mid] ? (rhs = mid) : (lhs = mid);
    } while (lhs < rhs);
}
/** @ignore */
function isChunkedValid(data, index) {
    return data.getValid(index);
}
/** @ignore */
function wrapChunkedCall1(fn) {
    function chunkedFn(chunks, i, j) { return fn(chunks[i], j); }
    return function (index) {
        const data = this.data;
        return binarySearch(data, this._offsets, index, chunkedFn);
    };
}
/** @ignore */
function wrapChunkedCall2(fn) {
    let _2;
    function chunkedFn(chunks, i, j) { return fn(chunks[i], j, _2); }
    return function (index, value) {
        const data = this.data;
        _2 = value;
        const result = binarySearch(data, this._offsets, index, chunkedFn);
        _2 = undefined;
        return result;
    };
}
/** @ignore */
function wrapChunkedIndexOf(indexOf) {
    let _1;
    function chunkedIndexOf(data, chunkIndex, fromIndex) {
        let begin = fromIndex, index = 0, total = 0;
        for (let i = chunkIndex - 1, n = data.length; ++i < n;) {
            const chunk = data[i];
            if (~(index = indexOf(chunk, _1, begin))) {
                return total + index;
            }
            begin = 0;
            total += chunk.length;
        }
        return -1;
    }
    return function (element, offset) {
        _1 = element;
        const data = this.data;
        const result = typeof offset !== 'number'
            ? chunkedIndexOf(data, 0, 0)
            : binarySearch(data, this._offsets, offset, chunkedIndexOf);
        _1 = undefined;
        return result;
    };
}

//# sourceMappingURL=chunk.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/indexof.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.





/** @ignore */
class IndexOfVisitor extends Visitor {
}
/** @ignore */
function nullIndexOf(data, searchElement) {
    // if you're looking for nulls and the vector isn't empty, we've got 'em!
    return searchElement === null && data.length > 0 ? 0 : -1;
}
/** @ignore */
function indexOfNull(data, fromIndex) {
    const { nullBitmap } = data;
    if (!nullBitmap || data.nullCount <= 0) {
        return -1;
    }
    let i = 0;
    for (const isValid of new BitIterator(nullBitmap, data.offset + (fromIndex || 0), data.length, nullBitmap, bit_getBool)) {
        if (!isValid) {
            return i;
        }
        ++i;
    }
    return -1;
}
/** @ignore */
function indexOfValue(data, searchElement, fromIndex) {
    if (searchElement === undefined) {
        return -1;
    }
    if (searchElement === null) {
        switch (data.typeId) {
            // Unions don't have a nullBitmap of its own, so compare the `searchElement` to `get()`.
            case Type.Union:
                break;
            // Dictionaries do have a nullBitmap, but their dictionary could also have null elements.
            case Type.Dictionary:
                break;
            // All other types can iterate the null bitmap
            default:
                return indexOfNull(data, fromIndex);
        }
    }
    const get = get_instance.getVisitFn(data);
    const compare = createElementComparator(searchElement);
    for (let i = (fromIndex || 0) - 1, n = data.length; ++i < n;) {
        if (compare(get(data, i))) {
            return i;
        }
    }
    return -1;
}
/** @ignore */
function indexOfUnion(data, searchElement, fromIndex) {
    // Unions are special -- they do have a nullBitmap, but so can their children.
    // If the searchElement is null, we don't know whether it came from the Union's
    // bitmap or one of its children's. So we don't interrogate the Union's bitmap,
    // since that will report the wrong index if a child has a null before the Union.
    const get = get_instance.getVisitFn(data);
    const compare = createElementComparator(searchElement);
    for (let i = (fromIndex || 0) - 1, n = data.length; ++i < n;) {
        if (compare(get(data, i))) {
            return i;
        }
    }
    return -1;
}
IndexOfVisitor.prototype.visitNull = nullIndexOf;
IndexOfVisitor.prototype.visitBool = indexOfValue;
IndexOfVisitor.prototype.visitInt = indexOfValue;
IndexOfVisitor.prototype.visitInt8 = indexOfValue;
IndexOfVisitor.prototype.visitInt16 = indexOfValue;
IndexOfVisitor.prototype.visitInt32 = indexOfValue;
IndexOfVisitor.prototype.visitInt64 = indexOfValue;
IndexOfVisitor.prototype.visitUint8 = indexOfValue;
IndexOfVisitor.prototype.visitUint16 = indexOfValue;
IndexOfVisitor.prototype.visitUint32 = indexOfValue;
IndexOfVisitor.prototype.visitUint64 = indexOfValue;
IndexOfVisitor.prototype.visitFloat = indexOfValue;
IndexOfVisitor.prototype.visitFloat16 = indexOfValue;
IndexOfVisitor.prototype.visitFloat32 = indexOfValue;
IndexOfVisitor.prototype.visitFloat64 = indexOfValue;
IndexOfVisitor.prototype.visitUtf8 = indexOfValue;
IndexOfVisitor.prototype.visitLargeUtf8 = indexOfValue;
IndexOfVisitor.prototype.visitUtf8View = indexOfValue;
IndexOfVisitor.prototype.visitBinary = indexOfValue;
IndexOfVisitor.prototype.visitLargeBinary = indexOfValue;
IndexOfVisitor.prototype.visitBinaryView = indexOfValue;
IndexOfVisitor.prototype.visitFixedSizeBinary = indexOfValue;
IndexOfVisitor.prototype.visitDate = indexOfValue;
IndexOfVisitor.prototype.visitDateDay = indexOfValue;
IndexOfVisitor.prototype.visitDateMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestamp = indexOfValue;
IndexOfVisitor.prototype.visitTimestampSecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitTime = indexOfValue;
IndexOfVisitor.prototype.visitTimeSecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitDecimal = indexOfValue;
IndexOfVisitor.prototype.visitList = indexOfValue;
IndexOfVisitor.prototype.visitLargeList = indexOfValue;
IndexOfVisitor.prototype.visitStruct = indexOfValue;
IndexOfVisitor.prototype.visitUnion = indexOfValue;
IndexOfVisitor.prototype.visitDenseUnion = indexOfUnion;
IndexOfVisitor.prototype.visitSparseUnion = indexOfUnion;
IndexOfVisitor.prototype.visitDictionary = indexOfValue;
IndexOfVisitor.prototype.visitInterval = indexOfValue;
IndexOfVisitor.prototype.visitIntervalDayTime = indexOfValue;
IndexOfVisitor.prototype.visitIntervalYearMonth = indexOfValue;
IndexOfVisitor.prototype.visitIntervalMonthDayNano = indexOfValue;
IndexOfVisitor.prototype.visitDuration = indexOfValue;
IndexOfVisitor.prototype.visitDurationSecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitFixedSizeList = indexOfValue;
IndexOfVisitor.prototype.visitMap = indexOfValue;
/** @ignore */
const indexof_instance = new IndexOfVisitor();

//# sourceMappingURL=indexof.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/iterator.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
class IteratorVisitor extends Visitor {
}
/** @ignore */
function vectorIterator(vector) {
    const { type } = vector;
    // Fast case, defer to native iterators if possible
    if (vector.nullCount === 0 && vector.stride === 1 && (
    // Don't defer to native iterator for timestamps since Numbers are expected
    // (DataType.isTimestamp(type)) && type.unit === TimeUnit.MILLISECOND ||
    (type_DataType.isInt(type) && type.bitWidth !== 64) ||
        (type_DataType.isTime(type) && type.bitWidth !== 64) ||
        (type_DataType.isFloat(type) && type.precision !== Precision.HALF))) {
        return new ChunkedIterator(vector.data.length, (chunkIndex) => {
            const data = vector.data[chunkIndex];
            return data.values.subarray(0, data.length)[Symbol.iterator]();
        });
    }
    // Otherwise, iterate manually
    let offset = 0;
    return new ChunkedIterator(vector.data.length, (chunkIndex) => {
        const data = vector.data[chunkIndex];
        const length = data.length;
        const inner = vector.slice(offset, offset + length);
        offset += length;
        return new VectorIterator(inner);
    });
}
/** @ignore */
class VectorIterator {
    constructor(vector) {
        this.vector = vector;
        this.index = 0;
    }
    next() {
        if (this.index < this.vector.length) {
            return {
                value: this.vector.get(this.index++)
            };
        }
        return { done: true, value: null };
    }
    [Symbol.iterator]() {
        return this;
    }
}
IteratorVisitor.prototype.visitNull = vectorIterator;
IteratorVisitor.prototype.visitBool = vectorIterator;
IteratorVisitor.prototype.visitInt = vectorIterator;
IteratorVisitor.prototype.visitInt8 = vectorIterator;
IteratorVisitor.prototype.visitInt16 = vectorIterator;
IteratorVisitor.prototype.visitInt32 = vectorIterator;
IteratorVisitor.prototype.visitInt64 = vectorIterator;
IteratorVisitor.prototype.visitUint8 = vectorIterator;
IteratorVisitor.prototype.visitUint16 = vectorIterator;
IteratorVisitor.prototype.visitUint32 = vectorIterator;
IteratorVisitor.prototype.visitUint64 = vectorIterator;
IteratorVisitor.prototype.visitFloat = vectorIterator;
IteratorVisitor.prototype.visitFloat16 = vectorIterator;
IteratorVisitor.prototype.visitFloat32 = vectorIterator;
IteratorVisitor.prototype.visitFloat64 = vectorIterator;
IteratorVisitor.prototype.visitUtf8 = vectorIterator;
IteratorVisitor.prototype.visitLargeUtf8 = vectorIterator;
IteratorVisitor.prototype.visitUtf8View = vectorIterator;
IteratorVisitor.prototype.visitBinary = vectorIterator;
IteratorVisitor.prototype.visitLargeBinary = vectorIterator;
IteratorVisitor.prototype.visitBinaryView = vectorIterator;
IteratorVisitor.prototype.visitFixedSizeBinary = vectorIterator;
IteratorVisitor.prototype.visitDate = vectorIterator;
IteratorVisitor.prototype.visitDateDay = vectorIterator;
IteratorVisitor.prototype.visitDateMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimestamp = vectorIterator;
IteratorVisitor.prototype.visitTimestampSecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampNanosecond = vectorIterator;
IteratorVisitor.prototype.visitTime = vectorIterator;
IteratorVisitor.prototype.visitTimeSecond = vectorIterator;
IteratorVisitor.prototype.visitTimeMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimeMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitTimeNanosecond = vectorIterator;
IteratorVisitor.prototype.visitDecimal = vectorIterator;
IteratorVisitor.prototype.visitList = vectorIterator;
IteratorVisitor.prototype.visitLargeList = vectorIterator;
IteratorVisitor.prototype.visitStruct = vectorIterator;
IteratorVisitor.prototype.visitUnion = vectorIterator;
IteratorVisitor.prototype.visitDenseUnion = vectorIterator;
IteratorVisitor.prototype.visitSparseUnion = vectorIterator;
IteratorVisitor.prototype.visitDictionary = vectorIterator;
IteratorVisitor.prototype.visitInterval = vectorIterator;
IteratorVisitor.prototype.visitIntervalDayTime = vectorIterator;
IteratorVisitor.prototype.visitIntervalYearMonth = vectorIterator;
IteratorVisitor.prototype.visitIntervalMonthDayNano = vectorIterator;
IteratorVisitor.prototype.visitDuration = vectorIterator;
IteratorVisitor.prototype.visitDurationSecond = vectorIterator;
IteratorVisitor.prototype.visitDurationMillisecond = vectorIterator;
IteratorVisitor.prototype.visitDurationMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitDurationNanosecond = vectorIterator;
IteratorVisitor.prototype.visitFixedSizeList = vectorIterator;
IteratorVisitor.prototype.visitMap = vectorIterator;
/** @ignore */
const iterator_instance = new IteratorVisitor();

//# sourceMappingURL=iterator.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/vector.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
var vector_a;









/** @ignore */
const kVectorSymbol = Symbol.for('apache-arrow/Vector');
const visitorsByTypeId = {};
const vectorPrototypesByTypeId = {};
/**
 * Array-like data structure. Use the convenience method {@link makeVector} and {@link vectorFromArray} to create vectors.
 */
class vector_Vector {
    /**
     * Check if an object is an instance of Vector.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isVector(x) {
        return (x === null || x === void 0 ? void 0 : x[kVectorSymbol]) === true;
    }
    constructor(input) {
        var _b, _c, _d;
        const data = input[0] instanceof vector_Vector
            ? input.flatMap(x => x.data)
            : input;
        if (data.length === 0 || data.some((x) => !(x instanceof data_Data))) {
            throw new TypeError('Vector constructor expects an Array of Data instances.');
        }
        const type = (_b = data[0]) === null || _b === void 0 ? void 0 : _b.type;
        switch (data.length) {
            case 0:
                this._offsets = [0];
                break;
            case 1: {
                // special case for unchunked vectors
                const { get, set, indexOf } = visitorsByTypeId[type.typeId];
                const unchunkedData = data[0];
                this.isValid = (index) => isChunkedValid(unchunkedData, index);
                this.get = (index) => get(unchunkedData, index);
                this.set = (index, value) => set(unchunkedData, index, value);
                this.indexOf = (index) => indexOf(unchunkedData, index);
                this._offsets = [0, unchunkedData.length];
                break;
            }
            default:
                Object.setPrototypeOf(this, vectorPrototypesByTypeId[type.typeId]);
                this._offsets = computeChunkOffsets(data);
                break;
        }
        this.data = data;
        this.type = type;
        this.stride = strideForType(type);
        this.numChildren = (_d = (_c = type.children) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
        this.length = this._offsets.at(-1);
    }
    /**
     * The aggregate size (in bytes) of this Vector's buffers and/or child Vectors.
     */
    get byteLength() {
        return this.data.reduce((byteLength, data) => byteLength + data.byteLength, 0);
    }
    /**
     * Whether this Vector's elements can contain null values.
     */
    get nullable() {
        return computeChunkNullable(this.data);
    }
    /**
     * The number of null elements in this Vector.
     */
    get nullCount() {
        return computeChunkNullCounts(this.data);
    }
    /**
     * The Array or TypedArray constructor used for the JS representation
     *  of the element's values in {@link Vector.prototype.toArray `toArray()`}.
     */
    get ArrayType() { return this.type.ArrayType; }
    /**
     * The name that should be printed when the Vector is logged in a message.
     */
    get [Symbol.toStringTag]() {
        return `${this.VectorName}<${this.type[Symbol.toStringTag]}>`;
    }
    /**
     * The name of this Vector.
     */
    get VectorName() { return `${Type[this.type.typeId]}Vector`; }
    /**
     * Check whether an element is null.
     * @param index The index at which to read the validity bitmap.
     */
    // @ts-ignore
    isValid(index) { return false; }
    /**
     * Get an element value by position.
     * @param index The index of the element to read.
     */
    // @ts-ignore
    get(index) { return null; }
    /**
     * Get an element value by position.
     * @param index The index of the element to read. A negative index will count back from the last element.
     */
    at(index) {
        return this.get(wrapIndex(index, this.length));
    }
    /**
     * Set an element value by position.
     * @param index The index of the element to write.
     * @param value The value to set.
     */
    // @ts-ignore
    set(index, value) { return; }
    /**
     * Retrieve the index of the first occurrence of a value in an Vector.
     * @param element The value to locate in the Vector.
     * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
     */
    // @ts-ignore
    indexOf(element, offset) { return -1; }
    includes(element, offset) {
        // eslint-disable-next-line unicorn/prefer-includes
        return this.indexOf(element, offset) > -1;
    }
    /**
     * Iterator for the Vector's elements.
     */
    [Symbol.iterator]() {
        return iterator_instance.visit(this);
    }
    /**
     * Combines two or more Vectors of the same type.
     * @param others Additional Vectors to add to the end of this Vector.
     */
    concat(...others) {
        return new vector_Vector(this.data.concat(others.flatMap((x) => x.data).flat(Number.POSITIVE_INFINITY)));
    }
    /**
     * Return a zero-copy sub-section of this Vector.
     * @param start The beginning of the specified portion of the Vector.
     * @param end The end of the specified portion of the Vector. This is exclusive of the element at the index 'end'.
     */
    slice(begin, end) {
        return new vector_Vector(clampRange(this, begin, end, ({ data, _offsets }, begin, end) => sliceChunks(data, _offsets, begin, end)));
    }
    toJSON() { return [...this]; }
    /**
     * Return a JavaScript Array or TypedArray of the Vector's elements.
     *
     * @note If this Vector contains a single Data chunk and the Vector's type is a
     *  primitive numeric type corresponding to one of the JavaScript TypedArrays, this
     *  method returns a zero-copy slice of the underlying TypedArray values. If there's
     *  more than one chunk, the resulting TypedArray will be a copy of the data from each
     *  chunk's underlying TypedArray values.
     *
     * @returns An Array or TypedArray of the Vector's elements, based on the Vector's DataType.
     */
    toArray() {
        const { type, data, length, stride, ArrayType } = this;
        // Fast case, return subarray if possible
        switch (type.typeId) {
            case Type.Int:
            case Type.Float:
            case Type.Decimal:
            case Type.Time:
            case Type.Timestamp:
                switch (data.length) {
                    case 0: return new ArrayType();
                    case 1: return data[0].values.subarray(0, length * stride);
                    default: return data.reduce((memo, { values, length: chunk_length }) => {
                        memo.array.set(values.subarray(0, chunk_length * stride), memo.offset);
                        memo.offset += chunk_length * stride;
                        return memo;
                    }, { array: new ArrayType(length * stride), offset: 0 }).array;
                }
        }
        // Otherwise if not primitive, slow copy
        return [...this];
    }
    /**
     * Returns a string representation of the Vector.
     *
     * @returns A string representation of the Vector.
     */
    toString() {
        return `[${[...this].join(',')}]`;
    }
    /**
     * Returns a child Vector by name, or null if this Vector has no child with the given name.
     * @param name The name of the child to retrieve.
     */
    getChild(name) {
        var _b;
        return this.getChildAt((_b = this.type.children) === null || _b === void 0 ? void 0 : _b.findIndex((f) => f.name === name));
    }
    /**
     * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
     * @param index The index of the child to retrieve.
     */
    getChildAt(index) {
        if (index > -1 && index < this.numChildren) {
            return new vector_Vector(this.data.map(({ children }) => children[index]));
        }
        return null;
    }
    get isMemoized() {
        if (type_DataType.isDictionary(this.type)) {
            return this.data[0].dictionary.isMemoized;
        }
        return false;
    }
    /**
     * Adds memoization to the Vector's {@link get} method. For dictionary
     * vectors, this method return a vector that memoizes only the dictionary
     * values.
     *
     * Memoization is very useful when decoding a value is expensive such as
     * Utf8. The memoization creates a cache of the size of the Vector and
     * therefore increases memory usage.
     *
     * @returns A new vector that memoizes calls to {@link get}.
     */
    memoize() {
        if (type_DataType.isDictionary(this.type)) {
            const dictionary = new MemoizedVector(this.data[0].dictionary);
            const newData = this.data.map((data) => {
                const cloned = data.clone();
                cloned.dictionary = dictionary;
                return cloned;
            });
            return new vector_Vector(newData);
        }
        return new MemoizedVector(this);
    }
    /**
     * Returns a vector without memoization of the {@link get} method. If this
     * vector is not memoized, this method returns this vector.
     *
     * @returns A new vector without memoization.
     */
    unmemoize() {
        if (type_DataType.isDictionary(this.type) && this.isMemoized) {
            const dictionary = this.data[0].dictionary.unmemoize();
            const newData = this.data.map((data) => {
                const newData = data.clone();
                newData.dictionary = dictionary;
                return newData;
            });
            return new vector_Vector(newData);
        }
        return this;
    }
}
vector_a = Symbol.toStringTag;
// Initialize this static property via an IIFE so bundlers don't tree-shake
// out this logic, but also so we're still compliant with `"sideEffects": false`
vector_Vector[vector_a] = ((proto) => {
    proto.type = type_DataType.prototype;
    proto.data = [];
    proto.length = 0;
    proto.stride = 1;
    proto.numChildren = 0;
    proto._offsets = new Uint32Array([0]);
    proto[Symbol.isConcatSpreadable] = true;
    proto[kVectorSymbol] = true;
    const typeIds = Object.keys(Type)
        .map((T) => Type[T])
        .filter((T) => typeof T === 'number' && T !== Type.NONE);
    for (const typeId of typeIds) {
        const get = get_instance.getVisitFnByTypeId(typeId);
        const set = instance.getVisitFnByTypeId(typeId);
        const indexOf = indexof_instance.getVisitFnByTypeId(typeId);
        visitorsByTypeId[typeId] = { get, set, indexOf };
        vectorPrototypesByTypeId[typeId] = Object.create(proto, {
            ['isValid']: { value: wrapChunkedCall1(isChunkedValid) },
            ['get']: { value: wrapChunkedCall1(get_instance.getVisitFnByTypeId(typeId)) },
            ['set']: { value: wrapChunkedCall2(instance.getVisitFnByTypeId(typeId)) },
            ['indexOf']: { value: wrapChunkedIndexOf(indexof_instance.getVisitFnByTypeId(typeId)) },
        });
    }
    return 'Vector';
})(vector_Vector.prototype);
Object.defineProperty(vector_Vector, Symbol.hasInstance, {
    value: function isVectorInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === vector_Vector && vector_Vector.isVector(instance));
    },
});
class MemoizedVector extends vector_Vector {
    constructor(vector) {
        super(vector.data);
        const get = this.get;
        const set = this.set;
        const slice = this.slice;
        const cache = new Array(this.length);
        Object.defineProperty(this, 'get', {
            value(index) {
                const cachedValue = cache[index];
                if (cachedValue !== undefined) {
                    return cachedValue;
                }
                const value = get.call(this, index);
                cache[index] = value;
                return value;
            }
        });
        Object.defineProperty(this, 'set', {
            value(index, value) {
                set.call(this, index, value);
                cache[index] = value;
            }
        });
        Object.defineProperty(this, 'slice', {
            value: (begin, end) => new MemoizedVector(slice.call(this, begin, end))
        });
        Object.defineProperty(this, 'isMemoized', { value: true });
        Object.defineProperty(this, 'unmemoize', {
            value: () => new vector_Vector(this.data)
        });
        Object.defineProperty(this, 'memoize', {
            value: () => this
        });
    }
}

function vector_makeVector(init) {
    if (init) {
        if (init instanceof Data) {
            return new vector_Vector([init]);
        }
        if (init instanceof vector_Vector) {
            return new vector_Vector(init.data);
        }
        if (init.type instanceof DataType) {
            return new vector_Vector([makeData(init)]);
        }
        if (Array.isArray(init)) {
            return new vector_Vector(init.flatMap(v => unwrapInputs(v)));
        }
        if (ArrayBuffer.isView(init)) {
            if (init instanceof DataView) {
                init = new Uint8Array(init.buffer);
            }
            const props = { offset: 0, length: init.length, nullCount: -1, data: init };
            if (init instanceof Int8Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Int8 }))]);
            }
            if (init instanceof Int16Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Int16 }))]);
            }
            if (init instanceof Int32Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Int32 }))]);
            }
            if (init instanceof BigInt64Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Int64 }))]);
            }
            if (init instanceof Uint8Array || init instanceof Uint8ClampedArray) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Uint8 }))]);
            }
            if (init instanceof Uint16Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Uint16 }))]);
            }
            if (init instanceof Uint32Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Uint32 }))]);
            }
            if (init instanceof BigUint64Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Uint64 }))]);
            }
            if (init instanceof Float32Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Float32 }))]);
            }
            if (init instanceof Float64Array) {
                return new vector_Vector([makeData(Object.assign(Object.assign({}, props), { type: new dtypes.Float64 }))]);
            }
            throw new Error('Unrecognized input');
        }
    }
    throw new Error('Unrecognized input');
}
function unwrapInputs(x) {
    return x instanceof Data ? [x] : (x instanceof vector_Vector ? x.data : vector_makeVector(x).data);
}

//# sourceMappingURL=vector.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/valid.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * Dynamically compile the null values into an `isValid()` function whose
 * implementation is a switch statement. Microbenchmarks in v8 indicate
 * this approach is 25% faster than using an ES6 Map.
 *
 * @example
 * console.log(createIsValidFunction([null, 'N/A', NaN]));
 * `function (x) {
 *     if (x !== x) return false;
 *     switch (x) {
 *         case null:
 *         case "N/A":
 *             return false;
 *     }
 *     return true;
 * }`
 *
 * @ignore
 * @param nullValues
 */
function createIsValidFunction(nullValues) {
    if (!nullValues || nullValues.length <= 0) {
        // @ts-ignore
        return function isValid(value) { return true; };
    }
    let fnBody = '';
    const noNaNs = nullValues.filter((x) => x === x);
    if (noNaNs.length > 0) {
        fnBody = `
    switch (x) {${noNaNs.map((x) => `
        case ${valueToCase(x)}:`).join('')}
            return false;
    }`;
    }
    // NaN doesn't equal anything including itself, so it doesn't work as a
    // switch case. Instead we must explicitly check for NaN before the switch.
    if (nullValues.length !== noNaNs.length) {
        fnBody = `if (x !== x) return false;\n${fnBody}`;
    }
    return new Function(`x`, `${fnBody}\nreturn true;`);
}
/** @ignore */
function valueToCase(x) {
    if (typeof x !== 'bigint') {
        return valueToString(x);
    }
    return `${valueToString(x)}n`;
}

//# sourceMappingURL=valid.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/buffer.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @ignore */
function roundLengthUpToNearest64Bytes(len, BPE) {
    const bytesMinus1 = Math.ceil(len) * BPE - 1;
    return ((bytesMinus1 - bytesMinus1 % 64 + 64) || 64) / BPE;
}
/** @ignore */
function resizeArray(arr, len = 0) {
    return arr.length >= len ?
        arr.subarray(0, len) :
        memcpy(new arr.constructor(len), arr, 0);
}
/** @ignore */
class BufferBuilder {
    constructor(bufferType, initialSize = 0, stride = 1) {
        this.length = Math.ceil(initialSize / stride);
        this.buffer = new bufferType(this.length);
        this.stride = stride;
        this.BYTES_PER_ELEMENT = bufferType.BYTES_PER_ELEMENT;
        this.ArrayType = bufferType;
    }
    get byteLength() {
        return Math.ceil(this.length * this.stride) * this.BYTES_PER_ELEMENT;
    }
    get reservedLength() { return this.buffer.length / this.stride; }
    get reservedByteLength() { return this.buffer.byteLength; }
    // @ts-ignore
    set(index, value) { return this; }
    append(value) { return this.set(this.length, value); }
    reserve(extra) {
        if (extra > 0) {
            this.length += extra;
            const stride = this.stride;
            const length = this.length * stride;
            const reserved = this.buffer.length;
            if (length >= reserved) {
                this._resize(reserved === 0
                    ? roundLengthUpToNearest64Bytes(length * 1, this.BYTES_PER_ELEMENT)
                    : roundLengthUpToNearest64Bytes(length * 2, this.BYTES_PER_ELEMENT));
            }
        }
        return this;
    }
    flush(length = this.length) {
        length = roundLengthUpToNearest64Bytes(length * this.stride, this.BYTES_PER_ELEMENT);
        const array = resizeArray(this.buffer, length);
        this.clear();
        return array;
    }
    clear() {
        this.length = 0;
        this.buffer = new this.ArrayType();
        return this;
    }
    _resize(newLength) {
        return this.buffer = resizeArray(this.buffer, newLength);
    }
}
/** @ignore */
class DataBufferBuilder extends BufferBuilder {
    last() { return this.get(this.length - 1); }
    get(index) { return this.buffer[index]; }
    set(index, value) {
        this.reserve(index - this.length + 1);
        this.buffer[index * this.stride] = value;
        return this;
    }
}
/** @ignore */
class BitmapBufferBuilder extends DataBufferBuilder {
    constructor() {
        super(Uint8Array, 0, 1 / 8);
        this.numValid = 0;
    }
    get numInvalid() { return this.length - this.numValid; }
    get(idx) { return this.buffer[idx >> 3] >> idx % 8 & 1; }
    set(idx, val) {
        const { buffer } = this.reserve(idx - this.length + 1);
        const byte = idx >> 3, bit = idx % 8, cur = buffer[byte] >> bit & 1;
        // If `val` is truthy and the current bit is 0, flip it to 1 and increment `numValid`.
        // If `val` is falsey and the current bit is 1, flip it to 0 and decrement `numValid`.
        val ? cur === 0 && ((buffer[byte] |= (1 << bit)), ++this.numValid)
            : cur === 1 && ((buffer[byte] &= ~(1 << bit)), --this.numValid);
        return this;
    }
    clear() {
        this.numValid = 0;
        return super.clear();
    }
}
/** @ignore */
class OffsetsBufferBuilder extends DataBufferBuilder {
    constructor(type) {
        super(type.OffsetArrayType, 1, 1);
    }
    append(value) {
        return this.set(this.length - 1, value);
    }
    set(index, value) {
        const offset = this.length - 1;
        const buffer = this.reserve(index - offset + 1).buffer;
        if (offset < index++ && offset >= 0) {
            buffer.fill(buffer[offset], offset, index);
        }
        buffer[index] = buffer[index - 1] + value;
        return this;
    }
    flush(length = this.length - 1) {
        if (length > this.length) {
            this.set(length - 1, this.BYTES_PER_ELEMENT > 4 ? BigInt(0) : 0);
        }
        return super.flush(length + 1);
    }
}

//# sourceMappingURL=buffer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.






/**
 * An abstract base class for types that construct Arrow Vectors from arbitrary JavaScript values.
 *
 * A `Builder` is responsible for writing arbitrary JavaScript values
 * to ArrayBuffers and/or child Builders according to the Arrow specification
 * for each DataType, creating or resizing the underlying ArrayBuffers as necessary.
 *
 * The `Builder` for each Arrow `DataType` handles converting and appending
 * values for a given `DataType`. The high-level {@link makeBuilder `makeBuilder()`} convenience
 * method creates the specific `Builder` subclass for the supplied `DataType`.
 *
 * Once created, `Builder` instances support both appending values to the end
 * of the `Builder`, and random-access writes to specific indices
 * (`Builder.prototype.append(value)` is a convenience method for
 * `builder.set(builder.length, value)`). Appending or setting values beyond the
 * Builder's current length may cause the builder to grow its underlying buffers
 * or child Builders (if applicable) to accommodate the new values.
 *
 * After enough values have been written to a `Builder`, `Builder.prototype.flush()`
 * will commit the values to the underlying ArrayBuffers (or child Builders). The
 * internal Builder state will be reset, and an instance of `Data<T>` is returned.
 * Alternatively, `Builder.prototype.toVector()` will flush the `Builder` and return
 * an instance of `Vector<T>` instead.
 *
 * When there are no more values to write, use `Builder.prototype.finish()` to
 * finalize the `Builder`. This does not reset the internal state, so it is
 * necessary to call `Builder.prototype.flush()` or `toVector()` one last time
 * if there are still values queued to be flushed.
 *
 * Note: calling `Builder.prototype.finish()` is required when using a `DictionaryBuilder`,
 * because this is when it flushes the values that have been enqueued in its internal
 * dictionary's `Builder`, and creates the `dictionaryVector` for the `Dictionary` `DataType`.
 *
 * @example
 * ```ts
 * import { makeBuilder, Utf8 } from 'apache-arrow';
 *
 * const utf8Builder = makeBuilder({
 *     type: new Utf8(),
 *     nullValues: [null, 'n/a']
 * });
 *
 * utf8Builder
 *     .append('hello')
 *     .append('n/a')
 *     .append('world')
 *     .append(null);
 *
 * const utf8Vector = utf8Builder.finish().toVector();
 *
 * console.log(utf8Vector.toJSON());
 * // > ["hello", null, "world", null]
 * ```
 *
 * @typeparam T The `DataType` of this `Builder`.
 * @typeparam TNull The type(s) of values which will be considered null-value sentinels.
 */
class Builder {
    /** @nocollapse */
    // @ts-ignore
    static throughNode(options) {
        throw new Error(`"throughNode" not available in this environment`);
    }
    /** @nocollapse */
    // @ts-ignore
    static throughDOM(options) {
        throw new Error(`"throughDOM" not available in this environment`);
    }
    /**
     * Construct a builder with the given Arrow DataType with optional null values,
     * which will be interpreted as "null" when set or appended to the `Builder`.
     * @param {{ type: T, nullValues?: any[] }} options A `BuilderOptions` object used to create this `Builder`.
     */
    constructor({ 'type': type, 'nullValues': nulls }) {
        /**
         * The number of values written to the `Builder` that haven't been flushed yet.
         * @readonly
         */
        this.length = 0;
        /**
         * A boolean indicating whether `Builder.prototype.finish()` has been called on this `Builder`.
         * @readonly
         */
        this.finished = false;
        this.type = type;
        this.children = [];
        this.nullValues = nulls;
        this.stride = strideForType(type);
        this._nulls = new BitmapBufferBuilder();
        if (nulls && nulls.length > 0) {
            this._isValid = createIsValidFunction(nulls);
        }
    }
    /**
     * Flush the `Builder` and return a `Vector<T>`.
     * @returns {Vector<T>} A `Vector<T>` of the flushed values.
     */
    toVector() { return new vector_Vector([this.flush()]); }
    get ArrayType() { return this.type.ArrayType; }
    get nullCount() { return this._nulls.numInvalid; }
    get numChildren() { return this.children.length; }
    /**
     * @returns The aggregate length (in bytes) of the values that have been written.
     */
    get byteLength() {
        let size = 0;
        const { _offsets, _values, _nulls, _typeIds, children } = this;
        _offsets && (size += _offsets.byteLength);
        _values && (size += _values.byteLength);
        _nulls && (size += _nulls.byteLength);
        _typeIds && (size += _typeIds.byteLength);
        return children.reduce((size, child) => size + child.byteLength, size);
    }
    /**
     * @returns The aggregate number of rows that have been reserved to write new values.
     */
    get reservedLength() {
        return this._nulls.reservedLength;
    }
    /**
     * @returns The aggregate length (in bytes) that has been reserved to write new values.
     */
    get reservedByteLength() {
        let size = 0;
        this._offsets && (size += this._offsets.reservedByteLength);
        this._values && (size += this._values.reservedByteLength);
        this._nulls && (size += this._nulls.reservedByteLength);
        this._typeIds && (size += this._typeIds.reservedByteLength);
        return this.children.reduce((size, child) => size + child.reservedByteLength, size);
    }
    get valueOffsets() { return this._offsets ? this._offsets.buffer : null; }
    get values() { return this._values ? this._values.buffer : null; }
    get nullBitmap() { return this._nulls ? this._nulls.buffer : null; }
    get typeIds() { return this._typeIds ? this._typeIds.buffer : null; }
    /**
     * Appends a value (or null) to this `Builder`.
     * This is equivalent to `builder.set(builder.length, value)`.
     * @param {T['TValue'] | TNull } value The value to append.
     */
    append(value) { return this.set(this.length, value); }
    /**
     * Validates whether a value is valid (true), or null (false)
     * @param {T['TValue'] | TNull } value The value to compare against null the value representations
     */
    isValid(value) { return this._isValid(value); }
    /**
     * Write a value (or null-value sentinel) at the supplied index.
     * If the value matches one of the null-value representations, a 1-bit is
     * written to the null `BitmapBufferBuilder`. Otherwise, a 0 is written to
     * the null `BitmapBufferBuilder`, and the value is passed to
     * `Builder.prototype.setValue()`.
     * @param {number} index The index of the value to write.
     * @param {T['TValue'] | TNull } value The value to write at the supplied index.
     * @returns {this} The updated `Builder` instance.
     */
    set(index, value) {
        if (this.setValid(index, this.isValid(value))) {
            this.setValue(index, value);
        }
        return this;
    }
    /**
     * Write a value to the underlying buffers at the supplied index, bypassing
     * the null-value check. This is a low-level method that
     * @param {number} index
     * @param {T['TValue'] | TNull } value
     */
    setValue(index, value) { this._setValue(this, index, value); }
    setValid(index, valid) {
        this.length = this._nulls.set(index, +valid).length;
        return valid;
    }
    // @ts-ignore
    addChild(child, name = `${this.numChildren}`) {
        throw new Error(`Cannot append children to non-nested type "${this.type}"`);
    }
    /**
     * Retrieve the child `Builder` at the supplied `index`, or null if no child
     * exists at that index.
     * @param {number} index The index of the child `Builder` to retrieve.
     * @returns {Builder | null} The child Builder at the supplied index or null.
     */
    getChildAt(index) {
        return this.children[index] || null;
    }
    /**
     * Commit all the values that have been written to their underlying
     * ArrayBuffers, including any child Builders if applicable, and reset
     * the internal `Builder` state.
     * @returns A `Data<T>` of the buffers and children representing the values written.
     */
    flush() {
        let data;
        let typeIds;
        let nullBitmap;
        let valueOffsets;
        const { type, length, nullCount, _typeIds, _offsets, _values, _nulls } = this;
        if (typeIds = _typeIds === null || _typeIds === void 0 ? void 0 : _typeIds.flush(length)) { // Unions, DenseUnions
            valueOffsets = _offsets === null || _offsets === void 0 ? void 0 : _offsets.flush(length);
        }
        else if (valueOffsets = _offsets === null || _offsets === void 0 ? void 0 : _offsets.flush(length)) { // Variable-width primitives (Binary, LargeBinary, Utf8, LargeUtf8), and Lists
            data = _values === null || _values === void 0 ? void 0 : _values.flush(_offsets.last());
        }
        else { // Fixed-width primitives (Int, Float, Decimal, Time, Timestamp, Duration and Interval)
            data = _values === null || _values === void 0 ? void 0 : _values.flush(length);
        }
        if (nullCount > 0) {
            nullBitmap = _nulls === null || _nulls === void 0 ? void 0 : _nulls.flush(length);
        }
        const children = this.children.map((child) => child.flush());
        this.clear();
        return data_makeData({
            type, length, nullCount,
            children, 'child': children[0],
            data, typeIds, nullBitmap, valueOffsets,
        });
    }
    /**
     * Finalize this `Builder`, and child builders if applicable.
     * @returns {this} The finalized `Builder` instance.
     */
    finish() {
        this.finished = true;
        for (const child of this.children)
            child.finish();
        return this;
    }
    /**
     * Clear this Builder's internal state, including child Builders if applicable, and reset the length to 0.
     * @returns {this} The cleared `Builder` instance.
     */
    clear() {
        var _a, _b, _c, _d;
        this.length = 0;
        (_a = this._nulls) === null || _a === void 0 ? void 0 : _a.clear();
        (_b = this._values) === null || _b === void 0 ? void 0 : _b.clear();
        (_c = this._offsets) === null || _c === void 0 ? void 0 : _c.clear();
        (_d = this._typeIds) === null || _d === void 0 ? void 0 : _d.clear();
        for (const child of this.children)
            child.clear();
        return this;
    }
}
Builder.prototype.length = 1;
Builder.prototype.stride = 1;
Builder.prototype.children = null;
Builder.prototype.finished = false;
Builder.prototype.nullValues = null;
Builder.prototype._isValid = () => true;
/** @ignore */
class FixedWidthBuilder extends Builder {
    constructor(opts) {
        super(opts);
        this._values = new DataBufferBuilder(this.ArrayType, 0, this.stride);
    }
    setValue(index, value) {
        const values = this._values;
        values.reserve(index - values.length + 1);
        return super.setValue(index, value);
    }
}
/** @ignore */
class VariableWidthBuilder extends Builder {
    constructor(opts) {
        super(opts);
        this._pendingLength = 0;
        this._offsets = new OffsetsBufferBuilder(opts.type);
    }
    setValue(index, value) {
        const pending = this._pending || (this._pending = new Map());
        const current = pending.get(index);
        current && (this._pendingLength -= current.length);
        this._pendingLength += (value instanceof MapRow) ? value[kKeys].length : value.length;
        pending.set(index, value);
    }
    setValid(index, isValid) {
        if (!super.setValid(index, isValid)) {
            (this._pending || (this._pending = new Map())).set(index, undefined);
            return false;
        }
        return true;
    }
    clear() {
        this._pendingLength = 0;
        this._pending = undefined;
        return super.clear();
    }
    flush() {
        this._flush();
        return super.flush();
    }
    finish() {
        this._flush();
        return super.finish();
    }
    _flush() {
        const pending = this._pending;
        const pendingLength = this._pendingLength;
        this._pendingLength = 0;
        this._pending = undefined;
        if (pending && pending.size > 0) {
            this._flushPending(pending, pendingLength);
        }
        return this;
    }
}

//# sourceMappingURL=builder.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/message-header.mjs
// automatically generated by the FlatBuffers compiler, do not modify





/**
 * ----------------------------------------------------------------------
 * The root Message type
 * This union enables us to easily send different message types without
 * redundant storage, and in the future we can easily add new message types.
 *
 * Arrow implementations do not need to implement all of the message types,
 * which may include experimental metadata types. For maximum compatibility,
 * it is best to send data using RecordBatch
 */
var MessageHeader;
(function (MessageHeader) {
    MessageHeader[MessageHeader["NONE"] = 0] = "NONE";
    MessageHeader[MessageHeader["Schema"] = 1] = "Schema";
    MessageHeader[MessageHeader["DictionaryBatch"] = 2] = "DictionaryBatch";
    MessageHeader[MessageHeader["RecordBatch"] = 3] = "RecordBatch";
    MessageHeader[MessageHeader["Tensor"] = 4] = "Tensor";
    MessageHeader[MessageHeader["SparseTensor"] = 5] = "SparseTensor";
})(MessageHeader || (MessageHeader = {}));
function unionToMessageHeader(type, accessor) {
    switch (MessageHeader[type]) {
        case 'NONE': return null;
        case 'Schema': return accessor(new Schema());
        case 'DictionaryBatch': return accessor(new DictionaryBatch());
        case 'RecordBatch': return accessor(new RecordBatch());
        case 'Tensor': return accessor(new Tensor());
        case 'SparseTensor': return accessor(new SparseTensor());
        default: return null;
    }
}
function unionListToMessageHeader(type, accessor, index) {
    switch (MessageHeader[type]) {
        case 'NONE': return null;
        case 'Schema': return accessor(index, new Schema());
        case 'DictionaryBatch': return accessor(index, new DictionaryBatch());
        case 'RecordBatch': return accessor(index, new RecordBatch());
        case 'Tensor': return accessor(index, new Tensor());
        case 'SparseTensor': return accessor(index, new SparseTensor());
        default: return null;
    }
}

//# sourceMappingURL=message-header.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/block.mjs
// automatically generated by the FlatBuffers compiler, do not modify
class Block {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    /**
     * Index to the start of the RecordBlock (note this is past the Message header)
     */
    offset() {
        return this.bb.readInt64(this.bb_pos);
    }
    /**
     * Length of the metadata
     */
    metaDataLength() {
        return this.bb.readInt32(this.bb_pos + 8);
    }
    /**
     * Length of the data (this is aligned so there can be a gap between this and
     * the metadata).
     */
    bodyLength() {
        return this.bb.readInt64(this.bb_pos + 16);
    }
    static sizeOf() {
        return 24;
    }
    static createBlock(builder, offset, metaDataLength, bodyLength) {
        builder.prep(8, 24);
        builder.writeInt64(BigInt(bodyLength !== null && bodyLength !== void 0 ? bodyLength : 0));
        builder.pad(4);
        builder.writeInt32(metaDataLength);
        builder.writeInt64(BigInt(offset !== null && offset !== void 0 ? offset : 0));
        return builder.offset();
    }
}

//# sourceMappingURL=block.mjs.map

// EXTERNAL MODULE: ./node_modules/flatbuffers/js/flatbuffers.js
var flatbuffers = __webpack_require__(96558);
;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/key-value.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * ----------------------------------------------------------------------
 * user defined key value pairs to add custom metadata to arrow
 * key namespacing is the responsibility of the user
 */
class KeyValue {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsKeyValue(bb, obj) {
        return (obj || new KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsKeyValue(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    key(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    value(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startKeyValue(builder) {
        builder.startObject(2);
    }
    static addKey(builder, keyOffset) {
        builder.addFieldOffset(0, keyOffset, 0);
    }
    static addValue(builder, valueOffset) {
        builder.addFieldOffset(1, valueOffset, 0);
    }
    static endKeyValue(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createKeyValue(builder, keyOffset, valueOffset) {
        KeyValue.startKeyValue(builder);
        KeyValue.addKey(builder, keyOffset);
        KeyValue.addValue(builder, valueOffset);
        return KeyValue.endKeyValue(builder);
    }
}

//# sourceMappingURL=key-value.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/metadata-version.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * Logical types, vector layouts, and schemas
 * Format Version History.
 * Version 1.0 - Forward and backwards compatibility guaranteed.
 * Version 1.1 - Add Decimal256.
 * Version 1.2 - Add Interval MONTH_DAY_NANO.
 * Version 1.3 - Add Run-End Encoded.
 */
var MetadataVersion;
(function (MetadataVersion) {
    /**
     * 0.1.0 (October 2016).
     */
    MetadataVersion[MetadataVersion["V1"] = 0] = "V1";
    /**
     * 0.2.0 (February 2017). Non-backwards compatible with V1.
     */
    MetadataVersion[MetadataVersion["V2"] = 1] = "V2";
    /**
     * 0.3.0 -> 0.7.1 (May - December 2017). Non-backwards compatible with V2.
     */
    MetadataVersion[MetadataVersion["V3"] = 2] = "V3";
    /**
     * >= 0.8.0 (December 2017). Non-backwards compatible with V3.
     */
    MetadataVersion[MetadataVersion["V4"] = 3] = "V4";
    /**
     * >= 1.0.0 (July 2020. Backwards compatible with V4 (V5 readers can read V4
     * metadata and IPC messages). Implementations are recommended to provide a
     * V4 compatibility mode with V5 format changes disabled.
     *
     * Incompatible changes between V4 and V5:
     * - Union buffer layout has changed. In V5, Unions don't have a validity
     *   bitmap buffer.
     */
    MetadataVersion[MetadataVersion["V5"] = 4] = "V5";
})(MetadataVersion || (MetadataVersion = {}));

//# sourceMappingURL=metadata-version.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/endianness.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * ----------------------------------------------------------------------
 * Endianness of the platform producing the data
 */
var Endianness;
(function (Endianness) {
    Endianness[Endianness["Little"] = 0] = "Little";
    Endianness[Endianness["Big"] = 1] = "Big";
})(Endianness || (Endianness = {}));

//# sourceMappingURL=endianness.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/dictionary-kind.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * ----------------------------------------------------------------------
 * Dictionary encoding metadata
 * Maintained for forwards compatibility, in the future
 * Dictionaries might be explicit maps between integers and values
 * allowing for non-contiguous index values
 */
var DictionaryKind;
(function (DictionaryKind) {
    DictionaryKind[DictionaryKind["DenseArray"] = 0] = "DenseArray";
})(DictionaryKind || (DictionaryKind = {}));

//# sourceMappingURL=dictionary-kind.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/int.mjs
// automatically generated by the FlatBuffers compiler, do not modify

class int_Int {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsInt(bb, obj) {
        return (obj || new int_Int()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsInt(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new int_Int()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    bitWidth() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    isSigned() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    static startInt(builder) {
        builder.startObject(2);
    }
    static addBitWidth(builder, bitWidth) {
        builder.addFieldInt32(0, bitWidth, 0);
    }
    static addIsSigned(builder, isSigned) {
        builder.addFieldInt8(1, +isSigned, +false);
    }
    static endInt(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createInt(builder, bitWidth, isSigned) {
        int_Int.startInt(builder);
        int_Int.addBitWidth(builder, bitWidth);
        int_Int.addIsSigned(builder, isSigned);
        return int_Int.endInt(builder);
    }
}

//# sourceMappingURL=int.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/dictionary-encoding.mjs
// automatically generated by the FlatBuffers compiler, do not modify



class DictionaryEncoding {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDictionaryEncoding(bb, obj) {
        return (obj || new DictionaryEncoding()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDictionaryEncoding(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new DictionaryEncoding()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * The known dictionary id in the application where this data is used. In
     * the file or streaming formats, the dictionary ids are found in the
     * DictionaryBatch messages
     */
    id() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    /**
     * The dictionary indices are constrained to be non-negative integers. If
     * this field is null, the indices must be signed int32. To maximize
     * cross-language compatibility and performance, implementations are
     * recommended to prefer signed integer types over unsigned integer types
     * and to avoid uint64 indices unless they are required by an application.
     */
    indexType(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new int_Int()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    /**
     * By default, dictionaries are not ordered, or the order does not have
     * semantic meaning. In some statistical, applications, dictionary-encoding
     * is used to represent ordered categorical data, and we provide a way to
     * preserve that metadata here
     */
    isOrdered() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    dictionaryKind() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : DictionaryKind.DenseArray;
    }
    static startDictionaryEncoding(builder) {
        builder.startObject(4);
    }
    static addId(builder, id) {
        builder.addFieldInt64(0, id, BigInt('0'));
    }
    static addIndexType(builder, indexTypeOffset) {
        builder.addFieldOffset(1, indexTypeOffset, 0);
    }
    static addIsOrdered(builder, isOrdered) {
        builder.addFieldInt8(2, +isOrdered, +false);
    }
    static addDictionaryKind(builder, dictionaryKind) {
        builder.addFieldInt16(3, dictionaryKind, DictionaryKind.DenseArray);
    }
    static endDictionaryEncoding(builder) {
        const offset = builder.endObject();
        return offset;
    }
}

//# sourceMappingURL=dictionary-encoding.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/type.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */


























/**
 * ----------------------------------------------------------------------
 * Top-level Type value, enabling extensible type-specific metadata. We can
 * add new logical types to Type without breaking backwards compatibility
 */
var type_Type;
(function (Type) {
    Type[Type["NONE"] = 0] = "NONE";
    Type[Type["Null"] = 1] = "Null";
    Type[Type["Int"] = 2] = "Int";
    Type[Type["FloatingPoint"] = 3] = "FloatingPoint";
    Type[Type["Binary"] = 4] = "Binary";
    Type[Type["Utf8"] = 5] = "Utf8";
    Type[Type["Bool"] = 6] = "Bool";
    Type[Type["Decimal"] = 7] = "Decimal";
    Type[Type["Date"] = 8] = "Date";
    Type[Type["Time"] = 9] = "Time";
    Type[Type["Timestamp"] = 10] = "Timestamp";
    Type[Type["Interval"] = 11] = "Interval";
    Type[Type["List"] = 12] = "List";
    Type[Type["Struct_"] = 13] = "Struct_";
    Type[Type["Union"] = 14] = "Union";
    Type[Type["FixedSizeBinary"] = 15] = "FixedSizeBinary";
    Type[Type["FixedSizeList"] = 16] = "FixedSizeList";
    Type[Type["Map"] = 17] = "Map";
    Type[Type["Duration"] = 18] = "Duration";
    Type[Type["LargeBinary"] = 19] = "LargeBinary";
    Type[Type["LargeUtf8"] = 20] = "LargeUtf8";
    Type[Type["LargeList"] = 21] = "LargeList";
    Type[Type["RunEndEncoded"] = 22] = "RunEndEncoded";
    Type[Type["BinaryView"] = 23] = "BinaryView";
    Type[Type["Utf8View"] = 24] = "Utf8View";
    Type[Type["ListView"] = 25] = "ListView";
    Type[Type["LargeListView"] = 26] = "LargeListView";
})(type_Type || (type_Type = {}));
function unionToType(type, accessor) {
    switch (type_Type[type]) {
        case 'NONE': return null;
        case 'Null': return accessor(new Null());
        case 'Int': return accessor(new Int());
        case 'FloatingPoint': return accessor(new FloatingPoint());
        case 'Binary': return accessor(new Binary());
        case 'Utf8': return accessor(new Utf8());
        case 'Bool': return accessor(new Bool());
        case 'Decimal': return accessor(new Decimal());
        case 'Date': return accessor(new Date());
        case 'Time': return accessor(new Time());
        case 'Timestamp': return accessor(new Timestamp());
        case 'Interval': return accessor(new Interval());
        case 'List': return accessor(new List());
        case 'Struct_': return accessor(new Struct_());
        case 'Union': return accessor(new Union());
        case 'FixedSizeBinary': return accessor(new FixedSizeBinary());
        case 'FixedSizeList': return accessor(new FixedSizeList());
        case 'Map': return accessor(new Map());
        case 'Duration': return accessor(new Duration());
        case 'LargeBinary': return accessor(new LargeBinary());
        case 'LargeUtf8': return accessor(new LargeUtf8());
        case 'LargeList': return accessor(new LargeList());
        case 'RunEndEncoded': return accessor(new RunEndEncoded());
        case 'BinaryView': return accessor(new BinaryView());
        case 'Utf8View': return accessor(new Utf8View());
        case 'ListView': return accessor(new ListView());
        case 'LargeListView': return accessor(new LargeListView());
        default: return null;
    }
}
function unionListToType(type, accessor, index) {
    switch (type_Type[type]) {
        case 'NONE': return null;
        case 'Null': return accessor(index, new Null());
        case 'Int': return accessor(index, new Int());
        case 'FloatingPoint': return accessor(index, new FloatingPoint());
        case 'Binary': return accessor(index, new Binary());
        case 'Utf8': return accessor(index, new Utf8());
        case 'Bool': return accessor(index, new Bool());
        case 'Decimal': return accessor(index, new Decimal());
        case 'Date': return accessor(index, new Date());
        case 'Time': return accessor(index, new Time());
        case 'Timestamp': return accessor(index, new Timestamp());
        case 'Interval': return accessor(index, new Interval());
        case 'List': return accessor(index, new List());
        case 'Struct_': return accessor(index, new Struct_());
        case 'Union': return accessor(index, new Union());
        case 'FixedSizeBinary': return accessor(index, new FixedSizeBinary());
        case 'FixedSizeList': return accessor(index, new FixedSizeList());
        case 'Map': return accessor(index, new Map());
        case 'Duration': return accessor(index, new Duration());
        case 'LargeBinary': return accessor(index, new LargeBinary());
        case 'LargeUtf8': return accessor(index, new LargeUtf8());
        case 'LargeList': return accessor(index, new LargeList());
        case 'RunEndEncoded': return accessor(index, new RunEndEncoded());
        case 'BinaryView': return accessor(index, new BinaryView());
        case 'Utf8View': return accessor(index, new Utf8View());
        case 'ListView': return accessor(index, new ListView());
        case 'LargeListView': return accessor(index, new LargeListView());
        default: return null;
    }
}

//# sourceMappingURL=type.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/field.mjs
// automatically generated by the FlatBuffers compiler, do not modify




/**
 * ----------------------------------------------------------------------
 * A field represents a named column in a record / row batch or child of a
 * nested type.
 */
class field_Field {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsField(bb, obj) {
        return (obj || new field_Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsField(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new field_Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    /**
     * Whether or not this field can contain nulls. Should be true in general.
     */
    nullable() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    typeType() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : type_Type.NONE;
    }
    /**
     * This is the type of the decoded value if the field is dictionary encoded.
     */
    type(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
    }
    /**
     * Present only if the field is dictionary encoded.
     */
    dictionary(obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new DictionaryEncoding()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    /**
     * children apply only to nested data types like Struct, List and Union. For
     * primitive types children will have length 0.
     */
    children(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new field_Field()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    childrenLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    /**
     * User-defined metadata
     */
    customMetadata(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    customMetadataLength() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startField(builder) {
        builder.startObject(7);
    }
    static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
    }
    static addNullable(builder, nullable) {
        builder.addFieldInt8(1, +nullable, +false);
    }
    static addTypeType(builder, typeType) {
        builder.addFieldInt8(2, typeType, type_Type.NONE);
    }
    static addType(builder, typeOffset) {
        builder.addFieldOffset(3, typeOffset, 0);
    }
    static addDictionary(builder, dictionaryOffset) {
        builder.addFieldOffset(4, dictionaryOffset, 0);
    }
    static addChildren(builder, childrenOffset) {
        builder.addFieldOffset(5, childrenOffset, 0);
    }
    static createChildrenVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startChildrenVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addCustomMetadata(builder, customMetadataOffset) {
        builder.addFieldOffset(6, customMetadataOffset, 0);
    }
    static createCustomMetadataVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCustomMetadataVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endField(builder) {
        const offset = builder.endObject();
        return offset;
    }
}

//# sourceMappingURL=field.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/schema.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */




/**
 * ----------------------------------------------------------------------
 * A Schema describes the columns in a row batch
 */
class schema_Schema {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsSchema(bb, obj) {
        return (obj || new schema_Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsSchema(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new schema_Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * endianness of the buffer
     * it is Little Endian by default
     * if endianness doesn't match the underlying system then the vectors need to be converted
     */
    endianness() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : Endianness.Little;
    }
    fields(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new field_Field()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    fieldsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    customMetadata(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    customMetadataLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    /**
     * Features used in the stream/file.
     */
    features(index) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt64(this.bb.__vector(this.bb_pos + offset) + index * 8) : BigInt(0);
    }
    featuresLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startSchema(builder) {
        builder.startObject(4);
    }
    static addEndianness(builder, endianness) {
        builder.addFieldInt16(0, endianness, Endianness.Little);
    }
    static addFields(builder, fieldsOffset) {
        builder.addFieldOffset(1, fieldsOffset, 0);
    }
    static createFieldsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startFieldsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addCustomMetadata(builder, customMetadataOffset) {
        builder.addFieldOffset(2, customMetadataOffset, 0);
    }
    static createCustomMetadataVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCustomMetadataVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addFeatures(builder, featuresOffset) {
        builder.addFieldOffset(3, featuresOffset, 0);
    }
    static createFeaturesVector(builder, data) {
        builder.startVector(8, data.length, 8);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addInt64(data[i]);
        }
        return builder.endVector();
    }
    static startFeaturesVector(builder, numElems) {
        builder.startVector(8, numElems, 8);
    }
    static endSchema(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createSchema(builder, endianness, fieldsOffset, customMetadataOffset, featuresOffset) {
        schema_Schema.startSchema(builder);
        schema_Schema.addEndianness(builder, endianness);
        schema_Schema.addFields(builder, fieldsOffset);
        schema_Schema.addCustomMetadata(builder, customMetadataOffset);
        schema_Schema.addFeatures(builder, featuresOffset);
        return schema_Schema.endSchema(builder);
    }
}

//# sourceMappingURL=schema.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/footer.mjs
// automatically generated by the FlatBuffers compiler, do not modify





/**
 * ----------------------------------------------------------------------
 * Arrow File metadata
 *
 */
class Footer {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsFooter(bb, obj) {
        return (obj || new Footer()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsFooter(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new Footer()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    version() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : MetadataVersion.V1;
    }
    schema(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new schema_Schema()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    dictionaries(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new Block()).__init(this.bb.__vector(this.bb_pos + offset) + index * 24, this.bb) : null;
    }
    dictionariesLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    recordBatches(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new Block()).__init(this.bb.__vector(this.bb_pos + offset) + index * 24, this.bb) : null;
    }
    recordBatchesLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    /**
     * User-defined metadata
     */
    customMetadata(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    customMetadataLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startFooter(builder) {
        builder.startObject(5);
    }
    static addVersion(builder, version) {
        builder.addFieldInt16(0, version, MetadataVersion.V1);
    }
    static addSchema(builder, schemaOffset) {
        builder.addFieldOffset(1, schemaOffset, 0);
    }
    static addDictionaries(builder, dictionariesOffset) {
        builder.addFieldOffset(2, dictionariesOffset, 0);
    }
    static startDictionariesVector(builder, numElems) {
        builder.startVector(24, numElems, 8);
    }
    static addRecordBatches(builder, recordBatchesOffset) {
        builder.addFieldOffset(3, recordBatchesOffset, 0);
    }
    static startRecordBatchesVector(builder, numElems) {
        builder.startVector(24, numElems, 8);
    }
    static addCustomMetadata(builder, customMetadataOffset) {
        builder.addFieldOffset(4, customMetadataOffset, 0);
    }
    static createCustomMetadataVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCustomMetadataVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endFooter(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static finishFooterBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedFooterBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
}

//# sourceMappingURL=footer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/schema.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
const kSchemaSymbol = Symbol.for('apache-arrow/Schema');
/** @ignore */
const kFieldSymbol = Symbol.for('apache-arrow/Field');
class apache_arrow_schema_Schema {
    /**
     * Check if an object is an instance of Schema.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isSchema(x) {
        return (x === null || x === void 0 ? void 0 : x[kSchemaSymbol]) === true;
    }
    constructor(fields = [], metadata, dictionaries, metadataVersion = MetadataVersion.V5) {
        this.fields = (fields || []);
        this.metadata = metadata || new Map();
        if (!dictionaries) {
            dictionaries = generateDictionaryMap(this.fields);
        }
        this.dictionaries = dictionaries;
        this.metadataVersion = metadataVersion;
    }
    get [Symbol.toStringTag]() { return 'Schema'; }
    get names() { return this.fields.map((f) => f.name); }
    toString() {
        return `Schema<{ ${this.fields.map((f, i) => `${i}: ${f}`).join(', ')} }>`;
    }
    /**
     * Construct a new Schema containing only specified fields.
     *
     * @param fieldNames Names of fields to keep.
     * @returns A new Schema of fields matching the specified names.
     */
    select(fieldNames) {
        const names = new Set(fieldNames);
        const fields = this.fields.filter((f) => names.has(f.name));
        return new apache_arrow_schema_Schema(fields, this.metadata);
    }
    /**
     * Construct a new Schema containing only fields at the specified indices.
     *
     * @param fieldIndices Indices of fields to keep.
     * @returns A new Schema of fields at the specified indices.
     */
    selectAt(fieldIndices) {
        const fields = fieldIndices.map((i) => this.fields[i]).filter(Boolean);
        return new apache_arrow_schema_Schema(fields, this.metadata);
    }
    assign(...args) {
        const other = (args[0] instanceof apache_arrow_schema_Schema
            ? args[0]
            : Array.isArray(args[0])
                ? new apache_arrow_schema_Schema(args[0])
                : new apache_arrow_schema_Schema(args));
        const curFields = [...this.fields];
        const metadata = mergeMaps(mergeMaps(new Map(), this.metadata), other.metadata);
        const newFields = other.fields.filter((f2) => {
            const i = curFields.findIndex((f) => f.name === f2.name);
            return ~i ? (curFields[i] = f2.clone({
                metadata: mergeMaps(mergeMaps(new Map(), curFields[i].metadata), f2.metadata)
            })) && false : true;
        });
        const newDictionaries = generateDictionaryMap(newFields, new Map());
        return new apache_arrow_schema_Schema([...curFields, ...newFields], metadata, new Map([...this.dictionaries, ...newDictionaries]));
    }
}
// Add these here so they're picked up by the externs creator
// in the build, and closure-compiler doesn't minify them away
apache_arrow_schema_Schema.prototype.fields = null;
apache_arrow_schema_Schema.prototype.metadata = null;
apache_arrow_schema_Schema.prototype.dictionaries = null;
apache_arrow_schema_Schema.prototype[kSchemaSymbol] = true;
Object.defineProperty(apache_arrow_schema_Schema, Symbol.hasInstance, {
    value: function isSchemaInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === apache_arrow_schema_Schema && apache_arrow_schema_Schema.isSchema(instance));
    },
});
class schema_Field {
    /**
     * Check if an object is an instance of Field.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isField(x) {
        return (x === null || x === void 0 ? void 0 : x[kFieldSymbol]) === true;
    }
    /** @nocollapse */
    static new(...args) {
        let [name, type, nullable, metadata] = args;
        if (args[0] && typeof args[0] === 'object') {
            ({ name } = args[0]);
            (type === undefined) && (type = args[0].type);
            (nullable === undefined) && (nullable = args[0].nullable);
            (metadata === undefined) && (metadata = args[0].metadata);
        }
        return new schema_Field(`${name}`, type, nullable, metadata);
    }
    constructor(name, type, nullable = false, metadata) {
        this.name = name;
        this.type = type;
        this.nullable = nullable;
        this.metadata = metadata || new Map();
    }
    get typeId() { return this.type.typeId; }
    get [Symbol.toStringTag]() { return 'Field'; }
    toString() { return `${this.name}: ${this.type}`; }
    clone(...args) {
        let [name, type, nullable, metadata] = args;
        (!args[0] || typeof args[0] !== 'object')
            ? ([name = this.name, type = this.type, nullable = this.nullable, metadata = this.metadata] = args)
            : ({ name = this.name, type = this.type, nullable = this.nullable, metadata = this.metadata } = args[0]);
        return schema_Field.new(name, type, nullable, metadata);
    }
}
// Add these here so they're picked up by the externs creator
// in the build, and closure-compiler doesn't minify them away
schema_Field.prototype.type = null;
schema_Field.prototype.name = null;
schema_Field.prototype.nullable = null;
schema_Field.prototype.metadata = null;
schema_Field.prototype[kFieldSymbol] = true;
Object.defineProperty(schema_Field, Symbol.hasInstance, {
    value: function isFieldInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === schema_Field && schema_Field.isField(instance));
    },
});
/** @ignore */
function mergeMaps(m1, m2) {
    return new Map([...(m1 || new Map()), ...(m2 || new Map())]);
}
/** @ignore */
function generateDictionaryMap(fields, dictionaries = new Map()) {
    for (let i = -1, n = fields.length; ++i < n;) {
        const field = fields[i];
        const type = field.type;
        if (type_DataType.isDictionary(type)) {
            if (!dictionaries.has(type.id)) {
                dictionaries.set(type.id, type.dictionary);
            }
            else if (dictionaries.get(type.id) !== type.dictionary) {
                throw new Error(`Cannot create Schema containing two different dictionaries with the same Id`);
            }
        }
        if (type.children && type.children.length > 0) {
            generateDictionaryMap(type.children, dictionaries);
        }
    }
    return dictionaries;
}

//# sourceMappingURL=schema.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/metadata/file.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



var file_Builder = flatbuffers/* Builder */.M$;
var ByteBuffer = flatbuffers/* ByteBuffer */.$F;




/** @ignore */
class Footer_ {
    /** @nocollapse */
    static decode(buf) {
        buf = new ByteBuffer(toUint8Array(buf));
        const footer = Footer.getRootAsFooter(buf);
        const schema = apache_arrow_schema_Schema.decode(footer.schema(), new Map(), footer.version());
        return new OffHeapFooter(schema, footer);
    }
    /** @nocollapse */
    static encode(footer) {
        const b = new file_Builder();
        const schemaOffset = apache_arrow_schema_Schema.encode(b, footer.schema);
        Footer.startRecordBatchesVector(b, footer.numRecordBatches);
        for (const rb of [...footer.recordBatches()].slice().reverse()) {
            FileBlock.encode(b, rb);
        }
        const recordBatchesOffset = b.endVector();
        Footer.startDictionariesVector(b, footer.numDictionaries);
        for (const db of [...footer.dictionaryBatches()].slice().reverse()) {
            FileBlock.encode(b, db);
        }
        const dictionaryBatchesOffset = b.endVector();
        Footer.startFooter(b);
        Footer.addSchema(b, schemaOffset);
        Footer.addVersion(b, MetadataVersion.V5);
        Footer.addRecordBatches(b, recordBatchesOffset);
        Footer.addDictionaries(b, dictionaryBatchesOffset);
        Footer.finishFooterBuffer(b, Footer.endFooter(b));
        return b.asUint8Array();
    }
    get numRecordBatches() { return this._recordBatches.length; }
    get numDictionaries() { return this._dictionaryBatches.length; }
    constructor(schema, version = MetadataVersion.V5, recordBatches, dictionaryBatches) {
        this.schema = schema;
        this.version = version;
        recordBatches && (this._recordBatches = recordBatches);
        dictionaryBatches && (this._dictionaryBatches = dictionaryBatches);
    }
    *recordBatches() {
        for (let block, i = -1, n = this.numRecordBatches; ++i < n;) {
            if (block = this.getRecordBatch(i)) {
                yield block;
            }
        }
    }
    *dictionaryBatches() {
        for (let block, i = -1, n = this.numDictionaries; ++i < n;) {
            if (block = this.getDictionaryBatch(i)) {
                yield block;
            }
        }
    }
    getRecordBatch(index) {
        return index >= 0
            && index < this.numRecordBatches
            && this._recordBatches[index] || null;
    }
    getDictionaryBatch(index) {
        return index >= 0
            && index < this.numDictionaries
            && this._dictionaryBatches[index] || null;
    }
}

/** @ignore */
class OffHeapFooter extends Footer_ {
    get numRecordBatches() { return this._footer.recordBatchesLength(); }
    get numDictionaries() { return this._footer.dictionariesLength(); }
    constructor(schema, _footer) {
        super(schema, _footer.version());
        this._footer = _footer;
    }
    getRecordBatch(index) {
        if (index >= 0 && index < this.numRecordBatches) {
            const fileBlock = this._footer.recordBatches(index);
            if (fileBlock) {
                return FileBlock.decode(fileBlock);
            }
        }
        return null;
    }
    getDictionaryBatch(index) {
        if (index >= 0 && index < this.numDictionaries) {
            const fileBlock = this._footer.dictionaries(index);
            if (fileBlock) {
                return FileBlock.decode(fileBlock);
            }
        }
        return null;
    }
}
/** @ignore */
class FileBlock {
    /** @nocollapse */
    static decode(block) {
        return new FileBlock(block.metaDataLength(), block.bodyLength(), block.offset());
    }
    /** @nocollapse */
    static encode(b, fileBlock) {
        const { metaDataLength } = fileBlock;
        const offset = BigInt(fileBlock.offset);
        const bodyLength = BigInt(fileBlock.bodyLength);
        return Block.createBlock(b, offset, metaDataLength, bodyLength);
    }
    constructor(metaDataLength, bodyLength, offset) {
        this.metaDataLength = metaDataLength;
        this.offset = bigIntToNumber(offset);
        this.bodyLength = bigIntToNumber(bodyLength);
    }
}

//# sourceMappingURL=file.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/body-compression-method.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * Provided for forward compatibility in case we need to support different
 * strategies for compressing the IPC message body (like whole-body
 * compression rather than buffer-level) in the future
 */
var BodyCompressionMethod;
(function (BodyCompressionMethod) {
    /**
     * Each constituent buffer is first compressed with the indicated
     * compressor, and then written with the uncompressed length in the first 8
     * bytes as a 64-bit little-endian signed integer followed by the compressed
     * buffer bytes (and then padding as required by the protocol). The
     * uncompressed length may be set to -1 to indicate that the data that
     * follows is not compressed, which can be useful for cases where
     * compression does not yield appreciable savings.
     */
    BodyCompressionMethod[BodyCompressionMethod["BUFFER"] = 0] = "BUFFER";
})(BodyCompressionMethod || (BodyCompressionMethod = {}));

//# sourceMappingURL=body-compression-method.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/compression-type.mjs
// automatically generated by the FlatBuffers compiler, do not modify
var CompressionType;
(function (CompressionType) {
    CompressionType[CompressionType["LZ4_FRAME"] = 0] = "LZ4_FRAME";
    CompressionType[CompressionType["ZSTD"] = 1] = "ZSTD";
})(CompressionType || (CompressionType = {}));

//# sourceMappingURL=compression-type.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/body-compression.mjs
// automatically generated by the FlatBuffers compiler, do not modify



/**
 * Optional compression for the memory buffers constituting IPC message
 * bodies. Intended for use with RecordBatch but could be used for other
 * message types
 */
class BodyCompression {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsBodyCompression(bb, obj) {
        return (obj || new BodyCompression()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsBodyCompression(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new BodyCompression()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Compressor library.
     * For LZ4_FRAME, each compressed buffer must consist of a single frame.
     */
    codec() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : CompressionType.LZ4_FRAME;
    }
    /**
     * Indicates the way the record batch body was compressed
     */
    method() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : BodyCompressionMethod.BUFFER;
    }
    static startBodyCompression(builder) {
        builder.startObject(2);
    }
    static addCodec(builder, codec) {
        builder.addFieldInt8(0, codec, CompressionType.LZ4_FRAME);
    }
    static addMethod(builder, method) {
        builder.addFieldInt8(1, method, BodyCompressionMethod.BUFFER);
    }
    static endBodyCompression(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createBodyCompression(builder, codec, method) {
        BodyCompression.startBodyCompression(builder);
        BodyCompression.addCodec(builder, codec);
        BodyCompression.addMethod(builder, method);
        return BodyCompression.endBodyCompression(builder);
    }
}

//# sourceMappingURL=body-compression.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/buffer.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * ----------------------------------------------------------------------
 * A Buffer represents a single contiguous memory segment
 */
class Buffer {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    /**
     * The relative offset into the shared memory page where the bytes for this
     * buffer starts
     */
    offset() {
        return this.bb.readInt64(this.bb_pos);
    }
    /**
     * The absolute length (in bytes) of the memory buffer. The memory is found
     * from offset (inclusive) to offset + length (non-inclusive). When building
     * messages using the encapsulated IPC message, padding bytes may be written
     * after a buffer, but such padding bytes do not need to be accounted for in
     * the size here.
     */
    length() {
        return this.bb.readInt64(this.bb_pos + 8);
    }
    static sizeOf() {
        return 16;
    }
    static createBuffer(builder, offset, length) {
        builder.prep(8, 16);
        builder.writeInt64(BigInt(length !== null && length !== void 0 ? length : 0));
        builder.writeInt64(BigInt(offset !== null && offset !== void 0 ? offset : 0));
        return builder.offset();
    }
}

//# sourceMappingURL=buffer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/field-node.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/**
 * ----------------------------------------------------------------------
 * Data structures for describing a table row batch (a collection of
 * equal-length Arrow arrays)
 * Metadata about a field at some level of a nested type tree (but not
 * its children).
 *
 * For example, a List<Int16> with values `[[1, 2, 3], null, [4], [5, 6], null]`
 * would have {length: 5, null_count: 2} for its List node, and {length: 6,
 * null_count: 0} for its Int16 node, as separate FieldNode structs
 */
class FieldNode {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    /**
     * The number of value slots in the Arrow array at this level of a nested
     * tree
     */
    length() {
        return this.bb.readInt64(this.bb_pos);
    }
    /**
     * The number of observed nulls. Fields with null_count == 0 may choose not
     * to write their physical validity bitmap out as a materialized buffer,
     * instead setting the length of the bitmap buffer to 0.
     */
    nullCount() {
        return this.bb.readInt64(this.bb_pos + 8);
    }
    static sizeOf() {
        return 16;
    }
    static createFieldNode(builder, length, null_count) {
        builder.prep(8, 16);
        builder.writeInt64(BigInt(null_count !== null && null_count !== void 0 ? null_count : 0));
        builder.writeInt64(BigInt(length !== null && length !== void 0 ? length : 0));
        return builder.offset();
    }
}

//# sourceMappingURL=field-node.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/record-batch.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */




/**
 * A data header describing the shared memory layout of a "record" or "row"
 * batch. Some systems call this a "row batch" internally and others a "record
 * batch".
 */
class record_batch_RecordBatch {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsRecordBatch(bb, obj) {
        return (obj || new record_batch_RecordBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsRecordBatch(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new record_batch_RecordBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * number of records / rows. The arrays in the batch should all have this
     * length
     */
    length() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    /**
     * Nodes correspond to the pre-ordered flattened logical schema
     */
    nodes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new FieldNode()).__init(this.bb.__vector(this.bb_pos + offset) + index * 16, this.bb) : null;
    }
    nodesLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    /**
     * Buffers correspond to the pre-ordered flattened buffer tree
     *
     * The number of buffers appended to this list depends on the schema. For
     * example, most primitive arrays will have 2 buffers, 1 for the validity
     * bitmap and 1 for the values. For struct arrays, there will only be a
     * single buffer for the validity (nulls) bitmap
     */
    buffers(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new Buffer()).__init(this.bb.__vector(this.bb_pos + offset) + index * 16, this.bb) : null;
    }
    buffersLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    /**
     * Optional compression of the message body
     */
    compression(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new BodyCompression()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    /**
     * Some types such as Utf8View are represented using a variable number of buffers.
     * For each such Field in the pre-ordered flattened logical schema, there will be
     * an entry in variadicBufferCounts to indicate the number of number of variadic
     * buffers which belong to that Field in the current RecordBatch.
     *
     * For example, the schema
     *     col1: Struct<alpha: Int32, beta: BinaryView, gamma: Float64>
     *     col2: Utf8View
     * contains two Fields with variadic buffers so variadicBufferCounts will have
     * two entries, the first counting the variadic buffers of `col1.beta` and the
     * second counting `col2`'s.
     *
     * This field may be omitted if and only if the schema contains no Fields with
     * a variable number of buffers, such as BinaryView and Utf8View.
     */
    variadicBufferCounts(index) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt64(this.bb.__vector(this.bb_pos + offset) + index * 8) : BigInt(0);
    }
    variadicBufferCountsLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startRecordBatch(builder) {
        builder.startObject(5);
    }
    static addLength(builder, length) {
        builder.addFieldInt64(0, length, BigInt('0'));
    }
    static addNodes(builder, nodesOffset) {
        builder.addFieldOffset(1, nodesOffset, 0);
    }
    static startNodesVector(builder, numElems) {
        builder.startVector(16, numElems, 8);
    }
    static addBuffers(builder, buffersOffset) {
        builder.addFieldOffset(2, buffersOffset, 0);
    }
    static startBuffersVector(builder, numElems) {
        builder.startVector(16, numElems, 8);
    }
    static addCompression(builder, compressionOffset) {
        builder.addFieldOffset(3, compressionOffset, 0);
    }
    static addVariadicBufferCounts(builder, variadicBufferCountsOffset) {
        builder.addFieldOffset(4, variadicBufferCountsOffset, 0);
    }
    static createVariadicBufferCountsVector(builder, data) {
        builder.startVector(8, data.length, 8);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addInt64(data[i]);
        }
        return builder.endVector();
    }
    static startVariadicBufferCountsVector(builder, numElems) {
        builder.startVector(8, numElems, 8);
    }
    static endRecordBatch(builder) {
        const offset = builder.endObject();
        return offset;
    }
}

//# sourceMappingURL=record-batch.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/dictionary-batch.mjs
// automatically generated by the FlatBuffers compiler, do not modify


/**
 * For sending dictionary encoding information. Any Field can be
 * dictionary-encoded, but in this case none of its children may be
 * dictionary-encoded.
 * There is one vector / column per dictionary, but that vector / column
 * may be spread across multiple dictionary batches by using the isDelta
 * flag
 */
class dictionary_batch_DictionaryBatch {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDictionaryBatch(bb, obj) {
        return (obj || new dictionary_batch_DictionaryBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDictionaryBatch(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new dictionary_batch_DictionaryBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    id() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    data(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new record_batch_RecordBatch()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    /**
     * If isDelta is true the values in the dictionary are to be appended to a
     * dictionary with the indicated id. If isDelta is false this dictionary
     * should replace the existing dictionary.
     */
    isDelta() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    static startDictionaryBatch(builder) {
        builder.startObject(3);
    }
    static addId(builder, id) {
        builder.addFieldInt64(0, id, BigInt('0'));
    }
    static addData(builder, dataOffset) {
        builder.addFieldOffset(1, dataOffset, 0);
    }
    static addIsDelta(builder, isDelta) {
        builder.addFieldInt8(2, +isDelta, +false);
    }
    static endDictionaryBatch(builder) {
        const offset = builder.endObject();
        return offset;
    }
}

//# sourceMappingURL=dictionary-batch.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/floating-point.mjs
// automatically generated by the FlatBuffers compiler, do not modify


class floating_point_FloatingPoint {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsFloatingPoint(bb, obj) {
        return (obj || new floating_point_FloatingPoint()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsFloatingPoint(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new floating_point_FloatingPoint()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    precision() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : Precision.HALF;
    }
    static startFloatingPoint(builder) {
        builder.startObject(1);
    }
    static addPrecision(builder, precision) {
        builder.addFieldInt16(0, precision, Precision.HALF);
    }
    static endFloatingPoint(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createFloatingPoint(builder, precision) {
        floating_point_FloatingPoint.startFloatingPoint(builder);
        floating_point_FloatingPoint.addPrecision(builder, precision);
        return floating_point_FloatingPoint.endFloatingPoint(builder);
    }
}

//# sourceMappingURL=floating-point.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/decimal.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Exact decimal value represented as an integer value in two's
 * complement. Currently only 128-bit (16-byte) and 256-bit (32-byte) integers
 * are used. The representation uses the endianness indicated
 * in the Schema.
 */
class decimal_Decimal {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDecimal(bb, obj) {
        return (obj || new decimal_Decimal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDecimal(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new decimal_Decimal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Total number of decimal digits
     */
    precision() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    /**
     * Number of digits after the decimal point "."
     */
    scale() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    /**
     * Number of bits per value. The only accepted widths are 128 and 256.
     * We use bitWidth for consistency with Int::bitWidth.
     */
    bitWidth() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 128;
    }
    static startDecimal(builder) {
        builder.startObject(3);
    }
    static addPrecision(builder, precision) {
        builder.addFieldInt32(0, precision, 0);
    }
    static addScale(builder, scale) {
        builder.addFieldInt32(1, scale, 0);
    }
    static addBitWidth(builder, bitWidth) {
        builder.addFieldInt32(2, bitWidth, 128);
    }
    static endDecimal(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createDecimal(builder, precision, scale, bitWidth) {
        decimal_Decimal.startDecimal(builder);
        decimal_Decimal.addPrecision(builder, precision);
        decimal_Decimal.addScale(builder, scale);
        decimal_Decimal.addBitWidth(builder, bitWidth);
        return decimal_Decimal.endDecimal(builder);
    }
}

//# sourceMappingURL=decimal.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/date.mjs
// automatically generated by the FlatBuffers compiler, do not modify


/**
 * Date is either a 32-bit or 64-bit signed integer type representing an
 * elapsed time since UNIX epoch (1970-01-01), stored in either of two units:
 *
 * * Milliseconds (64 bits) indicating UNIX time elapsed since the epoch (no
 *   leap seconds), where the values are evenly divisible by 86400000
 * * Days (32 bits) since the UNIX epoch
 */
class date_Date {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDate(bb, obj) {
        return (obj || new date_Date()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDate(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new date_Date()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    unit() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : DateUnit.MILLISECOND;
    }
    static startDate(builder) {
        builder.startObject(1);
    }
    static addUnit(builder, unit) {
        builder.addFieldInt16(0, unit, DateUnit.MILLISECOND);
    }
    static endDate(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createDate(builder, unit) {
        date_Date.startDate(builder);
        date_Date.addUnit(builder, unit);
        return date_Date.endDate(builder);
    }
}

//# sourceMappingURL=date.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/time.mjs
// automatically generated by the FlatBuffers compiler, do not modify


/**
 * Time is either a 32-bit or 64-bit signed integer type representing an
 * elapsed time since midnight, stored in either of four units: seconds,
 * milliseconds, microseconds or nanoseconds.
 *
 * The integer `bitWidth` depends on the `unit` and must be one of the following:
 * * SECOND and MILLISECOND: 32 bits
 * * MICROSECOND and NANOSECOND: 64 bits
 *
 * The allowed values are between 0 (inclusive) and 86400 (=24*60*60) seconds
 * (exclusive), adjusted for the time unit (for example, up to 86400000
 * exclusive for the MILLISECOND unit).
 * This definition doesn't allow for leap seconds. Time values from
 * measurements with leap seconds will need to be corrected when ingesting
 * into Arrow (for example by replacing the value 86400 with 86399).
 */
class time_Time {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsTime(bb, obj) {
        return (obj || new time_Time()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsTime(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new time_Time()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    unit() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : TimeUnit.MILLISECOND;
    }
    bitWidth() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 32;
    }
    static startTime(builder) {
        builder.startObject(2);
    }
    static addUnit(builder, unit) {
        builder.addFieldInt16(0, unit, TimeUnit.MILLISECOND);
    }
    static addBitWidth(builder, bitWidth) {
        builder.addFieldInt32(1, bitWidth, 32);
    }
    static endTime(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createTime(builder, unit, bitWidth) {
        time_Time.startTime(builder);
        time_Time.addUnit(builder, unit);
        time_Time.addBitWidth(builder, bitWidth);
        return time_Time.endTime(builder);
    }
}

//# sourceMappingURL=time.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/timestamp.mjs
// automatically generated by the FlatBuffers compiler, do not modify


/**
 * Timestamp is a 64-bit signed integer representing an elapsed time since a
 * fixed epoch, stored in either of four units: seconds, milliseconds,
 * microseconds or nanoseconds, and is optionally annotated with a timezone.
 *
 * Timestamp values do not include any leap seconds (in other words, all
 * days are considered 86400 seconds long).
 *
 * Timestamps with a non-empty timezone
 * ------------------------------------
 *
 * If a Timestamp column has a non-empty timezone value, its epoch is
 * 1970-01-01 00:00:00 (January 1st 1970, midnight) in the *UTC* timezone
 * (the Unix epoch), regardless of the Timestamp's own timezone.
 *
 * Therefore, timestamp values with a non-empty timezone correspond to
 * physical points in time together with some additional information about
 * how the data was obtained and/or how to display it (the timezone).
 *
 *   For example, the timestamp value 0 with the timezone string "Europe/Paris"
 *   corresponds to "January 1st 1970, 00h00" in the UTC timezone, but the
 *   application may prefer to display it as "January 1st 1970, 01h00" in
 *   the Europe/Paris timezone (which is the same physical point in time).
 *
 * One consequence is that timestamp values with a non-empty timezone
 * can be compared and ordered directly, since they all share the same
 * well-known point of reference (the Unix epoch).
 *
 * Timestamps with an unset / empty timezone
 * -----------------------------------------
 *
 * If a Timestamp column has no timezone value, its epoch is
 * 1970-01-01 00:00:00 (January 1st 1970, midnight) in an *unknown* timezone.
 *
 * Therefore, timestamp values without a timezone cannot be meaningfully
 * interpreted as physical points in time, but only as calendar / clock
 * indications ("wall clock time") in an unspecified timezone.
 *
 *   For example, the timestamp value 0 with an empty timezone string
 *   corresponds to "January 1st 1970, 00h00" in an unknown timezone: there
 *   is not enough information to interpret it as a well-defined physical
 *   point in time.
 *
 * One consequence is that timestamp values without a timezone cannot
 * be reliably compared or ordered, since they may have different points of
 * reference.  In particular, it is *not* possible to interpret an unset
 * or empty timezone as the same as "UTC".
 *
 * Conversion between timezones
 * ----------------------------
 *
 * If a Timestamp column has a non-empty timezone, changing the timezone
 * to a different non-empty value is a metadata-only operation:
 * the timestamp values need not change as their point of reference remains
 * the same (the Unix epoch).
 *
 * However, if a Timestamp column has no timezone value, changing it to a
 * non-empty value requires to think about the desired semantics.
 * One possibility is to assume that the original timestamp values are
 * relative to the epoch of the timezone being set; timestamp values should
 * then adjusted to the Unix epoch (for example, changing the timezone from
 * empty to "Europe/Paris" would require converting the timestamp values
 * from "Europe/Paris" to "UTC", which seems counter-intuitive but is
 * nevertheless correct).
 *
 * Guidelines for encoding data from external libraries
 * ----------------------------------------------------
 *
 * Date & time libraries often have multiple different data types for temporal
 * data. In order to ease interoperability between different implementations the
 * Arrow project has some recommendations for encoding these types into a Timestamp
 * column.
 *
 * An "instant" represents a physical point in time that has no relevant timezone
 * (for example, astronomical data). To encode an instant, use a Timestamp with
 * the timezone string set to "UTC", and make sure the Timestamp values
 * are relative to the UTC epoch (January 1st 1970, midnight).
 *
 * A "zoned date-time" represents a physical point in time annotated with an
 * informative timezone (for example, the timezone in which the data was
 * recorded).  To encode a zoned date-time, use a Timestamp with the timezone
 * string set to the name of the timezone, and make sure the Timestamp values
 * are relative to the UTC epoch (January 1st 1970, midnight).
 *
 *  (There is some ambiguity between an instant and a zoned date-time with the
 *   UTC timezone.  Both of these are stored the same in Arrow.  Typically,
 *   this distinction does not matter.  If it does, then an application should
 *   use custom metadata or an extension type to distinguish between the two cases.)
 *
 * An "offset date-time" represents a physical point in time combined with an
 * explicit offset from UTC.  To encode an offset date-time, use a Timestamp
 * with the timezone string set to the numeric timezone offset string
 * (e.g. "+03:00"), and make sure the Timestamp values are relative to
 * the UTC epoch (January 1st 1970, midnight).
 *
 * A "naive date-time" (also called "local date-time" in some libraries)
 * represents a wall clock time combined with a calendar date, but with
 * no indication of how to map this information to a physical point in time.
 * Naive date-times must be handled with care because of this missing
 * information, and also because daylight saving time (DST) may make
 * some values ambiguous or nonexistent. A naive date-time may be
 * stored as a struct with Date and Time fields. However, it may also be
 * encoded into a Timestamp column with an empty timezone. The timestamp
 * values should be computed "as if" the timezone of the date-time values
 * was UTC; for example, the naive date-time "January 1st 1970, 00h00" would
 * be encoded as timestamp value 0.
 */
class timestamp_Timestamp {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsTimestamp(bb, obj) {
        return (obj || new timestamp_Timestamp()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsTimestamp(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new timestamp_Timestamp()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    unit() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : TimeUnit.SECOND;
    }
    timezone(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startTimestamp(builder) {
        builder.startObject(2);
    }
    static addUnit(builder, unit) {
        builder.addFieldInt16(0, unit, TimeUnit.SECOND);
    }
    static addTimezone(builder, timezoneOffset) {
        builder.addFieldOffset(1, timezoneOffset, 0);
    }
    static endTimestamp(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createTimestamp(builder, unit, timezoneOffset) {
        timestamp_Timestamp.startTimestamp(builder);
        timestamp_Timestamp.addUnit(builder, unit);
        timestamp_Timestamp.addTimezone(builder, timezoneOffset);
        return timestamp_Timestamp.endTimestamp(builder);
    }
}

//# sourceMappingURL=timestamp.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/interval.mjs
// automatically generated by the FlatBuffers compiler, do not modify


class interval_Interval {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsInterval(bb, obj) {
        return (obj || new interval_Interval()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsInterval(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new interval_Interval()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    unit() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : IntervalUnit.YEAR_MONTH;
    }
    static startInterval(builder) {
        builder.startObject(1);
    }
    static addUnit(builder, unit) {
        builder.addFieldInt16(0, unit, IntervalUnit.YEAR_MONTH);
    }
    static endInterval(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createInterval(builder, unit) {
        interval_Interval.startInterval(builder);
        interval_Interval.addUnit(builder, unit);
        return interval_Interval.endInterval(builder);
    }
}

//# sourceMappingURL=interval.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/duration.mjs
// automatically generated by the FlatBuffers compiler, do not modify


class duration_Duration {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDuration(bb, obj) {
        return (obj || new duration_Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDuration(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new duration_Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    unit() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : TimeUnit.MILLISECOND;
    }
    static startDuration(builder) {
        builder.startObject(1);
    }
    static addUnit(builder, unit) {
        builder.addFieldInt16(0, unit, TimeUnit.MILLISECOND);
    }
    static endDuration(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createDuration(builder, unit) {
        duration_Duration.startDuration(builder);
        duration_Duration.addUnit(builder, unit);
        return duration_Duration.endDuration(builder);
    }
}

//# sourceMappingURL=duration.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/union.mjs
// automatically generated by the FlatBuffers compiler, do not modify


/**
 * A union is a complex type with children in Field
 * By default ids in the type vector refer to the offsets in the children
 * optionally typeIds provides an indirection between the child offset and the type id
 * for each child `typeIds[offset]` is the id used in the type vector
 */
class union_Union {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsUnion(bb, obj) {
        return (obj || new union_Union()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsUnion(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new union_Union()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    mode() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : UnionMode.Sparse;
    }
    typeIds(index) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
    }
    typeIdsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    typeIdsArray() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
    }
    static startUnion(builder) {
        builder.startObject(2);
    }
    static addMode(builder, mode) {
        builder.addFieldInt16(0, mode, UnionMode.Sparse);
    }
    static addTypeIds(builder, typeIdsOffset) {
        builder.addFieldOffset(1, typeIdsOffset, 0);
    }
    static createTypeIdsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addInt32(data[i]);
        }
        return builder.endVector();
    }
    static startTypeIdsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endUnion(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createUnion(builder, mode, typeIdsOffset) {
        union_Union.startUnion(builder);
        union_Union.addMode(builder, mode);
        union_Union.addTypeIds(builder, typeIdsOffset);
        return union_Union.endUnion(builder);
    }
}

//# sourceMappingURL=union.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/fixed-size-binary.mjs
// automatically generated by the FlatBuffers compiler, do not modify

class fixed_size_binary_FixedSizeBinary {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsFixedSizeBinary(bb, obj) {
        return (obj || new fixed_size_binary_FixedSizeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsFixedSizeBinary(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new fixed_size_binary_FixedSizeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Number of bytes per value
     */
    byteWidth() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    static startFixedSizeBinary(builder) {
        builder.startObject(1);
    }
    static addByteWidth(builder, byteWidth) {
        builder.addFieldInt32(0, byteWidth, 0);
    }
    static endFixedSizeBinary(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createFixedSizeBinary(builder, byteWidth) {
        fixed_size_binary_FixedSizeBinary.startFixedSizeBinary(builder);
        fixed_size_binary_FixedSizeBinary.addByteWidth(builder, byteWidth);
        return fixed_size_binary_FixedSizeBinary.endFixedSizeBinary(builder);
    }
}

//# sourceMappingURL=fixed-size-binary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/fixed-size-list.mjs
// automatically generated by the FlatBuffers compiler, do not modify

class fixed_size_list_FixedSizeList {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsFixedSizeList(bb, obj) {
        return (obj || new fixed_size_list_FixedSizeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsFixedSizeList(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new fixed_size_list_FixedSizeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Number of list items per value
     */
    listSize() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    static startFixedSizeList(builder) {
        builder.startObject(1);
    }
    static addListSize(builder, listSize) {
        builder.addFieldInt32(0, listSize, 0);
    }
    static endFixedSizeList(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createFixedSizeList(builder, listSize) {
        fixed_size_list_FixedSizeList.startFixedSizeList(builder);
        fixed_size_list_FixedSizeList.addListSize(builder, listSize);
        return fixed_size_list_FixedSizeList.endFixedSizeList(builder);
    }
}

//# sourceMappingURL=fixed-size-list.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/map.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * A Map is a logical nested type that is represented as
 *
 * List<entries: Struct<key: K, value: V>>
 *
 * In this layout, the keys and values are each respectively contiguous. We do
 * not constrain the key and value types, so the application is responsible
 * for ensuring that the keys are hashable and unique. Whether the keys are sorted
 * may be set in the metadata for this field.
 *
 * In a field with Map type, the field has a child Struct field, which then
 * has two children: key type and the second the value type. The names of the
 * child fields may be respectively "entries", "key", and "value", but this is
 * not enforced.
 *
 * Map
 * ```text
 *   - child[0] entries: Struct
 *     - child[0] key: K
 *     - child[1] value: V
 * ```
 * Neither the "entries" field nor the "key" field may be nullable.
 *
 * The metadata is structured so that Arrow systems without special handling
 * for Map can make Map an alias for List. The "layout" attribute for the Map
 * field must have the same contents as a List.
 */
class map_Map {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsMap(bb, obj) {
        return (obj || new map_Map()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsMap(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new map_Map()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Set to true if the keys within each value are sorted
     */
    keysSorted() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    static startMap(builder) {
        builder.startObject(1);
    }
    static addKeysSorted(builder, keysSorted) {
        builder.addFieldInt8(0, +keysSorted, +false);
    }
    static endMap(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createMap(builder, keysSorted) {
        map_Map.startMap(builder);
        map_Map.addKeysSorted(builder, keysSorted);
        return map_Map.endMap(builder);
    }
}

//# sourceMappingURL=map.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/message.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */




class message_Message {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsMessage(bb, obj) {
        return (obj || new message_Message()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsMessage(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new message_Message()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    version() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : MetadataVersion.V1;
    }
    headerType() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : MessageHeader.NONE;
    }
    header(obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
    }
    bodyLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    customMetadata(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    customMetadataLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startMessage(builder) {
        builder.startObject(5);
    }
    static addVersion(builder, version) {
        builder.addFieldInt16(0, version, MetadataVersion.V1);
    }
    static addHeaderType(builder, headerType) {
        builder.addFieldInt8(1, headerType, MessageHeader.NONE);
    }
    static addHeader(builder, headerOffset) {
        builder.addFieldOffset(2, headerOffset, 0);
    }
    static addBodyLength(builder, bodyLength) {
        builder.addFieldInt64(3, bodyLength, BigInt('0'));
    }
    static addCustomMetadata(builder, customMetadataOffset) {
        builder.addFieldOffset(4, customMetadataOffset, 0);
    }
    static createCustomMetadataVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCustomMetadataVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endMessage(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static finishMessageBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedMessageBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
    static createMessage(builder, version, headerType, headerOffset, bodyLength, customMetadataOffset) {
        message_Message.startMessage(builder);
        message_Message.addVersion(builder, version);
        message_Message.addHeaderType(builder, headerType);
        message_Message.addHeader(builder, headerOffset);
        message_Message.addBodyLength(builder, bodyLength);
        message_Message.addCustomMetadata(builder, customMetadataOffset);
        return message_Message.endMessage(builder);
    }
}

//# sourceMappingURL=message.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/null.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * These are stored in the flatbuffer in the Type union below
 */
class null_Null {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsNull(bb, obj) {
        return (obj || new null_Null()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsNull(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new null_Null()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startNull(builder) {
        builder.startObject(0);
    }
    static endNull(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createNull(builder) {
        null_Null.startNull(builder);
        return null_Null.endNull(builder);
    }
}

//# sourceMappingURL=null.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/binary.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Opaque binary data
 */
class binary_Binary {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsBinary(bb, obj) {
        return (obj || new binary_Binary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsBinary(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new binary_Binary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startBinary(builder) {
        builder.startObject(0);
    }
    static endBinary(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createBinary(builder) {
        binary_Binary.startBinary(builder);
        return binary_Binary.endBinary(builder);
    }
}

//# sourceMappingURL=binary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/binary-view.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

/**
 * Logically the same as Binary, but the internal representation uses a view
 * struct that contains the string length and either the string's entire data
 * inline (for small strings) or an inlined prefix, an index of another buffer,
 * and an offset pointing to a slice in that buffer (for non-small strings).
 *
 * Since it uses a variable number of data buffers, each Field with this type
 * must have a corresponding entry in `variadicBufferCounts`.
 */
class binary_view_BinaryView {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsBinaryView(bb, obj) {
        return (obj || new binary_view_BinaryView()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsBinaryView(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new binary_view_BinaryView()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startBinaryView(builder) {
        builder.startObject(0);
    }
    static endBinaryView(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createBinaryView(builder) {
        binary_view_BinaryView.startBinaryView(builder);
        return binary_view_BinaryView.endBinaryView(builder);
    }
}

//# sourceMappingURL=binary-view.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/large-binary.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Same as Binary, but with 64-bit offsets, allowing to represent
 * extremely large data values.
 */
class large_binary_LargeBinary {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsLargeBinary(bb, obj) {
        return (obj || new large_binary_LargeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsLargeBinary(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new large_binary_LargeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startLargeBinary(builder) {
        builder.startObject(0);
    }
    static endLargeBinary(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createLargeBinary(builder) {
        large_binary_LargeBinary.startLargeBinary(builder);
        return large_binary_LargeBinary.endLargeBinary(builder);
    }
}

//# sourceMappingURL=large-binary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/bool.mjs
// automatically generated by the FlatBuffers compiler, do not modify

class bool_Bool {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsBool(bb, obj) {
        return (obj || new bool_Bool()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsBool(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new bool_Bool()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startBool(builder) {
        builder.startObject(0);
    }
    static endBool(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createBool(builder) {
        bool_Bool.startBool(builder);
        return bool_Bool.endBool(builder);
    }
}

//# sourceMappingURL=bool.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/utf8.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Unicode with UTF-8 encoding
 */
class utf8_Utf8 {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsUtf8(bb, obj) {
        return (obj || new utf8_Utf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsUtf8(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new utf8_Utf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startUtf8(builder) {
        builder.startObject(0);
    }
    static endUtf8(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createUtf8(builder) {
        utf8_Utf8.startUtf8(builder);
        return utf8_Utf8.endUtf8(builder);
    }
}

//# sourceMappingURL=utf8.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/utf8-view.mjs
// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

/**
 * Logically the same as Utf8, but the internal representation uses a view
 * struct that contains the string length and either the string's entire data
 * inline (for small strings) or an inlined prefix, an index of another buffer,
 * and an offset pointing to a slice in that buffer (for non-small strings).
 *
 * Since it uses a variable number of data buffers, each Field with this type
 * must have a corresponding entry in `variadicBufferCounts`.
 */
class utf8_view_Utf8View {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsUtf8View(bb, obj) {
        return (obj || new utf8_view_Utf8View()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsUtf8View(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new utf8_view_Utf8View()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startUtf8View(builder) {
        builder.startObject(0);
    }
    static endUtf8View(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createUtf8View(builder) {
        utf8_view_Utf8View.startUtf8View(builder);
        return utf8_view_Utf8View.endUtf8View(builder);
    }
}

//# sourceMappingURL=utf8-view.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/large-utf8.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Same as Utf8, but with 64-bit offsets, allowing to represent
 * extremely large data values.
 */
class large_utf8_LargeUtf8 {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsLargeUtf8(bb, obj) {
        return (obj || new large_utf8_LargeUtf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsLargeUtf8(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new large_utf8_LargeUtf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startLargeUtf8(builder) {
        builder.startObject(0);
    }
    static endLargeUtf8(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createLargeUtf8(builder) {
        large_utf8_LargeUtf8.startLargeUtf8(builder);
        return large_utf8_LargeUtf8.endLargeUtf8(builder);
    }
}

//# sourceMappingURL=large-utf8.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/list.mjs
// automatically generated by the FlatBuffers compiler, do not modify

class list_List {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsList(bb, obj) {
        return (obj || new list_List()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsList(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new list_List()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startList(builder) {
        builder.startObject(0);
    }
    static endList(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createList(builder) {
        list_List.startList(builder);
        return list_List.endList(builder);
    }
}

//# sourceMappingURL=list.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/large-list.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Same as List, but with 64-bit offsets, allowing to represent
 * extremely large data values.
 */
class large_list_LargeList {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsLargeList(bb, obj) {
        return (obj || new large_list_LargeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsLargeList(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new large_list_LargeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startLargeList(builder) {
        builder.startObject(0);
    }
    static endLargeList(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createLargeList(builder) {
        large_list_LargeList.startLargeList(builder);
        return large_list_LargeList.endLargeList(builder);
    }
}

//# sourceMappingURL=large-list.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/fb/struct-.mjs
// automatically generated by the FlatBuffers compiler, do not modify

/**
 * A Struct_ in the flatbuffer metadata is the same as an Arrow Struct
 * (according to the physical memory layout). We used Struct_ here as
 * Struct is a reserved word in Flatbuffers
 */
class struct_Struct_ {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsStruct_(bb, obj) {
        return (obj || new struct_Struct_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsStruct_(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers/* SIZE_PREFIX_LENGTH */.kc);
        return (obj || new struct_Struct_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static startStruct_(builder) {
        builder.startObject(0);
    }
    static endStruct_(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createStruct_(builder) {
        struct_Struct_.startStruct_(builder);
        return struct_Struct_.endStruct_(builder);
    }
}

//# sourceMappingURL=struct-.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/typeassembler.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

























/** @ignore */
class TypeAssembler extends Visitor {
    visit(node, builder) {
        return (node == null || builder == null) ? undefined : super.visit(node, builder);
    }
    visitNull(_node, b) {
        null_Null.startNull(b);
        return null_Null.endNull(b);
    }
    visitInt(node, b) {
        int_Int.startInt(b);
        int_Int.addBitWidth(b, node.bitWidth);
        int_Int.addIsSigned(b, node.isSigned);
        return int_Int.endInt(b);
    }
    visitFloat(node, b) {
        floating_point_FloatingPoint.startFloatingPoint(b);
        floating_point_FloatingPoint.addPrecision(b, node.precision);
        return floating_point_FloatingPoint.endFloatingPoint(b);
    }
    visitBinary(_node, b) {
        binary_Binary.startBinary(b);
        return binary_Binary.endBinary(b);
    }
    visitBinaryView(_node, b) {
        binary_view_BinaryView.startBinaryView(b);
        return binary_view_BinaryView.endBinaryView(b);
    }
    visitLargeBinary(_node, b) {
        large_binary_LargeBinary.startLargeBinary(b);
        return large_binary_LargeBinary.endLargeBinary(b);
    }
    visitBool(_node, b) {
        bool_Bool.startBool(b);
        return bool_Bool.endBool(b);
    }
    visitUtf8(_node, b) {
        utf8_Utf8.startUtf8(b);
        return utf8_Utf8.endUtf8(b);
    }
    visitUtf8View(_node, b) {
        utf8_view_Utf8View.startUtf8View(b);
        return utf8_view_Utf8View.endUtf8View(b);
    }
    visitLargeUtf8(_node, b) {
        large_utf8_LargeUtf8.startLargeUtf8(b);
        return large_utf8_LargeUtf8.endLargeUtf8(b);
    }
    visitDecimal(node, b) {
        decimal_Decimal.startDecimal(b);
        decimal_Decimal.addScale(b, node.scale);
        decimal_Decimal.addPrecision(b, node.precision);
        decimal_Decimal.addBitWidth(b, node.bitWidth);
        return decimal_Decimal.endDecimal(b);
    }
    visitDate(node, b) {
        date_Date.startDate(b);
        date_Date.addUnit(b, node.unit);
        return date_Date.endDate(b);
    }
    visitTime(node, b) {
        time_Time.startTime(b);
        time_Time.addUnit(b, node.unit);
        time_Time.addBitWidth(b, node.bitWidth);
        return time_Time.endTime(b);
    }
    visitTimestamp(node, b) {
        const timezone = (node.timezone && b.createString(node.timezone)) || undefined;
        timestamp_Timestamp.startTimestamp(b);
        timestamp_Timestamp.addUnit(b, node.unit);
        if (timezone !== undefined) {
            timestamp_Timestamp.addTimezone(b, timezone);
        }
        return timestamp_Timestamp.endTimestamp(b);
    }
    visitInterval(node, b) {
        interval_Interval.startInterval(b);
        interval_Interval.addUnit(b, node.unit);
        return interval_Interval.endInterval(b);
    }
    visitDuration(node, b) {
        duration_Duration.startDuration(b);
        duration_Duration.addUnit(b, node.unit);
        return duration_Duration.endDuration(b);
    }
    visitList(_node, b) {
        list_List.startList(b);
        return list_List.endList(b);
    }
    visitLargeList(_node, b) {
        large_list_LargeList.startLargeList(b);
        return large_list_LargeList.endLargeList(b);
    }
    visitStruct(_node, b) {
        struct_Struct_.startStruct_(b);
        return struct_Struct_.endStruct_(b);
    }
    visitUnion(node, b) {
        union_Union.startTypeIdsVector(b, node.typeIds.length);
        const typeIds = union_Union.createTypeIdsVector(b, node.typeIds);
        union_Union.startUnion(b);
        union_Union.addMode(b, node.mode);
        union_Union.addTypeIds(b, typeIds);
        return union_Union.endUnion(b);
    }
    visitDictionary(node, b) {
        const indexType = this.visit(node.indices, b);
        DictionaryEncoding.startDictionaryEncoding(b);
        DictionaryEncoding.addId(b, BigInt(node.id));
        DictionaryEncoding.addIsOrdered(b, node.isOrdered);
        if (indexType !== undefined) {
            DictionaryEncoding.addIndexType(b, indexType);
        }
        return DictionaryEncoding.endDictionaryEncoding(b);
    }
    visitFixedSizeBinary(node, b) {
        fixed_size_binary_FixedSizeBinary.startFixedSizeBinary(b);
        fixed_size_binary_FixedSizeBinary.addByteWidth(b, node.byteWidth);
        return fixed_size_binary_FixedSizeBinary.endFixedSizeBinary(b);
    }
    visitFixedSizeList(node, b) {
        fixed_size_list_FixedSizeList.startFixedSizeList(b);
        fixed_size_list_FixedSizeList.addListSize(b, node.listSize);
        return fixed_size_list_FixedSizeList.endFixedSizeList(b);
    }
    visitMap(node, b) {
        map_Map.startMap(b);
        map_Map.addKeysSorted(b, node.keysSorted);
        return map_Map.endMap(b);
    }
}
/** @ignore */
const typeassembler_instance = new TypeAssembler();

//# sourceMappingURL=typeassembler.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/metadata/json.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
function schemaFromJSON(_schema, dictionaries = new Map()) {
    return new apache_arrow_schema_Schema(schemaFieldsFromJSON(_schema, dictionaries), customMetadataFromJSON(_schema['metadata']), dictionaries);
}
/** @ignore */
function recordBatchFromJSON(b) {
    return new message_RecordBatch(b['count'], fieldNodesFromJSON(b['columns']), buffersFromJSON(b['columns']), null, variadicBufferCountsFromJSON(b['columns']));
}
/** @ignore */
function dictionaryBatchFromJSON(b) {
    return new message_DictionaryBatch(recordBatchFromJSON(b['data']), b['id'], b['isDelta']);
}
/** @ignore */
function schemaFieldsFromJSON(_schema, dictionaries) {
    return (_schema['fields'] || []).filter(Boolean).map((f) => schema_Field.fromJSON(f, dictionaries));
}
/** @ignore */
function fieldChildrenFromJSON(_field, dictionaries) {
    return (_field['children'] || []).filter(Boolean).map((f) => schema_Field.fromJSON(f, dictionaries));
}
/** @ignore */
function fieldNodesFromJSON(xs) {
    return (xs || []).reduce((fieldNodes, column) => [
        ...fieldNodes,
        new message_FieldNode(column['count'], nullCountFromJSON(column['VALIDITY'])),
        ...fieldNodesFromJSON(column['children'])
    ], []);
}
/** @ignore */
function buffersFromJSON(xs, buffers = []) {
    for (let i = -1, n = (xs || []).length; ++i < n;) {
        const column = xs[i];
        column['VALIDITY'] && buffers.push(new BufferRegion(buffers.length, column['VALIDITY'].length));
        column['TYPE_ID'] && buffers.push(new BufferRegion(buffers.length, column['TYPE_ID'].length));
        column['OFFSET'] && buffers.push(new BufferRegion(buffers.length, column['OFFSET'].length));
        column['DATA'] && buffers.push(new BufferRegion(buffers.length, column['DATA'].length));
        column['VIEWS'] && buffers.push(new BufferRegion(buffers.length, column['VIEWS'].length));
        // Handle variadic buffers for view types (BinaryView, Utf8View)
        if (column['VARIADIC_DATA_BUFFERS']) {
            for (const buf of column['VARIADIC_DATA_BUFFERS']) {
                buffers.push(new BufferRegion(buffers.length, buf.length));
            }
        }
        buffers = buffersFromJSON(column['children'], buffers);
    }
    return buffers;
}
/** @ignore */
function nullCountFromJSON(validity) {
    return (validity || []).reduce((sum, val) => sum + +(val === 0), 0);
}
/** @ignore */
function variadicBufferCountsFromJSON(xs) {
    return (xs || []).reduce((counts, column) => [
        ...counts,
        ...(column['VARIADIC_DATA_BUFFERS'] ? [column['VARIADIC_DATA_BUFFERS'].length] : []),
        ...variadicBufferCountsFromJSON(column['children'])
    ], []);
}
/** @ignore */
function fieldFromJSON(_field, dictionaries) {
    let id;
    let keys;
    let field;
    let dictMeta;
    let type;
    let dictType;
    // If no dictionary encoding
    if (!dictionaries || !(dictMeta = _field['dictionary'])) {
        type = typeFromJSON(_field, fieldChildrenFromJSON(_field, dictionaries));
        field = new schema_Field(_field['name'], type, _field['nullable'], customMetadataFromJSON(_field['metadata']));
    }
    // If dictionary encoded and the first time we've seen this dictionary id, decode
    // the data type and child fields, then wrap in a Dictionary type and insert the
    // data type into the dictionary types map.
    else if (!dictionaries.has(id = dictMeta['id'])) {
        // a dictionary index defaults to signed 32 bit int if unspecified
        keys = (keys = dictMeta['indexType']) ? indexTypeFromJSON(keys) : new Int32();
        dictionaries.set(id, type = typeFromJSON(_field, fieldChildrenFromJSON(_field, dictionaries)));
        dictType = new Dictionary(type, keys, id, dictMeta['isOrdered']);
        field = new schema_Field(_field['name'], dictType, _field['nullable'], customMetadataFromJSON(_field['metadata']));
    }
    // If dictionary encoded, and have already seen this dictionary Id in the schema, then reuse the
    // data type and wrap in a new Dictionary type and field.
    else {
        // a dictionary index defaults to signed 32 bit int if unspecified
        keys = (keys = dictMeta['indexType']) ? indexTypeFromJSON(keys) : new Int32();
        dictType = new Dictionary(dictionaries.get(id), keys, id, dictMeta['isOrdered']);
        field = new schema_Field(_field['name'], dictType, _field['nullable'], customMetadataFromJSON(_field['metadata']));
    }
    return field || null;
}
/** @ignore */
function customMetadataFromJSON(metadata = []) {
    return new Map(metadata.map(({ key, value }) => [key, value]));
}
/** @ignore */
function indexTypeFromJSON(_type) {
    return new Int_(_type['isSigned'], _type['bitWidth']);
}
/** @ignore */
function typeFromJSON(f, children) {
    const typeId = f['type']['name'];
    switch (typeId) {
        case 'NONE': return new type_Null();
        case 'null': return new type_Null();
        case 'binary': return new type_Binary();
        case 'largebinary': return new type_LargeBinary();
        case 'binaryview': return new type_BinaryView();
        case 'utf8': return new type_Utf8();
        case 'largeutf8': return new type_LargeUtf8();
        case 'utf8view': return new type_Utf8View();
        case 'bool': return new type_Bool();
        case 'list': return new type_List((children || [])[0]);
        case 'largelist': return new type_LargeList((children || [])[0]);
        case 'struct': return new Struct(children || []);
        case 'struct_': return new Struct(children || []);
    }
    switch (typeId) {
        case 'int': {
            const t = f['type'];
            return new Int_(t['isSigned'], t['bitWidth']);
        }
        case 'floatingpoint': {
            const t = f['type'];
            return new Float(Precision[t['precision']]);
        }
        case 'decimal': {
            const t = f['type'];
            return new type_Decimal(t['scale'], t['precision'], t['bitWidth']);
        }
        case 'date': {
            const t = f['type'];
            return new Date_(DateUnit[t['unit']]);
        }
        case 'time': {
            const t = f['type'];
            return new Time_(TimeUnit[t['unit']], t['bitWidth']);
        }
        case 'timestamp': {
            const t = f['type'];
            return new Timestamp_(TimeUnit[t['unit']], t['timezone']);
        }
        case 'interval': {
            const t = f['type'];
            return new Interval_(IntervalUnit[t['unit']]);
        }
        case 'duration': {
            const t = f['type'];
            return new type_Duration(TimeUnit[t['unit']]);
        }
        case 'union': {
            const t = f['type'];
            const [m, ...ms] = (t['mode'] + '').toLowerCase();
            const mode = (m.toUpperCase() + ms.join(''));
            return new Union_(UnionMode[mode], (t['typeIds'] || []), children || []);
        }
        case 'fixedsizebinary': {
            const t = f['type'];
            return new type_FixedSizeBinary(t['byteWidth']);
        }
        case 'fixedsizelist': {
            const t = f['type'];
            return new type_FixedSizeList(t['listSize'], (children || [])[0]);
        }
        case 'map': {
            const t = f['type'];
            return new Map_((children || [])[0], t['keysSorted']);
        }
    }
    throw new Error(`Unrecognized type: "${typeId}"`);
}

//# sourceMappingURL=json.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/metadata/message.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.































var message_Builder = flatbuffers/* Builder */.M$;
var message_ByteBuffer = flatbuffers/* ByteBuffer */.$F;

/**
 * @ignore
 * @private
 **/
class Message {
    /** @nocollapse */
    static fromJSON(msg, headerType) {
        const message = new Message(0, MetadataVersion.V5, headerType);
        message._createHeader = messageHeaderFromJSON(msg, headerType);
        return message;
    }
    /** @nocollapse */
    static decode(buf) {
        buf = new message_ByteBuffer(toUint8Array(buf));
        const _message = message_Message.getRootAsMessage(buf);
        const bodyLength = _message.bodyLength();
        const version = _message.version();
        const headerType = _message.headerType();
        const metadata = decodeMessageCustomMetadata(_message);
        const message = new Message(bodyLength, version, headerType, undefined, metadata);
        message._createHeader = decodeMessageHeader(_message, headerType);
        return message;
    }
    /** @nocollapse */
    static encode(message) {
        const b = new message_Builder();
        let headerOffset = -1;
        if (message.isSchema()) {
            headerOffset = apache_arrow_schema_Schema.encode(b, message.header());
        }
        else if (message.isRecordBatch()) {
            headerOffset = message_RecordBatch.encode(b, message.header());
        }
        else if (message.isDictionaryBatch()) {
            headerOffset = message_DictionaryBatch.encode(b, message.header());
        }
        // Encode custom metadata if present (must be done before startMessage)
        const customMetadataOffset = !(message.metadata && message.metadata.size > 0) ? -1 :
            message_Message.createCustomMetadataVector(b, [...message.metadata].map(([k, v]) => {
                const key = b.createString(`${k}`);
                const val = b.createString(`${v}`);
                KeyValue.startKeyValue(b);
                KeyValue.addKey(b, key);
                KeyValue.addValue(b, val);
                return KeyValue.endKeyValue(b);
            }));
        message_Message.startMessage(b);
        message_Message.addVersion(b, MetadataVersion.V5);
        message_Message.addHeader(b, headerOffset);
        message_Message.addHeaderType(b, message.headerType);
        message_Message.addBodyLength(b, BigInt(message.bodyLength));
        if (customMetadataOffset !== -1) {
            message_Message.addCustomMetadata(b, customMetadataOffset);
        }
        message_Message.finishMessageBuffer(b, message_Message.endMessage(b));
        return b.asUint8Array();
    }
    /** @nocollapse */
    static from(header, bodyLength = 0) {
        if (header instanceof apache_arrow_schema_Schema) {
            return new Message(0, MetadataVersion.V5, MessageHeader.Schema, header);
        }
        if (header instanceof message_RecordBatch) {
            return new Message(bodyLength, MetadataVersion.V5, MessageHeader.RecordBatch, header, header.metadata);
        }
        if (header instanceof message_DictionaryBatch) {
            return new Message(bodyLength, MetadataVersion.V5, MessageHeader.DictionaryBatch, header);
        }
        throw new Error(`Unrecognized Message header: ${header}`);
    }
    get type() { return this.headerType; }
    get version() { return this._version; }
    get headerType() { return this._headerType; }
    get compression() { return this._compression; }
    get bodyLength() { return this._bodyLength; }
    get metadata() { return this._metadata; }
    header() { return this._createHeader(); }
    isSchema() { return this.headerType === MessageHeader.Schema; }
    isRecordBatch() { return this.headerType === MessageHeader.RecordBatch; }
    isDictionaryBatch() { return this.headerType === MessageHeader.DictionaryBatch; }
    constructor(bodyLength, version, headerType, header, metadata) {
        this._version = version;
        this._headerType = headerType;
        this.body = new Uint8Array(0);
        this._compression = header === null || header === void 0 ? void 0 : header.compression;
        header && (this._createHeader = () => header);
        this._bodyLength = bigIntToNumber(bodyLength);
        this._metadata = metadata || new Map();
    }
}
/**
 * @ignore
 * @private
 **/
class message_RecordBatch {
    get nodes() { return this._nodes; }
    get length() { return this._length; }
    get buffers() { return this._buffers; }
    get compression() { return this._compression; }
    get variadicBufferCounts() { return this._variadicBufferCounts; }
    get metadata() { return this._metadata; }
    constructor(length, nodes, buffers, compression, variadicBufferCounts = [], metadata) {
        this._nodes = nodes;
        this._buffers = buffers;
        this._length = bigIntToNumber(length);
        this._compression = compression;
        this._variadicBufferCounts = variadicBufferCounts;
        this._metadata = metadata || new Map();
    }
}
/**
 * @ignore
 * @private
 **/
class message_DictionaryBatch {
    get id() { return this._id; }
    get data() { return this._data; }
    get isDelta() { return this._isDelta; }
    get length() { return this.data.length; }
    get nodes() { return this.data.nodes; }
    get buffers() { return this.data.buffers; }
    constructor(data, id, isDelta = false) {
        this._data = data;
        this._isDelta = isDelta;
        this._id = bigIntToNumber(id);
    }
}
/**
 * @ignore
 * @private
 **/
class BufferRegion {
    constructor(offset, length) {
        this.offset = bigIntToNumber(offset);
        this.length = bigIntToNumber(length);
    }
}
/**
 * @ignore
 * @private
 **/
class message_FieldNode {
    constructor(length, nullCount) {
        this.length = bigIntToNumber(length);
        this.nullCount = bigIntToNumber(nullCount);
    }
}
/**
 * @ignore
 * @private
 **/
class message_BodyCompression {
    constructor(type, method = BodyCompressionMethod.BUFFER) {
        this.type = type;
        this.method = method;
    }
}
/** @ignore */
function messageHeaderFromJSON(message, type) {
    return (() => {
        switch (type) {
            case MessageHeader.Schema: return apache_arrow_schema_Schema.fromJSON(message);
            case MessageHeader.RecordBatch: return message_RecordBatch.fromJSON(message);
            case MessageHeader.DictionaryBatch: return message_DictionaryBatch.fromJSON(message);
        }
        throw new Error(`Unrecognized Message type: { name: ${MessageHeader[type]}, type: ${type} }`);
    });
}
/** @ignore */
function decodeMessageHeader(message, type) {
    return (() => {
        switch (type) {
            case MessageHeader.Schema: return apache_arrow_schema_Schema.decode(message.header(new schema_Schema()), new Map(), message.version());
            case MessageHeader.RecordBatch: return message_RecordBatch.decode(message.header(new record_batch_RecordBatch()), message.version());
            case MessageHeader.DictionaryBatch: return message_DictionaryBatch.decode(message.header(new dictionary_batch_DictionaryBatch()), message.version());
        }
        throw new Error(`Unrecognized Message type: { name: ${MessageHeader[type]}, type: ${type} }`);
    });
}
schema_Field['encode'] = encodeField;
schema_Field['decode'] = decodeField;
schema_Field['fromJSON'] = fieldFromJSON;
apache_arrow_schema_Schema['encode'] = encodeSchema;
apache_arrow_schema_Schema['decode'] = decodeSchema;
apache_arrow_schema_Schema['fromJSON'] = schemaFromJSON;
message_RecordBatch['encode'] = encodeRecordBatch;
message_RecordBatch['decode'] = decodeRecordBatch;
message_RecordBatch['fromJSON'] = recordBatchFromJSON;
message_DictionaryBatch['encode'] = encodeDictionaryBatch;
message_DictionaryBatch['decode'] = decodeDictionaryBatch;
message_DictionaryBatch['fromJSON'] = dictionaryBatchFromJSON;
message_FieldNode['encode'] = encodeFieldNode;
message_FieldNode['decode'] = decodeFieldNode;
BufferRegion['encode'] = encodeBufferRegion;
BufferRegion['decode'] = decodeBufferRegion;
message_BodyCompression['encode'] = encodeBodyCompression;
message_BodyCompression['decode'] = decodeBodyCompression;
/** @ignore */
function decodeSchema(_schema, dictionaries = new Map(), version = MetadataVersion.V5) {
    const fields = decodeSchemaFields(_schema, dictionaries);
    return new apache_arrow_schema_Schema(fields, decodeCustomMetadata(_schema), dictionaries, version);
}
/** @ignore */
function decodeRecordBatch(batch, version = MetadataVersion.V5) {
    const recordBatch = new message_RecordBatch(batch.length(), decodeFieldNodes(batch), decodeBuffers(batch, version), decodeBodyCompression(batch.compression()), decodeVariadicBufferCounts(batch));
    return recordBatch;
}
/** @ignore */
function decodeDictionaryBatch(batch, version = MetadataVersion.V5) {
    return new message_DictionaryBatch(message_RecordBatch.decode(batch.data(), version), batch.id(), batch.isDelta());
}
/** @ignore */
function decodeBufferRegion(b) {
    return new BufferRegion(b.offset(), b.length());
}
/** @ignore */
function decodeFieldNode(f) {
    return new message_FieldNode(f.length(), f.nullCount());
}
/** @ignore */
function decodeFieldNodes(batch) {
    const nodes = [];
    for (let f, i = -1, j = -1, n = batch.nodesLength(); ++i < n;) {
        if (f = batch.nodes(i)) {
            nodes[++j] = message_FieldNode.decode(f);
        }
    }
    return nodes;
}
/** @ignore */
function decodeBuffers(batch, version) {
    const bufferRegions = [];
    for (let b, i = -1, j = -1, n = batch.buffersLength(); ++i < n;) {
        if (b = batch.buffers(i)) {
            // If this Arrow buffer was written before version 4,
            // advance the buffer's bb_pos 8 bytes to skip past
            // the now-removed page_id field
            if (version < MetadataVersion.V4) {
                b.bb_pos += (8 * (i + 1));
            }
            bufferRegions[++j] = BufferRegion.decode(b);
        }
    }
    return bufferRegions;
}
/** @ignore */
function decodeVariadicBufferCounts(batch) {
    const counts = [];
    const length = Math.trunc(batch.variadicBufferCountsLength());
    for (let i = 0; i < length; ++i) {
        counts.push(bigIntToNumber(batch.variadicBufferCounts(i)));
    }
    return counts;
}
/** @ignore */
function decodeSchemaFields(schema, dictionaries) {
    const fields = [];
    for (let f, i = -1, j = -1, n = schema.fieldsLength(); ++i < n;) {
        if (f = schema.fields(i)) {
            fields[++j] = schema_Field.decode(f, dictionaries);
        }
    }
    return fields;
}
/** @ignore */
function decodeFieldChildren(field, dictionaries) {
    const children = [];
    for (let f, i = -1, j = -1, n = field.childrenLength(); ++i < n;) {
        if (f = field.children(i)) {
            children[++j] = schema_Field.decode(f, dictionaries);
        }
    }
    return children;
}
/** @ignore */
function decodeField(f, dictionaries) {
    let id;
    let field;
    let type;
    let keys;
    let dictType;
    let dictMeta;
    // If no dictionary encoding
    if (!dictionaries || !(dictMeta = f.dictionary())) {
        type = decodeFieldType(f, decodeFieldChildren(f, dictionaries));
        field = new schema_Field(f.name(), type, f.nullable(), decodeCustomMetadata(f));
    }
    // If dictionary encoded and the first time we've seen this dictionary id, decode
    // the data type and child fields, then wrap in a Dictionary type and insert the
    // data type into the dictionary types map.
    else if (!dictionaries.has(id = bigIntToNumber(dictMeta.id()))) {
        // a dictionary index defaults to signed 32 bit int if unspecified
        keys = (keys = dictMeta.indexType()) ? decodeIndexType(keys) : new Int32();
        dictionaries.set(id, type = decodeFieldType(f, decodeFieldChildren(f, dictionaries)));
        dictType = new Dictionary(type, keys, id, dictMeta.isOrdered());
        field = new schema_Field(f.name(), dictType, f.nullable(), decodeCustomMetadata(f));
    }
    // If dictionary encoded, and have already seen this dictionary Id in the schema, then reuse the
    // data type and wrap in a new Dictionary type and field.
    else {
        // a dictionary index defaults to signed 32 bit int if unspecified
        keys = (keys = dictMeta.indexType()) ? decodeIndexType(keys) : new Int32();
        dictType = new Dictionary(dictionaries.get(id), keys, id, dictMeta.isOrdered());
        field = new schema_Field(f.name(), dictType, f.nullable(), decodeCustomMetadata(f));
    }
    return field || null;
}
/** @ignore */
function decodeCustomMetadata(parent) {
    const data = new Map();
    if (parent) {
        for (let entry, key, i = -1, n = Math.trunc(parent.customMetadataLength()); ++i < n;) {
            if ((entry = parent.customMetadata(i)) && (key = entry.key()) != null) {
                data.set(key, entry.value());
            }
        }
    }
    return data;
}
/** @ignore */
function decodeMessageCustomMetadata(message) {
    const data = new Map();
    for (let entry, key, i = -1, n = Math.trunc(message.customMetadataLength()); ++i < n;) {
        if ((entry = message.customMetadata(i)) && (key = entry.key()) != null) {
            data.set(key, entry.value());
        }
    }
    return data;
}
/** @ignore */
function decodeIndexType(_type) {
    return new Int_(_type.isSigned(), _type.bitWidth());
}
/** @ignore */
function decodeFieldType(f, children) {
    const typeId = f.typeType();
    switch (typeId) {
        case type_Type['NONE']: return new type_Null();
        case type_Type['Null']: return new type_Null();
        case type_Type['Binary']: return new type_Binary();
        case type_Type['LargeBinary']: return new type_LargeBinary();
        case type_Type['BinaryView']: return new type_BinaryView();
        case type_Type['Utf8']: return new type_Utf8();
        case type_Type['LargeUtf8']: return new type_LargeUtf8();
        case type_Type['Utf8View']: return new type_Utf8View();
        case type_Type['Bool']: return new type_Bool();
        case type_Type['List']: return new type_List((children || [])[0]);
        case type_Type['LargeList']: return new type_LargeList((children || [])[0]);
        case type_Type['Struct_']: return new Struct(children || []);
    }
    switch (typeId) {
        case type_Type['Int']: {
            const t = f.type(new int_Int());
            return new Int_(t.isSigned(), t.bitWidth());
        }
        case type_Type['FloatingPoint']: {
            const t = f.type(new floating_point_FloatingPoint());
            return new Float(t.precision());
        }
        case type_Type['Decimal']: {
            const t = f.type(new decimal_Decimal());
            return new type_Decimal(t.scale(), t.precision(), t.bitWidth());
        }
        case type_Type['Date']: {
            const t = f.type(new date_Date());
            return new Date_(t.unit());
        }
        case type_Type['Time']: {
            const t = f.type(new time_Time());
            return new Time_(t.unit(), t.bitWidth());
        }
        case type_Type['Timestamp']: {
            const t = f.type(new timestamp_Timestamp());
            return new Timestamp_(t.unit(), t.timezone());
        }
        case type_Type['Interval']: {
            const t = f.type(new interval_Interval());
            return new Interval_(t.unit());
        }
        case type_Type['Duration']: {
            const t = f.type(new duration_Duration());
            return new type_Duration(t.unit());
        }
        case type_Type['Union']: {
            const t = f.type(new union_Union());
            return new Union_(t.mode(), t.typeIdsArray() || [], children || []);
        }
        case type_Type['FixedSizeBinary']: {
            const t = f.type(new fixed_size_binary_FixedSizeBinary());
            return new type_FixedSizeBinary(t.byteWidth());
        }
        case type_Type['FixedSizeList']: {
            const t = f.type(new fixed_size_list_FixedSizeList());
            return new type_FixedSizeList(t.listSize(), (children || [])[0]);
        }
        case type_Type['Map']: {
            const t = f.type(new map_Map());
            return new Map_((children || [])[0], t.keysSorted());
        }
    }
    throw new Error(`Unrecognized type: "${type_Type[typeId]}" (${typeId})`);
}
/** @ignore */
function decodeBodyCompression(b) {
    return b ? new message_BodyCompression(b.codec(), b.method()) : null;
}
/** @ignore */
function encodeSchema(b, schema) {
    const fieldOffsets = schema.fields.map((f) => schema_Field.encode(b, f));
    schema_Schema.startFieldsVector(b, fieldOffsets.length);
    const fieldsVectorOffset = schema_Schema.createFieldsVector(b, fieldOffsets);
    const metadataOffset = !(schema.metadata && schema.metadata.size > 0) ? -1 :
        schema_Schema.createCustomMetadataVector(b, [...schema.metadata].map(([k, v]) => {
            const key = b.createString(`${k}`);
            const val = b.createString(`${v}`);
            KeyValue.startKeyValue(b);
            KeyValue.addKey(b, key);
            KeyValue.addValue(b, val);
            return KeyValue.endKeyValue(b);
        }));
    schema_Schema.startSchema(b);
    schema_Schema.addFields(b, fieldsVectorOffset);
    schema_Schema.addEndianness(b, platformIsLittleEndian ? Endianness.Little : Endianness.Big);
    if (metadataOffset !== -1) {
        schema_Schema.addCustomMetadata(b, metadataOffset);
    }
    return schema_Schema.endSchema(b);
}
/** @ignore */
function encodeField(b, field) {
    let nameOffset = -1;
    let typeOffset = -1;
    let dictionaryOffset = -1;
    const type = field.type;
    let typeId = field.typeId;
    if (!type_DataType.isDictionary(type)) {
        typeOffset = typeassembler_instance.visit(type, b);
    }
    else {
        typeId = type.dictionary.typeId;
        dictionaryOffset = typeassembler_instance.visit(type, b);
        typeOffset = typeassembler_instance.visit(type.dictionary, b);
    }
    const childOffsets = (type.children || []).map((f) => schema_Field.encode(b, f));
    const childrenVectorOffset = field_Field.createChildrenVector(b, childOffsets);
    const metadataOffset = !(field.metadata && field.metadata.size > 0) ? -1 :
        field_Field.createCustomMetadataVector(b, [...field.metadata].map(([k, v]) => {
            const key = b.createString(`${k}`);
            const val = b.createString(`${v}`);
            KeyValue.startKeyValue(b);
            KeyValue.addKey(b, key);
            KeyValue.addValue(b, val);
            return KeyValue.endKeyValue(b);
        }));
    if (field.name) {
        nameOffset = b.createString(field.name);
    }
    field_Field.startField(b);
    field_Field.addType(b, typeOffset);
    field_Field.addTypeType(b, typeId);
    field_Field.addChildren(b, childrenVectorOffset);
    field_Field.addNullable(b, !!field.nullable);
    if (nameOffset !== -1) {
        field_Field.addName(b, nameOffset);
    }
    if (dictionaryOffset !== -1) {
        field_Field.addDictionary(b, dictionaryOffset);
    }
    if (metadataOffset !== -1) {
        field_Field.addCustomMetadata(b, metadataOffset);
    }
    return field_Field.endField(b);
}
/** @ignore */
function encodeRecordBatch(b, recordBatch) {
    const nodes = recordBatch.nodes || [];
    const buffers = recordBatch.buffers || [];
    const variadicBufferCounts = recordBatch.variadicBufferCounts || [];
    record_batch_RecordBatch.startNodesVector(b, nodes.length);
    for (const n of nodes.slice().reverse())
        message_FieldNode.encode(b, n);
    const nodesVectorOffset = b.endVector();
    record_batch_RecordBatch.startBuffersVector(b, buffers.length);
    for (const b_ of buffers.slice().reverse())
        BufferRegion.encode(b, b_);
    const buffersVectorOffset = b.endVector();
    let bodyCompressionOffset = null;
    if (recordBatch.compression !== null) {
        bodyCompressionOffset = encodeBodyCompression(b, recordBatch.compression);
    }
    let variadicBufferCountsOffset = -1;
    if (variadicBufferCounts.length > 0) {
        variadicBufferCountsOffset = record_batch_RecordBatch.createVariadicBufferCountsVector(b, variadicBufferCounts.map(BigInt));
    }
    record_batch_RecordBatch.startRecordBatch(b);
    record_batch_RecordBatch.addLength(b, BigInt(recordBatch.length));
    record_batch_RecordBatch.addNodes(b, nodesVectorOffset);
    record_batch_RecordBatch.addBuffers(b, buffersVectorOffset);
    if (recordBatch.compression !== null && bodyCompressionOffset) {
        record_batch_RecordBatch.addCompression(b, bodyCompressionOffset);
    }
    if (variadicBufferCountsOffset !== -1) {
        record_batch_RecordBatch.addVariadicBufferCounts(b, variadicBufferCountsOffset);
    }
    return record_batch_RecordBatch.endRecordBatch(b);
}
/** @ignore */
function encodeBodyCompression(b, node) {
    BodyCompression.startBodyCompression(b);
    BodyCompression.addCodec(b, node.type);
    BodyCompression.addMethod(b, node.method);
    return BodyCompression.endBodyCompression(b);
}
/** @ignore */
function encodeDictionaryBatch(b, dictionaryBatch) {
    const dataOffset = message_RecordBatch.encode(b, dictionaryBatch.data);
    dictionary_batch_DictionaryBatch.startDictionaryBatch(b);
    dictionary_batch_DictionaryBatch.addId(b, BigInt(dictionaryBatch.id));
    dictionary_batch_DictionaryBatch.addIsDelta(b, dictionaryBatch.isDelta);
    dictionary_batch_DictionaryBatch.addData(b, dataOffset);
    return dictionary_batch_DictionaryBatch.endDictionaryBatch(b);
}
/** @ignore */
function encodeFieldNode(b, node) {
    return FieldNode.createFieldNode(b, BigInt(node.length), BigInt(node.nullCount));
}
/** @ignore */
function encodeBufferRegion(b, node) {
    return Buffer.createBuffer(b, BigInt(node.offset), BigInt(node.length));
}
/** @ignore */
const platformIsLittleEndian = (() => {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    // Int16Array uses the platform's endianness.
    return new Int16Array(buffer)[0] === 256;
})();

//# sourceMappingURL=message.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/interfaces.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
const ITERATOR_DONE = Object.freeze({ done: true, value: void (0) });
/** @ignore */
class ArrowJSON {
    constructor(_json) {
        this._json = _json;
    }
    get schema() { return this._json['schema']; }
    get batches() { return (this._json['batches'] || []); }
    get dictionaries() { return (this._json['dictionaries'] || []); }
}
/** @ignore */
class ReadableInterop {
    tee() {
        return this._getDOMStream().tee();
    }
    pipe(writable, options) {
        return this._getNodeStream().pipe(writable, options);
    }
    pipeTo(writable, options) { return this._getDOMStream().pipeTo(writable, options); }
    pipeThrough(duplex, options) {
        return this._getDOMStream().pipeThrough(duplex, options);
    }
    _getDOMStream() {
        return this._DOMStream || (this._DOMStream = this.toDOMStream());
    }
    _getNodeStream() {
        return this._nodeStream || (this._nodeStream = this.toNodeStream());
    }
}
/** @ignore */
class AsyncQueue extends ReadableInterop {
    constructor() {
        super();
        this._values = [];
        this.resolvers = [];
        this._closedPromise = new Promise((r) => this._closedPromiseResolve = r);
    }
    get closed() { return this._closedPromise; }
    cancel(reason) {
        return __awaiter(this, void 0, void 0, function* () { yield this.return(reason); });
    }
    write(value) {
        if (this._ensureOpen()) {
            this.resolvers.length <= 0
                ? (this._values.push(value))
                : (this.resolvers.shift().resolve({ done: false, value }));
        }
    }
    abort(value) {
        if (this._closedPromiseResolve) {
            this.resolvers.length <= 0
                ? (this._error = { error: value })
                : (this.resolvers.shift().reject({ done: true, value }));
        }
    }
    close() {
        if (this._closedPromiseResolve) {
            const { resolvers } = this;
            while (resolvers.length > 0) {
                resolvers.shift().resolve(ITERATOR_DONE);
            }
            this._closedPromiseResolve();
            this._closedPromiseResolve = undefined;
        }
    }
    [Symbol.asyncIterator]() { return this; }
    toDOMStream(options) {
        return adapters.toDOMStream((this._closedPromiseResolve || this._error)
            ? this
            : this._values, options);
    }
    toNodeStream(options) {
        return adapters.toNodeStream((this._closedPromiseResolve || this._error)
            ? this
            : this._values, options);
    }
    throw(_) {
        return __awaiter(this, void 0, void 0, function* () { yield this.abort(_); return ITERATOR_DONE; });
    }
    return(_) {
        return __awaiter(this, void 0, void 0, function* () { yield this.close(); return ITERATOR_DONE; });
    }
    read(size) {
        return __awaiter(this, void 0, void 0, function* () { return (yield this.next(size, 'read')).value; });
    }
    peek(size) {
        return __awaiter(this, void 0, void 0, function* () { return (yield this.next(size, 'peek')).value; });
    }
    next(..._args) {
        if (this._values.length > 0) {
            return Promise.resolve({ done: false, value: this._values.shift() });
        }
        else if (this._error) {
            return Promise.reject({ done: true, value: this._error.error });
        }
        else if (!this._closedPromiseResolve) {
            return Promise.resolve(ITERATOR_DONE);
        }
        else {
            return new Promise((resolve, reject) => {
                this.resolvers.push({ resolve, reject });
            });
        }
    }
    _ensureOpen() {
        if (this._closedPromiseResolve) {
            return true;
        }
        throw new Error(`AsyncQueue is closed`);
    }
}

//# sourceMappingURL=interfaces.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/stream.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.






/** @ignore */
class AsyncByteQueue extends AsyncQueue {
    write(value) {
        if ((value = toUint8Array(value)).byteLength > 0) {
            return super.write(value);
        }
    }
    toString(sync = false) {
        return sync
            ? decodeUtf8(this.toUint8Array(true))
            : this.toUint8Array(false).then(decodeUtf8);
    }
    toUint8Array(sync = false) {
        return sync ? joinUint8Arrays(this._values)[0] : (() => __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const buffers = [];
            let byteLength = 0;
            try {
                for (var _d = true, _e = modules_asyncValues(this), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    buffers.push(chunk);
                    byteLength += chunk.byteLength;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return joinUint8Arrays(buffers, byteLength)[0];
        }))();
    }
}
/** @ignore */
class ByteStream {
    constructor(source) {
        if (source) {
            this.source = new ByteStreamSource(adapters.fromIterable(source));
        }
    }
    [Symbol.iterator]() { return this; }
    next(value) { return this.source.next(value); }
    throw(value) { return this.source.throw(value); }
    return(value) { return this.source.return(value); }
    peek(size) { return this.source.peek(size); }
    read(size) { return this.source.read(size); }
}
/** @ignore */
class AsyncByteStream {
    constructor(source) {
        if (source instanceof AsyncByteStream) {
            this.source = source.source;
        }
        else if (source instanceof AsyncByteQueue) {
            this.source = new AsyncByteStreamSource(adapters.fromAsyncIterable(source));
        }
        else if (isReadableNodeStream(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromNodeStream(source));
        }
        else if (isReadableDOMStream(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromDOMStream(source));
        }
        else if (isFetchResponse(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromDOMStream(source.body));
        }
        else if (isIterable(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromIterable(source));
        }
        else if (isPromise(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromAsyncIterable(source));
        }
        else if (isAsyncIterable(source)) {
            this.source = new AsyncByteStreamSource(adapters.fromAsyncIterable(source));
        }
    }
    [Symbol.asyncIterator]() { return this; }
    next(value) { return this.source.next(value); }
    throw(value) { return this.source.throw(value); }
    return(value) { return this.source.return(value); }
    get closed() { return this.source.closed; }
    cancel(reason) { return this.source.cancel(reason); }
    peek(size) { return this.source.peek(size); }
    read(size) { return this.source.read(size); }
}
/** @ignore */
class ByteStreamSource {
    constructor(source) {
        this.source = source;
    }
    cancel(reason) { this.return(reason); }
    peek(size) { return this.next(size, 'peek').value; }
    read(size) { return this.next(size, 'read').value; }
    next(size, cmd = 'read') { return this.source.next({ cmd, size }); }
    throw(value) { return Object.create((this.source.throw && this.source.throw(value)) || ITERATOR_DONE); }
    return(value) { return Object.create((this.source.return && this.source.return(value)) || ITERATOR_DONE); }
}
/** @ignore */
class AsyncByteStreamSource {
    constructor(source) {
        this.source = source;
        this._closedPromise = new Promise((r) => this._closedPromiseResolve = r);
    }
    cancel(reason) {
        return __awaiter(this, void 0, void 0, function* () { yield this.return(reason); });
    }
    get closed() { return this._closedPromise; }
    read(size) {
        return __awaiter(this, void 0, void 0, function* () { return (yield this.next(size, 'read')).value; });
    }
    peek(size) {
        return __awaiter(this, void 0, void 0, function* () { return (yield this.next(size, 'peek')).value; });
    }
    next(size_1) {
        return __awaiter(this, arguments, void 0, function* (size, cmd = 'read') { return (yield this.source.next({ cmd, size })); });
    }
    throw(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (this.source.throw && (yield this.source.throw(value))) || ITERATOR_DONE;
            this._closedPromiseResolve && this._closedPromiseResolve();
            this._closedPromiseResolve = undefined;
            return Object.create(result);
        });
    }
    return(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (this.source.return && (yield this.source.return(value))) || ITERATOR_DONE;
            this._closedPromiseResolve && this._closedPromiseResolve();
            this._closedPromiseResolve = undefined;
            return Object.create(result);
        });
    }
}

//# sourceMappingURL=stream.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/file.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class RandomAccessFile extends ByteStream {
    constructor(buffer, byteLength) {
        super();
        this.position = 0;
        this.buffer = toUint8Array(buffer);
        this.size = byteLength === undefined ? this.buffer.byteLength : byteLength;
    }
    readInt32(position) {
        const { buffer, byteOffset } = this.readAt(position, 4);
        return new DataView(buffer, byteOffset).getInt32(0, true);
    }
    seek(position) {
        this.position = Math.min(position, this.size);
        return position < this.size;
    }
    read(nBytes) {
        const { buffer, size, position } = this;
        if (buffer && position < size) {
            if (typeof nBytes !== 'number') {
                nBytes = Number.POSITIVE_INFINITY;
            }
            this.position = Math.min(size, position + Math.min(size - position, nBytes));
            return buffer.subarray(position, this.position);
        }
        return null;
    }
    readAt(position, nBytes) {
        const buf = this.buffer;
        const end = Math.min(this.size, position + nBytes);
        return buf ? buf.subarray(position, end) : new Uint8Array(nBytes);
    }
    close() { this.buffer && (this.buffer = null); }
    throw(value) { this.close(); return { done: true, value }; }
    return(value) { this.close(); return { done: true, value }; }
}
/** @ignore */
class AsyncRandomAccessFile extends AsyncByteStream {
    constructor(file, byteLength) {
        super();
        this.position = 0;
        this._handle = file;
        if (typeof byteLength === 'number') {
            this.size = byteLength;
        }
        else {
            this._pending = (() => __awaiter(this, void 0, void 0, function* () {
                this.size = (yield file.stat()).size;
                delete this._pending;
            }))();
        }
    }
    readInt32(position) {
        return __awaiter(this, void 0, void 0, function* () {
            const { buffer, byteOffset } = yield this.readAt(position, 4);
            return new DataView(buffer, byteOffset).getInt32(0, true);
        });
    }
    seek(position) {
        return __awaiter(this, void 0, void 0, function* () {
            this._pending && (yield this._pending);
            this.position = Math.min(position, this.size);
            return position < this.size;
        });
    }
    read(nBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            this._pending && (yield this._pending);
            const { _handle: file, size, position } = this;
            if (file && position < size) {
                if (typeof nBytes !== 'number') {
                    nBytes = Number.POSITIVE_INFINITY;
                }
                let pos = position, offset = 0, bytesRead = 0;
                const end = Math.min(size, pos + Math.min(size - pos, nBytes));
                const buffer = new Uint8Array(Math.max(0, (this.position = end) - pos));
                while ((pos += bytesRead) < end && (offset += bytesRead) < buffer.byteLength) {
                    ({ bytesRead } = yield file.read(buffer, offset, buffer.byteLength - offset, pos));
                }
                return buffer;
            }
            return null;
        });
    }
    readAt(position, nBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            this._pending && (yield this._pending);
            const { _handle: file, size } = this;
            if (file && (position + nBytes) < size) {
                const end = Math.min(size, position + nBytes);
                const buffer = new Uint8Array(end - position);
                return (yield file.read(buffer, 0, nBytes, position)).buffer;
            }
            return new Uint8Array(nBytes);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () { const f = this._handle; this._handle = null; f && (yield f.close()); });
    }
    throw(value) {
        return __awaiter(this, void 0, void 0, function* () { yield this.close(); return { done: true, value }; });
    }
    return(value) {
        return __awaiter(this, void 0, void 0, function* () { yield this.close(); return { done: true, value }; });
    }
}

//# sourceMappingURL=file.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/int.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/** @ignore */
const carryBit16 = 1 << 16;
/** @ignore */
function intAsHex(value) {
    if (value < 0) {
        value = 0xFFFFFFFF + value + 1;
    }
    return `0x${value.toString(16)}`;
}
/** @ignore */
const kInt32DecimalDigits = 8;
/** @ignore */
const kPowersOfTen = [
    1,
    10,
    100,
    1000,
    10000,
    100000,
    1000000,
    10000000,
    100000000
];
/** @ignore */
class BaseInt64 {
    constructor(buffer) {
        this.buffer = buffer;
    }
    high() { return this.buffer[1]; }
    low() { return this.buffer[0]; }
    _times(other) {
        // Break the left and right numbers into 16 bit chunks
        // so that we can multiply them without overflow.
        const L = new Uint32Array([
            this.buffer[1] >>> 16,
            this.buffer[1] & 0xFFFF,
            this.buffer[0] >>> 16,
            this.buffer[0] & 0xFFFF
        ]);
        const R = new Uint32Array([
            other.buffer[1] >>> 16,
            other.buffer[1] & 0xFFFF,
            other.buffer[0] >>> 16,
            other.buffer[0] & 0xFFFF
        ]);
        let product = L[3] * R[3];
        this.buffer[0] = product & 0xFFFF;
        let sum = product >>> 16;
        product = L[2] * R[3];
        sum += product;
        product = (L[3] * R[2]) >>> 0;
        sum += product;
        this.buffer[0] += sum << 16;
        this.buffer[1] = (sum >>> 0 < product ? carryBit16 : 0);
        this.buffer[1] += sum >>> 16;
        this.buffer[1] += L[1] * R[3] + L[2] * R[2] + L[3] * R[1];
        this.buffer[1] += (L[0] * R[3] + L[1] * R[2] + L[2] * R[1] + L[3] * R[0]) << 16;
        return this;
    }
    _plus(other) {
        const sum = (this.buffer[0] + other.buffer[0]) >>> 0;
        this.buffer[1] += other.buffer[1];
        if (sum < (this.buffer[0] >>> 0)) {
            ++this.buffer[1];
        }
        this.buffer[0] = sum;
    }
    lessThan(other) {
        return this.buffer[1] < other.buffer[1] ||
            (this.buffer[1] === other.buffer[1] && this.buffer[0] < other.buffer[0]);
    }
    equals(other) {
        return this.buffer[1] === other.buffer[1] && this.buffer[0] == other.buffer[0];
    }
    greaterThan(other) {
        return other.lessThan(this);
    }
    hex() {
        return `${intAsHex(this.buffer[1])} ${intAsHex(this.buffer[0])}`;
    }
}
/** @ignore */
class int_Uint64 extends BaseInt64 {
    times(other) {
        this._times(other);
        return this;
    }
    plus(other) {
        this._plus(other);
        return this;
    }
    /** @nocollapse */
    static from(val, out_buffer = new Uint32Array(2)) {
        return int_Uint64.fromString(typeof (val) === 'string' ? val : val.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromNumber(num, out_buffer = new Uint32Array(2)) {
        // Always parse numbers as strings - pulling out high and low bits
        // directly seems to lose precision sometimes
        // For example:
        //     > -4613034156400212000 >>> 0
        //     721782784
        // The correct lower 32-bits are 721782752
        return int_Uint64.fromString(num.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromString(str, out_buffer = new Uint32Array(2)) {
        const length = str.length;
        const out = new int_Uint64(out_buffer);
        for (let posn = 0; posn < length;) {
            const group = kInt32DecimalDigits < length - posn ?
                kInt32DecimalDigits : length - posn;
            const chunk = new int_Uint64(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0]));
            const multiple = new int_Uint64(new Uint32Array([kPowersOfTen[group], 0]));
            out.times(multiple);
            out.plus(chunk);
            posn += group;
        }
        return out;
    }
    /** @nocollapse */
    static convertArray(values) {
        const data = new Uint32Array(values.length * 2);
        for (let i = -1, n = values.length; ++i < n;) {
            int_Uint64.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 2 * i * 4, 2));
        }
        return data;
    }
    /** @nocollapse */
    static multiply(left, right) {
        const rtrn = new int_Uint64(new Uint32Array(left.buffer));
        return rtrn.times(right);
    }
    /** @nocollapse */
    static add(left, right) {
        const rtrn = new int_Uint64(new Uint32Array(left.buffer));
        return rtrn.plus(right);
    }
}
/** @ignore */
class int_Int64 extends BaseInt64 {
    negate() {
        this.buffer[0] = ~this.buffer[0] + 1;
        this.buffer[1] = ~this.buffer[1];
        if (this.buffer[0] == 0) {
            ++this.buffer[1];
        }
        return this;
    }
    times(other) {
        this._times(other);
        return this;
    }
    plus(other) {
        this._plus(other);
        return this;
    }
    lessThan(other) {
        // force high bytes to be signed
        // eslint-disable-next-line unicorn/prefer-math-trunc
        const this_high = this.buffer[1] << 0;
        // eslint-disable-next-line unicorn/prefer-math-trunc
        const other_high = other.buffer[1] << 0;
        return this_high < other_high ||
            (this_high === other_high && this.buffer[0] < other.buffer[0]);
    }
    /** @nocollapse */
    static from(val, out_buffer = new Uint32Array(2)) {
        return int_Int64.fromString(typeof (val) === 'string' ? val : val.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromNumber(num, out_buffer = new Uint32Array(2)) {
        // Always parse numbers as strings - pulling out high and low bits
        // directly seems to lose precision sometimes
        // For example:
        //     > -4613034156400212000 >>> 0
        //     721782784
        // The correct lower 32-bits are 721782752
        return int_Int64.fromString(num.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromString(str, out_buffer = new Uint32Array(2)) {
        // TODO: Assert that out_buffer is 0 and length = 2
        const negate = str.startsWith('-');
        const length = str.length;
        const out = new int_Int64(out_buffer);
        for (let posn = negate ? 1 : 0; posn < length;) {
            const group = kInt32DecimalDigits < length - posn ?
                kInt32DecimalDigits : length - posn;
            const chunk = new int_Int64(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0]));
            const multiple = new int_Int64(new Uint32Array([kPowersOfTen[group], 0]));
            out.times(multiple);
            out.plus(chunk);
            posn += group;
        }
        return negate ? out.negate() : out;
    }
    /** @nocollapse */
    static convertArray(values) {
        const data = new Uint32Array(values.length * 2);
        for (let i = -1, n = values.length; ++i < n;) {
            int_Int64.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 2 * i * 4, 2));
        }
        return data;
    }
    /** @nocollapse */
    static multiply(left, right) {
        const rtrn = new int_Int64(new Uint32Array(left.buffer));
        return rtrn.times(right);
    }
    /** @nocollapse */
    static add(left, right) {
        const rtrn = new int_Int64(new Uint32Array(left.buffer));
        return rtrn.plus(right);
    }
}
/** @ignore */
class Int128 {
    constructor(buffer) {
        this.buffer = buffer;
        // buffer[3] MSB (high)
        // buffer[2]
        // buffer[1]
        // buffer[0] LSB (low)
    }
    high() {
        return new int_Int64(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
    }
    low() {
        return new int_Int64(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset, 2));
    }
    negate() {
        this.buffer[0] = ~this.buffer[0] + 1;
        this.buffer[1] = ~this.buffer[1];
        this.buffer[2] = ~this.buffer[2];
        this.buffer[3] = ~this.buffer[3];
        if (this.buffer[0] == 0) {
            ++this.buffer[1];
        }
        if (this.buffer[1] == 0) {
            ++this.buffer[2];
        }
        if (this.buffer[2] == 0) {
            ++this.buffer[3];
        }
        return this;
    }
    times(other) {
        // Break the left and right numbers into 32 bit chunks
        // so that we can multiply them without overflow.
        const L0 = new int_Uint64(new Uint32Array([this.buffer[3], 0]));
        const L1 = new int_Uint64(new Uint32Array([this.buffer[2], 0]));
        const L2 = new int_Uint64(new Uint32Array([this.buffer[1], 0]));
        const L3 = new int_Uint64(new Uint32Array([this.buffer[0], 0]));
        const R0 = new int_Uint64(new Uint32Array([other.buffer[3], 0]));
        const R1 = new int_Uint64(new Uint32Array([other.buffer[2], 0]));
        const R2 = new int_Uint64(new Uint32Array([other.buffer[1], 0]));
        const R3 = new int_Uint64(new Uint32Array([other.buffer[0], 0]));
        let product = int_Uint64.multiply(L3, R3);
        this.buffer[0] = product.low();
        const sum = new int_Uint64(new Uint32Array([product.high(), 0]));
        product = int_Uint64.multiply(L2, R3);
        sum.plus(product);
        product = int_Uint64.multiply(L3, R2);
        sum.plus(product);
        this.buffer[1] = sum.low();
        this.buffer[3] = (sum.lessThan(product) ? 1 : 0);
        this.buffer[2] = sum.high();
        const high = new int_Uint64(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
        high.plus(int_Uint64.multiply(L1, R3))
            .plus(int_Uint64.multiply(L2, R2))
            .plus(int_Uint64.multiply(L3, R1));
        this.buffer[3] += int_Uint64.multiply(L0, R3)
            .plus(int_Uint64.multiply(L1, R2))
            .plus(int_Uint64.multiply(L2, R1))
            .plus(int_Uint64.multiply(L3, R0)).low();
        return this;
    }
    plus(other) {
        const sums = new Uint32Array(4);
        sums[3] = (this.buffer[3] + other.buffer[3]) >>> 0;
        sums[2] = (this.buffer[2] + other.buffer[2]) >>> 0;
        sums[1] = (this.buffer[1] + other.buffer[1]) >>> 0;
        sums[0] = (this.buffer[0] + other.buffer[0]) >>> 0;
        if (sums[0] < (this.buffer[0] >>> 0)) {
            ++sums[1];
        }
        if (sums[1] < (this.buffer[1] >>> 0)) {
            ++sums[2];
        }
        if (sums[2] < (this.buffer[2] >>> 0)) {
            ++sums[3];
        }
        this.buffer[3] = sums[3];
        this.buffer[2] = sums[2];
        this.buffer[1] = sums[1];
        this.buffer[0] = sums[0];
        return this;
    }
    hex() {
        return `${intAsHex(this.buffer[3])} ${intAsHex(this.buffer[2])} ${intAsHex(this.buffer[1])} ${intAsHex(this.buffer[0])}`;
    }
    /** @nocollapse */
    static multiply(left, right) {
        const rtrn = new Int128(new Uint32Array(left.buffer));
        return rtrn.times(right);
    }
    /** @nocollapse */
    static add(left, right) {
        const rtrn = new Int128(new Uint32Array(left.buffer));
        return rtrn.plus(right);
    }
    /** @nocollapse */
    static from(val, out_buffer = new Uint32Array(4)) {
        return Int128.fromString(typeof (val) === 'string' ? val : val.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromNumber(num, out_buffer = new Uint32Array(4)) {
        // Always parse numbers as strings - pulling out high and low bits
        // directly seems to lose precision sometimes
        // For example:
        //     > -4613034156400212000 >>> 0
        //     721782784
        // The correct lower 32-bits are 721782752
        return Int128.fromString(num.toString(), out_buffer);
    }
    /** @nocollapse */
    static fromString(str, out_buffer = new Uint32Array(4)) {
        // TODO: Assert that out_buffer is 0 and length = 4
        const negate = str.startsWith('-');
        const length = str.length;
        const out = new Int128(out_buffer);
        for (let posn = negate ? 1 : 0; posn < length;) {
            const group = kInt32DecimalDigits < length - posn ?
                kInt32DecimalDigits : length - posn;
            const chunk = new Int128(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0, 0, 0]));
            const multiple = new Int128(new Uint32Array([kPowersOfTen[group], 0, 0, 0]));
            out.times(multiple);
            out.plus(chunk);
            posn += group;
        }
        return negate ? out.negate() : out;
    }
    /** @nocollapse */
    static convertArray(values) {
        // TODO: Distinguish between string and number at compile-time
        const data = new Uint32Array(values.length * 4);
        for (let i = -1, n = values.length; ++i < n;) {
            Int128.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 4 * 4 * i, 4));
        }
        return data;
    }
}

//# sourceMappingURL=int.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/interval.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
function toIntervalDayTimeInt32Array(objects) {
    var _a, _b;
    const length = objects.length;
    const array = new Int32Array(length * 2);
    for (let oi = 0, ai = 0; oi < length; oi++) {
        const interval = objects[oi];
        array[ai++] = (_a = interval['days']) !== null && _a !== void 0 ? _a : 0;
        array[ai++] = (_b = interval['milliseconds']) !== null && _b !== void 0 ? _b : 0;
    }
    return array;
}
function toIntervalMonthDayNanoInt32Array(objects) {
    var _a, _b;
    const length = objects.length;
    const data = new Int32Array(length * 4);
    for (let oi = 0, ai = 0; oi < length; oi++) {
        const interval = objects[oi];
        data[ai++] = (_a = interval['months']) !== null && _a !== void 0 ? _a : 0;
        data[ai++] = (_b = interval['days']) !== null && _b !== void 0 ? _b : 0;
        const nanoseconds = interval['nanoseconds'];
        if (nanoseconds) {
            const ns = BigInt(nanoseconds);
            // Convert to unsigned 32-bit integers to avoid precision loss
            data[ai++] = Number(ns & BigInt(0xFFFFFFFF)) >>> 0;
            data[ai++] = Number(ns >> BigInt(32)) >>> 0;
        }
        else {
            ai += 2;
        }
    }
    return data;
}
function toIntervalDayTimeObjects(array) {
    const length = array.length;
    const objects = new Array(length / 2);
    for (let ai = 0, oi = 0; ai < length; ai += 2) {
        objects[oi++] = {
            'days': array[ai],
            'milliseconds': array[ai + 1]
        };
    }
    return objects;
}
/** @ignore */
function toIntervalMonthDayNanoObjects(array, stringifyNano) {
    const length = array.length;
    const objects = new Array(length / 4);
    for (let ai = 0, oi = 0; ai < length; ai += 4) {
        const nanoseconds = (BigInt(array[ai + 3]) << BigInt(32)) | BigInt(array[ai + 2] >>> 0);
        objects[oi++] = {
            'months': array[ai],
            'days': array[ai + 1],
            'nanoseconds': (stringifyNano ? `${nanoseconds}` : nanoseconds),
        };
    }
    return objects;
}

//# sourceMappingURL=interval.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/vectorloader.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.










/** @ignore */
class VectorLoader extends Visitor {
    constructor(bytes, nodes, buffers, dictionaries, metadataVersion = MetadataVersion.V5, variadicBufferCounts = []) {
        super();
        this.nodesIndex = -1;
        this.buffersIndex = -1;
        this.variadicBufferIndex = -1;
        this.bytes = bytes;
        this.nodes = nodes;
        this.buffers = buffers;
        this.dictionaries = dictionaries;
        this.metadataVersion = metadataVersion;
        this.variadicBufferCounts = variadicBufferCounts;
    }
    visit(node) {
        return super.visit(node instanceof schema_Field ? node.type : node);
    }
    visitNull(type, { length } = this.nextFieldNode()) {
        return data_makeData({ type, length });
    }
    visitBool(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitInt(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitFloat(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitUtf8(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitLargeUtf8(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitUtf8View(type, { length, nullCount } = this.nextFieldNode()) {
        const nullBitmap = this.readNullBitmap(type, nullCount);
        const views = this.readData(type);
        const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
        return data_makeData({
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        });
    }
    visitBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitLargeBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
    }
    visitBinaryView(type, { length, nullCount } = this.nextFieldNode()) {
        const nullBitmap = this.readNullBitmap(type, nullCount);
        const views = this.readData(type);
        const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
        return data_makeData({
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        });
    }
    visitFixedSizeBinary(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDate(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitTimestamp(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitTime(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDecimal(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitList(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    visitLargeList(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    visitStruct(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), children: this.visitMany(type.children) });
    }
    visitUnion(type, { length, nullCount } = this.nextFieldNode()) {
        if (this.metadataVersion < MetadataVersion.V5) {
            this.readNullBitmap(type, nullCount);
        }
        return type.mode === UnionMode.Sparse
            ? this.visitSparseUnion(type, { length, nullCount })
            : this.visitDenseUnion(type, { length, nullCount });
    }
    visitDenseUnion(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), valueOffsets: this.readOffsets(type), children: this.visitMany(type.children) });
    }
    visitSparseUnion(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), children: this.visitMany(type.children) });
    }
    visitDictionary(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type.indices), dictionary: this.readDictionary(type) });
    }
    visitInterval(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitDuration(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
    }
    visitFixedSizeList(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), 'child': this.visit(type.children[0]) });
    }
    visitMap(type, { length, nullCount } = this.nextFieldNode()) {
        return data_makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), 'child': this.visit(type.children[0]) });
    }
    nextFieldNode() { return this.nodes[++this.nodesIndex]; }
    nextBufferRange() { return this.buffers[++this.buffersIndex]; }
    readNullBitmap(type, nullCount, buffer = this.nextBufferRange()) {
        return nullCount > 0 && this.readData(type, buffer) || new Uint8Array(0);
    }
    readOffsets(type, buffer) { return this.readData(type, buffer); }
    readTypeIds(type, buffer) { return this.readData(type, buffer); }
    readData(_type, { length, offset } = this.nextBufferRange()) {
        return this.bytes.subarray(offset, offset + length);
    }
    readVariadicBuffers(length) {
        return Array.from({ length }, () => this.readData(null));
    }
    nextVariadicBufferCount() {
        var _a;
        return (_a = this.variadicBufferCounts[++this.variadicBufferIndex]) !== null && _a !== void 0 ? _a : 0;
    }
    readDictionary(type) {
        return this.dictionaries.get(type.id);
    }
}
/** @ignore */
class JSONVectorLoader extends VectorLoader {
    constructor(sources, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.sources = sources;
    }
    readNullBitmap(_type, nullCount, { offset } = this.nextBufferRange()) {
        return nullCount <= 0 ? new Uint8Array(0) : packBools(this.sources[offset]);
    }
    readOffsets(_type, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(_type.OffsetArrayType, this.sources[offset]));
    }
    readTypeIds(type, { offset } = this.nextBufferRange()) {
        return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, this.sources[offset]));
    }
    readData(type, { offset } = this.nextBufferRange()) {
        const { sources } = this;
        if (type_DataType.isTimestamp(type)) {
            return toArrayBufferView(Uint8Array, int_Int64.convertArray(sources[offset]));
        }
        else if ((type_DataType.isInt(type) || type_DataType.isTime(type)) && type.bitWidth === 64 || type_DataType.isDuration(type)) {
            return toArrayBufferView(Uint8Array, int_Int64.convertArray(sources[offset]));
        }
        else if (type_DataType.isDate(type) && type.unit === DateUnit.MILLISECOND) {
            return toArrayBufferView(Uint8Array, int_Int64.convertArray(sources[offset]));
        }
        else if (type_DataType.isDecimal(type)) {
            return toArrayBufferView(Uint8Array, Int128.convertArray(sources[offset]));
        }
        else if (type_DataType.isBinary(type) || type_DataType.isLargeBinary(type) || type_DataType.isFixedSizeBinary(type)) {
            return binaryDataFromJSON(sources[offset]);
        }
        else if (type_DataType.isBinaryView(type)) {
            return binaryViewDataFromJSON(sources[offset]);
        }
        else if (type_DataType.isUtf8View(type)) {
            return utf8ViewDataFromJSON(sources[offset]);
        }
        else if (type_DataType.isBool(type)) {
            return packBools(sources[offset]);
        }
        else if (type_DataType.isUtf8(type) || type_DataType.isLargeUtf8(type)) {
            return encodeUtf8(sources[offset].join(''));
        }
        else if (type_DataType.isInterval(type)) {
            switch (type.unit) {
                case IntervalUnit.DAY_TIME:
                    return toIntervalDayTimeInt32Array(sources[offset]);
                case IntervalUnit.MONTH_DAY_NANO:
                    return toIntervalMonthDayNanoInt32Array(sources[offset]);
                default:
                    break;
            }
        }
        return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, sources[offset].map((x) => +x)));
    }
    readVariadicBuffers(length) {
        // Per Arrow C++ reference implementation (cpp/src/arrow/ipc/reader.cc),
        // each variadic buffer is stored as a separate buffer region, matching
        // the IPC format where each is accessed via separate GetBuffer() calls.
        // VARIADIC_DATA_BUFFERS in JSON is an array, but flattenDataSources spreads
        // it so each hex string gets its own sources entry, maintaining 1:1
        // correspondence with BufferRegion entries.
        const buffers = [];
        for (let i = 0; i < length; i++) {
            const { offset } = this.nextBufferRange();
            // sources[offset] is 'any[]' but for variadic buffers it's actually a string
            // after spreading in flattenDataSources. Cast necessary due to heterogeneous
            // sources array structure (most fields are arrays, variadic elements are strings).
            const hexString = this.sources[offset];
            buffers.push(hexStringToBytes(hexString));
        }
        return buffers;
    }
}
/** @ignore */
function hexStringToBytes(hexString) {
    // Parse hex string per Arrow JSON integration format (uppercase hex encoding).
    // Used for: VARIADIC_DATA_BUFFERS elements, Binary DATA (after join),
    // BinaryView PREFIX_HEX and INLINED fields.
    const data = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        data[i >> 1] = Number.parseInt(hexString.slice(i, i + 2), 16);
    }
    return data;
}
/** @ignore */
function binaryDataFromJSON(values) {
    // Arrow JSON Binary/LargeBinary/FixedSizeBinary format:
    // "DATA": ["49BC7D5B6C47D2","3F5FB6D9322026"] (array of hex strings, one per value)
    // Join all values into one continuous hex string, then parse to bytes.
    return hexStringToBytes(values.join(''));
}
/** @ignore */
function parseViewDataFromJSON(views, parseInlined) {
    // Each view is a 16-byte struct: [length: i32, prefix/inlined: 12 bytes, buffer_index: i32, offset: i32]
    const data = new Uint8Array(views.length * 16);
    const dataView = new DataView(data.buffer);
    for (const [i, view] of views.entries()) {
        const offset = i * 16;
        const size = view['SIZE'];
        // Write size (int32 at byte 0)
        dataView.setInt32(offset, size, true);
        if (view['INLINED'] !== undefined) {
            // Inline view: parse INLINED field using provided callback
            const bytes = parseInlined(view['INLINED']);
            for (let j = 0; j < bytes.length && j < 12; j++) {
                data[offset + 4 + j] = bytes[j];
            }
        }
        else {
            // Out-of-line view: write prefix, buffer_index, offset
            const prefix = view['PREFIX_HEX'];
            // Write 4-byte prefix at bytes 4-7
            for (let j = 0; j < 8 && j < prefix.length; j += 2) {
                data[offset + 4 + (j >> 1)] = Number.parseInt(prefix.slice(j, j + 2), 16);
            }
            // Write buffer_index (int32 at byte 8)
            dataView.setInt32(offset + 8, view['BUFFER_INDEX'], true);
            // Write offset (int32 at byte 12)
            dataView.setInt32(offset + 12, view['OFFSET'], true);
        }
    }
    return data;
}
/** @ignore */
function binaryViewDataFromJSON(views) {
    return parseViewDataFromJSON(views, (inlined) => {
        // BinaryView: INLINED is hex-encoded string
        const bytes = new Uint8Array(inlined.length / 2);
        for (let i = 0; i < inlined.length; i += 2) {
            bytes[i >> 1] = Number.parseInt(inlined.slice(i, i + 2), 16);
        }
        return bytes;
    });
}
/** @ignore */
function utf8ViewDataFromJSON(views) {
    return parseViewDataFromJSON(views, (inlined) => {
        // Utf8View: INLINED is UTF-8 string - encode to bytes
        const encoder = new TextEncoder();
        return encoder.encode(inlined);
    });
}
class CompressedVectorLoader extends VectorLoader {
    constructor(bodyChunks, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
        super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
        this.bodyChunks = bodyChunks;
    }
    readData(_type, _buffer = this.nextBufferRange()) {
        return this.bodyChunks[this.buffersIndex];
    }
}

//# sourceMappingURL=vectorloader.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/typecomparator.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @ignore */
class TypeComparator extends Visitor {
    compareSchemas(schema, other) {
        return (schema === other) || (other instanceof schema.constructor &&
            this.compareManyFields(schema.fields, other.fields));
    }
    compareManyFields(fields, others) {
        return (fields === others) || (Array.isArray(fields) &&
            Array.isArray(others) &&
            fields.length === others.length &&
            fields.every((f, i) => this.compareFields(f, others[i])));
    }
    compareFields(field, other) {
        return (field === other) || (other instanceof field.constructor &&
            field.name === other.name &&
            field.nullable === other.nullable &&
            this.visit(field.type, other.type));
    }
}
function compareConstructor(type, other) {
    return other instanceof type.constructor;
}
function compareAny(type, other) {
    return (type === other) || compareConstructor(type, other);
}
function compareInt(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.bitWidth === other.bitWidth &&
        type.isSigned === other.isSigned);
}
function compareFloat(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.precision === other.precision);
}
function compareFixedSizeBinary(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.byteWidth === other.byteWidth);
}
function compareDate(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.unit === other.unit);
}
function compareTimestamp(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.unit === other.unit &&
        type.timezone === other.timezone);
}
function compareTime(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.unit === other.unit &&
        type.bitWidth === other.bitWidth);
}
function compareList(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.children.length === other.children.length &&
        typecomparator_instance.compareManyFields(type.children, other.children));
}
function compareStruct(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.children.length === other.children.length &&
        typecomparator_instance.compareManyFields(type.children, other.children));
}
function compareUnion(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.mode === other.mode &&
        type.typeIds.every((x, i) => x === other.typeIds[i]) &&
        typecomparator_instance.compareManyFields(type.children, other.children));
}
function compareDictionary(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.id === other.id &&
        type.isOrdered === other.isOrdered &&
        typecomparator_instance.visit(type.indices, other.indices) &&
        typecomparator_instance.visit(type.dictionary, other.dictionary));
}
function compareInterval(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.unit === other.unit);
}
function compareDuration(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.unit === other.unit);
}
function compareFixedSizeList(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.listSize === other.listSize &&
        type.children.length === other.children.length &&
        typecomparator_instance.compareManyFields(type.children, other.children));
}
function compareMap(type, other) {
    return (type === other) || (compareConstructor(type, other) &&
        type.keysSorted === other.keysSorted &&
        type.children.length === other.children.length &&
        typecomparator_instance.compareManyFields(type.children, other.children));
}
TypeComparator.prototype.visitNull = compareAny;
TypeComparator.prototype.visitBool = compareAny;
TypeComparator.prototype.visitInt = compareInt;
TypeComparator.prototype.visitInt8 = compareInt;
TypeComparator.prototype.visitInt16 = compareInt;
TypeComparator.prototype.visitInt32 = compareInt;
TypeComparator.prototype.visitInt64 = compareInt;
TypeComparator.prototype.visitUint8 = compareInt;
TypeComparator.prototype.visitUint16 = compareInt;
TypeComparator.prototype.visitUint32 = compareInt;
TypeComparator.prototype.visitUint64 = compareInt;
TypeComparator.prototype.visitFloat = compareFloat;
TypeComparator.prototype.visitFloat16 = compareFloat;
TypeComparator.prototype.visitFloat32 = compareFloat;
TypeComparator.prototype.visitFloat64 = compareFloat;
TypeComparator.prototype.visitUtf8 = compareAny;
TypeComparator.prototype.visitLargeUtf8 = compareAny;
TypeComparator.prototype.visitUtf8View = compareAny;
TypeComparator.prototype.visitBinary = compareAny;
TypeComparator.prototype.visitLargeBinary = compareAny;
TypeComparator.prototype.visitBinaryView = compareAny;
TypeComparator.prototype.visitFixedSizeBinary = compareFixedSizeBinary;
TypeComparator.prototype.visitDate = compareDate;
TypeComparator.prototype.visitDateDay = compareDate;
TypeComparator.prototype.visitDateMillisecond = compareDate;
TypeComparator.prototype.visitTimestamp = compareTimestamp;
TypeComparator.prototype.visitTimestampSecond = compareTimestamp;
TypeComparator.prototype.visitTimestampMillisecond = compareTimestamp;
TypeComparator.prototype.visitTimestampMicrosecond = compareTimestamp;
TypeComparator.prototype.visitTimestampNanosecond = compareTimestamp;
TypeComparator.prototype.visitTime = compareTime;
TypeComparator.prototype.visitTimeSecond = compareTime;
TypeComparator.prototype.visitTimeMillisecond = compareTime;
TypeComparator.prototype.visitTimeMicrosecond = compareTime;
TypeComparator.prototype.visitTimeNanosecond = compareTime;
TypeComparator.prototype.visitDecimal = compareAny;
TypeComparator.prototype.visitList = compareList;
TypeComparator.prototype.visitLargeList = compareList;
TypeComparator.prototype.visitStruct = compareStruct;
TypeComparator.prototype.visitUnion = compareUnion;
TypeComparator.prototype.visitDenseUnion = compareUnion;
TypeComparator.prototype.visitSparseUnion = compareUnion;
TypeComparator.prototype.visitDictionary = compareDictionary;
TypeComparator.prototype.visitInterval = compareInterval;
TypeComparator.prototype.visitIntervalDayTime = compareInterval;
TypeComparator.prototype.visitIntervalYearMonth = compareInterval;
TypeComparator.prototype.visitIntervalMonthDayNano = compareInterval;
TypeComparator.prototype.visitDuration = compareDuration;
TypeComparator.prototype.visitDurationSecond = compareDuration;
TypeComparator.prototype.visitDurationMillisecond = compareDuration;
TypeComparator.prototype.visitDurationMicrosecond = compareDuration;
TypeComparator.prototype.visitDurationNanosecond = compareDuration;
TypeComparator.prototype.visitFixedSizeList = compareFixedSizeList;
TypeComparator.prototype.visitMap = compareMap;
/** @ignore */
const typecomparator_instance = new TypeComparator();
function compareSchemas(schema, other) {
    return typecomparator_instance.compareSchemas(schema, other);
}
function compareFields(field, other) {
    return typecomparator_instance.compareFields(field, other);
}
function typecomparator_compareTypes(type, other) {
    return typecomparator_instance.visit(type, other);
}

//# sourceMappingURL=typecomparator.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/util/recordbatch.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
function distributeVectorsIntoRecordBatches(schema, vecs) {
    return uniformlyDistributeChunksAcrossRecordBatches(schema, vecs.map((v) => v.data.concat()));
}
/** @ignore */
function uniformlyDistributeChunksAcrossRecordBatches(schema, cols) {
    const fields = [...schema.fields];
    const batches = [];
    const memo = { numBatches: cols.reduce((n, c) => Math.max(n, c.length), 0) };
    let numBatches = 0, batchLength = 0;
    let i = -1;
    const numColumns = cols.length;
    let child, children = [];
    while (memo.numBatches-- > 0) {
        for (batchLength = Number.POSITIVE_INFINITY, i = -1; ++i < numColumns;) {
            children[i] = child = cols[i].shift();
            batchLength = Math.min(batchLength, child ? child.length : batchLength);
        }
        if (Number.isFinite(batchLength)) {
            children = distributeChildren(fields, batchLength, children, cols, memo);
            if (batchLength > 0) {
                batches[numBatches++] = data_makeData({
                    type: new Struct(fields),
                    length: batchLength,
                    nullCount: 0,
                    children: children.slice()
                });
            }
        }
    }
    return [
        schema = schema.assign(fields),
        batches.map((data) => new recordbatch_RecordBatch(schema, data))
    ];
}
/** @ignore */
function distributeChildren(fields, batchLength, children, columns, memo) {
    var _a;
    const nullBitmapSize = ((batchLength + 63) & ~63) >> 3;
    for (let i = -1, n = columns.length; ++i < n;) {
        const child = children[i];
        const length = child === null || child === void 0 ? void 0 : child.length;
        if (length >= batchLength) {
            if (length === batchLength) {
                children[i] = child;
            }
            else {
                children[i] = child.slice(0, batchLength);
                memo.numBatches = Math.max(memo.numBatches, columns[i].unshift(child.slice(batchLength, length - batchLength)));
            }
        }
        else {
            const field = fields[i];
            fields[i] = field.clone({ nullable: true });
            children[i] = (_a = child === null || child === void 0 ? void 0 : child._changeLengthAndBackfillNullBitmap(batchLength)) !== null && _a !== void 0 ? _a : data_makeData({
                type: field.type,
                length: batchLength,
                nullCount: batchLength,
                nullBitmap: new Uint8Array(nullBitmapSize)
            });
        }
    }
    return children;
}

//# sourceMappingURL=recordbatch.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/table.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
var table_a;















/** @ignore */
const kTableSymbol = Symbol.for('apache-arrow/Table');
/**
 * Tables are collections of {@link Vector}s and have a {@link Schema}. Use the convenience methods {@link makeTable}
 * or {@link tableFromArrays} to create a table in JavaScript. To create a table from the IPC format, use
 * {@link tableFromIPC}.
 */
class table_Table {
    /**
     * Check if an object is an instance of Table.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isTable(x) {
        return (x === null || x === void 0 ? void 0 : x[kTableSymbol]) === true;
    }
    constructor(...args) {
        var _b, _c;
        if (args.length === 0) {
            this.batches = [];
            this.schema = new apache_arrow_schema_Schema([]);
            this._offsets = [0];
            return this;
        }
        let schema;
        let offsets;
        if (args[0] instanceof apache_arrow_schema_Schema) {
            schema = args.shift();
        }
        if (args.at(-1) instanceof Uint32Array) {
            offsets = args.pop();
        }
        const unwrap = (x) => {
            if (x) {
                if (x instanceof recordbatch_RecordBatch) {
                    return [x];
                }
                else if (x instanceof table_Table) {
                    return x.batches;
                }
                else if (x instanceof data_Data) {
                    if (x.type instanceof Struct) {
                        return [new recordbatch_RecordBatch(new apache_arrow_schema_Schema(x.type.children), x)];
                    }
                }
                else if (Array.isArray(x)) {
                    return x.flatMap(v => unwrap(v));
                }
                else if (typeof x[Symbol.iterator] === 'function') {
                    return [...x].flatMap(v => unwrap(v));
                }
                else if (typeof x === 'object') {
                    const keys = Object.keys(x);
                    const vecs = keys.map((k) => new vector_Vector([x[k]]));
                    const batchSchema = schema !== null && schema !== void 0 ? schema : new apache_arrow_schema_Schema(keys.map((k, i) => new schema_Field(String(k), vecs[i].type, vecs[i].nullable)));
                    const [, batches] = distributeVectorsIntoRecordBatches(batchSchema, vecs);
                    return batches.length === 0 ? [new recordbatch_RecordBatch(x)] : batches;
                }
            }
            return [];
        };
        const batches = args.flatMap(v => unwrap(v));
        schema = (_c = schema !== null && schema !== void 0 ? schema : (_b = batches[0]) === null || _b === void 0 ? void 0 : _b.schema) !== null && _c !== void 0 ? _c : new apache_arrow_schema_Schema([]);
        if (!(schema instanceof apache_arrow_schema_Schema)) {
            throw new TypeError('Table constructor expects a [Schema, RecordBatch[]] pair.');
        }
        for (const batch of batches) {
            if (!(batch instanceof recordbatch_RecordBatch)) {
                throw new TypeError('Table constructor expects a [Schema, RecordBatch[]] pair.');
            }
            if (!compareSchemas(schema, batch.schema)) {
                throw new TypeError('Table and inner RecordBatch schemas must be equivalent.');
            }
        }
        this.schema = schema;
        this.batches = batches;
        this._offsets = offsets !== null && offsets !== void 0 ? offsets : computeChunkOffsets(this.data);
    }
    /**
     * The contiguous {@link RecordBatch `RecordBatch`} chunks of the Table rows.
     */
    get data() { return this.batches.map(({ data }) => data); }
    /**
     * The number of columns in this Table.
     */
    get numCols() { return this.schema.fields.length; }
    /**
     * The number of rows in this Table.
     */
    get numRows() {
        return this.data.reduce((numRows, data) => numRows + data.length, 0);
    }
    /**
     * The number of null rows in this Table.
     */
    get nullCount() {
        if (this._nullCount === -1) {
            this._nullCount = computeChunkNullCounts(this.data);
        }
        return this._nullCount;
    }
    /**
     * Check whether an element is null.
     *
     * @param index The index at which to read the validity bitmap.
     */
    // @ts-ignore
    isValid(index) { return false; }
    /**
     * Get an element value by position.
     *
     * @param index The index of the element to read.
     */
    // @ts-ignore
    get(index) { return null; }
    /**
      * Get an element value by position.
      * @param index The index of the element to read. A negative index will count back from the last element.
      */
    // @ts-ignore
    at(index) {
        return this.get(wrapIndex(index, this.numRows));
    }
    /**
     * Set an element value by position.
     *
     * @param index The index of the element to write.
     * @param value The value to set.
     */
    // @ts-ignore
    set(index, value) { return; }
    /**
     * Retrieve the index of the first occurrence of a value in an Vector.
     *
     * @param element The value to locate in the Vector.
     * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
     */
    // @ts-ignore
    indexOf(element, offset) { return -1; }
    /**
     * Iterator for rows in this Table.
     */
    [Symbol.iterator]() {
        if (this.batches.length > 0) {
            return iterator_instance.visit(new vector_Vector(this.data));
        }
        return (new Array(0))[Symbol.iterator]();
    }
    /**
     * Return a JavaScript Array of the Table rows.
     *
     * @returns An Array of Table rows.
     */
    toArray() {
        return [...this];
    }
    /**
     * Returns a string representation of the Table rows.
     *
     * @returns A string representation of the Table rows.
     */
    toString() {
        return `[\n  ${this.toArray().join(',\n  ')}\n]`;
    }
    /**
     * Combines two or more Tables of the same schema.
     *
     * @param others Additional Tables to add to the end of this Tables.
     */
    concat(...others) {
        const schema = this.schema;
        const data = this.data.concat(others.flatMap(({ data }) => data));
        return new table_Table(schema, data.map((data) => new recordbatch_RecordBatch(schema, data)));
    }
    /**
     * Return a zero-copy sub-section of this Table.
     *
     * @param begin The beginning of the specified portion of the Table.
     * @param end The end of the specified portion of the Table. This is exclusive of the element at the index 'end'.
     */
    slice(begin, end) {
        const schema = this.schema;
        [begin, end] = clampRange({ length: this.numRows }, begin, end);
        const data = sliceChunks(this.data, this._offsets, begin, end);
        return new table_Table(schema, data.map((chunk) => new recordbatch_RecordBatch(schema, chunk)));
    }
    /**
     * Returns a child Vector by name, or null if this Vector has no child with the given name.
     *
     * @param name The name of the child to retrieve.
     */
    getChild(name) {
        return this.getChildAt(this.schema.fields.findIndex((f) => f.name === name));
    }
    /**
     * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
     *
     * @param index The index of the child to retrieve.
     */
    getChildAt(index) {
        if (index > -1 && index < this.schema.fields.length) {
            const data = this.data.map((data) => data.children[index]);
            if (data.length === 0) {
                const { type } = this.schema.fields[index];
                const empty = data_makeData({ type, length: 0, nullCount: 0 });
                data.push(empty._changeLengthAndBackfillNullBitmap(this.numRows));
            }
            return new vector_Vector(data);
        }
        return null;
    }
    /**
     * Sets a child Vector by name.
     *
     * @param name The name of the child to overwrite.
     * @returns A new Table with the supplied child for the specified name.
     */
    setChild(name, child) {
        var _b;
        return this.setChildAt((_b = this.schema.fields) === null || _b === void 0 ? void 0 : _b.findIndex((f) => f.name === name), child);
    }
    setChildAt(index, child) {
        let schema = this.schema;
        let batches = [...this.batches];
        if (index > -1 && index < this.numCols) {
            if (!child) {
                child = new vector_Vector([data_makeData({ type: new type_Null, length: this.numRows })]);
            }
            const fields = schema.fields.slice();
            const field = fields[index].clone({ type: child.type });
            const children = this.schema.fields.map((_, i) => this.getChildAt(i));
            [fields[index], children[index]] = [field, child];
            [schema, batches] = distributeVectorsIntoRecordBatches(schema, children);
        }
        return new table_Table(schema, batches);
    }
    /**
     * Construct a new Table containing only specified columns.
     *
     * @param columnNames Names of columns to keep.
     * @returns A new Table of columns matching the specified names.
     */
    select(columnNames) {
        const nameToIndex = this.schema.fields.reduce((m, f, i) => m.set(f.name, i), new Map());
        return this.selectAt(columnNames.map((columnName) => nameToIndex.get(columnName)).filter((x) => x > -1));
    }
    /**
     * Construct a new Table containing only columns at the specified indices.
     *
     * @param columnIndices Indices of columns to keep.
     * @returns A new Table of columns at the specified indices.
     */
    selectAt(columnIndices) {
        const schema = this.schema.selectAt(columnIndices);
        const data = this.batches.map((batch) => batch.selectAt(columnIndices));
        return new table_Table(schema, data);
    }
    assign(other) {
        const fields = this.schema.fields;
        const [indices, oldToNew] = other.schema.fields.reduce((memo, f2, newIdx) => {
            const [indices, oldToNew] = memo;
            const i = fields.findIndex((f) => f.name === f2.name);
            ~i ? (oldToNew[i] = newIdx) : indices.push(newIdx);
            return memo;
        }, [[], []]);
        const schema = this.schema.assign(other.schema);
        const columns = [
            ...fields.map((_, i) => [i, oldToNew[i]]).map(([i, j]) => (j === undefined ? this.getChildAt(i) : other.getChildAt(j))),
            ...indices.map((i) => other.getChildAt(i))
        ].filter(Boolean);
        return new table_Table(...distributeVectorsIntoRecordBatches(schema, columns));
    }
}
table_a = Symbol.toStringTag;
// Initialize this static property via an IIFE so bundlers don't tree-shake
// out this logic, but also so we're still compliant with `"sideEffects": false`
table_Table[table_a] = ((proto) => {
    proto.schema = null;
    proto.batches = [];
    proto._offsets = new Uint32Array([0]);
    proto._nullCount = -1;
    proto[Symbol.isConcatSpreadable] = true;
    proto[kTableSymbol] = true;
    proto['isValid'] = wrapChunkedCall1(isChunkedValid);
    proto['get'] = wrapChunkedCall1(get_instance.getVisitFn(Type.Struct));
    proto['set'] = wrapChunkedCall2(instance.getVisitFn(Type.Struct));
    proto['indexOf'] = wrapChunkedIndexOf(indexof_instance.getVisitFn(Type.Struct));
    return 'Table';
})(table_Table.prototype);
Object.defineProperty(table_Table, Symbol.hasInstance, {
    value: function isTableInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === table_Table && table_Table.isTable(instance));
    },
});
/**
 * Creates a new Table from an object of typed arrays.
 *
*  @example
 * ```ts
 * const table = makeTable({
 *   a: new Int8Array([1, 2, 3]),
 * })
 * ```
 *
 * @param input Input an object of typed arrays.
 * @returns A new Table.
 */
function makeTable(input) {
    const vecs = {};
    const inputs = Object.entries(input);
    for (const [key, col] of inputs) {
        vecs[key] = makeVector(col);
    }
    return new table_Table(vecs);
}
/**
 * Creates a new Table from an object of typed arrays or JavaScript arrays.
 *
 *  @example
 * ```ts
 * const table = tableFromArrays({
 *   a: [1, 2, 3],
 *   b: new Int8Array([1, 2, 3]),
 * })
 * ```
 *
 * @param input Input an object of typed arrays or JavaScript arrays.
 * @returns A new Table.
 */
function tableFromArrays(input) {
    const vecs = {};
    const inputs = Object.entries(input);
    for (const [key, col] of inputs) {
        vecs[key] = vectorFromArray(col);
    }
    return new table_Table(vecs);
}

//# sourceMappingURL=table.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/recordbatch.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
var recordbatch_a;










/** @ignore */
const kRecordBatchSymbol = Symbol.for('apache-arrow/RecordBatch');
/**
 * A RecordBatch is a collection of equal-length columns conforming to a
 * particular {@link Schema}. A {@link Table} is composed of one or more
 * RecordBatches.
 */
class recordbatch_RecordBatch {
    /**
     * Check if an object is an instance of RecordBatch.
     * This works across different instances of the Arrow library.
     */
    /** @nocollapse */ static isRecordBatch(x) {
        return (x === null || x === void 0 ? void 0 : x[kRecordBatchSymbol]) === true;
    }
    constructor(...args) {
        switch (args.length) {
            case 3:
            case 2: {
                [this.schema] = args;
                if (!(this.schema instanceof apache_arrow_schema_Schema)) {
                    throw new TypeError('RecordBatch constructor expects a [Schema, Data] pair.');
                }
                [,
                    this.data = data_makeData({
                        nullCount: 0,
                        type: new Struct(this.schema.fields),
                        children: this.schema.fields.map((f) => data_makeData({ type: f.type, nullCount: 0 }))
                    }),
                    this._metadata = new Map()] = args;
                if (!(this.data instanceof data_Data)) {
                    throw new TypeError('RecordBatch constructor expects a [Schema, Data] pair.');
                }
                [this.schema, this.data] = ensureSameLengthData(this.schema, this.data.children, this.data.length);
                break;
            }
            case 1: {
                const [obj] = args;
                const { fields, children, length } = Object.keys(obj).reduce((memo, name, i) => {
                    memo.children[i] = obj[name];
                    memo.length = Math.max(memo.length, obj[name].length);
                    memo.fields[i] = schema_Field.new({ name, type: obj[name].type, nullable: true });
                    return memo;
                }, {
                    length: 0,
                    fields: new Array(),
                    children: new Array(),
                });
                const schema = new apache_arrow_schema_Schema(fields);
                const data = data_makeData({ type: new Struct(fields), length, children, nullCount: 0 });
                [this.schema, this.data] = ensureSameLengthData(schema, data.children, length);
                this._metadata = new Map();
                break;
            }
            default: throw new TypeError('RecordBatch constructor expects an Object mapping names to child Data, or a [Schema, Data] pair.');
        }
    }
    /**
     * Custom metadata for this RecordBatch.
     */
    get metadata() { return this._metadata; }
    get dictionaries() {
        return this._dictionaries || (this._dictionaries = collectDictionaries(this.schema.fields, this.data.children));
    }
    /**
     * The number of columns in this RecordBatch.
     */
    get numCols() { return this.schema.fields.length; }
    /**
     * The number of rows in this RecordBatch.
     */
    get numRows() { return this.data.length; }
    /**
     * The number of null rows in this RecordBatch.
     */
    get nullCount() {
        return this.data.nullCount;
    }
    /**
     * Check whether an row is null.
     * @param index The index at which to read the validity bitmap.
     */
    isValid(index) {
        return this.data.getValid(index);
    }
    /**
     * Get a row by position.
     * @param index The index of the row to read.
     */
    get(index) {
        return get_instance.visit(this.data, index);
    }
    /**
      * Get a row value by position.
      * @param index The index of the row to read. A negative index will count back from the last row.
      */
    at(index) {
        return this.get(wrapIndex(index, this.numRows));
    }
    /**
     * Set a row by position.
     * @param index The index of the row to write.
     * @param value The value to set.
     */
    set(index, value) {
        return instance.visit(this.data, index, value);
    }
    /**
     * Retrieve the index of the first occurrence of a row in an RecordBatch.
     * @param element The row to locate in the RecordBatch.
     * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
     */
    indexOf(element, offset) {
        return indexof_instance.visit(this.data, element, offset);
    }
    /**
     * Iterator for rows in this RecordBatch.
     */
    [Symbol.iterator]() {
        return iterator_instance.visit(new vector_Vector([this.data]));
    }
    /**
     * Return a JavaScript Array of the RecordBatch rows.
     * @returns An Array of RecordBatch rows.
     */
    toArray() {
        return [...this];
    }
    /**
     * Combines two or more RecordBatch of the same schema.
     * @param others Additional RecordBatch to add to the end of this RecordBatch.
     */
    concat(...others) {
        return new table_Table(this.schema, [this, ...others]);
    }
    /**
     * Return a zero-copy sub-section of this RecordBatch.
     * @param start The beginning of the specified portion of the RecordBatch.
     * @param end The end of the specified portion of the RecordBatch. This is exclusive of the row at the index 'end'.
     */
    slice(begin, end) {
        const [slice] = new vector_Vector([this.data]).slice(begin, end).data;
        return new recordbatch_RecordBatch(this.schema, slice, this._metadata);
    }
    /**
     * Returns a child Vector by name, or null if this Vector has no child with the given name.
     * @param name The name of the child to retrieve.
     */
    getChild(name) {
        var _b;
        return this.getChildAt((_b = this.schema.fields) === null || _b === void 0 ? void 0 : _b.findIndex((f) => f.name === name));
    }
    /**
     * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
     * @param index The index of the child to retrieve.
     */
    getChildAt(index) {
        if (index > -1 && index < this.schema.fields.length) {
            return new vector_Vector([this.data.children[index]]);
        }
        return null;
    }
    /**
     * Sets a child Vector by name.
     * @param name The name of the child to overwrite.
     * @returns A new RecordBatch with the new child for the specified name.
     */
    setChild(name, child) {
        var _b;
        return this.setChildAt((_b = this.schema.fields) === null || _b === void 0 ? void 0 : _b.findIndex((f) => f.name === name), child);
    }
    setChildAt(index, child) {
        let schema = this.schema;
        let data = this.data;
        if (index > -1 && index < this.numCols) {
            if (!child) {
                child = new vector_Vector([data_makeData({ type: new type_Null, length: this.numRows })]);
            }
            const fields = schema.fields.slice();
            const children = data.children.slice();
            const field = fields[index].clone({ type: child.type });
            [fields[index], children[index]] = [field, child.data[0]];
            schema = new apache_arrow_schema_Schema(fields, new Map(this.schema.metadata));
            data = data_makeData({ type: new Struct(fields), length: data.length, children });
        }
        return new recordbatch_RecordBatch(schema, data, this._metadata);
    }
    /**
     * Construct a new RecordBatch containing only specified columns.
     *
     * @param columnNames Names of columns to keep.
     * @returns A new RecordBatch of columns matching the specified names.
     */
    select(columnNames) {
        const schema = this.schema.select(columnNames);
        const type = new Struct(schema.fields);
        const children = [];
        for (const name of columnNames) {
            const index = this.schema.fields.findIndex((f) => f.name === name);
            if (~index) {
                children[index] = this.data.children[index];
            }
        }
        return new recordbatch_RecordBatch(schema, data_makeData({ type, length: this.numRows, children }), this._metadata);
    }
    /**
     * Construct a new RecordBatch containing only columns at the specified indices.
     *
     * @param columnIndices Indices of columns to keep.
     * @returns A new RecordBatch of columns matching at the specified indices.
     */
    selectAt(columnIndices) {
        const schema = this.schema.selectAt(columnIndices);
        const children = columnIndices.map((i) => this.data.children[i]).filter(Boolean);
        const subset = data_makeData({ type: new Struct(schema.fields), length: this.numRows, children });
        return new recordbatch_RecordBatch(schema, subset, this._metadata);
    }
}
recordbatch_a = Symbol.toStringTag;
// Initialize this static property via an IIFE so bundlers don't tree-shake
// out this logic, but also so we're still compliant with `"sideEffects": false`
recordbatch_RecordBatch[recordbatch_a] = ((proto) => {
    proto._nullCount = -1;
    proto[Symbol.isConcatSpreadable] = true;
    proto[kRecordBatchSymbol] = true;
    return 'RecordBatch';
})(recordbatch_RecordBatch.prototype);
Object.defineProperty(recordbatch_RecordBatch, Symbol.hasInstance, {
    value: function isRecordBatchInstance(instance) {
        return Function.prototype[Symbol.hasInstance].call(this, instance)
            || (this === recordbatch_RecordBatch && recordbatch_RecordBatch.isRecordBatch(instance));
    },
});
/** @ignore */
function ensureSameLengthData(schema, chunks, maxLength = chunks.reduce((max, col) => Math.max(max, col.length), 0)) {
    var _b;
    const fields = [...schema.fields];
    const children = [...chunks];
    const nullBitmapSize = ((maxLength + 63) & ~63) >> 3;
    for (const [idx, field] of schema.fields.entries()) {
        const chunk = chunks[idx];
        if (!chunk || chunk.length !== maxLength) {
            fields[idx] = field.clone({ nullable: true });
            children[idx] = (_b = chunk === null || chunk === void 0 ? void 0 : chunk._changeLengthAndBackfillNullBitmap(maxLength)) !== null && _b !== void 0 ? _b : data_makeData({
                type: field.type,
                length: maxLength,
                nullCount: maxLength,
                nullBitmap: new Uint8Array(nullBitmapSize)
            });
        }
    }
    return [
        schema.assign(fields),
        data_makeData({ type: new Struct(fields), length: maxLength, children })
    ];
}
/** @ignore */
function collectDictionaries(fields, children, dictionaries = new Map()) {
    var _b, _c;
    if (((_b = fields === null || fields === void 0 ? void 0 : fields.length) !== null && _b !== void 0 ? _b : 0) > 0 && ((fields === null || fields === void 0 ? void 0 : fields.length) === (children === null || children === void 0 ? void 0 : children.length))) {
        for (let i = -1, n = fields.length; ++i < n;) {
            const { type } = fields[i];
            const data = children[i];
            for (const next of [data, ...(((_c = data === null || data === void 0 ? void 0 : data.dictionary) === null || _c === void 0 ? void 0 : _c.data) || [])]) {
                collectDictionaries(type.children, next === null || next === void 0 ? void 0 : next.children, dictionaries);
            }
            if (type_DataType.isDictionary(type)) {
                const { id } = type;
                if (!dictionaries.has(id)) {
                    if (data === null || data === void 0 ? void 0 : data.dictionary) {
                        dictionaries.set(id, data.dictionary);
                    }
                }
                else if (dictionaries.get(id) !== data.dictionary) {
                    throw new Error(`Cannot create Schema containing two different dictionaries with the same Id`);
                }
            }
        }
    }
    return dictionaries;
}
/**
 * An internal class used by the `RecordBatchReader` and `RecordBatchWriter`
 * implementations to differentiate between a stream with valid zero-length
 * RecordBatches, and a stream with a Schema message, but no RecordBatches.
 * @see https://github.com/apache/arrow/pull/4373
 * @ignore
 * @private
 */
class _InternalEmptyPlaceholderRecordBatch extends recordbatch_RecordBatch {
    constructor(schema, metadata) {
        const children = schema.fields.map((f) => data_makeData({ type: f.type }));
        const data = data_makeData({ type: new Struct(schema.fields), length: 0, nullCount: 0, children });
        super(schema, data, metadata || new Map());
    }
}

//# sourceMappingURL=recordbatch.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/message.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.









/** @ignore */ const invalidMessageType = (type) => `Expected ${MessageHeader[type]} Message in stream, but was null or length 0.`;
/** @ignore */ const nullMessage = (type) => `Header pointer of flatbuffer-encoded ${MessageHeader[type]} Message is null or length 0.`;
/** @ignore */ const invalidMessageMetadata = (expected, actual) => `Expected to read ${expected} metadata bytes, but only read ${actual}.`;
/** @ignore */ const invalidMessageBodyLength = (expected, actual) => `Expected to read ${expected} bytes for message body, but only read ${actual}.`;
/** @ignore */
class MessageReader {
    constructor(source) {
        this.source = source instanceof ByteStream ? source : new ByteStream(source);
    }
    [Symbol.iterator]() { return this; }
    next() {
        let r;
        if ((r = this.readMetadataLength()).done) {
            return ITERATOR_DONE;
        }
        // ARROW-6313: If the first 4 bytes are continuation indicator (-1), read
        // the next 4 for the 32-bit metadata length. Otherwise, assume this is a
        // pre-v0.15 message, where the first 4 bytes are the metadata length.
        if ((r.value === -1) &&
            (r = this.readMetadataLength()).done) {
            return ITERATOR_DONE;
        }
        if ((r = this.readMetadata(r.value)).done) {
            return ITERATOR_DONE;
        }
        return r;
    }
    throw(value) { return this.source.throw(value); }
    return(value) { return this.source.return(value); }
    readMessage(type) {
        let r;
        if ((r = this.next()).done) {
            return null;
        }
        if ((type != null) && r.value.headerType !== type) {
            throw new Error(invalidMessageType(type));
        }
        return r.value;
    }
    readMessageBody(bodyLength) {
        if (bodyLength <= 0) {
            return new Uint8Array(0);
        }
        const buf = toUint8Array(this.source.read(bodyLength));
        if (buf.byteLength < bodyLength) {
            throw new Error(invalidMessageBodyLength(bodyLength, buf.byteLength));
        }
        // 1. Work around bugs in fs.ReadStream's internal Buffer pooling, see: https://github.com/nodejs/node/issues/24817
        // 2. Work around https://github.com/whatwg/streams/blob/0ebe4b042e467d9876d80ae045de3843092ad797/reference-implementation/lib/helpers.js#L126
        return /* 1. */ (buf.byteOffset % 8 === 0) &&
            /* 2. */ (buf.byteOffset + buf.byteLength) <= buf.buffer.byteLength ? buf : buf.slice();
    }
    readSchema(throwIfNull = false) {
        const type = MessageHeader.Schema;
        const message = this.readMessage(type);
        const schema = message === null || message === void 0 ? void 0 : message.header();
        if (throwIfNull && !schema) {
            throw new Error(nullMessage(type));
        }
        return schema;
    }
    readMetadataLength() {
        const buf = this.source.read(PADDING);
        const bb = buf && new flatbuffers/* ByteBuffer */.$F(buf);
        const len = (bb === null || bb === void 0 ? void 0 : bb.readInt32(0)) || 0;
        return { done: len === 0, value: len };
    }
    readMetadata(metadataLength) {
        const buf = this.source.read(metadataLength);
        if (!buf) {
            return ITERATOR_DONE;
        }
        if (buf.byteLength < metadataLength) {
            throw new Error(invalidMessageMetadata(metadataLength, buf.byteLength));
        }
        return { done: false, value: Message.decode(buf) };
    }
}
/** @ignore */
class AsyncMessageReader {
    constructor(source, byteLength) {
        this.source = source instanceof AsyncByteStream ? source
            : isFileHandle(source)
                ? new AsyncRandomAccessFile(source, byteLength)
                : new AsyncByteStream(source);
    }
    [Symbol.asyncIterator]() { return this; }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            let r;
            if ((r = yield this.readMetadataLength()).done) {
                return ITERATOR_DONE;
            }
            // ARROW-6313: If the first 4 bytes are continuation indicator (-1), read
            // the next 4 for the 32-bit metadata length. Otherwise, assume this is a
            // pre-v0.15 message, where the first 4 bytes are the metadata length.
            if ((r.value === -1) &&
                (r = yield this.readMetadataLength()).done) {
                return ITERATOR_DONE;
            }
            if ((r = yield this.readMetadata(r.value)).done) {
                return ITERATOR_DONE;
            }
            return r;
        });
    }
    throw(value) {
        return __awaiter(this, void 0, void 0, function* () { return yield this.source.throw(value); });
    }
    return(value) {
        return __awaiter(this, void 0, void 0, function* () { return yield this.source.return(value); });
    }
    readMessage(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let r;
            if ((r = yield this.next()).done) {
                return null;
            }
            if ((type != null) && r.value.headerType !== type) {
                throw new Error(invalidMessageType(type));
            }
            return r.value;
        });
    }
    readMessageBody(bodyLength) {
        return __awaiter(this, void 0, void 0, function* () {
            if (bodyLength <= 0) {
                return new Uint8Array(0);
            }
            const buf = toUint8Array(yield this.source.read(bodyLength));
            if (buf.byteLength < bodyLength) {
                throw new Error(invalidMessageBodyLength(bodyLength, buf.byteLength));
            }
            // 1. Work around bugs in fs.ReadStream's internal Buffer pooling, see: https://github.com/nodejs/node/issues/24817
            // 2. Work around https://github.com/whatwg/streams/blob/0ebe4b042e467d9876d80ae045de3843092ad797/reference-implementation/lib/helpers.js#L126
            return /* 1. */ (buf.byteOffset % 8 === 0) &&
                /* 2. */ (buf.byteOffset + buf.byteLength) <= buf.buffer.byteLength ? buf : buf.slice();
        });
    }
    readSchema() {
        return __awaiter(this, arguments, void 0, function* (throwIfNull = false) {
            const type = MessageHeader.Schema;
            const message = yield this.readMessage(type);
            const schema = message === null || message === void 0 ? void 0 : message.header();
            if (throwIfNull && !schema) {
                throw new Error(nullMessage(type));
            }
            return schema;
        });
    }
    readMetadataLength() {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = yield this.source.read(PADDING);
            const bb = buf && new flatbuffers/* ByteBuffer */.$F(buf);
            const len = (bb === null || bb === void 0 ? void 0 : bb.readInt32(0)) || 0;
            return { done: len === 0, value: len };
        });
    }
    readMetadata(metadataLength) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = yield this.source.read(metadataLength);
            if (!buf) {
                return ITERATOR_DONE;
            }
            if (buf.byteLength < metadataLength) {
                throw new Error(invalidMessageMetadata(metadataLength, buf.byteLength));
            }
            return { done: false, value: Message.decode(buf) };
        });
    }
}
/** @ignore */
class JSONMessageReader extends MessageReader {
    constructor(source) {
        super(new Uint8Array(0));
        this._schema = false;
        this._body = [];
        this._batchIndex = 0;
        this._dictionaryIndex = 0;
        this._json = source instanceof ArrowJSON ? source : new ArrowJSON(source);
    }
    next() {
        const { _json } = this;
        if (!this._schema) {
            this._schema = true;
            const message = Message.fromJSON(_json.schema, MessageHeader.Schema);
            return { done: false, value: message };
        }
        if (this._dictionaryIndex < _json.dictionaries.length) {
            const batch = _json.dictionaries[this._dictionaryIndex++];
            this._body = batch['data']['columns'];
            const message = Message.fromJSON(batch, MessageHeader.DictionaryBatch);
            return { done: false, value: message };
        }
        if (this._batchIndex < _json.batches.length) {
            const batch = _json.batches[this._batchIndex++];
            this._body = batch['columns'];
            const message = Message.fromJSON(batch, MessageHeader.RecordBatch);
            return { done: false, value: message };
        }
        this._body = [];
        return ITERATOR_DONE;
    }
    readMessageBody(_bodyLength) {
        return flattenDataSources(this._body);
        function flattenDataSources(xs) {
            return (xs || []).reduce((buffers, column) => [
                ...buffers,
                ...(column['VALIDITY'] && [column['VALIDITY']] || []),
                ...(column['TYPE_ID'] && [column['TYPE_ID']] || []),
                ...(column['OFFSET'] && [column['OFFSET']] || []),
                ...(column['DATA'] && [column['DATA']] || []),
                ...(column['VIEWS'] && [column['VIEWS']] || []),
                ...(column['VARIADIC_DATA_BUFFERS'] || []),
                ...flattenDataSources(column['children'])
            ], []);
        }
    }
    readMessage(type) {
        let r;
        if ((r = this.next()).done) {
            return null;
        }
        if ((type != null) && r.value.headerType !== type) {
            throw new Error(invalidMessageType(type));
        }
        return r.value;
    }
    readSchema() {
        const type = MessageHeader.Schema;
        const message = this.readMessage(type);
        const schema = message === null || message === void 0 ? void 0 : message.header();
        if (!message || !schema) {
            throw new Error(nullMessage(type));
        }
        return schema;
    }
}
/** @ignore */
const PADDING = 4;
/** @ignore */
const MAGIC_STR = 'ARROW1';
/** @ignore */
const MAGIC = new Uint8Array(MAGIC_STR.length);
for (let i = 0; i < MAGIC_STR.length; i += 1) {
    MAGIC[i] = MAGIC_STR.codePointAt(i);
}
/** @ignore */
function checkForMagicArrowString(buffer, index = 0) {
    for (let i = -1, n = MAGIC.length; ++i < n;) {
        if (MAGIC[i] !== buffer[index + i]) {
            return false;
        }
    }
    return true;
}
/** @ignore */
const magicLength = MAGIC.length;
/** @ignore */
const magicAndPadding = magicLength + PADDING;
/** @ignore */
const magicX2AndPadding = magicLength * 2 + PADDING;

//# sourceMappingURL=message.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/compression/validators.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

class Lz4FrameValidator {
    constructor() {
        this.LZ4_FRAME_MAGIC = new Uint8Array([4, 34, 77, 24]);
        this.MIN_HEADER_LENGTH = 7; // 4 (magic) + 2 (FLG + BD) + 1 (header checksum) = 7 min bytes
    }
    isValidCodecEncode(codec) {
        const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const compressed = codec.encode(testData);
        return this._isValidCompressed(compressed);
    }
    _isValidCompressed(buffer) {
        return (this._hasMinimumLength(buffer) &&
            this._hasValidMagicNumber(buffer) &&
            this._hasValidVersion(buffer));
    }
    _hasMinimumLength(buffer) {
        return buffer.length >= this.MIN_HEADER_LENGTH;
    }
    _hasValidMagicNumber(buffer) {
        return this.LZ4_FRAME_MAGIC.every((byte, i) => buffer[i] === byte);
    }
    _hasValidVersion(buffer) {
        const flg = buffer[4];
        const versionBits = (flg & 0xC0) >> 6;
        return versionBits === 1;
    }
}
class ZstdValidator {
    constructor() {
        this.ZSTD_MAGIC = new Uint8Array([40, 181, 47, 253]);
        this.MIN_HEADER_LENGTH = 6; // 4 (magic) + 2 (min Frame_Header) = 6 min bytes
    }
    isValidCodecEncode(codec) {
        const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const compressed = codec.encode(testData);
        return this._isValidCompressed(compressed);
    }
    _isValidCompressed(buffer) {
        return (this._hasMinimumLength(buffer) &&
            this._hasValidMagicNumber(buffer));
    }
    _hasMinimumLength(buffer) {
        return buffer.length >= this.MIN_HEADER_LENGTH;
    }
    _hasValidMagicNumber(buffer) {
        return this.ZSTD_MAGIC.every((byte, i) => buffer[i] === byte);
    }
}
const compressionValidators = {
    [CompressionType.LZ4_FRAME]: new Lz4FrameValidator(),
    [CompressionType.ZSTD]: new ZstdValidator(),
};

//# sourceMappingURL=validators.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/compression/registry.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


class _CompressionRegistry {
    constructor() {
        this.registry = {};
    }
    set(compression, codec) {
        if ((codec === null || codec === void 0 ? void 0 : codec.encode) && typeof codec.encode === 'function' && !compressionValidators[compression].isValidCodecEncode(codec)) {
            throw new Error(`Encoder for ${CompressionType[compression]} is not valid.`);
        }
        this.registry[compression] = codec;
    }
    get(compression) {
        var _a;
        return ((_a = this.registry) === null || _a === void 0 ? void 0 : _a[compression]) || null;
    }
}
const compressionRegistry = new _CompressionRegistry();

//# sourceMappingURL=registry.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/compression/constants.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const LENGTH_NO_COMPRESSED_DATA = -1;
const COMPRESS_LENGTH_PREFIX = 8;

//# sourceMappingURL=constants.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/reader.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



















class RecordBatchReader extends ReadableInterop {
    constructor(impl) {
        super();
        this._impl = impl;
    }
    get closed() { return this._impl.closed; }
    get schema() { return this._impl.schema; }
    get autoDestroy() { return this._impl.autoDestroy; }
    get dictionaries() { return this._impl.dictionaries; }
    get numDictionaries() { return this._impl.numDictionaries; }
    get numRecordBatches() { return this._impl.numRecordBatches; }
    get footer() { return this._impl.isFile() ? this._impl.footer : null; }
    isSync() { return this._impl.isSync(); }
    isAsync() { return this._impl.isAsync(); }
    isFile() { return this._impl.isFile(); }
    isStream() { return this._impl.isStream(); }
    next() {
        return this._impl.next();
    }
    throw(value) {
        return this._impl.throw(value);
    }
    return(value) {
        return this._impl.return(value);
    }
    cancel() {
        return this._impl.cancel();
    }
    reset(schema) {
        this._impl.reset(schema);
        this._DOMStream = undefined;
        this._nodeStream = undefined;
        return this;
    }
    open(options) {
        const opening = this._impl.open(options);
        return isPromise(opening) ? opening.then(() => this) : this;
    }
    readRecordBatch(index) {
        return this._impl.isFile() ? this._impl.readRecordBatch(index) : null;
    }
    [Symbol.iterator]() {
        return this._impl[Symbol.iterator]();
    }
    [Symbol.asyncIterator]() {
        return this._impl[Symbol.asyncIterator]();
    }
    toDOMStream() {
        return adapters.toDOMStream((this.isSync()
            ? { [Symbol.iterator]: () => this }
            : { [Symbol.asyncIterator]: () => this }));
    }
    toNodeStream() {
        return adapters.toNodeStream((this.isSync()
            ? { [Symbol.iterator]: () => this }
            : { [Symbol.asyncIterator]: () => this }), { objectMode: true });
    }
    /** @nocollapse */
    // @ts-ignore
    static throughNode(options) {
        throw new Error(`"throughNode" not available in this environment`);
    }
    /** @nocollapse */
    static throughDOM(
    // @ts-ignore
    writableStrategy, 
    // @ts-ignore
    readableStrategy) {
        throw new Error(`"throughDOM" not available in this environment`);
    }
    /** @nocollapse */
    static from(source) {
        if (source instanceof RecordBatchReader) {
            return source;
        }
        else if (isArrowJSON(source)) {
            return fromArrowJSON(source);
        }
        else if (isFileHandle(source)) {
            return fromFileHandle(source);
        }
        else if (isPromise(source)) {
            return (() => __awaiter(this, void 0, void 0, function* () { return yield RecordBatchReader.from(yield source); }))();
        }
        else if (isFetchResponse(source) || isReadableDOMStream(source) || isReadableNodeStream(source) || isAsyncIterable(source)) {
            return fromAsyncByteStream(new AsyncByteStream(source));
        }
        return fromByteStream(new ByteStream(source));
    }
    /** @nocollapse */
    static readAll(source) {
        if (source instanceof RecordBatchReader) {
            return source.isSync() ? readAllSync(source) : readAllAsync(source);
        }
        else if (isArrowJSON(source) || ArrayBuffer.isView(source) || isIterable(source) || isIteratorResult(source)) {
            return readAllSync(source);
        }
        return readAllAsync(source);
    }
}
//
// Since TS is a structural type system, we define the following subclass stubs
// so that concrete types exist to associate with the interfaces below.
//
// The implementation for each RecordBatchReader is hidden away in the set of
// `RecordBatchReaderImpl` classes in the second half of this file. This allows
// us to export a single RecordBatchReader class, and swap out the impl based
// on the io primitives or underlying arrow (JSON, file, or stream) at runtime.
//
// Async/await makes our job a bit harder, since it forces everything to be
// either fully sync or fully async. This is why the logic for the reader impls
// has been duplicated into both sync and async variants. Since the RBR
// delegates to its impl, an RBR with an AsyncRecordBatchFileReaderImpl for
// example will return async/await-friendly Promises, but one with a (sync)
// RecordBatchStreamReaderImpl will always return values. Nothing should be
// different about their logic, aside from the async handling. This is also why
// this code looks highly structured, as it should be nearly identical and easy
// to follow.
//
/** @ignore */
class RecordBatchStreamReader extends RecordBatchReader {
    constructor(_impl) {
        super(_impl);
        this._impl = _impl;
    }
    readAll() { return [...this]; }
    [Symbol.iterator]() { return this._impl[Symbol.iterator](); }
    [Symbol.asyncIterator]() { return modules_asyncGenerator(this, arguments, function* _a() { yield modules_await(yield* __asyncDelegator(modules_asyncValues(this[Symbol.iterator]()))); }); }
}
/** @ignore */
class AsyncRecordBatchStreamReader extends RecordBatchReader {
    constructor(_impl) {
        super(_impl);
        this._impl = _impl;
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const batches = new Array();
            try {
                for (var _d = true, _e = modules_asyncValues(this), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const batch = _c;
                    batches.push(batch);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return batches;
        });
    }
    [Symbol.iterator]() { throw new Error(`AsyncRecordBatchStreamReader is not Iterable`); }
    [Symbol.asyncIterator]() { return this._impl[Symbol.asyncIterator](); }
}
/** @ignore */
class RecordBatchFileReader extends RecordBatchStreamReader {
    constructor(_impl) {
        super(_impl);
        this._impl = _impl;
    }
}
/** @ignore */
class AsyncRecordBatchFileReader extends AsyncRecordBatchStreamReader {
    constructor(_impl) {
        super(_impl);
        this._impl = _impl;
    }
}
/** @ignore */
class RecordBatchReaderImpl {
    get numDictionaries() { return this._dictionaryIndex; }
    get numRecordBatches() { return this._recordBatchIndex; }
    constructor(dictionaries = new Map()) {
        this.closed = false;
        this.autoDestroy = true;
        this._dictionaryIndex = 0;
        this._recordBatchIndex = 0;
        this.dictionaries = dictionaries;
    }
    isSync() { return false; }
    isAsync() { return false; }
    isFile() { return false; }
    isStream() { return false; }
    reset(schema) {
        this._dictionaryIndex = 0;
        this._recordBatchIndex = 0;
        this.schema = schema;
        this.dictionaries = new Map();
        return this;
    }
    _loadRecordBatch(header, body, messageMetadata) {
        let children;
        if (header.compression != null) {
            const codec = compressionRegistry.get(header.compression.type);
            if ((codec === null || codec === void 0 ? void 0 : codec.decode) && typeof codec.decode === 'function') {
                const { decommpressedBody, buffers } = this._decompressBuffers(header, body, codec);
                children = this._loadCompressedVectors(header, decommpressedBody, this.schema.fields);
                header = new message_RecordBatch(header.length, header.nodes, buffers, null);
            }
            else {
                throw new Error('Record batch is compressed but codec not found');
            }
        }
        else {
            children = this._loadVectors(header, body, this.schema.fields);
        }
        const data = data_makeData({ type: new Struct(this.schema.fields), length: header.length, children });
        return new recordbatch_RecordBatch(this.schema, data, messageMetadata);
    }
    _loadDictionaryBatch(header, body) {
        const { id, isDelta } = header;
        const { dictionaries, schema } = this;
        const dictionary = dictionaries.get(id);
        const type = schema.dictionaries.get(id);
        let data;
        if (header.data.compression != null) {
            const codec = compressionRegistry.get(header.data.compression.type);
            if ((codec === null || codec === void 0 ? void 0 : codec.decode) && typeof codec.decode === 'function') {
                const { decommpressedBody, buffers } = this._decompressBuffers(header.data, body, codec);
                data = this._loadCompressedVectors(header.data, decommpressedBody, [type]);
                header = new message_DictionaryBatch(new message_RecordBatch(header.data.length, header.data.nodes, buffers, null, header.data.variadicBufferCounts), id, isDelta);
            }
            else {
                throw new Error('Dictionary batch is compressed but codec not found');
            }
        }
        else {
            data = this._loadVectors(header.data, body, [type]);
        }
        // const data = this._loadVectors(header.data, body, [type]);
        return (dictionary && isDelta ? dictionary.concat(new vector_Vector(data)) :
            new vector_Vector(data)).memoize();
    }
    _loadVectors(header, body, types) {
        return new VectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
    }
    _loadCompressedVectors(header, body, types) {
        return new CompressedVectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
    }
    _decompressBuffers(header, body, codec) {
        const decompressedBuffers = [];
        const newBufferRegions = [];
        let currentOffset = 0;
        for (const { offset, length } of header.buffers) {
            if (length === 0) {
                decompressedBuffers.push(new Uint8Array(0));
                newBufferRegions.push(new BufferRegion(currentOffset, 0));
                continue;
            }
            const byteBuf = new flatbuffers/* ByteBuffer */.$F(body.subarray(offset, offset + length));
            const uncompressedLenth = bigIntToNumber(byteBuf.readInt64(0));
            const bytes = byteBuf.bytes().subarray(COMPRESS_LENGTH_PREFIX);
            const decompressed = (uncompressedLenth === LENGTH_NO_COMPRESSED_DATA)
                ? bytes
                : codec.decode(bytes);
            decompressedBuffers.push(decompressed);
            const padding = ((currentOffset + 7) & ~7) - currentOffset;
            currentOffset += padding;
            newBufferRegions.push(new BufferRegion(currentOffset, decompressed.length));
            currentOffset += decompressed.length;
        }
        return {
            decommpressedBody: decompressedBuffers,
            buffers: newBufferRegions
        };
    }
}
/** @ignore */
class RecordBatchStreamReaderImpl extends RecordBatchReaderImpl {
    constructor(source, dictionaries) {
        super(dictionaries);
        this._reader = !isArrowJSON(source)
            ? new MessageReader(this._handle = source)
            : new JSONMessageReader(this._handle = source);
    }
    isSync() { return true; }
    isStream() { return true; }
    [Symbol.iterator]() {
        return this;
    }
    cancel() {
        if (!this.closed && (this.closed = true)) {
            this.reset()._reader.return();
            this._reader = null;
            this.dictionaries = null;
        }
    }
    open(options) {
        if (!this.closed) {
            this.autoDestroy = shouldAutoDestroy(this, options);
            if (!(this.schema || (this.schema = this._reader.readSchema()))) {
                this.cancel();
            }
        }
        return this;
    }
    throw(value) {
        if (!this.closed && this.autoDestroy && (this.closed = true)) {
            return this.reset()._reader.throw(value);
        }
        return ITERATOR_DONE;
    }
    return(value) {
        if (!this.closed && this.autoDestroy && (this.closed = true)) {
            return this.reset()._reader.return(value);
        }
        return ITERATOR_DONE;
    }
    next() {
        if (this.closed) {
            return ITERATOR_DONE;
        }
        let message;
        const { _reader: reader } = this;
        while (message = this._readNextMessageAndValidate()) {
            if (message.isSchema()) {
                this.reset(message.header());
            }
            else if (message.isRecordBatch()) {
                this._recordBatchIndex++;
                const header = message.header();
                const buffer = reader.readMessageBody(message.bodyLength);
                const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
                return { done: false, value: recordBatch };
            }
            else if (message.isDictionaryBatch()) {
                this._dictionaryIndex++;
                const header = message.header();
                const buffer = reader.readMessageBody(message.bodyLength);
                const vector = this._loadDictionaryBatch(header, buffer);
                this.dictionaries.set(header.id, vector);
            }
        }
        if (this.schema && this._recordBatchIndex === 0) {
            this._recordBatchIndex++;
            return { done: false, value: new _InternalEmptyPlaceholderRecordBatch(this.schema) };
        }
        return this.return();
    }
    _readNextMessageAndValidate(type) {
        return this._reader.readMessage(type);
    }
}
/** @ignore */
class AsyncRecordBatchStreamReaderImpl extends RecordBatchReaderImpl {
    constructor(source, dictionaries) {
        super(dictionaries);
        this._reader = new AsyncMessageReader(this._handle = source);
    }
    isAsync() { return true; }
    isStream() { return true; }
    [Symbol.asyncIterator]() {
        return this;
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed && (this.closed = true)) {
                yield this.reset()._reader.return();
                this._reader = null;
                this.dictionaries = null;
            }
        });
    }
    open(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed) {
                this.autoDestroy = shouldAutoDestroy(this, options);
                if (!(this.schema || (this.schema = (yield this._reader.readSchema())))) {
                    yield this.cancel();
                }
            }
            return this;
        });
    }
    throw(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed && this.autoDestroy && (this.closed = true)) {
                return yield this.reset()._reader.throw(value);
            }
            return ITERATOR_DONE;
        });
    }
    return(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed && this.autoDestroy && (this.closed = true)) {
                return yield this.reset()._reader.return(value);
            }
            return ITERATOR_DONE;
        });
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closed) {
                return ITERATOR_DONE;
            }
            let message;
            const { _reader: reader } = this;
            while (message = yield this._readNextMessageAndValidate()) {
                if (message.isSchema()) {
                    yield this.reset(message.header());
                }
                else if (message.isRecordBatch()) {
                    this._recordBatchIndex++;
                    const header = message.header();
                    const buffer = yield reader.readMessageBody(message.bodyLength);
                    const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
                    return { done: false, value: recordBatch };
                }
                else if (message.isDictionaryBatch()) {
                    this._dictionaryIndex++;
                    const header = message.header();
                    const buffer = yield reader.readMessageBody(message.bodyLength);
                    const vector = this._loadDictionaryBatch(header, buffer);
                    this.dictionaries.set(header.id, vector);
                }
            }
            if (this.schema && this._recordBatchIndex === 0) {
                this._recordBatchIndex++;
                return { done: false, value: new _InternalEmptyPlaceholderRecordBatch(this.schema) };
            }
            return yield this.return();
        });
    }
    _readNextMessageAndValidate(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._reader.readMessage(type);
        });
    }
}
/** @ignore */
class RecordBatchFileReaderImpl extends RecordBatchStreamReaderImpl {
    get footer() { return this._footer; }
    get numDictionaries() { return this._footer ? this._footer.numDictionaries : 0; }
    get numRecordBatches() { return this._footer ? this._footer.numRecordBatches : 0; }
    constructor(source, dictionaries) {
        super(source instanceof RandomAccessFile ? source : new RandomAccessFile(source), dictionaries);
    }
    isSync() { return true; }
    isFile() { return true; }
    open(options) {
        if (!this.closed && !this._footer) {
            this.schema = (this._footer = this._readFooter()).schema;
            for (const block of this._footer.dictionaryBatches()) {
                block && this._readDictionaryBatch(this._dictionaryIndex++);
            }
        }
        return super.open(options);
    }
    readRecordBatch(index) {
        var _a;
        if (this.closed) {
            return null;
        }
        if (!this._footer) {
            this.open();
        }
        const block = (_a = this._footer) === null || _a === void 0 ? void 0 : _a.getRecordBatch(index);
        if (block && this._handle.seek(block.offset)) {
            const message = this._reader.readMessage(MessageHeader.RecordBatch);
            if (message === null || message === void 0 ? void 0 : message.isRecordBatch()) {
                const header = message.header();
                const buffer = this._reader.readMessageBody(message.bodyLength);
                const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
                return recordBatch;
            }
        }
        return null;
    }
    _readDictionaryBatch(index) {
        var _a;
        const block = (_a = this._footer) === null || _a === void 0 ? void 0 : _a.getDictionaryBatch(index);
        if (block && this._handle.seek(block.offset)) {
            const message = this._reader.readMessage(MessageHeader.DictionaryBatch);
            if (message === null || message === void 0 ? void 0 : message.isDictionaryBatch()) {
                const header = message.header();
                const buffer = this._reader.readMessageBody(message.bodyLength);
                const vector = this._loadDictionaryBatch(header, buffer);
                this.dictionaries.set(header.id, vector);
            }
        }
    }
    _readFooter() {
        const { _handle } = this;
        const offset = _handle.size - magicAndPadding;
        const length = _handle.readInt32(offset);
        const buffer = _handle.readAt(offset - length, length);
        return Footer_.decode(buffer);
    }
    _readNextMessageAndValidate(type) {
        var _a;
        if (!this._footer) {
            this.open();
        }
        if (this._footer && this._recordBatchIndex < this.numRecordBatches) {
            const block = (_a = this._footer) === null || _a === void 0 ? void 0 : _a.getRecordBatch(this._recordBatchIndex);
            if (block && this._handle.seek(block.offset)) {
                return this._reader.readMessage(type);
            }
        }
        return null;
    }
}
/** @ignore */
class AsyncRecordBatchFileReaderImpl extends AsyncRecordBatchStreamReaderImpl {
    get footer() { return this._footer; }
    get numDictionaries() { return this._footer ? this._footer.numDictionaries : 0; }
    get numRecordBatches() { return this._footer ? this._footer.numRecordBatches : 0; }
    constructor(source, ...rest) {
        const byteLength = typeof rest[0] !== 'number' ? rest.shift() : undefined;
        const dictionaries = rest[0] instanceof Map ? rest.shift() : undefined;
        super(source instanceof AsyncRandomAccessFile ? source : new AsyncRandomAccessFile(source, byteLength), dictionaries);
    }
    isFile() { return true; }
    isAsync() { return true; }
    open(options) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed && !this._footer) {
                this.schema = (this._footer = yield this._readFooter()).schema;
                for (const block of this._footer.dictionaryBatches()) {
                    block && (yield this._readDictionaryBatch(this._dictionaryIndex++));
                }
            }
            return yield _super.open.call(this, options);
        });
    }
    readRecordBatch(index) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.closed) {
                return null;
            }
            if (!this._footer) {
                yield this.open();
            }
            const block = (_a = this._footer) === null || _a === void 0 ? void 0 : _a.getRecordBatch(index);
            if (block && (yield this._handle.seek(block.offset))) {
                const message = yield this._reader.readMessage(MessageHeader.RecordBatch);
                if (message === null || message === void 0 ? void 0 : message.isRecordBatch()) {
                    const header = message.header();
                    const buffer = yield this._reader.readMessageBody(message.bodyLength);
                    const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
                    return recordBatch;
                }
            }
            return null;
        });
    }
    _readDictionaryBatch(index) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const block = (_a = this._footer) === null || _a === void 0 ? void 0 : _a.getDictionaryBatch(index);
            if (block && (yield this._handle.seek(block.offset))) {
                const message = yield this._reader.readMessage(MessageHeader.DictionaryBatch);
                if (message === null || message === void 0 ? void 0 : message.isDictionaryBatch()) {
                    const header = message.header();
                    const buffer = yield this._reader.readMessageBody(message.bodyLength);
                    const vector = this._loadDictionaryBatch(header, buffer);
                    this.dictionaries.set(header.id, vector);
                }
            }
        });
    }
    _readFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            const { _handle } = this;
            _handle._pending && (yield _handle._pending);
            const offset = _handle.size - magicAndPadding;
            const length = yield _handle.readInt32(offset);
            const buffer = yield _handle.readAt(offset - length, length);
            return Footer_.decode(buffer);
        });
    }
    _readNextMessageAndValidate(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._footer) {
                yield this.open();
            }
            if (this._footer && this._recordBatchIndex < this.numRecordBatches) {
                const block = this._footer.getRecordBatch(this._recordBatchIndex);
                if (block && (yield this._handle.seek(block.offset))) {
                    return yield this._reader.readMessage(type);
                }
            }
            return null;
        });
    }
}
/** @ignore */
class RecordBatchJSONReaderImpl extends RecordBatchStreamReaderImpl {
    constructor(source, dictionaries) {
        super(source, dictionaries);
    }
    _loadVectors(header, body, types) {
        return new JSONVectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
    }
}
//
// Define some helper functions and static implementations down here. There's
// a bit of branching in the static methods that can lead to the same routines
// being executed, so we've broken those out here for readability.
//
/** @ignore */
function shouldAutoDestroy(self, options) {
    return options && (typeof options['autoDestroy'] === 'boolean') ? options['autoDestroy'] : self['autoDestroy'];
}
/** @ignore */
function* readAllSync(source) {
    const reader = RecordBatchReader.from(source);
    try {
        if (!reader.open({ autoDestroy: false }).closed) {
            do {
                yield reader;
            } while (!(reader.reset().open()).closed);
        }
    }
    finally {
        reader.cancel();
    }
}
/** @ignore */
function readAllAsync(source) {
    return modules_asyncGenerator(this, arguments, function* readAllAsync_1() {
        const reader = yield modules_await(RecordBatchReader.from(source));
        try {
            if (!(yield modules_await(reader.open({ autoDestroy: false }))).closed) {
                do {
                    yield yield modules_await(reader);
                } while (!(yield modules_await(reader.reset().open())).closed);
            }
        }
        finally {
            yield modules_await(reader.cancel());
        }
    });
}
/** @ignore */
function fromArrowJSON(source) {
    return new RecordBatchStreamReader(new RecordBatchJSONReaderImpl(source));
}
/** @ignore */
function fromByteStream(source) {
    const bytes = source.peek((magicLength + 7) & ~7);
    return bytes && bytes.byteLength >= 4 ? !checkForMagicArrowString(bytes)
        ? new RecordBatchStreamReader(new RecordBatchStreamReaderImpl(source))
        : new RecordBatchFileReader(new RecordBatchFileReaderImpl(source.read()))
        : new RecordBatchStreamReader(new RecordBatchStreamReaderImpl(function* () { }()));
}
/** @ignore */
function fromAsyncByteStream(source) {
    return __awaiter(this, void 0, void 0, function* () {
        const bytes = yield source.peek((magicLength + 7) & ~7);
        return bytes && bytes.byteLength >= 4 ? !checkForMagicArrowString(bytes)
            ? new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl(source))
            : new RecordBatchFileReader(new RecordBatchFileReaderImpl(yield source.read()))
            : new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl(function () { return modules_asyncGenerator(this, arguments, function* () { }); }()));
    });
}
/** @ignore */
function fromFileHandle(source) {
    return __awaiter(this, void 0, void 0, function* () {
        const { size } = yield source.stat();
        const file = new AsyncRandomAccessFile(source, size);
        if (size >= magicX2AndPadding && checkForMagicArrowString(yield file.readAt(0, (magicLength + 7) & ~7))) {
            return new AsyncRecordBatchFileReader(new AsyncRecordBatchFileReaderImpl(file));
        }
        return new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl(file));
    });
}

//# sourceMappingURL=reader.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/vectorassembler.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.









/** @ignore */
class VectorAssembler extends Visitor {
    /** @nocollapse */
    static assemble(...args) {
        const unwrap = (nodes) => nodes.flatMap((node) => Array.isArray(node) ? unwrap(node) :
            (node instanceof recordbatch_RecordBatch) ? node.data.children : node.data);
        const assembler = new VectorAssembler();
        assembler.visitMany(unwrap(args));
        return assembler;
    }
    constructor() {
        super();
        this._byteLength = 0;
        this._nodes = [];
        this._buffers = [];
        this._bufferRegions = [];
        this._variadicBufferCounts = [];
    }
    visit(data) {
        if (data instanceof vector_Vector) {
            this.visitMany(data.data);
            return this;
        }
        const { type } = data;
        if (!type_DataType.isDictionary(type)) {
            const { length } = data;
            if (length > 2147483647) {
                /* istanbul ignore next */
                throw new RangeError('Cannot write arrays larger than 2^31 - 1 in length');
            }
            if (type_DataType.isUnion(type)) {
                this.nodes.push(new message_FieldNode(length, 0));
            }
            else {
                const { nullCount } = data;
                if (!type_DataType.isNull(type)) {
                    addBuffer.call(this, nullCount <= 0
                        ? new Uint8Array(0) // placeholder validity buffer
                        : truncateBitmap(data.offset, length, data.nullBitmap));
                }
                this.nodes.push(new message_FieldNode(length, nullCount));
            }
        }
        return super.visit(data);
    }
    visitNull(_null) {
        return this;
    }
    visitDictionary(data) {
        // Assemble the indices here, Dictionary assembled separately.
        return this.visit(data.clone(data.type.indices));
    }
    get nodes() { return this._nodes; }
    get buffers() { return this._buffers; }
    get byteLength() { return this._byteLength; }
    get bufferRegions() { return this._bufferRegions; }
    get variadicBufferCounts() { return this._variadicBufferCounts; }
}
/** @ignore */
function addBuffer(values) {
    const byteLength = (values.byteLength + 7) & ~7; // Round up to a multiple of 8
    this.buffers.push(values);
    this.bufferRegions.push(new BufferRegion(this._byteLength, byteLength));
    this._byteLength += byteLength;
    return this;
}
/** @ignore */
function assembleUnion(data) {
    var _a;
    const { type, length, typeIds, valueOffsets } = data;
    // All Union Vectors have a typeIds buffer
    addBuffer.call(this, typeIds);
    // If this is a Sparse Union, treat it like all other Nested types
    if (type.mode === UnionMode.Sparse) {
        return assembleNestedVector.call(this, data);
    }
    else if (type.mode === UnionMode.Dense) {
        // If this is a Dense Union, add the valueOffsets buffer and potentially slice the children
        if (data.offset <= 0) {
            // If the Vector hasn't been sliced, write the existing valueOffsets
            addBuffer.call(this, valueOffsets);
            // We can treat this like all other Nested types
            return assembleNestedVector.call(this, data);
        }
        else {
            // A sliced Dense Union is an unpleasant case. Because the offsets are different for
            // each child vector, we need to "rebase" the valueOffsets for each child
            // Union typeIds are not necessary 0-indexed
            const shiftedOffsets = new Int32Array(length);
            const childOffsets = Object.create(null);
            const childLengths = Object.create(null);
            // If we have a non-zero offset, then the value offsets do not start at
            // zero. We must a) create a new offsets array with shifted offsets and
            // b) slice the values array accordingly
            for (let typeId, shift, index = -1; ++index < length;) {
                if ((typeId = typeIds[index]) === undefined) {
                    continue;
                }
                if ((shift = childOffsets[typeId]) === undefined) {
                    shift = childOffsets[typeId] = valueOffsets[index];
                }
                shiftedOffsets[index] = valueOffsets[index] - shift;
                childLengths[typeId] = ((_a = childLengths[typeId]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            addBuffer.call(this, shiftedOffsets);
            // Slice and visit children accordingly
            this.visitMany(data.children.map((child, childIndex) => {
                const typeId = type.typeIds[childIndex];
                const childOffset = childOffsets[typeId];
                const childLength = childLengths[typeId];
                return child.slice(childOffset, Math.min(length, childLength));
            }));
        }
    }
    return this;
}
/** @ignore */
function assembleBoolVector(data) {
    // Bool vector is a special case of FlatVector, as its data buffer needs to stay packed
    let values;
    if (data.nullCount >= data.length) {
        // If all values are null, write a zero-filled data buffer of the correct byte length
        return addBuffer.call(this, new Uint8Array((data.length + 7) >> 3));
    }
    else if ((values = data.values) instanceof Uint8Array) {
        // If values is already a Uint8Array, slice the bitmap (fast path)
        return addBuffer.call(this, truncateBitmap(data.offset, data.length, values));
    }
    // Otherwise if the underlying data *isn't* a Uint8Array, enumerate the
    // values as bools and re-pack them into a Uint8Array. This code isn't
    // reachable unless you're trying to manipulate the Data internals,
    // we're only doing this for safety.
    /* istanbul ignore next */
    return addBuffer.call(this, packBools(data.values));
}
/** @ignore */
function assembleFlatVector(data) {
    return addBuffer.call(this, data.values.subarray(0, data.length * data.stride));
}
/** @ignore */
function assembleFlatListVector(data) {
    const { length, values, valueOffsets } = data;
    const begin = bigIntToNumber(valueOffsets[0]);
    const end = bigIntToNumber(valueOffsets[length]);
    const byteLength = Math.min(end - begin, values.byteLength - begin);
    // Push in the order FlatList types read their buffers
    addBuffer.call(this, rebaseValueOffsets(-begin, length + 1, valueOffsets)); // valueOffsets buffer first
    addBuffer.call(this, values.subarray(begin, begin + byteLength)); // sliced values buffer second
    return this;
}
/** @ignore */
function assembleBinaryViewVector(data) {
    const { offset, length, stride, values, variadicBuffers = [] } = data;
    if (!values) {
        throw new Error('BinaryView data is missing view buffer');
    }
    const start = offset * stride;
    const end = start + length * stride;
    addBuffer.call(this, values.subarray(start, end));
    for (const buffer of variadicBuffers) {
        addBuffer.call(this, buffer);
    }
    this._variadicBufferCounts.push(variadicBuffers.length);
    return this;
}
/** @ignore */
function assembleListVector(data) {
    const { length, valueOffsets } = data;
    // If we have valueOffsets (MapVector, ListVector, LargeListVector), push that buffer first
    if (valueOffsets) {
        const begin = bigIntToNumber(valueOffsets[0]);
        const end = bigIntToNumber(valueOffsets[length]);
        addBuffer.call(this, rebaseValueOffsets(-begin, length + 1, valueOffsets));
        // Then insert the List's values child
        return this.visit(data.children[0].slice(begin, end - begin));
    }
    // Then insert the List's values child
    return this.visit(data.children[0]);
}
/** @ignore */
function assembleNestedVector(data) {
    return this.visitMany(data.type.children.map((_, i) => data.children[i]).filter(Boolean))[0];
}
VectorAssembler.prototype.visitBool = assembleBoolVector;
VectorAssembler.prototype.visitInt = assembleFlatVector;
VectorAssembler.prototype.visitFloat = assembleFlatVector;
VectorAssembler.prototype.visitUtf8 = assembleFlatListVector;
VectorAssembler.prototype.visitLargeUtf8 = assembleFlatListVector;
VectorAssembler.prototype.visitUtf8View = assembleBinaryViewVector;
VectorAssembler.prototype.visitBinary = assembleFlatListVector;
VectorAssembler.prototype.visitLargeBinary = assembleFlatListVector;
VectorAssembler.prototype.visitBinaryView = assembleBinaryViewVector;
VectorAssembler.prototype.visitFixedSizeBinary = assembleFlatVector;
VectorAssembler.prototype.visitDate = assembleFlatVector;
VectorAssembler.prototype.visitTimestamp = assembleFlatVector;
VectorAssembler.prototype.visitTime = assembleFlatVector;
VectorAssembler.prototype.visitDecimal = assembleFlatVector;
VectorAssembler.prototype.visitList = assembleListVector;
VectorAssembler.prototype.visitLargeList = assembleListVector;
VectorAssembler.prototype.visitStruct = assembleNestedVector;
VectorAssembler.prototype.visitUnion = assembleUnion;
VectorAssembler.prototype.visitInterval = assembleFlatVector;
VectorAssembler.prototype.visitDuration = assembleFlatVector;
VectorAssembler.prototype.visitFixedSizeList = assembleListVector;
VectorAssembler.prototype.visitMap = assembleListVector;

//# sourceMappingURL=vectorassembler.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/jsontypeassembler.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class JSONTypeAssembler extends Visitor {
    visit(node) {
        return node == null ? undefined : super.visit(node);
    }
    visitNull({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitInt({ typeId, bitWidth, isSigned }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'bitWidth': bitWidth, 'isSigned': isSigned };
    }
    visitFloat({ typeId, precision }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'precision': Precision[precision] };
    }
    visitBinary({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitLargeBinary({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitBinaryView({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitBool({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitUtf8({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitLargeUtf8({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitUtf8View({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitDecimal({ typeId, scale, precision, bitWidth }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'scale': scale, 'precision': precision, 'bitWidth': bitWidth };
    }
    visitDate({ typeId, unit }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'unit': DateUnit[unit] };
    }
    visitTime({ typeId, unit, bitWidth }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'unit': TimeUnit[unit], bitWidth };
    }
    visitTimestamp({ typeId, timezone, unit }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'unit': TimeUnit[unit], timezone };
    }
    visitInterval({ typeId, unit }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'unit': IntervalUnit[unit] };
    }
    visitDuration({ typeId, unit }) {
        return { 'name': type_Type[typeId].toLocaleLowerCase(), 'unit': TimeUnit[unit] };
    }
    visitList({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitLargeList({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitStruct({ typeId }) {
        return { 'name': type_Type[typeId].toLowerCase() };
    }
    visitUnion({ typeId, mode, typeIds }) {
        return {
            'name': type_Type[typeId].toLowerCase(),
            'mode': UnionMode[mode].toUpperCase(),
            'typeIds': [...typeIds]
        };
    }
    visitDictionary(node) {
        return this.visit(node.dictionary);
    }
    visitFixedSizeBinary({ typeId, byteWidth }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'byteWidth': byteWidth };
    }
    visitFixedSizeList({ typeId, listSize }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'listSize': listSize };
    }
    visitMap({ typeId, keysSorted }) {
        return { 'name': type_Type[typeId].toLowerCase(), 'keysSorted': keysSorted };
    }
}

//# sourceMappingURL=jsontypeassembler.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/jsonvectorassembler.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.








/** @ignore */
class JSONVectorAssembler extends Visitor {
    /** @nocollapse */
    static assemble(...batches) {
        const assembler = new JSONVectorAssembler();
        return batches.map(({ schema, data }) => {
            return assembler.visitMany(schema.fields, data.children);
        });
    }
    visit({ name }, data) {
        const { length } = data;
        const { offset, nullCount, nullBitmap } = data;
        const type = type_DataType.isDictionary(data.type) ? data.type.indices : data.type;
        const buffers = Object.assign([], data.buffers, { [BufferType.VALIDITY]: undefined });
        return Object.assign({ 'name': name, 'count': length, 'VALIDITY': (type_DataType.isNull(type) || type_DataType.isUnion(type))
                ? undefined
                : nullCount <= 0 ? Array.from({ length }, () => 1)
                    : [...new BitIterator(nullBitmap, offset, length, null, getBit)] }, super.visit(data.clone(type, offset, length, 0, buffers)));
    }
    visitNull() { return {}; }
    visitBool({ values, offset, length }) {
        return { 'DATA': [...new BitIterator(values, offset, length, null, bit_getBool)] };
    }
    visitInt(data) {
        return {
            'DATA': data.type.bitWidth < 64
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitFloat(data) {
        return { 'DATA': [...data.values] };
    }
    visitUtf8(data) {
        return { 'DATA': [...new vector_Vector([data])], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeUtf8(data) {
        return { 'DATA': [...new vector_Vector([data])], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
    }
    visitBinary(data) {
        return { 'DATA': [...binaryToString(new vector_Vector([data]))], 'OFFSET': [...data.valueOffsets] };
    }
    visitLargeBinary(data) {
        return { 'DATA': [...binaryToString(new vector_Vector([data]))], 'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)] };
    }
    visitBinaryView(data) {
        return binaryViewDataToJSON(data, (bytes) => Array.from(bytes)
            .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
            .join('')
            .toUpperCase());
    }
    visitUtf8View(data) {
        return binaryViewDataToJSON(data, (bytes) => Array.from(bytes).map(b => String.fromCodePoint(b)).join(''));
    }
    visitFixedSizeBinary(data) {
        return { 'DATA': [...binaryToString(new vector_Vector([data]))] };
    }
    visitDate(data) {
        return {
            'DATA': data.type.unit === DateUnit.DAY
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitTimestamp(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 2)] };
    }
    visitTime(data) {
        return {
            'DATA': data.type.unit < TimeUnit.MICROSECOND
                ? [...data.values]
                : [...bigNumsToStrings(data.values, 2)]
        };
    }
    visitDecimal(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 4)] };
    }
    visitList(data) {
        return {
            'OFFSET': [...data.valueOffsets],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitLargeList(data) {
        return {
            'OFFSET': [...bigNumsToStrings(data.valueOffsets, 2)],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitStruct(data) {
        return {
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitUnion(data) {
        return {
            'TYPE_ID': [...data.typeIds],
            'OFFSET': data.type.mode === UnionMode.Dense ? [...data.valueOffsets] : undefined,
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitInterval(data) {
        switch (data.type.unit) {
            case IntervalUnit.YEAR_MONTH:
                return { 'DATA': [...data.values] };
            case IntervalUnit.DAY_TIME:
                return { 'DATA': toIntervalDayTimeObjects(data.values) };
            case IntervalUnit.MONTH_DAY_NANO:
                return { 'DATA': toIntervalMonthDayNanoObjects(data.values, true) };
        }
    }
    visitDuration(data) {
        return { 'DATA': [...bigNumsToStrings(data.values, 2)] };
    }
    visitFixedSizeList(data) {
        return {
            'children': this.visitMany(data.type.children, data.children)
        };
    }
    visitMap(data) {
        return {
            'OFFSET': [...data.valueOffsets],
            'children': this.visitMany(data.type.children, data.children)
        };
    }
}
/** @ignore */
function* binaryToString(vector) {
    for (const octets of vector) {
        yield octets.reduce((str, byte) => {
            return `${str}${('0' + (byte & 0xFF).toString(16)).slice(-2)}`;
        }, '').toUpperCase();
    }
}
/** @ignore */
function* bigNumsToStrings(values, stride) {
    const u32s = new Uint32Array(values.buffer, values.byteOffset, values.byteLength / Uint32Array.BYTES_PER_ELEMENT);
    for (let i = -1, n = u32s.length / stride; ++i < n;) {
        yield `${BN.new(u32s.subarray((i + 0) * stride, (i + 1) * stride), false)}`;
    }
}
/** @ignore */
function binaryViewDataToJSON(data, formatInlined) {
    const INLINE_SIZE = 12;
    const viewsData = data.values;
    const dataView = new DataView(viewsData.buffer, viewsData.byteOffset, viewsData.byteLength);
    const numViews = viewsData.byteLength / 16;
    const bytesToHex = (bytes) => Array.from(bytes)
        .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
        .join('')
        .toUpperCase();
    const parsedViews = Array.from({ length: numViews }, (_, i) => {
        const offset = i * 16;
        const size = dataView.getInt32(offset, true);
        return [offset, size];
    }).map(([offset, size]) => (size > INLINE_SIZE) ? {
        'SIZE': size,
        'PREFIX_HEX': bytesToHex(viewsData.subarray(offset + 4, offset + 8)),
        'BUFFER_INDEX': dataView.getInt32(offset + 8, true),
        'OFFSET': dataView.getInt32(offset + 12, true)
    } : {
        'SIZE': size,
        'INLINED': formatInlined(viewsData.subarray(offset + 4, offset + 4 + size))
    });
    const uniqueBufferIndices = [...new Set(parsedViews
            .map(v => v['BUFFER_INDEX'])
            .filter((idx) => idx !== undefined))];
    const variadicBuffers = uniqueBufferIndices.map(bufferIndex => bytesToHex(data.variadicBuffers[bufferIndex]));
    const bufferIndexMap = new Map(uniqueBufferIndices.map((bufferIndex, outputIndex) => [bufferIndex, outputIndex]));
    // Remap buffer indices in views
    const views = parsedViews.map(v => v['BUFFER_INDEX'] !== undefined
        ? Object.assign(Object.assign({}, v), { 'BUFFER_INDEX': bufferIndexMap.get(v['BUFFER_INDEX']) }) : v);
    return { 'VIEWS': views, 'VARIADIC_DATA_BUFFERS': variadicBuffers };
}

//# sourceMappingURL=jsonvectorassembler.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/writer.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.






















class RecordBatchWriter extends ReadableInterop {
    /** @nocollapse */
    // @ts-ignore
    static throughNode(options) {
        throw new Error(`"throughNode" not available in this environment`);
    }
    /** @nocollapse */
    static throughDOM(
    // @ts-ignore
    writableStrategy, 
    // @ts-ignore
    readableStrategy) {
        throw new Error(`"throughDOM" not available in this environment`);
    }
    constructor(options) {
        super();
        this._position = 0;
        this._started = false;
        this._compression = null;
        // @ts-ignore
        this._sink = new AsyncByteQueue();
        this._schema = null;
        this._dictionaryBlocks = [];
        this._recordBatchBlocks = [];
        this._seenDictionaries = new Map();
        this._dictionaryDeltaOffsets = new Map();
        isObject(options) || (options = { autoDestroy: true, writeLegacyIpcFormat: false, compressionType: null });
        this._autoDestroy = (typeof options.autoDestroy === 'boolean') ? options.autoDestroy : true;
        this._writeLegacyIpcFormat = (typeof options.writeLegacyIpcFormat === 'boolean') ? options.writeLegacyIpcFormat : false;
        if (options.compressionType != null) {
            if (this._writeLegacyIpcFormat) {
                throw new Error('Legacy IPC format does not support columnar compression. Use modern IPC format (writeLegacyIpcFormat=false).');
            }
            if (Object.values(CompressionType).includes(options.compressionType)) {
                this._compression = new message_BodyCompression(options.compressionType);
            }
            else {
                const validCompressionTypes = Object.values(CompressionType)
                    .filter((v) => typeof v === 'string');
                throw new Error(`Unsupported compressionType: ${options.compressionType} Available types: ${validCompressionTypes.join(', ')}`);
            }
        }
        else {
            this._compression = null;
        }
    }
    toString(sync = false) {
        return this._sink.toString(sync);
    }
    toUint8Array(sync = false) {
        return this._sink.toUint8Array(sync);
    }
    writeAll(input) {
        if (isPromise(input)) {
            return input.then((x) => this.writeAll(x));
        }
        else if (isAsyncIterable(input)) {
            return writeAllAsync(this, input);
        }
        return writeAll(this, input);
    }
    get closed() { return this._sink.closed; }
    [Symbol.asyncIterator]() { return this._sink[Symbol.asyncIterator](); }
    toDOMStream(options) { return this._sink.toDOMStream(options); }
    toNodeStream(options) { return this._sink.toNodeStream(options); }
    close() {
        return this.reset()._sink.close();
    }
    abort(reason) {
        return this.reset()._sink.abort(reason);
    }
    finish() {
        this._autoDestroy ? this.close() : this.reset(this._sink, this._schema);
        return this;
    }
    reset(sink = this._sink, schema = null) {
        if ((sink === this._sink) || (sink instanceof AsyncByteQueue)) {
            this._sink = sink;
        }
        else {
            this._sink = new AsyncByteQueue();
            if (sink && isWritableDOMStream(sink)) {
                this.toDOMStream({ type: 'bytes' }).pipeTo(sink);
            }
            else if (sink && isWritableNodeStream(sink)) {
                this.toNodeStream({ objectMode: false }).pipe(sink);
            }
        }
        if (this._started && this._schema) {
            this._writeFooter(this._schema);
        }
        this._started = false;
        this._dictionaryBlocks = [];
        this._recordBatchBlocks = [];
        this._seenDictionaries = new Map();
        this._dictionaryDeltaOffsets = new Map();
        if (!schema || !(compareSchemas(schema, this._schema))) {
            if (schema == null) {
                this._position = 0;
                this._schema = null;
            }
            else {
                this._started = true;
                this._schema = schema;
                this._writeSchema(schema);
            }
        }
        return this;
    }
    write(payload) {
        let schema = null;
        if (!this._sink) {
            throw new Error(`RecordBatchWriter is closed`);
        }
        else if (payload == null) {
            return this.finish() && undefined;
        }
        else if (payload instanceof table_Table && !(schema = payload.schema)) {
            return this.finish() && undefined;
        }
        else if (payload instanceof recordbatch_RecordBatch && !(schema = payload.schema)) {
            return this.finish() && undefined;
        }
        if (schema && !compareSchemas(schema, this._schema)) {
            if (this._started && this._autoDestroy) {
                return this.close();
            }
            this.reset(this._sink, schema);
        }
        if (payload instanceof recordbatch_RecordBatch) {
            if (!(payload instanceof _InternalEmptyPlaceholderRecordBatch)) {
                this._writeRecordBatch(payload);
            }
        }
        else if (payload instanceof table_Table) {
            this.writeAll(payload.batches);
        }
        else if (isIterable(payload)) {
            this.writeAll(payload);
        }
    }
    _writeMessage(message, alignment = 8) {
        const a = alignment - 1;
        const buffer = Message.encode(message);
        const flatbufferSize = buffer.byteLength;
        const prefixSize = !this._writeLegacyIpcFormat ? 8 : 4;
        const alignedSize = (flatbufferSize + prefixSize + a) & ~a;
        const nPaddingBytes = alignedSize - flatbufferSize - prefixSize;
        if (message.headerType === MessageHeader.RecordBatch) {
            this._recordBatchBlocks.push(new FileBlock(alignedSize, message.bodyLength, this._position));
        }
        else if (message.headerType === MessageHeader.DictionaryBatch) {
            this._dictionaryBlocks.push(new FileBlock(alignedSize, message.bodyLength, this._position));
        }
        // If not in legacy pre-0.15.0 mode, write the stream continuation indicator
        if (!this._writeLegacyIpcFormat) {
            this._write(Int32Array.of(-1));
        }
        // Write the flatbuffer size prefix including padding
        this._write(Int32Array.of(alignedSize - prefixSize));
        // Write the flatbuffer
        if (flatbufferSize > 0) {
            this._write(buffer);
        }
        // Write any padding
        return this._writePadding(nPaddingBytes);
    }
    _write(chunk) {
        if (this._started) {
            const buffer = toUint8Array(chunk);
            if (buffer && buffer.byteLength > 0) {
                this._sink.write(buffer);
                this._position += buffer.byteLength;
            }
        }
        return this;
    }
    _writeSchema(schema) {
        return this._writeMessage(Message.from(schema));
    }
    // @ts-ignore
    _writeFooter(schema) {
        // eos bytes
        return this._writeLegacyIpcFormat
            ? this._write(Int32Array.of(0))
            : this._write(Int32Array.of(-1, 0));
    }
    _writeMagic() {
        return this._write(MAGIC);
    }
    _writePadding(nBytes) {
        return nBytes > 0 ? this._write(new Uint8Array(nBytes)) : this;
    }
    _writeRecordBatch(batch) {
        const { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = this._assembleRecordBatch(batch);
        const recordBatch = new message_RecordBatch(batch.numRows, nodes, bufferRegions, this._compression, variadicBufferCounts, batch.metadata);
        const message = Message.from(recordBatch, byteLength);
        return this
            ._writeDictionaries(batch)
            ._writeMessage(message)
            ._writeBodyBuffers(buffers);
    }
    _assembleRecordBatch(batch) {
        let { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = VectorAssembler.assemble(batch);
        if (this._compression != null) {
            ({ byteLength, bufferRegions, buffers } = this._compressBodyBuffers(buffers));
        }
        return { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts };
    }
    _compressBodyBuffers(buffers) {
        const codec = compressionRegistry.get(this._compression.type);
        if (!(codec === null || codec === void 0 ? void 0 : codec.encode) || typeof codec.encode !== 'function') {
            throw new Error(`Codec for compression type "${CompressionType[this._compression.type]}" has invalid encode method`);
        }
        let currentOffset = 0;
        const compressedBuffers = [];
        const bufferRegions = [];
        for (const buffer of buffers) {
            const byteBuf = toUint8Array(buffer);
            if (byteBuf.length === 0) {
                compressedBuffers.push(new Uint8Array(0), new Uint8Array(0));
                bufferRegions.push(new BufferRegion(currentOffset, 0));
                continue;
            }
            const compressed = codec.encode(byteBuf);
            const isCompressionEffective = compressed.length < byteBuf.length;
            const finalBuffer = isCompressionEffective ? compressed : byteBuf;
            const byteLength = isCompressionEffective ? finalBuffer.length : LENGTH_NO_COMPRESSED_DATA;
            const lengthPrefix = new flatbuffers/* ByteBuffer */.$F(new Uint8Array(COMPRESS_LENGTH_PREFIX));
            lengthPrefix.writeInt64(0, BigInt(byteLength));
            compressedBuffers.push(lengthPrefix.bytes(), new Uint8Array(finalBuffer));
            const padding = ((currentOffset + 7) & ~7) - currentOffset;
            currentOffset += padding;
            const fullBodyLength = COMPRESS_LENGTH_PREFIX + finalBuffer.length;
            bufferRegions.push(new BufferRegion(currentOffset, fullBodyLength));
            currentOffset += fullBodyLength;
        }
        const finalPadding = ((currentOffset + 7) & ~7) - currentOffset;
        currentOffset += finalPadding;
        return { byteLength: currentOffset, bufferRegions, buffers: compressedBuffers };
    }
    _writeDictionaryBatch(dictionary, id, isDelta = false) {
        const { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = this._assembleRecordBatch(new vector_Vector([dictionary]));
        const recordBatch = new message_RecordBatch(dictionary.length, nodes, bufferRegions, this._compression, variadicBufferCounts);
        const dictionaryBatch = new message_DictionaryBatch(recordBatch, id, isDelta);
        const message = Message.from(dictionaryBatch, byteLength);
        return this
            ._writeMessage(message)
            ._writeBodyBuffers(buffers);
    }
    _writeBodyBuffers(buffers) {
        const bufGroupSize = this._compression != null ? 2 : 1;
        const bufs = new Array(bufGroupSize);
        for (let i = 0; i < buffers.length; i += bufGroupSize) {
            let size = 0;
            for (let j = -1; ++j < bufGroupSize;) {
                bufs[j] = buffers[i + j];
                size += bufs[j].byteLength;
            }
            if (size === 0) {
                continue;
            }
            for (const buf of bufs)
                this._write(buf);
            const padding = ((size + 7) & ~7) - size;
            if (padding > 0) {
                this._writePadding(padding);
            }
        }
        return this;
    }
    _writeDictionaries(batch) {
        var _a, _b;
        for (const [id, dictionary] of batch.dictionaries) {
            const chunks = (_a = dictionary === null || dictionary === void 0 ? void 0 : dictionary.data) !== null && _a !== void 0 ? _a : [];
            const prevDictionary = this._seenDictionaries.get(id);
            const offset = (_b = this._dictionaryDeltaOffsets.get(id)) !== null && _b !== void 0 ? _b : 0;
            // * If no previous dictionary was written, write an initial DictionaryMessage.
            // * If the current dictionary does not share chunks with the previous dictionary, write a replacement DictionaryMessage.
            if (!prevDictionary || prevDictionary.data[0] !== chunks[0]) {
                // * If `index > 0`, then `isDelta` is true.
                // * If `index = 0`, then `isDelta` is false, because this is either the initial or a replacement DictionaryMessage.
                for (const [index, chunk] of chunks.entries())
                    this._writeDictionaryBatch(chunk, id, index > 0);
            }
            else if (offset < chunks.length) {
                for (const chunk of chunks.slice(offset))
                    this._writeDictionaryBatch(chunk, id, true);
            }
            this._seenDictionaries.set(id, dictionary);
            this._dictionaryDeltaOffsets.set(id, chunks.length);
        }
        return this;
    }
}
/** @ignore */
class writer_RecordBatchStreamWriter extends RecordBatchWriter {
    /** @nocollapse */
    static writeAll(input, options) {
        const writer = new writer_RecordBatchStreamWriter(options);
        if (isPromise(input)) {
            return input.then((x) => writer.writeAll(x));
        }
        else if (isAsyncIterable(input)) {
            return writeAllAsync(writer, input);
        }
        return writeAll(writer, input);
    }
}
/** @ignore */
class writer_RecordBatchFileWriter extends RecordBatchWriter {
    /** @nocollapse */
    static writeAll(input, options) {
        const writer = new writer_RecordBatchFileWriter(options);
        if (isPromise(input)) {
            return input.then((x) => writer.writeAll(x));
        }
        else if (isAsyncIterable(input)) {
            return writeAllAsync(writer, input);
        }
        return writeAll(writer, input);
    }
    constructor(options) {
        super(options);
        this._autoDestroy = true;
        this._writeLegacyIpcFormat = false;
    }
    // @ts-ignore
    _writeSchema(schema) {
        return this._writeMagic()._writePadding(2);
    }
    _writeDictionaryBatch(dictionary, id, isDelta = false) {
        if (!isDelta && this._seenDictionaries.has(id)) {
            throw new Error('The Arrow File format does not support replacement dictionaries. ');
        }
        return super._writeDictionaryBatch(dictionary, id, isDelta);
    }
    _writeFooter(schema) {
        const buffer = Footer_.encode(new Footer_(schema, MetadataVersion.V5, this._recordBatchBlocks, this._dictionaryBlocks));
        return super
            ._writeFooter(schema) // EOS bytes for sequential readers
            ._write(buffer) // Write the flatbuffer
            ._write(Int32Array.of(buffer.byteLength)) // then the footer size suffix
            ._writeMagic(); // then the magic suffix
    }
}
/** @ignore */
class RecordBatchJSONWriter extends RecordBatchWriter {
    /** @nocollapse */
    static writeAll(input) {
        return new RecordBatchJSONWriter().writeAll(input);
    }
    constructor() {
        super();
        this._autoDestroy = true;
        this._recordBatches = [];
        this._recordBatchesWithDictionaries = [];
    }
    _writeMessage() { return this; }
    // @ts-ignore
    _writeFooter(schema) { return this; }
    _writeSchema(schema) {
        return this._write(`{\n  "schema": ${JSON.stringify({ fields: schema.fields.map(field => fieldToJSON(field)) }, null, 2)}`);
    }
    _writeDictionaries(batch) {
        if (batch.dictionaries.size > 0) {
            this._recordBatchesWithDictionaries.push(batch);
        }
        return this;
    }
    _writeDictionaryBatch(dictionary, id, isDelta = false) {
        this._write(this._dictionaryBlocks.length === 0 ? `    ` : `,\n    `);
        this._write(dictionaryBatchToJSON(dictionary, id, isDelta));
        this._dictionaryBlocks.push(new FileBlock(0, 0, 0));
        return this;
    }
    _writeRecordBatch(batch) {
        this._writeDictionaries(batch);
        this._recordBatches.push(batch);
        return this;
    }
    close() {
        if (this._recordBatchesWithDictionaries.length > 0) {
            this._write(`,\n  "dictionaries": [\n`);
            for (const batch of this._recordBatchesWithDictionaries) {
                super._writeDictionaries(batch);
            }
            this._write(`\n  ]`);
        }
        if (this._recordBatches.length > 0) {
            for (let i = -1, n = this._recordBatches.length; ++i < n;) {
                this._write(i === 0 ? `,\n  "batches": [\n    ` : `,\n    `);
                this._write(recordBatchToJSON(this._recordBatches[i]));
                this._recordBatchBlocks.push(new FileBlock(0, 0, 0));
            }
            this._write(`\n  ]`);
        }
        if (this._schema) {
            this._write(`\n}`);
        }
        this._recordBatchesWithDictionaries = [];
        this._recordBatches = [];
        return super.close();
    }
}
/** @ignore */
function writeAll(writer, input) {
    let chunks = input;
    if (input instanceof table_Table) {
        chunks = input.batches;
        writer.reset(undefined, input.schema);
    }
    for (const batch of chunks) {
        writer.write(batch);
    }
    return writer.finish();
}
/** @ignore */
function writeAllAsync(writer, batches) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, batches_1, batches_1_1;
        var _b, e_1, _c, _d;
        try {
            for (_a = true, batches_1 = modules_asyncValues(batches); batches_1_1 = yield batches_1.next(), _b = batches_1_1.done, !_b; _a = true) {
                _d = batches_1_1.value;
                _a = false;
                const batch = _d;
                writer.write(batch);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_a && !_b && (_c = batches_1.return)) yield _c.call(batches_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return writer.finish();
    });
}
/** @ignore */
function fieldToJSON({ name, type, nullable }) {
    const assembler = new JSONTypeAssembler();
    return {
        'name': name, 'nullable': nullable,
        'type': assembler.visit(type),
        'children': (type.children || []).map((field) => fieldToJSON(field)),
        'dictionary': !type_DataType.isDictionary(type) ? undefined : {
            'id': type.id,
            'isOrdered': type.isOrdered,
            'indexType': assembler.visit(type.indices)
        }
    };
}
/** @ignore */
function dictionaryBatchToJSON(dictionary, id, isDelta = false) {
    const [columns] = JSONVectorAssembler.assemble(new recordbatch_RecordBatch({ [id]: dictionary }));
    return JSON.stringify({
        'id': id,
        'isDelta': isDelta,
        'data': {
            'count': dictionary.length,
            'columns': columns
        }
    }, null, 2);
}
/** @ignore */
function recordBatchToJSON(records) {
    const [columns] = JSONVectorAssembler.assemble(records);
    return JSON.stringify({
        'count': records.numRows,
        'columns': columns
    }, null, 2);
}

//# sourceMappingURL=writer.mjs.map

// EXTERNAL MODULE: external "node:stream"
var external_node_stream_ = __webpack_require__(57075);
;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/node/iterable.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
function toNodeStream(source, options) {
    if (isAsyncIterable(source)) {
        return new AsyncIterableReadable(source[Symbol.asyncIterator](), options);
    }
    if (isIterable(source)) {
        return new IterableReadable(source[Symbol.iterator](), options);
    }
    /* istanbul ignore next */
    throw new Error(`toNodeStream() must be called with an Iterable or AsyncIterable`);
}
/** @ignore */
class IterableReadable extends external_node_stream_.Readable {
    constructor(it, options) {
        super(options);
        this._iterator = it;
        this._pulling = false;
        this._bytesMode = !options || !options.objectMode;
    }
    _read(size) {
        const it = this._iterator;
        if (it && !this._pulling && (this._pulling = true)) {
            this._pulling = this._pull(size, it);
        }
    }
    _destroy(e, cb) {
        const it = this._iterator;
        let fn;
        it && (fn = e != null && it.throw || it.return);
        fn === null || fn === void 0 ? void 0 : fn.call(it, e);
        cb && cb(null);
    }
    _pull(size, it) {
        const bm = this._bytesMode;
        let r = null;
        while (this.readable && !(r = it.next(bm ? size : null)).done) {
            if (size != null) {
                size -= (bm && ArrayBuffer.isView(r.value) ? r.value.byteLength : 1);
            }
            if (!this.push(r.value) || size <= 0) {
                break;
            }
        }
        if (((r === null || r === void 0 ? void 0 : r.done) || !this.readable) && (this.push(null) || true)) {
            it.return && it.return();
        }
        return !this.readable;
    }
}
/** @ignore */
class AsyncIterableReadable extends external_node_stream_.Readable {
    constructor(it, options) {
        super(options);
        this._iterator = it;
        this._pulling = false;
        this._bytesMode = !options || !options.objectMode;
    }
    _read(size) {
        const it = this._iterator;
        if (it && !this._pulling && (this._pulling = true)) {
            (() => __awaiter(this, void 0, void 0, function* () { return this._pulling = yield this._pull(size, it); }))();
        }
    }
    _destroy(e, cb) {
        const it = this._iterator;
        let fn;
        it && (fn = e != null && it.throw || it.return);
        (fn === null || fn === void 0 ? void 0 : fn.call(it, e).then(() => cb && cb(null))) || (cb && cb(null));
    }
    _pull(size, it) {
        return __awaiter(this, void 0, void 0, function* () {
            const bm = this._bytesMode;
            let r = null;
            while (this.readable && !(r = yield it.next(bm ? size : null)).done) {
                if (size != null) {
                    size -= (bm && ArrayBuffer.isView(r.value) ? r.value.byteLength : 1);
                }
                if (!this.push(r.value) || size <= 0) {
                    break;
                }
            }
            if (((r === null || r === void 0 ? void 0 : r.done) || !this.readable) && (this.push(null) || true)) {
                it.return && it.return();
            }
            return !this.readable;
        });
    }
}

//# sourceMappingURL=iterable.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/binary.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class BinaryBuilder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._values = new BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = this._pendingLength + (this.length * 4);
        this._offsets && (size += this._offsets.byteLength);
        this._values && (size += this._values.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        return size;
    }
    setValue(index, value) {
        return super.setValue(index, toUint8Array(value));
    }
    _flushPending(pending, pendingLength) {
        const offsets = this._offsets;
        const data = this._values.reserve(pendingLength).buffer;
        let offset = 0;
        for (const [index, value] of pending) {
            if (value === undefined) {
                offsets.set(index, 0);
            }
            else {
                const length = value.length;
                data.set(value, offset);
                offsets.set(index, length);
                offset += length;
            }
        }
    }
}

//# sourceMappingURL=binary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/largebinary.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class LargeBinaryBuilder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._values = new BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = this._pendingLength + (this.length * 4);
        this._offsets && (size += this._offsets.byteLength);
        this._values && (size += this._values.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        return size;
    }
    setValue(index, value) {
        return super.setValue(index, toUint8Array(value));
    }
    _flushPending(pending, pendingLength) {
        const offsets = this._offsets;
        const data = this._values.reserve(pendingLength).buffer;
        let offset = 0;
        for (const [index, value] of pending) {
            if (value === undefined) {
                offsets.set(index, BigInt(0));
            }
            else {
                const length = value.length;
                data.set(value, offset);
                offsets.set(index, BigInt(length));
                offset += length;
            }
        }
    }
}

//# sourceMappingURL=largebinary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/bool.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class BoolBuilder extends Builder {
    constructor(options) {
        super(options);
        this._values = new BitmapBufferBuilder();
    }
    setValue(index, value) {
        this._values.set(index, +value);
    }
}

//# sourceMappingURL=bool.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/date.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class DateBuilder extends FixedWidthBuilder {
}
DateBuilder.prototype._setValue = setDate;
/** @ignore */
class DateDayBuilder extends DateBuilder {
}
DateDayBuilder.prototype._setValue = setDateDay;
/** @ignore */
class DateMillisecondBuilder extends DateBuilder {
}
DateMillisecondBuilder.prototype._setValue = setDateMillisecond;

//# sourceMappingURL=date.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/decimal.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class DecimalBuilder extends FixedWidthBuilder {
}
DecimalBuilder.prototype._setValue = setDecimal;

//# sourceMappingURL=decimal.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/dictionary.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class DictionaryBuilder extends Builder {
    constructor({ 'type': type, 'nullValues': nulls, 'dictionaryHashFunction': hashFn }) {
        super({ type: new Dictionary(type.dictionary, type.indices, type.id, type.isOrdered) });
        this._nulls = null;
        this._dictionaryOffset = 0;
        this._keysToIndices = Object.create(null);
        this.indices = makeBuilder({ 'type': this.type.indices, 'nullValues': nulls });
        this.dictionary = makeBuilder({ 'type': this.type.dictionary, 'nullValues': null });
        if (typeof hashFn === 'function') {
            this.valueToKey = hashFn;
        }
    }
    get values() { return this.indices.values; }
    get nullCount() { return this.indices.nullCount; }
    get nullBitmap() { return this.indices.nullBitmap; }
    get byteLength() { return this.indices.byteLength + this.dictionary.byteLength; }
    get reservedLength() { return this.indices.reservedLength + this.dictionary.reservedLength; }
    get reservedByteLength() { return this.indices.reservedByteLength + this.dictionary.reservedByteLength; }
    isValid(value) { return this.indices.isValid(value); }
    setValid(index, valid) {
        const indices = this.indices;
        valid = indices.setValid(index, valid);
        this.length = indices.length;
        return valid;
    }
    setValue(index, value) {
        const keysToIndices = this._keysToIndices;
        const key = this.valueToKey(value);
        let idx = keysToIndices[key];
        if (idx === undefined) {
            keysToIndices[key] = idx = this._dictionaryOffset + this.dictionary.append(value).length - 1;
        }
        return this.indices.setValue(index, idx);
    }
    flush() {
        const type = this.type;
        const prev = this._dictionary;
        const curr = this.dictionary.toVector();
        const data = this.indices.flush().clone(type);
        data.dictionary = prev ? prev.concat(curr) : curr;
        this.finished || (this._dictionaryOffset += curr.length);
        this._dictionary = data.dictionary;
        this.clear();
        return data;
    }
    finish() {
        this.indices.finish();
        this.dictionary.finish();
        this._dictionaryOffset = 0;
        this._keysToIndices = Object.create(null);
        return super.finish();
    }
    clear() {
        this.indices.clear();
        this.dictionary.clear();
        return super.clear();
    }
    valueToKey(val) {
        return typeof val === 'string' ? val : `${val}`;
    }
}

//# sourceMappingURL=dictionary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/fixedsizebinary.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class FixedSizeBinaryBuilder extends FixedWidthBuilder {
}
FixedSizeBinaryBuilder.prototype._setValue = setFixedSizeBinary;

//# sourceMappingURL=fixedsizebinary.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/fixedsizelist.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class FixedSizeListBuilder extends Builder {
    setValue(index, value) {
        const [child] = this.children;
        const start = index * this.stride;
        for (let i = -1, n = this.stride; ++i < n;) {
            child.set(start + i, value[i]);
        }
    }
    setValid(index, valid) {
        if (!super.setValid(index, valid)) {
            this.children[0].setValid((index + 1) * this.stride - 1, false);
        }
        return valid;
    }
    addChild(child, name = '0') {
        if (this.numChildren > 0) {
            throw new Error('FixedSizeListBuilder can only have one child.');
        }
        const childIndex = this.children.push(child);
        this.type = new type_FixedSizeList(this.type.listSize, new schema_Field(name, child.type, true));
        return childIndex;
    }
}

//# sourceMappingURL=fixedsizelist.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/float.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class FloatBuilder extends FixedWidthBuilder {
    setValue(index, value) {
        this._values.set(index, value);
    }
}
/** @ignore */
class Float16Builder extends FloatBuilder {
    setValue(index, value) {
        // convert JS float64 to a uint16
        super.setValue(index, float64ToUint16(value));
    }
}
/** @ignore */
class Float32Builder extends FloatBuilder {
}
/** @ignore */
class Float64Builder extends FloatBuilder {
}

//# sourceMappingURL=float.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/interval.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class IntervalBuilder extends FixedWidthBuilder {
}
IntervalBuilder.prototype._setValue = setIntervalValue;
/** @ignore */
class IntervalDayTimeBuilder extends IntervalBuilder {
}
IntervalDayTimeBuilder.prototype._setValue = setIntervalDayTime;
/** @ignore */
class IntervalYearMonthBuilder extends IntervalBuilder {
}
IntervalYearMonthBuilder.prototype._setValue = setIntervalYearMonth;
/** @ignore */
class IntervalMonthDayNanoBuilder extends IntervalBuilder {
}
IntervalMonthDayNanoBuilder.prototype._setValue = setIntervalMonthDayNano;

//# sourceMappingURL=interval.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/duration.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class DurationBuilder extends FixedWidthBuilder {
}
DurationBuilder.prototype._setValue = setDuration;
/** @ignore */
class DurationSecondBuilder extends DurationBuilder {
}
DurationSecondBuilder.prototype._setValue = setDurationSecond;
/** @ignore */
class DurationMillisecondBuilder extends DurationBuilder {
}
DurationMillisecondBuilder.prototype._setValue = setDurationMillisecond;
/** @ignore */
class DurationMicrosecondBuilder extends DurationBuilder {
}
DurationMicrosecondBuilder.prototype._setValue = setDurationMicrosecond;
/** @ignore */
class DurationNanosecondBuilder extends DurationBuilder {
}
DurationNanosecondBuilder.prototype._setValue = setDurationNanosecond;

//# sourceMappingURL=duration.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/int.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @ignore */
class IntBuilder extends FixedWidthBuilder {
    setValue(index, value) {
        this._values.set(index, value);
    }
}
/** @ignore */
class Int8Builder extends IntBuilder {
}
/** @ignore */
class Int16Builder extends IntBuilder {
}
/** @ignore */
class Int32Builder extends IntBuilder {
}
/** @ignore */
class Int64Builder extends IntBuilder {
}
/** @ignore */
class Uint8Builder extends IntBuilder {
}
/** @ignore */
class Uint16Builder extends IntBuilder {
}
/** @ignore */
class Uint32Builder extends IntBuilder {
}
/** @ignore */
class Uint64Builder extends IntBuilder {
}

//# sourceMappingURL=int.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/list.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
class ListBuilder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._offsets = new OffsetsBufferBuilder(opts.type);
    }
    addChild(child, name = '0') {
        if (this.numChildren > 0) {
            throw new Error('ListBuilder can only have one child.');
        }
        this.children[this.numChildren] = child;
        this.type = new type_List(new schema_Field(name, child.type, true));
        return this.numChildren - 1;
    }
    _flushPending(pending) {
        const offsets = this._offsets;
        const [child] = this.children;
        for (const [index, value] of pending) {
            if (typeof value === 'undefined') {
                offsets.set(index, 0);
            }
            else {
                const v = value;
                const n = v.length;
                const start = offsets.set(index, n).buffer[index];
                for (let i = -1; ++i < n;) {
                    child.set(start + i, v[i]);
                }
            }
        }
    }
}

//# sourceMappingURL=list.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/largelist.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.





/** @ignore */
class LargeListBuilder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._offsets = new OffsetsBufferBuilder(opts.type);
    }
    addChild(child, name = '0') {
        if (this.numChildren > 0) {
            throw new Error('LargeListBuilder can only have one child.');
        }
        this.children[this.numChildren] = child;
        this.type = new type_LargeList(new schema_Field(name, child.type, true));
        return this.numChildren - 1;
    }
    _flushPending(pending) {
        const offsets = this._offsets;
        const [child] = this.children;
        for (const [index, value] of pending) {
            if (typeof value === 'undefined') {
                offsets.set(index, BigInt(0));
            }
            else {
                const v = value;
                const n = v.length;
                const start = bigIntToNumber(offsets.set(index, BigInt(n)).buffer[index]);
                for (let i = -1; ++i < n;) {
                    child.set(start + i, v[i]);
                }
            }
        }
    }
}

//# sourceMappingURL=largelist.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/map.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
class MapBuilder extends VariableWidthBuilder {
    set(index, value) {
        return super.set(index, value);
    }
    setValue(index, value) {
        const row = (value instanceof Map ? value : new Map(Object.entries(value)));
        const pending = this._pending || (this._pending = new Map());
        const current = pending.get(index);
        current && (this._pendingLength -= current.size);
        this._pendingLength += row.size;
        pending.set(index, row);
    }
    addChild(child, name = `${this.numChildren}`) {
        if (this.numChildren > 0) {
            throw new Error('ListBuilder can only have one child.');
        }
        this.children[this.numChildren] = child;
        this.type = new Map_(new schema_Field(name, child.type, true), this.type.keysSorted);
        return this.numChildren - 1;
    }
    _flushPending(pending) {
        const offsets = this._offsets;
        const [child] = this.children;
        for (const [index, value] of pending) {
            if (value === undefined) {
                offsets.set(index, 0);
            }
            else {
                let { [index]: idx, [index + 1]: end } = offsets.set(index, value.size).buffer;
                for (const val of value.entries()) {
                    child.set(idx, val);
                    if (++idx >= end)
                        break;
                }
            }
        }
    }
}

//# sourceMappingURL=map.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/null.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @ignore */
class NullBuilder extends Builder {
    // @ts-ignore
    setValue(index, value) { }
    setValid(index, valid) {
        this.length = Math.max(index + 1, this.length);
        return valid;
    }
}

//# sourceMappingURL=null.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/struct.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/* eslint-disable unicorn/no-array-for-each */



/** @ignore */
class StructBuilder extends Builder {
    setValue(index, value) {
        const { children, type } = this;
        switch (Array.isArray(value) || value.constructor) {
            case true: return type.children.forEach((_, i) => children[i].set(index, value[i]));
            case Map: return type.children.forEach((f, i) => children[i].set(index, value.get(f.name)));
            default: return type.children.forEach((f, i) => children[i].set(index, value[f.name]));
        }
    }
    /** @inheritdoc */
    setValid(index, valid) {
        if (!super.setValid(index, valid)) {
            this.children.forEach((child) => child.setValid(index, valid));
        }
        return valid;
    }
    addChild(child, name = `${this.numChildren}`) {
        const childIndex = this.children.push(child);
        this.type = new Struct([...this.type.children, new schema_Field(name, child.type, true)]);
        return childIndex;
    }
}

//# sourceMappingURL=struct.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/timestamp.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class TimestampBuilder extends FixedWidthBuilder {
}
TimestampBuilder.prototype._setValue = setTimestamp;
/** @ignore */
class TimestampSecondBuilder extends TimestampBuilder {
}
TimestampSecondBuilder.prototype._setValue = setTimestampSecond;
/** @ignore */
class TimestampMillisecondBuilder extends TimestampBuilder {
}
TimestampMillisecondBuilder.prototype._setValue = setTimestampMillisecond;
/** @ignore */
class TimestampMicrosecondBuilder extends TimestampBuilder {
}
TimestampMicrosecondBuilder.prototype._setValue = setTimestampMicrosecond;
/** @ignore */
class TimestampNanosecondBuilder extends TimestampBuilder {
}
TimestampNanosecondBuilder.prototype._setValue = setTimestampNanosecond;

//# sourceMappingURL=timestamp.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/time.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class TimeBuilder extends FixedWidthBuilder {
}
TimeBuilder.prototype._setValue = setTime;
/** @ignore */
class TimeSecondBuilder extends TimeBuilder {
}
TimeSecondBuilder.prototype._setValue = setTimeSecond;
/** @ignore */
class TimeMillisecondBuilder extends TimeBuilder {
}
TimeMillisecondBuilder.prototype._setValue = setTimeMillisecond;
/** @ignore */
class TimeMicrosecondBuilder extends TimeBuilder {
}
TimeMicrosecondBuilder.prototype._setValue = setTimeMicrosecond;
/** @ignore */
class TimeNanosecondBuilder extends TimeBuilder {
}
TimeNanosecondBuilder.prototype._setValue = setTimeNanosecond;

//# sourceMappingURL=time.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/union.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
class UnionBuilder extends Builder {
    constructor(options) {
        super(options);
        this._typeIds = new DataBufferBuilder(Int8Array, 0, 1);
        if (typeof options['valueToChildTypeId'] === 'function') {
            this._valueToChildTypeId = options['valueToChildTypeId'];
        }
    }
    get typeIdToChildIndex() { return this.type.typeIdToChildIndex; }
    append(value, childTypeId) {
        return this.set(this.length, value, childTypeId);
    }
    set(index, value, childTypeId) {
        if (childTypeId === undefined) {
            childTypeId = this._valueToChildTypeId(this, value, index);
        }
        this.setValue(index, value, childTypeId);
        return this;
    }
    setValue(index, value, childTypeId) {
        this._typeIds.set(index, childTypeId);
        const childIndex = this.type.typeIdToChildIndex[childTypeId];
        const child = this.children[childIndex];
        child === null || child === void 0 ? void 0 : child.set(index, value);
        this.length = Math.max(index + 1, this.length);
    }
    addChild(child, name = `${this.children.length}`) {
        const childTypeId = this.children.push(child);
        const { type: { children, mode, typeIds } } = this;
        const fields = [...children, new schema_Field(name, child.type)];
        this.type = new Union_(mode, [...typeIds, childTypeId], fields);
        return childTypeId;
    }
    /** @ignore */
    // @ts-ignore
    _valueToChildTypeId(builder, value, offset) {
        throw new Error(`Cannot map UnionBuilder value to child typeId. \
Pass the \`childTypeId\` as the second argument to unionBuilder.append(), \
or supply a \`valueToChildTypeId\` function as part of the UnionBuilder constructor options.`);
    }
}
/** @ignore */
class SparseUnionBuilder extends UnionBuilder {
}
/** @ignore */
class DenseUnionBuilder extends UnionBuilder {
    constructor(options) {
        super(options);
        this._offsets = new DataBufferBuilder(Int32Array);
    }
    /** @ignore */
    setValue(index, value, childTypeId) {
        const id = this._typeIds.set(index, childTypeId).buffer[index];
        const child = this.getChildAt(this.type.typeIdToChildIndex[id]);
        const denseIndex = this._offsets.set(index, child.length).buffer[index];
        child === null || child === void 0 ? void 0 : child.set(denseIndex, value);
        this.length = Math.max(index + 1, this.length);
    }
}

//# sourceMappingURL=union.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/utf8.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
class Utf8Builder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._values = new BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = this._pendingLength + (this.length * 4);
        this._offsets && (size += this._offsets.byteLength);
        this._values && (size += this._values.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        return size;
    }
    setValue(index, value) {
        return super.setValue(index, encodeUtf8(value));
    }
    // @ts-ignore
    _flushPending(pending, pendingLength) { }
}
Utf8Builder.prototype._flushPending = BinaryBuilder.prototype._flushPending;

//# sourceMappingURL=utf8.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/largeutf8.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
class LargeUtf8Builder extends VariableWidthBuilder {
    constructor(opts) {
        super(opts);
        this._values = new BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = this._pendingLength + (this.length * 4);
        this._offsets && (size += this._offsets.byteLength);
        this._values && (size += this._values.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        return size;
    }
    setValue(index, value) {
        return super.setValue(index, encodeUtf8(value));
    }
    // @ts-ignore
    _flushPending(pending, pendingLength) { }
}
LargeUtf8Builder.prototype._flushPending = LargeBinaryBuilder.prototype._flushPending;

//# sourceMappingURL=largeutf8.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/binaryview.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.





/** @ignore */
class BinaryViewBuilder extends Builder {
    constructor(opts) {
        super(opts);
        this._variadicBuffers = [];
        this._currentBuffer = null;
        this._currentBufferIndex = 0;
        this._currentBufferOffset = 0;
        this._bufferSize = 32 * 1024 * 1024; // 32MB per buffer as per spec recommendation
        this._views = new BufferBuilder(Uint8Array);
    }
    get byteLength() {
        let size = 0;
        this._views && (size += this._views.byteLength);
        this._nulls && (size += this._nulls.byteLength);
        for (const buffer of this._variadicBuffers) {
            size += buffer.byteLength;
        }
        this._currentBuffer && (size += this._currentBuffer.byteLength);
        return size;
    }
    setValue(index, value) {
        return this.writeBinaryValue(index, this.encodeValue(value));
    }
    writeBinaryValue(index, data) {
        const length = data.length;
        // Ensure views buffer has space up to this index (similar to FixedWidthBuilder)
        const bytesNeeded = (index + 1) * type_BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const viewBuffer = this._views.buffer;
        const viewOffset = index * type_BinaryView.ELEMENT_WIDTH;
        const view = new DataView(viewBuffer.buffer, viewBuffer.byteOffset + viewOffset, type_BinaryView.ELEMENT_WIDTH);
        // Write length (4 bytes, little-endian)
        view.setInt32(type_BinaryView.LENGTH_OFFSET, length, true);
        if (length <= type_BinaryView.INLINE_CAPACITY) {
            // Inline: store data directly in view struct (up to 12 bytes)
            viewBuffer.set(data, viewOffset + type_BinaryView.INLINE_OFFSET);
            // Zero out remaining bytes
            for (let i = length; i < type_BinaryView.INLINE_CAPACITY; i++) {
                viewBuffer[viewOffset + type_BinaryView.INLINE_OFFSET + i] = 0;
            }
        }
        else {
            // Out-of-line: store in variadic buffer
            // Write prefix (first 4 bytes of data)
            const prefix = new DataView(data.buffer, data.byteOffset, Math.min(4, length));
            view.setUint32(type_BinaryView.INLINE_OFFSET, prefix.getUint32(0, true), true);
            // Allocate space in variadic buffer
            if (!this._currentBuffer || this._currentBufferOffset + length > this._bufferSize) {
                // Start a new buffer
                if (this._currentBuffer) {
                    this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
                }
                this._currentBuffer = new BufferBuilder(Uint8Array);
                this._currentBufferIndex = this._variadicBuffers.length;
                this._currentBufferOffset = 0;
            }
            // Write data to current buffer
            const bufferData = this._currentBuffer.reserve(length).buffer;
            bufferData.set(data, this._currentBufferOffset);
            // Write buffer index and offset to view struct
            view.setInt32(type_BinaryView.BUFFER_INDEX_OFFSET, this._currentBufferIndex, true);
            view.setInt32(type_BinaryView.BUFFER_OFFSET_OFFSET, this._currentBufferOffset, true);
            this._currentBufferOffset += length;
        }
        return this;
    }
    encodeValue(value) {
        return toUint8Array(value);
    }
    setValid(index, isValid) {
        // Ensure space is allocated in the views buffer for this index
        const bytesNeeded = (index + 1) * type_BinaryView.ELEMENT_WIDTH;
        const currentBytes = this._views.length;
        if (bytesNeeded > currentBytes) {
            this._views.reserve(bytesNeeded - currentBytes);
        }
        const result = super.setValid(index, isValid);
        if (!result) {
            // For null values, zero out the view struct
            const viewBuffer = this._views.buffer;
            const viewOffset = index * type_BinaryView.ELEMENT_WIDTH;
            for (let i = 0; i < type_BinaryView.ELEMENT_WIDTH; i++) {
                viewBuffer[viewOffset + i] = 0;
            }
        }
        return result;
    }
    clear() {
        this._variadicBuffers = [];
        this._currentBuffer = null;
        this._currentBufferIndex = 0;
        this._currentBufferOffset = 0;
        this._views.clear();
        return super.clear();
    }
    flush() {
        const { type, length, nullCount, _views, _nulls } = this;
        // Finalize current buffer if it exists
        if (this._currentBuffer && this._currentBufferOffset > 0) {
            this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
            this._currentBuffer = null;
            this._currentBufferOffset = 0;
        }
        const views = _views.flush(length * type_BinaryView.ELEMENT_WIDTH);
        const nullBitmap = nullCount > 0 ? _nulls.flush(length) : undefined;
        const variadicBuffers = this._variadicBuffers.slice();
        // Reset variadic buffers for next batch
        this._variadicBuffers = [];
        this._currentBufferIndex = 0;
        this.clear();
        const props = {
            type,
            length,
            nullCount,
            nullBitmap,
            ['views']: views,
            ['variadicBuffers']: variadicBuffers
        };
        return data_makeData(props);
    }
    finish() {
        this.finished = true;
        return this;
    }
}

//# sourceMappingURL=binaryview.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/builder/utf8view.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
class Utf8ViewBuilder extends BinaryViewBuilder {
    constructor(opts) {
        super(opts);
    }
    setValue(index, value) {
        return this.writeBinaryValue(index, encodeUtf8(value));
    }
}

//# sourceMappingURL=utf8view.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/visitor/builderctor.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

























/** @ignore */
class GetBuilderCtor extends Visitor {
    visitNull() { return NullBuilder; }
    visitBool() { return BoolBuilder; }
    visitInt() { return IntBuilder; }
    visitInt8() { return Int8Builder; }
    visitInt16() { return Int16Builder; }
    visitInt32() { return Int32Builder; }
    visitInt64() { return Int64Builder; }
    visitUint8() { return Uint8Builder; }
    visitUint16() { return Uint16Builder; }
    visitUint32() { return Uint32Builder; }
    visitUint64() { return Uint64Builder; }
    visitFloat() { return FloatBuilder; }
    visitFloat16() { return Float16Builder; }
    visitFloat32() { return Float32Builder; }
    visitFloat64() { return Float64Builder; }
    visitUtf8() { return Utf8Builder; }
    visitLargeUtf8() { return LargeUtf8Builder; }
    visitBinary() { return BinaryBuilder; }
    visitLargeBinary() { return LargeBinaryBuilder; }
    visitFixedSizeBinary() { return FixedSizeBinaryBuilder; }
    visitDate() { return DateBuilder; }
    visitDateDay() { return DateDayBuilder; }
    visitDateMillisecond() { return DateMillisecondBuilder; }
    visitTimestamp() { return TimestampBuilder; }
    visitTimestampSecond() { return TimestampSecondBuilder; }
    visitTimestampMillisecond() { return TimestampMillisecondBuilder; }
    visitTimestampMicrosecond() { return TimestampMicrosecondBuilder; }
    visitTimestampNanosecond() { return TimestampNanosecondBuilder; }
    visitTime() { return TimeBuilder; }
    visitTimeSecond() { return TimeSecondBuilder; }
    visitTimeMillisecond() { return TimeMillisecondBuilder; }
    visitTimeMicrosecond() { return TimeMicrosecondBuilder; }
    visitTimeNanosecond() { return TimeNanosecondBuilder; }
    visitDecimal() { return DecimalBuilder; }
    visitList() { return ListBuilder; }
    visitLargeList() { return LargeListBuilder; }
    visitStruct() { return StructBuilder; }
    visitUnion() { return UnionBuilder; }
    visitDenseUnion() { return DenseUnionBuilder; }
    visitSparseUnion() { return SparseUnionBuilder; }
    visitDictionary() { return DictionaryBuilder; }
    visitInterval() { return IntervalBuilder; }
    visitIntervalDayTime() { return IntervalDayTimeBuilder; }
    visitIntervalYearMonth() { return IntervalYearMonthBuilder; }
    visitIntervalMonthDayNano() { return IntervalMonthDayNanoBuilder; }
    visitDuration() { return DurationBuilder; }
    visitDurationSecond() { return DurationSecondBuilder; }
    visitDurationMillisecond() { return DurationMillisecondBuilder; }
    visitDurationMicrosecond() { return DurationMicrosecondBuilder; }
    visitDurationNanosecond() { return DurationNanosecondBuilder; }
    visitFixedSizeList() { return FixedSizeListBuilder; }
    visitMap() { return MapBuilder; }
    visitBinaryView() { return BinaryViewBuilder; }
    visitUtf8View() { return Utf8ViewBuilder; }
}
/** @ignore */
const builderctor_instance = new GetBuilderCtor();

//# sourceMappingURL=builderctor.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/factories.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.









function makeBuilder(options) {
    const type = options.type;
    const builder = new (builderctor_instance.getVisitFn(type)())(options);
    if (type.children && type.children.length > 0) {
        const children = options['children'] || [];
        const defaultOptions = { 'nullValues': options['nullValues'] };
        const getChildOptions = Array.isArray(children)
            ? ((_, i) => children[i] || defaultOptions)
            : (({ name }) => children[name] || defaultOptions);
        for (const [index, field] of type.children.entries()) {
            const { type } = field;
            const opts = getChildOptions(field, index);
            builder.children.push(makeBuilder(Object.assign(Object.assign({}, opts), { type })));
        }
    }
    return builder;
}
function factories_vectorFromArray(init, type) {
    if (init instanceof Data || init instanceof Vector || init.type instanceof dtypes.DataType || ArrayBuffer.isView(init)) {
        return makeVector(init);
    }
    const options = { type: type !== null && type !== void 0 ? type : inferType(init), nullValues: [null] };
    const chunks = [...builderThroughIterable(options)(init)];
    const vector = chunks.length === 1 ? chunks[0] : chunks.reduce((a, b) => a.concat(b));
    if (dtypes.DataType.isDictionary(vector.type)) {
        return vector.memoize();
    }
    return vector;
}
/**
 * Creates a {@link Table} from an array of objects.
 *
 * @param array A table of objects.
 */
function tableFromJSON(array) {
    const vector = factories_vectorFromArray(array);
    const batch = new RecordBatch(new Schema(vector.type.children), vector.data[0]);
    return new Table(batch);
}
function inferType(value) {
    if (value.length === 0) {
        return new dtypes.Null;
    }
    let nullsCount = 0;
    let arraysCount = 0;
    let objectsCount = 0;
    let numbersCount = 0;
    let stringsCount = 0;
    let bigintsCount = 0;
    let booleansCount = 0;
    let datesCount = 0;
    for (const val of value) {
        if (val == null) {
            ++nullsCount;
            continue;
        }
        switch (typeof val) {
            case 'bigint':
                ++bigintsCount;
                continue;
            case 'boolean':
                ++booleansCount;
                continue;
            case 'number':
                ++numbersCount;
                continue;
            case 'string':
                ++stringsCount;
                continue;
            case 'object':
                if (Array.isArray(val)) {
                    ++arraysCount;
                }
                else if (Object.prototype.toString.call(val) === '[object Date]') {
                    ++datesCount;
                }
                else {
                    ++objectsCount;
                }
                continue;
        }
        throw new TypeError('Unable to infer Vector type from input values, explicit type declaration expected.');
    }
    if (numbersCount + nullsCount === value.length) {
        return new dtypes.Float64;
    }
    else if (stringsCount + nullsCount === value.length) {
        return new dtypes.Dictionary(new dtypes.Utf8, new dtypes.Int32);
    }
    else if (bigintsCount + nullsCount === value.length) {
        return new dtypes.Int64;
    }
    else if (booleansCount + nullsCount === value.length) {
        return new dtypes.Bool;
    }
    else if (datesCount + nullsCount === value.length) {
        return new dtypes.TimestampMillisecond;
    }
    else if (arraysCount + nullsCount === value.length) {
        const array = value;
        const childType = inferType(array[array.findIndex((ary) => ary != null)]);
        if (array.every((ary) => ary == null || compareTypes(childType, inferType(ary)))) {
            return new dtypes.List(new Field('', childType, true));
        }
    }
    else if (objectsCount + nullsCount === value.length) {
        const fields = new Map();
        for (const row of value) {
            for (const key of Object.keys(row)) {
                if (!fields.has(key) && row[key] != null) {
                    // use the type inferred for the first instance of a found key
                    fields.set(key, new Field(key, inferType([row[key]]), true));
                }
            }
        }
        return new dtypes.Struct([...fields.values()]);
    }
    throw new TypeError('Unable to infer Vector type from input values, explicit type declaration expected.');
}
/**
 * Transform a synchronous `Iterable` of arbitrary JavaScript values into a
 * sequence of Arrow Vector<T> following the chunking semantics defined in
 * the supplied `options` argument.
 *
 * This function returns a function that accepts an `Iterable` of values to
 * transform. When called, this function returns an Iterator of `Vector<T>`.
 *
 * The resulting `Iterator<Vector<T>>` yields Vectors based on the
 * `queueingStrategy` and `highWaterMark` specified in the `options` argument.
 *
 * * If `queueingStrategy` is `"count"` (or omitted), The `Iterator<Vector<T>>`
 *   will flush the underlying `Builder` (and yield a new `Vector<T>`) once the
 *   Builder's `length` reaches or exceeds the supplied `highWaterMark`.
 * * If `queueingStrategy` is `"bytes"`, the `Iterator<Vector<T>>` will flush
 *   the underlying `Builder` (and yield a new `Vector<T>`) once its `byteLength`
 *   reaches or exceeds the supplied `highWaterMark`.
 *
 * @param {IterableBuilderOptions<T, TNull>} options An object of properties which determine the `Builder` to create and the chunking semantics to use.
 * @returns A function which accepts a JavaScript `Iterable` of values to
 *          write, and returns an `Iterator` that yields Vectors according
 *          to the chunking semantics defined in the `options` argument.
 * @nocollapse
 */
function builderThroughIterable(options) {
    const { ['queueingStrategy']: queueingStrategy = 'count' } = options;
    const { ['highWaterMark']: highWaterMark = queueingStrategy !== 'bytes' ? Number.POSITIVE_INFINITY : Math.pow(2, 14) } = options;
    const sizeProperty = queueingStrategy !== 'bytes' ? 'length' : 'byteLength';
    return function* (source) {
        let numChunks = 0;
        const builder = makeBuilder(options);
        for (const value of source) {
            if (builder.append(value)[sizeProperty] >= highWaterMark) {
                ++numChunks && (yield builder.toVector());
            }
        }
        if (builder.finish().length > 0 || numChunks === 0) {
            yield builder.toVector();
        }
    };
}
/**
 * Transform an `AsyncIterable` of arbitrary JavaScript values into a
 * sequence of Arrow Vector<T> following the chunking semantics defined in
 * the supplied `options` argument.
 *
 * This function returns a function that accepts an `AsyncIterable` of values to
 * transform. When called, this function returns an AsyncIterator of `Vector<T>`.
 *
 * The resulting `AsyncIterator<Vector<T>>` yields Vectors based on the
 * `queueingStrategy` and `highWaterMark` specified in the `options` argument.
 *
 * * If `queueingStrategy` is `"count"` (or omitted), The `AsyncIterator<Vector<T>>`
 *   will flush the underlying `Builder` (and yield a new `Vector<T>`) once the
 *   Builder's `length` reaches or exceeds the supplied `highWaterMark`.
 * * If `queueingStrategy` is `"bytes"`, the `AsyncIterator<Vector<T>>` will flush
 *   the underlying `Builder` (and yield a new `Vector<T>`) once its `byteLength`
 *   reaches or exceeds the supplied `highWaterMark`.
 *
 * @param {IterableBuilderOptions<T, TNull>} options An object of properties which determine the `Builder` to create and the chunking semantics to use.
 * @returns A function which accepts a JavaScript `AsyncIterable` of values
 *          to write, and returns an `AsyncIterator` that yields Vectors
 *          according to the chunking semantics defined in the `options`
 *          argument.
 * @nocollapse
 */
function builderThroughAsyncIterable(options) {
    const { ['queueingStrategy']: queueingStrategy = 'count' } = options;
    const { ['highWaterMark']: highWaterMark = queueingStrategy !== 'bytes' ? Number.POSITIVE_INFINITY : Math.pow(2, 14) } = options;
    const sizeProperty = queueingStrategy !== 'bytes' ? 'length' : 'byteLength';
    return function (source) {
        return __asyncGenerator(this, arguments, function* () {
            var _a, e_1, _b, _c;
            let numChunks = 0;
            const builder = makeBuilder(options);
            try {
                for (var _d = true, source_1 = __asyncValues(source), source_1_1; source_1_1 = yield __await(source_1.next()), _a = source_1_1.done, !_a; _d = true) {
                    _c = source_1_1.value;
                    _d = false;
                    const value = _c;
                    if (builder.append(value)[sizeProperty] >= highWaterMark) {
                        ++numChunks && (yield yield __await(builder.toVector()));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = source_1.return)) yield __await(_b.call(source_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (builder.finish().length > 0 || numChunks === 0) {
                yield yield __await(builder.toVector());
            }
        });
    };
}

//# sourceMappingURL=factories.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/node/builder.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
function builderThroughNodeStream(options) {
    return new BuilderDuplex(makeBuilder(options), options);
}
/** @ignore */
class BuilderDuplex extends external_node_stream_.Duplex {
    constructor(builder, options) {
        const { queueingStrategy = 'count', autoDestroy = true } = options;
        const { highWaterMark = queueingStrategy !== 'bytes' ? 1000 : Math.pow(2, 14) } = options;
        super({ autoDestroy, highWaterMark: 1, allowHalfOpen: true, writableObjectMode: true, readableObjectMode: true });
        this._numChunks = 0;
        this._finished = false;
        this._builder = builder;
        this._desiredSize = highWaterMark;
        this._getSize = queueingStrategy !== 'bytes' ? builderLength : builderByteLength;
    }
    _read(size) {
        this._maybeFlush(this._builder, this._desiredSize = size);
    }
    _final(cb) {
        this._maybeFlush(this._builder.finish(), this._desiredSize);
        cb && cb();
    }
    _write(value, _, cb) {
        const result = this._maybeFlush(this._builder.append(value), this._desiredSize);
        cb && cb();
        return result;
    }
    _destroy(err, cb) {
        this._builder.clear();
        cb && cb(err);
    }
    _maybeFlush(builder, size) {
        if (this._getSize(builder) >= size) {
            ++this._numChunks && this.push(builder.toVector());
        }
        if (builder.finished) {
            if (builder.length > 0 || this._numChunks === 0) {
                ++this._numChunks && this.push(builder.toVector());
            }
            if (!this._finished && (this._finished = true)) {
                this.push(null);
            }
            return false;
        }
        return this._getSize(builder) < this.writableHighWaterMark;
    }
}
/** @ignore */ const builderLength = (builder) => builder.length;
/** @ignore */ const builderByteLength = (builder) => builder.byteLength;

//# sourceMappingURL=builder.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/node/reader.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




/** @ignore */
function recordBatchReaderThroughNodeStream(options) {
    return new RecordBatchReaderDuplex(options);
}
/** @ignore */
class RecordBatchReaderDuplex extends external_node_stream_.Duplex {
    constructor(options) {
        super(Object.assign(Object.assign({ allowHalfOpen: false }, options), { readableObjectMode: true, writableObjectMode: false }));
        this._pulling = false;
        this._autoDestroy = true;
        this._reader = null;
        this._pulling = false;
        this._asyncQueue = new AsyncByteQueue();
        this._autoDestroy = options && (typeof options.autoDestroy === 'boolean') ? options.autoDestroy : true;
    }
    _final(cb) {
        const aq = this._asyncQueue;
        aq === null || aq === void 0 ? void 0 : aq.close();
        cb && cb();
    }
    _write(x, _, cb) {
        const aq = this._asyncQueue;
        aq === null || aq === void 0 ? void 0 : aq.write(x);
        cb && cb();
        return true;
    }
    _read(size) {
        const aq = this._asyncQueue;
        if (aq && !this._pulling && (this._pulling = true)) {
            (() => __awaiter(this, void 0, void 0, function* () {
                if (!this._reader) {
                    this._reader = yield this._open(aq);
                }
                this._pulling = yield this._pull(size, this._reader);
            }))();
        }
    }
    _destroy(err, cb) {
        const aq = this._asyncQueue;
        if (aq) {
            err ? aq.abort(err) : aq.close();
        }
        cb(this._asyncQueue = this._reader = null);
    }
    _open(source) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield RecordBatchReader.from(source)).open({ autoDestroy: this._autoDestroy });
        });
    }
    _pull(size, reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = null;
            while (this.readable && !(r = yield reader.next()).done) {
                if (!this.push(r.value) || (size != null && --size <= 0)) {
                    break;
                }
            }
            if (!this.readable || ((r === null || r === void 0 ? void 0 : r.done) && (reader.autoDestroy || (yield reader.reset().open()).closed))) {
                this.push(null);
                yield reader.cancel();
            }
            return !this.readable;
        });
    }
}

//# sourceMappingURL=reader.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/node/writer.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
function recordBatchWriterThroughNodeStream(options) {
    return new RecordBatchWriterDuplex(new this(options));
}
/** @ignore */
class RecordBatchWriterDuplex extends external_node_stream_.Duplex {
    constructor(writer, options) {
        super(Object.assign(Object.assign({ allowHalfOpen: false }, options), { writableObjectMode: true, readableObjectMode: false }));
        this._pulling = false;
        this._writer = writer;
        this._reader = new AsyncByteStream(writer);
    }
    _final(cb) {
        const writer = this._writer;
        writer === null || writer === void 0 ? void 0 : writer.close();
        cb && cb();
    }
    _write(x, _, cb) {
        const writer = this._writer;
        writer === null || writer === void 0 ? void 0 : writer.write(x);
        cb && cb();
        return true;
    }
    _read(size) {
        const it = this._reader;
        if (it && !this._pulling && (this._pulling = true)) {
            (() => __awaiter(this, void 0, void 0, function* () { return this._pulling = yield this._pull(size, it); }))();
        }
    }
    _destroy(err, cb) {
        const writer = this._writer;
        if (writer) {
            err ? writer.abort(err) : writer.close();
        }
        cb(this._reader = this._writer = null);
    }
    _pull(size, reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = null;
            while (this.readable && !(r = yield reader.next(size || null)).done) {
                if (size != null && r.value) {
                    size -= r.value.byteLength;
                }
                if (!this.push(r.value) || size <= 0) {
                    break;
                }
            }
            if (((r === null || r === void 0 ? void 0 : r.done) || !this.readable)) {
                this.push(null);
                yield reader.cancel();
            }
            return !this.readable;
        });
    }
}

//# sourceMappingURL=writer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/whatwg/iterable.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
function toDOMStream(source, options) {
    if (isAsyncIterable(source)) {
        return asyncIterableAsReadableDOMStream(source, options);
    }
    if (isIterable(source)) {
        return iterableAsReadableDOMStream(source, options);
    }
    /* istanbul ignore next */
    throw new Error(`toDOMStream() must be called with an Iterable or AsyncIterable`);
}
/** @ignore */
function iterableAsReadableDOMStream(source, options) {
    let it = null;
    const bm = ((options === null || options === void 0 ? void 0 : options.type) === 'bytes') || false;
    const hwm = (options === null || options === void 0 ? void 0 : options.highWaterMark) || (Math.pow(2, 24));
    return new ReadableStream(Object.assign(Object.assign({}, options), { start(controller) { next(controller, it || (it = source[Symbol.iterator]())); },
        pull(controller) { it ? (next(controller, it)) : controller.close(); },
        cancel() { ((it === null || it === void 0 ? void 0 : it.return) && it.return()); it = null; } }), Object.assign({ highWaterMark: bm ? hwm : undefined }, options));
    function next(controller, it) {
        let buf;
        let r = null;
        let size = controller.desiredSize || null;
        while (!(r = it.next(bm ? size : null)).done) {
            if (ArrayBuffer.isView(r.value) && (buf = toUint8Array(r.value))) {
                size != null && bm && (size = size - buf.byteLength + 1);
                r.value = buf;
            }
            controller.enqueue(r.value);
            if (size != null && --size <= 0) {
                return;
            }
        }
        controller.close();
    }
}
/** @ignore */
function asyncIterableAsReadableDOMStream(source, options) {
    let it = null;
    const bm = ((options === null || options === void 0 ? void 0 : options.type) === 'bytes') || false;
    const hwm = (options === null || options === void 0 ? void 0 : options.highWaterMark) || (Math.pow(2, 24));
    return new ReadableStream(Object.assign(Object.assign({}, options), { start(controller) {
            return __awaiter(this, void 0, void 0, function* () { yield next(controller, it || (it = source[Symbol.asyncIterator]())); });
        },
        pull(controller) {
            return __awaiter(this, void 0, void 0, function* () { it ? (yield next(controller, it)) : controller.close(); });
        },
        cancel() {
            return __awaiter(this, void 0, void 0, function* () { ((it === null || it === void 0 ? void 0 : it.return) && (yield it.return())); it = null; });
        } }), Object.assign({ highWaterMark: bm ? hwm : undefined }, options));
    function next(controller, it) {
        return __awaiter(this, void 0, void 0, function* () {
            let buf;
            let r = null;
            let size = controller.desiredSize || null;
            while (!(r = yield it.next(bm ? size : null)).done) {
                if (ArrayBuffer.isView(r.value) && (buf = toUint8Array(r.value))) {
                    size != null && bm && (size = size - buf.byteLength + 1);
                    r.value = buf;
                }
                controller.enqueue(r.value);
                if (size != null && --size <= 0) {
                    return;
                }
            }
            controller.close();
        });
    }
}

//# sourceMappingURL=iterable.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/whatwg/builder.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
function builderThroughDOMStream(options) {
    return new BuilderTransform(options);
}
/** @ignore */
class BuilderTransform {
    constructor(options) {
        // Access properties by string indexers to defeat closure compiler
        this._numChunks = 0;
        this._finished = false;
        this._bufferedSize = 0;
        const { ['readableStrategy']: readableStrategy, ['writableStrategy']: writableStrategy, ['queueingStrategy']: queueingStrategy = 'count' } = options, builderOptions = __rest(options, ['readableStrategy', 'writableStrategy', 'queueingStrategy']);
        this._controller = null;
        this._builder = makeBuilder(builderOptions);
        this._getSize = queueingStrategy !== 'bytes' ? chunkLength : chunkByteLength;
        const { ['highWaterMark']: readableHighWaterMark = queueingStrategy === 'bytes' ? Math.pow(2, 14) : 1000 } = Object.assign({}, readableStrategy);
        const { ['highWaterMark']: writableHighWaterMark = queueingStrategy === 'bytes' ? Math.pow(2, 14) : 1000 } = Object.assign({}, writableStrategy);
        this['readable'] = new ReadableStream({
            ['cancel']: () => { this._builder.clear(); },
            ['pull']: (c) => { this._maybeFlush(this._builder, this._controller = c); },
            ['start']: (c) => { this._maybeFlush(this._builder, this._controller = c); },
        }, {
            'highWaterMark': readableHighWaterMark,
            'size': queueingStrategy !== 'bytes' ? chunkLength : chunkByteLength,
        });
        this['writable'] = new WritableStream({
            ['abort']: () => { this._builder.clear(); },
            ['write']: () => { this._maybeFlush(this._builder, this._controller); },
            ['close']: () => { this._maybeFlush(this._builder.finish(), this._controller); },
        }, {
            'highWaterMark': writableHighWaterMark,
            'size': (value) => this._writeValueAndReturnChunkSize(value),
        });
    }
    _writeValueAndReturnChunkSize(value) {
        const bufferedSize = this._bufferedSize;
        this._bufferedSize = this._getSize(this._builder.append(value));
        return this._bufferedSize - bufferedSize;
    }
    _maybeFlush(builder, controller) {
        if (controller == null) {
            return;
        }
        if (this._bufferedSize >= controller.desiredSize) {
            ++this._numChunks && this._enqueue(controller, builder.toVector());
        }
        if (builder.finished) {
            if (builder.length > 0 || this._numChunks === 0) {
                ++this._numChunks && this._enqueue(controller, builder.toVector());
            }
            if (!this._finished && (this._finished = true)) {
                this._enqueue(controller, null);
            }
        }
    }
    _enqueue(controller, chunk) {
        this._bufferedSize = 0;
        this._controller = null;
        chunk == null ? controller.close() : controller.enqueue(chunk);
    }
}
/** @ignore */ const chunkLength = (chunk) => { var _a; return (_a = chunk === null || chunk === void 0 ? void 0 : chunk.length) !== null && _a !== void 0 ? _a : 0; };
/** @ignore */ const chunkByteLength = (chunk) => { var _a; return (_a = chunk === null || chunk === void 0 ? void 0 : chunk.byteLength) !== null && _a !== void 0 ? _a : 0; };

//# sourceMappingURL=builder.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/whatwg/reader.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.



/** @ignore */
function recordBatchReaderThroughDOMStream(writableStrategy, readableStrategy) {
    const queue = new AsyncByteQueue();
    let reader = null;
    const readable = new ReadableStream({
        cancel() {
            return __awaiter(this, void 0, void 0, function* () { yield queue.close(); });
        },
        start(controller) {
            return __awaiter(this, void 0, void 0, function* () { yield next(controller, reader || (reader = yield open())); });
        },
        pull(controller) {
            return __awaiter(this, void 0, void 0, function* () { reader ? yield next(controller, reader) : controller.close(); });
        }
    });
    return { writable: new WritableStream(queue, Object.assign({ 'highWaterMark': Math.pow(2, 14) }, writableStrategy)), readable };
    function open() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield RecordBatchReader.from(queue)).open(readableStrategy);
        });
    }
    function next(controller, reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let size = controller.desiredSize;
            let r = null;
            while (!(r = yield reader.next()).done) {
                controller.enqueue(r.value);
                if (size != null && --size <= 0) {
                    return;
                }
            }
            controller.close();
        });
    }
}

//# sourceMappingURL=reader.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/io/whatwg/writer.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


/** @ignore */
function recordBatchWriterThroughDOMStream(writableStrategy, readableStrategy) {
    const writer = new this(writableStrategy);
    const reader = new AsyncByteStream(writer);
    const readable = new ReadableStream({
        // type: 'bytes',
        cancel() {
            return __awaiter(this, void 0, void 0, function* () { yield reader.cancel(); });
        },
        pull(controller) {
            return __awaiter(this, void 0, void 0, function* () { yield next(controller); });
        },
        start(controller) {
            return __awaiter(this, void 0, void 0, function* () { yield next(controller); });
        },
    }, Object.assign({ 'highWaterMark': Math.pow(2, 14) }, readableStrategy));
    return { writable: new WritableStream(writer, writableStrategy), readable };
    function next(controller) {
        return __awaiter(this, void 0, void 0, function* () {
            let buf = null;
            let size = controller.desiredSize;
            while (buf = yield reader.read(size || null)) {
                controller.enqueue(buf);
                if (size != null && (size -= buf.byteLength) <= 0) {
                    return;
                }
            }
            controller.close();
        });
    }
}

//# sourceMappingURL=writer.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/ipc/serialization.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.




function tableFromIPC(input) {
    const reader = RecordBatchReader.from(input);
    if (isPromise(reader)) {
        return reader.then((reader) => tableFromIPC(reader));
    }
    if (reader.isAsync()) {
        return reader.readAll().then((xs) => new table_Table(xs));
    }
    return new table_Table(reader.readAll());
}
/**
 * Serialize a {@link Table} to the IPC format. This function is a convenience
 * wrapper for {@link RecordBatchStreamWriter} and {@link RecordBatchFileWriter}.
 * Opposite of {@link tableFromIPC}.
 *
 * @param table The Table to serialize.
 * @param type Whether to serialize the Table as a file or a stream.
 */
function tableToIPC(table, type = 'stream', compressionType = null) {
    const writerOptions = { compressionType };
    return (type === 'stream' ? RecordBatchStreamWriter : RecordBatchFileWriter)
        .writeAll(table, writerOptions)
        .toUint8Array(true);
}

//# sourceMappingURL=serialization.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/Arrow.dom.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.








adapters.toDOMStream = toDOMStream;
Builder['throughDOM'] = builderThroughDOMStream;
RecordBatchReader['throughDOM'] = recordBatchReaderThroughDOMStream;
RecordBatchFileReader['throughDOM'] = recordBatchReaderThroughDOMStream;
RecordBatchStreamReader['throughDOM'] = recordBatchReaderThroughDOMStream;
RecordBatchWriter['throughDOM'] = recordBatchWriterThroughDOMStream;
writer_RecordBatchFileWriter['throughDOM'] = recordBatchWriterThroughDOMStream;
writer_RecordBatchStreamWriter['throughDOM'] = recordBatchWriterThroughDOMStream;



//# sourceMappingURL=Arrow.dom.mjs.map

;// CONCATENATED MODULE: ./node_modules/apache-arrow/Arrow.node.mjs
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.








adapters.toNodeStream = toNodeStream;
Builder['throughNode'] = builderThroughNodeStream;
RecordBatchReader['throughNode'] = recordBatchReaderThroughNodeStream;
RecordBatchWriter['throughNode'] = recordBatchWriterThroughNodeStream;


//# sourceMappingURL=Arrow.node.mjs.map


/***/ })

};
;