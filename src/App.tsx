import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Menu from "./components/Menu";
import Chart from "./components/Chart";
import Filters from "./components/Filters";
import parseLink from "./utils/parseLink";
import { subscribe } from "./router";
import useTableData from "./useTableData";

/** All pages in the app */
const TABLES: { [key: string]: string | void } = {
    "/": "temperature",
    "/temperature": "temperature",
    "/precipitation": "precipitation"
};

/**
 * Small helper for extract a current path
 * @returns Current path
 */
function useRoute() {
    const [route, setRoute] = useState(location.href);
    useEffect(() => subscribe((newRoute) => setRoute(newRoute)), []);

    return parseLink(route).pathname;
}

/**
 * Application Component
 * @param props Props for component
 */
export default function App() {
    const route = useRoute();
    const tableName: string | void = TABLES[route];

    const { data, range, setRange, availableYearsRange } = useTableData(tableName);

    return (
        <div>
            <Menu />
            {tableName ? (
                <Fragment>
                    <Filters availableYearsRange={availableYearsRange} range={range} onChange={setRange} />
                    <Chart data={data} />
                </Fragment>
            ) : (
                <Fragment>404 - Not found</Fragment>
            )}
        </div>
    );
}
