import React from "react";

/**
 * Allow HTML attributes, and any custom props
 */
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A semantic button, that resets the styles.
 * This allows us to keep buttons operable with keyboard and screen readers,
 * while also allowing us to style them.
 */
const Button: React.FC<Props> = props => {
  const {className, ...rest} = props;
  const mergedClassName= `button-reset ${className !== undefined ? className : ''}`

  return <button className={mergedClassName} {...rest}></button>;
};

export default Button;
