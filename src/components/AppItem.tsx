
type Props = {
  label: string;
  showLabel?: boolean,
  icon: string;
};

export default function AppItem({
  label,
  icon,
  showLabel
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src={icon}
        alt={label}
        className="w-full h-full"
        onDragStart={(e) => e.preventDefault()}
      />
      {showLabel ? <span>{label}</span> : null}
    </div>
  );
}
