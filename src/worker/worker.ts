/// <reference lib="webworker" />
import { Point } from "./index";

const BASE_NAME = "weather";
const BASE_VERSION = 1;

/**
 * Open IndexDB database
 *
 * @returns A promise with database instance
 */
function openDB() {
    return new Promise<IDBDatabase>((resolve) => {
        const request = indexedDB.open(BASE_NAME, BASE_VERSION);

        request.onerror = (event) => {
            console.error("db", event);
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            ["temperature", "precipitation"].forEach((i) => {
                db.createObjectStore(i, { keyPath: "t" });
            });
            resolve(openDB());
        };
    });
}

/**
 * Get data from the table by name
 *
 * @param tableName Name for the table with data
 * @returns A promise with data from table
 */
async function getDataFromServer(tableName: string): Promise<Point[]> {
    const response = await fetch(`/data/${tableName}.json`);
    return response.json();
}

/**
 * Get data from IndexDB database
 *
 * @param tableName Name for the table with data
 * @param from The date for filter data starting this date
 * @param to The date for filter data ending this date
 * @returns A promise with data from table
 */
async function getDataFromDb(tableName: string, from: Date | null, to: Date | null) {
    const db = await openDB();

    const objectStore = db.transaction(tableName, "readonly").objectStore(tableName);

    return new Promise<Point[]>((resolve, reject) => {
        const data: Point[] = [];

        // Match anything between "from" and "to", but not including "to"
        const boundKeyRange = from && to ? IDBKeyRange.bound(from, to, false, true) : undefined;

        const cursor = objectStore.openCursor(boundKeyRange);

        cursor.onsuccess = (event) => {
            const { result } = event.target as any;

            if (!result) {
                resolve(data);
                return;
            }

            data.push({ t: result.key, v: result.value.v });
            result.continue();
        };

        cursor.onerror = (event) => {
            reject(event);
        };
    });
}

/**
 * Save the data to the table
 *
 * @param data Array with points
 * @param tableName Name for the table in database
 * @returns A promise with successful operation result
 */
async function saveDataToDb(data: Point[], tableName: string) {
    const db = await openDB();

    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(tableName, "readwrite");

        const objectStore = transaction.objectStore(tableName);

        data.forEach((i) => objectStore.add({ ...i, t: new Date(i.t) }));

        transaction.onerror = (event) => reject(event);
        transaction.oncomplete = () => resolve();
    });
}

/**
 * Get data from IndexDB database or server
 *
 * @param tableName Name for the table with data
 * @param from The year for filter data starting this year
 * @param to The year for filter data ending this year
 * @returns A promise with data from table
 */
async function getData(tableName: string, from: Date | null, to: Date | null) {
    let data;

    try {
        data = await getDataFromDb(tableName, from, to);
    } catch (err) {
        console.error(err);
    }

    if (!data || !data.length) {
        data = await getDataFromServer(tableName);
        await saveDataToDb(data, tableName);
        data = await getDataFromDb(tableName, from, to);
    }

    return data;
}

/**
 * Function for filter data by range
 *
 * @param data Array with points
 * @param from The date for filter data starting this date
 * @param to The date for filter data ending this date
 */
function filterData(data: Point[], from: Date | null, to: Date | null) {
    if (!from && !to) {
        return data;
    }

    const fromIndex = from ? data.findIndex((i) => new Date(i.t) >= from) : -1;
    const toIndex = to ? data.findIndex((i) => new Date(i.t) > to) : -1;

    return data.slice(fromIndex === -1 ? 0 : fromIndex, toIndex === -1 ? undefined : toIndex);
}

/** Reference to reject function for the last promise */
let activePromiseReject: ((err: Error) => void) | null = null;

/**
 * Handler for income message from main thread
 *
 * @returns A promise of successful handle
 */
onmessage = async function(e) {
    const table = e.data[0];
    const from: Date | null = e.data[1] && new Date(parseInt(e.data[1], 10), 0, 1);
    const to: Date | null = e.data[2] && new Date(parseInt(e.data[2], 10) + 1, 0, 1);

    if (activePromiseReject) {
        activePromiseReject(new Error("Canceled by next query"));
        activePromiseReject = null;
    }

    return new Promise(async (resolve, reject) => {
        activePromiseReject = reject;

        let data;

        try {
            data = await getData(table, from, to);
        } catch (err) {
            console.error(err);
            reject(err);
            return;
        }

        resolve(data);
    }).then((data) => postMessage(data), () => {});
};
