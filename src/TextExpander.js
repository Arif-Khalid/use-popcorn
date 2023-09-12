import { useState } from "react";

export default function TextExpander({
  children,
  buttonColor = "blue",
  expandButtonText = "Show More",
  collapseButtonText = "Show Less",
  collapsedNumWords = 20,
  expanded = false,
  className = "",
}) {
  const buttonStyle = {
    textDecoration: "underline",
    color: buttonColor,
    cursor: "pointer",
  };
  const [isShown, setIsShown] = useState(!expanded);
  const isTooShort = children.split(" ").length <= collapsedNumWords;
  const shownString = isShown
    ? children
    : children
        .split(" ")
        .slice(0, collapsedNumWords)
        .join(" ", collapsedNumWords)
        .concat("...");
  function toggleIsShown() {
    setIsShown((isShown) => !isShown);
  }
  console.log(isTooShort);
  return (
    <div className={className}>
      {shownString}{" "}
      {isTooShort || (
        <span onClick={toggleIsShown} style={buttonStyle}>
          {isShown ? collapseButtonText : expandButtonText}
        </span>
      )}
    </div>
  );
}
