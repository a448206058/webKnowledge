let flushing = false
let has: { [key: number]: ?true } = {}
import type Watcher from './watcher'

const queue: Array<Watcher> = []
let index = 0
let waiting = false

function flushSchedulerQueue(){
    flushing = true;
    let watcher, id
    queue.sort((a, b) => a.id - b.id)

    for (index = 0; index < queue.length;  index++) {
        watcher = queue[index]

    }

}

export function queueWatcher(watcher: Watcher){
    const id = watcher.id
    if (has[id] == null) {
        has[id] = true;
        if (!flushing) {
            queue.push(watcher)
        } else {
            let i = this.queue.length - 1
            while (i > index && queue[i].id > watcher.id) {
                i--
            }
            queue.splice(i + 1, 0, watcher)
        }
        if (!waiting) {
            waiting = true

            flushSchedulerQueue()
        }
    }
}
