import { EventEmitter } from '../event';

export class Task {
    constructor(
        public readonly run: () => Promise<void>,
        public readonly priority: number,
    ) {}
}

export class TaskPriorityQueue {
    private readonly tasks: Task[] = [];
    private running = false;
    private done$ = new EventEmitter();

    enqueue(task: Task) {
        if (this.running) {
            return;
        }

        if (this.tasks.includes(task)) {
            return;
        }

        this.tasks.push(task);
        this.tasks.sort((a, b) => a.priority - b.priority);

        return () => {
            this.dequeue(task);
        };
    }

    dequeue(task: Task) {
        const index = this.tasks.indexOf(task);

        if (index === -1) return;

        const removed = this.tasks.splice(index, 1);

        return removed;
    }

    async run() {
        if (this.running) return;

        this.running = true;
        for (const task of this.tasks) {
            await task.run();
        }

        this.done$.emit();

        this.clear();
        this.running = false;
    }

    clear() {
        this.tasks.length = 0;
    }

    isRunning() {
        return this.running;
    }

    onDone(callback: () => void) {
        return this.done$.addListenerOnce(callback);
    }
}
