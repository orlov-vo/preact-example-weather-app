import { h } from "preact";

/**
 * Component with main navigation in the application
 *
 * @returns JSX element
 */
export default function Menu() {
    return (
        <nav class="tables">
            <a href="/temperature" class="tables__link">
                Temperature
            </a>
            <a href="/precipitation" class="tables__link">
                Precipitation
            </a>
        </nav>
    );
}
