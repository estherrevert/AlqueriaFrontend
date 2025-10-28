import { jsx as _jsx } from "react/jsx-runtime";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
export default function BlockDaysCalendar({ month, onMonthChange, selected, onDayClick, disabled, modifiers, modifiersStyles, className, }) {
    return (_jsx(DayPicker, { className: className, mode: "multiple", month: month, onMonthChange: onMonthChange, onDayClick: onDayClick, selected: selected, disabled: disabled, locale: es, modifiers: modifiers, modifiersStyles: modifiersStyles, styles: {
            caption: { fontWeight: 600, color: "var(--color-text-main)" },
            head_cell: { color: "#6B7280", fontWeight: 700 },
            nav_button: { color: "var(--color-primary)" },
        } }));
}
