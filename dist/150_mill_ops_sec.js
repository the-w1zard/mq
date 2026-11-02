export class DisruptorSoA {
    capacity;
    mask;
    pids;
    values;
    flags;
    writeCursor = 0;
    readCursor = 0;
    constructor(capacity = 65536) {
        if ((capacity & (capacity - 1)) !== 0)
            throw new Error("Capacity must be power of two");
        this.capacity = capacity;
        this.mask = capacity - 1;
        this.pids = new Int32Array(capacity);
        this.values = new Float64Array(capacity);
        this.flags = new Uint8Array(capacity);
    }
    publish(pid, value, flag = 0) {
        if (this.writeCursor - this.readCursor >= this.capacity)
            return false;
        const index = this.writeCursor & this.mask;
        this.pids[index] = pid;
        this.values[index] = value;
        this.flags[index] = flag;
        this.writeCursor++;
        return true;
    }
    poll(handler) {
        if (this.readCursor === this.writeCursor)
            return false;
        const index = this.readCursor & this.mask;
        handler(this.pids[index], this.values[index], this.flags[index]);
        this.readCursor++;
        return true;
    }
}
