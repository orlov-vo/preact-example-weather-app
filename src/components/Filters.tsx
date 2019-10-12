import { h } from "preact";

interface FilterProps {
    value: number | null;
    options: number[];
    disabled: (option: number) => boolean;
    onChange: (selected: number) => void;
}

/**
 * Component for render filter for years
 *
 * @param props Properties for component
 * @returns JSX element
 */
function Filter(props: FilterProps) {
    const { value, options, disabled, onChange } = props;

    return (
        <select
            class="filters__control"
            value={value || ""}
            onChange={(e) => onChange(Number((e.currentTarget as HTMLSelectElement).value))}
        >
            {options.map((option) => (
                <option value={option} disabled={disabled(option)}>
                    {option}
                </option>
            ))}
        </select>
    );
}

interface Props {
    range: [number | null, number | null];
    availableYearsRange: number[];
    onChange: (range: [number | null, number | null]) => void;
}

/**
 * Component for render filters
 *
 * @param props Properties for component
 * @returns JSX element
 */
export default function Filters(props: Props) {
    const { range, availableYearsRange, onChange } = props;

    return (
        <div class="filters">
            <Filter
                value={range[0]}
                options={availableYearsRange}
                disabled={(year) => !!range[1] && year >= range[1]}
                onChange={(value) => onChange([value, range[1]])}
            />
            <Filter
                value={range[1]}
                options={availableYearsRange}
                disabled={(year) => !!range[0] && year <= range[0]}
                onChange={(value) => onChange([range[0], value])}
            />
        </div>
    );
}
