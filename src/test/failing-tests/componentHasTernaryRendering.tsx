export const selection = `
  <div id={id}>
    {showWarning ? (
      <i className={className} />
    ) : (
      <Badge
        style={{ minWidth: '1.5rem', height: '1.5rem' }}
        className={classNames('line-height-3', {
          'bg-gray-100': isLightGray,
          'bg-gray-400': isGray,
          'bg-yellow-400': isYellow,
          'bg-green-400': isGreen,
        })}
      />
    )}
  </div>
`;
