let queue = []
export function queueJob(job) {
  job()
  // if (!queue.includes(job)) {
  //   queue.push(job);
  //   queueFlush()
  // }
}

function queueFlush(){

}
