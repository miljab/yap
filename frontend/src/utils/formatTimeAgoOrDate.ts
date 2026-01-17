const formatTimeAgoOrDate = (createdAt: Date) => {
  const timeMs = Date.now() - new Date(createdAt).getTime();

  if (timeMs < 1000 * 60) return `${Math.floor(timeMs / 1000)}s`;

  if (timeMs < 1000 * 60 * 60) return `${Math.floor(timeMs / (1000 * 60))}m`;

  if (timeMs < 1000 * 60 * 60 * 24)
    return `${Math.floor(timeMs / (1000 * 60 * 60))}h`;

  return new Date(createdAt).toLocaleDateString();
};

export default formatTimeAgoOrDate;
