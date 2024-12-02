class Queue {
    constructor() {
        this.jobs = [];
        this.processing = false;
    }

    async add(job) {
        this.jobs.push(job);
        this.process();
    }

    async process() {
        if (this.processing || !this.jobs.length) return;

        this.processing = true;

        while (this.jobs.length) {
            const job = this.jobs.shift();
            try {
                const result = await job(); // Process job
            } catch (err) {
                console.error(err);
            }
        }

        this.processing = false;
    }
}

module.exports = Queue;
