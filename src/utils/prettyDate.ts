const prettyDate = (date: number | Date): string =>
  new Date(date).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default prettyDate;
