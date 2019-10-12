import { useEffect, useState, useMemo } from "preact/hooks";
import { askData, subscribe, Point } from "./worker";

type Range = [number | null, number | null];

/**
 * Hook for fetch data from table
 *
 * @param tableName Name for table with data
 * @returns Fields and methods for manage fetching data
 */
export default function useTableData(tableName: string | void) {
    const [data, setData] = useState<Point[]>([]);
    const [range, setRange] = useState<Range>([null, null]);

    const availableYearsRange = useMemo(() => {
        if (!data || !data.length) return [];

        const from = data[0].t.getFullYear();
        const to = data[data.length - 1].t.getFullYear();

        return [...new Array(to - from + 1)].map((_i, index) => from + index);
    }, [data]);

    const firstAvailable = availableYearsRange[0];
    const lastAvailable = availableYearsRange[availableYearsRange.length - 1];

    useEffect(() => subscribe(setData), []);

    useEffect(() => {
        setRange((range) => [range[0] || firstAvailable, range[1] || lastAvailable]);
    }, [firstAvailable, lastAvailable]);

    useEffect(() => {
        if (tableName) askData(tableName, range[0], range[1]);
    }, [tableName, range[0], range[1]]);

    return {
        availableYearsRange,
        range,
        setRange,
        data
    };
}
