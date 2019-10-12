const worker = new Worker("./worker.ts");

export interface Point {
    t: Date;
    v: number;
}

/**
 * Public method for ask data from database or server
 *
 * @param tableName Name for the table with data
 * @param fromYear The year for filter data starting this year
 * @param toYear The year for filter data ending this year
 */
export function askData(tableName: string, fromYear: number | null, toYear: number | null) {
    worker.postMessage([tableName, fromYear, toYear]);
}

/**
 * Subscribe for the data from worker
 *
 * @param handler A handler for getting data from worker
 * @returns Function for unsubscribe
 */
export function subscribe(handler: (data: any) => void) {
    const internalHandler = (e: MessageEvent) => {
        handler(e.data);
    };
    worker.addEventListener("message", internalHandler);

    return () => {
        worker.removeEventListener("message", internalHandler);
    };
}
