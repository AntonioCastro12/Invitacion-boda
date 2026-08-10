export default function BotanicalAccent({ position = "top-right", subtle = false }) {
  return (
    <span
      className={`botanical botanical--${position}${subtle ? " botanical--subtle" : ""}`}
      aria-hidden="true"
    >
      <i className="botanical__stem" />
      <i className="botanical__leaf botanical__leaf--one" />
      <i className="botanical__leaf botanical__leaf--two" />
      <i className="botanical__leaf botanical__leaf--three" />
      <i className="botanical__bud botanical__bud--one" />
      <i className="botanical__bud botanical__bud--two" />
    </span>
  );
}
