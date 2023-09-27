/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { ClimbingContext } from '../contexts/climbingContext';

export const RoutePath = ({ onRouteSelect, route, routeNumber }) => {
  // const [isHovered, setIsHovered] = useState(false);
  const { imageSize, isSelectedRouteEditable, routeSelectedIndex } =
    useContext(ClimbingContext);
  const isSelected = routeSelectedIndex === routeNumber;
  const pointsInString = route?.path.map(({ x, y }, index) => {
    const currentX = imageSize.width * x;
    const currentY = imageSize.height * y;
    return `${index === 0 ? 'M' : 'L'}${currentX} ${currentY} `;
  });

  // const onMouseEnter = () => {
  //   if (isSelectedRouteEditable) {
  //     setIsHovered(true);
  //   }
  // };

  // const onMouseLeave = () => {
  //   if (isSelectedRouteEditable) {
  //     setIsHovered(false);
  //   }
  // };

  const commonProps = isSelectedRouteEditable
    ? {}
    : {
        onClick: (e) => {
          onRouteSelect(routeNumber);
          e.stopPropagation();
        },
        cursor: 'pointer',
      };

  return (
    <>
      <path
        d={`M0 0 ${pointsInString}`}
        strokeWidth={10}
        stroke="transparent"
        strokeLinecap="round"
        fill="none"
        // onMouseEnter={onMouseEnter}
        // onMouseLeave={onMouseLeave}
        {...commonProps}
      />
      <path
        d={`M0 0 ${pointsInString}`}
        strokeWidth={5}
        stroke={isSelected ? 'white' : '#666'}
        strokeLinecap="round"
        fill="none"
        {...commonProps}
      />
      <path
        d={`M0 0 ${pointsInString}`}
        strokeWidth={3}
        stroke={isSelected ? 'royalblue' : 'white'}
        strokeLinecap="round"
        fill="none"
        markerEnd={
          isSelected && isSelectedRouteEditable ? 'url(#triangle)' : null
        }
        {...commonProps}
      />
    </>
  );
};
