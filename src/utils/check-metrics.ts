import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { uuidv4 } from 'zod';

@Injectable()
export class CheckMetrics {
    private readonly startTime = performance.now();
    private readonly startCpu = process.cpuUsage();
    private readonly nameFileJSON = uuidv4();

    private peakRss = 0;
    private peakHeap = 0;
    private totalRows = 0;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: Logger
    ) { }

    private readonly interval = setInterval(() => {
        this.captureMemory();
    }, 100);

    private captureMemory() {
        const { rss, heapUsed } = process.memoryUsage();

        this.peakRss = Math.max(this.peakRss, rss);
        this.peakHeap = Math.max(this.peakHeap, heapUsed);
    }

    addRows(count: number) {
        this.totalRows += count;
    }

    snapshot() {
        this.captureMemory();

        const memory = process.memoryUsage();
        const duration = (performance.now() - this.startTime) / 1000;
        const cpu = process.cpuUsage(this.startCpu);

        return {
            totalRows: this.totalRows,

            durationSeconds: Number(duration.toFixed(2)),

            rowsPerSecond: Math.round(
                this.totalRows / duration,
            ),

            currentRssMB: Number(
                (memory.rss / 1024 ** 2).toFixed(2),
            ),

            peakRssMB: Number(
                (this.peakRss / 1024 ** 2).toFixed(2),
            ),

            currentHeapMB: Number(
                (memory.heapUsed / 1024 ** 2).toFixed(2),
            ),

            peakHeapMB: Number(
                (this.peakHeap / 1024 ** 2).toFixed(2),
            ),

            cpuTimeSeconds: Number(
                ((cpu.user + cpu.system) / 1_000_000).toFixed(2),
            ),
        };
    }

    finish() {
        clearInterval(this.interval);

        const snapResult = this.snapshot();

        this.logger.log(snapResult);

        return snapResult;
    }
}
