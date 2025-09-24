import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";

type Props = {
  month: Date;
  onMonthChange: (m: Date) => void;
  selected: Date[];
  onDayClick: (d?: Date) => void;
  disabled: (d: Date) => boolean;
  modifiers: Record<string, Date[]>;
  modifiersStyles: Record<string, React.CSSProperties>;
  className?: string; // 👈 nuevo
};

export default function BlockDaysCalendar({
  month,
  onMonthChange,
  selected,
  onDayClick,
  disabled,
  modifiers,
  modifiersStyles,
  className,
}: Props) {
  return (
    <DayPicker
      className={className}      // 👈 aplicamos clase
      mode="multiple"
      month={month}
      onMonthChange={onMonthChange}
      onDayClick={onDayClick}
      selected={selected}
      disabled={disabled}
      locale={es}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      styles={{
        caption: { fontWeight: 600, color: "var(--color-text-main)" },
        head_cell: { color: "#6B7280", fontWeight: 700 },
        nav_button: { color: "var(--color-primary)" },
      }}
    />
  );
}
