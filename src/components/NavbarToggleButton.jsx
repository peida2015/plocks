import React from 'react';
import { Glyphicon } from 'react-bootstrap';

// NavbarToggleButton can be used to toggle show/hide of a navbar.  They are ideally hidden behind the navbar when the navbar is present.
// Props:
// 1. direction: either "up" or "down" to control the direction shown.
// 2. onClick: accepts a click handler function for show/hide control

export default function NavbarToggleButton(props) {
  let topBorderRad = props.direction === "up" ? 8 : 0,
      bottomBorderRad = topBorderRad === 8 ? 0 : 8;

  return (
    <div>
      <span className="centered-toggle-button"
              onClick={ props.onClick }
              style={{
                  borderRadius: `${topBorderRad}px ${topBorderRad}px
                                  ${bottomBorderRad}px ${bottomBorderRad}px`
              }}>
                <Glyphicon glyph={ `chevron-${props.direction}` }
                        style={ {
                          textAlign: "center",
                          display: "block",
                          color: "#24a6e8"
                          } } />
      </span>
    </div>
  )
}
