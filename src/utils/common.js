import dayjs from 'dayjs';

const MIN_PERIOD_IN_MINUTES = 1;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * 60;

export const getPointCities = (eventPoints) => {
  const cities = new Set();
  for(const point of eventPoints) {
    cities.add(point.destination.name);
  }
  return Array.from(cities);
};

export const getFullEventPrice = (point) => {
  const { basePrice, offers } = point;
  const offerPricesSum = offers.map((item) => item.price).reduce(((sum, item) => sum + item), basePrice);
  return offerPricesSum + basePrice;
};


export const getEventPriceSum = (eventPoints) => {
  return eventPoints.reduce((pointSum, point) => {
    return pointSum + getFullEventPrice(point);
  }, 0);
};

export const createElement = (template) => {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;
  return newElement.firstChild;
};

export const getDiffDates = (start, end, unitMeasure) => dayjs(end).diff(dayjs(start), unitMeasure);

const getFormatTime = (period) => {
  if(period >= MIN_PERIOD_IN_MINUTES && period < MINUTES_IN_HOUR) {
    return `${period}M`;
  }
  if(period >= MINUTES_IN_HOUR && period < MINUTES_IN_DAY) {
    const hours = Math.trunc(period / MINUTES_IN_HOUR);
    const minutes = period - hours * MINUTES_IN_HOUR;
    return `${hours}H ${minutes ? minutes : '00'}M`;
  }
  if(period >= MINUTES_IN_DAY) {
    const days = Math.trunc(period/MINUTES_IN_DAY);
    const hours = Math.trunc((period - days * MINUTES_IN_DAY) / MINUTES_IN_HOUR);
    const minutes = (period - days * MINUTES_IN_DAY - hours * MINUTES_IN_HOUR);
    return `${days}D ${hours ? hours : '00'}H ${minutes ? minutes : '00'}M`;
  }
};

export const getPeriod = (dateFrom, dateTo) => {
  const periodInMinutes = getDiffDates(dateFrom, dateTo, 'minutes');
  return periodInMinutes ? getFormatTime(periodInMinutes) : '';
};

export const getDateInFormat = (date, type) => dayjs(date).format(type);

export const sortPointsByTime = (pointPrev, pointNext) => {
  const periodPrev = getDiffDates(pointPrev.dateFrom, pointPrev.dateTo,'second');
  const periodNext = getDiffDates(pointNext.dateFrom, pointNext.dateTo,'second');
  return periodNext - periodPrev;
};

export const sortPointsByPrice = (pointPrev, pointNext) => pointNext.basePrice - pointPrev.basePrice;

export const sortPointsByDay = (pointPrev, pointNext) => getDiffDates(pointPrev.dateFrom, pointNext.dateFrom,'second');
