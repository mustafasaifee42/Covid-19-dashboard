import React from 'react';

/* This module contains various SVG Icons as React Components.
 * The main benefit of including them like this, is that we can "inline" them
 * and even "lazy-load" them as needed, instead of having to always fetch
 * as <img> tag sources. Furthermore, we can tweak the colours and classes
 * using normal props, and even offer accessible defaults based on the icon
 * being standalone or not.
 *
 * Various Resources:
 * @see https://css-tricks.com/can-make-icon-system-accessible/
 * @see https://css-tricks.com/accessible-svgs/
 * @see http://nicolasgallagher.com/making-svg-icon-libraries-for-react-apps/
 * @see https://github.com/c8r/pixo
 */
interface ISVG extends React.SVGAttributes<SVGElement> {
  fillColor?: string;
  className?: string;
  purpose: Purpose;
}

/** Whether the icon is content or not. */
type Purpose = 'decorative' | 'standalone';

export const SortArrowUp: React.SFC<ISVG> = ({
  fillColor = 'currentcolor',
  className,
  purpose,
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={purpose === 'decorative'}
    role="img"
    focusable="false"
    {...rest}>
    <g fill="none" fillRule="nonzero">
      <path d="M14 14H0V0h14z" />
      <path
        d="M11.8 8.4l-4-5.3333c-.3314-.4419-.9582-.5314-1.4-.2a1 1 0 0 0-.2.2L2.2 8.4c-.3314.4418-.2418 1.0686.2 1.4a1 1 0 0 0 .6.2h8c.5523 0 1-.4477 1-1a1 1 0 0 0-.2-.6z"
        stroke={fillColor}
        fill={fillColor}
      />
    </g>
  </svg>
);

export const SortArrowDown: React.SFC<ISVG> = ({
  fillColor = 'currentcolor',
  className,
  purpose,
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={purpose === 'decorative'}
    role="img"
    focusable="false"
    {...rest}>
    <g fill="none" fillRule="evenodd">
      <path
        d="M2.2 5.6l4 5.3333c.3314.4419.9582.5314 1.4.2a1 1 0 0 0 .2-.2l4-5.3333c.3314-.4418.2418-1.0686-.2-1.4A1 1 0 0 0 11 4H3c-.5523 0-1 .4477-1 1a1 1 0 0 0 .2.6z"
        stroke={fillColor}
        fill={fillColor}
        fillRule="nonzero"
      />
    </g>
  </svg>
);

export const SortArrowUnset: React.SFC<ISVG> = ({
  fillColor = 'currentcolor',
  className,
  purpose,
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={purpose === 'decorative'}
    role="img"
    focusable="false"
    {...rest}>
    <g fill="none" fillRule="evenodd" opacity={0.3}>
      <path
        d="M2.2 5.6l4 5.3333c.3314.4419.9582.5314 1.4.2a1 1 0 0 0 .2-.2l4-5.3333c.3314-.4418.2418-1.0686-.2-1.4A1 1 0 0 0 11 4H3c-.5523 0-1 .4477-1 1a1 1 0 0 0 .2.6z"
        stroke={fillColor}
        fill={fillColor}
        fillRule="nonzero"
      />
    </g>
  </svg>
);
