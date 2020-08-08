const date = new Date();
const day = date.getDate();
const dayFormatted = day.length > 1 ? day : `0${day}`;
const dayPadded = day.length > 1 ? day : `0${day - 1}`;

const month = date.getMonth();
const monthFormatted = month.length > 1 ? month : `0${month}`;
const monthPadded = month.length > 1 ? month : `0${month + 1}`;

const year = date.getFullYear();
export const end = `${dayFormatted}-${monthPadded}-${year}`;
export const start = `${dayPadded}-${monthFormatted}-${year}`;
