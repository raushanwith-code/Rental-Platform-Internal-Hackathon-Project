export const BLOCKING_STATUSES = ["Pending", "Approved", "Active"];

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function daysBetweenInclusive(start, end) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

export function findConflict({ equipmentBookings, totalUnits, startDate, endDate, excludeBookingId }) {
  const relevant = equipmentBookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      BLOCKING_STATUSES.includes(b.status) &&
      rangesOverlap(startDate, endDate, b.startDate, b.endDate)
  );

  const overlappingCount = relevant.length;

  if (overlappingCount >= totalUnits) {
    return {
      conflict: true,
      conflictingBookings: relevant,
      reason: `All ${totalUnits} unit(s) of this item are already booked for an overlapping date range.`,
    };
  }

  return { conflict: false, conflictingBookings: relevant };
}

export function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return false;
  return startDate <= endDate;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
