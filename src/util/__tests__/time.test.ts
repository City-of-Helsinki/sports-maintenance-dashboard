import moment from 'moment';
import {
  LINK_DATEFORMAT,
  formatHumanDate,
  today,
  isFuture,
  isToday,
  minutesToHours,
  hoursToMinutes,
  formatHours,
  round
} from '../time';

describe('time utilities', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-09T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  describe('LINK_DATEFORMAT', () => {
    it('should be the correct date format', () => {
      expect(LINK_DATEFORMAT).toBe('YYYY-MM-DD');
    });
  });

  describe('formatHumanDate', () => {
    it('should format a moment date in human readable format', () => {
      const testDate = moment('2026-01-09');
      const result = formatHumanDate(testDate);
      
      expect(result).toMatch(/Friday.*January.*9.*2026/);
    });

    it('should handle different dates correctly', () => {
      const testDate = moment('2025-12-25');
      const result = formatHumanDate(testDate);
      
      expect(result).toMatch(/Thursday.*December.*25.*2025/);
    });
  });

  describe('today', () => {
    it('should return current date in LINK_DATEFORMAT', () => {
      const result = today();
      const expectedFormat = moment().format(LINK_DATEFORMAT);
      
      expect(result).toBe(expectedFormat);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const futureDate = moment().add(1, 'day');
      const result = isFuture(futureDate);
      
      expect(result).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = moment().subtract(1, 'day');
      const result = isFuture(pastDate);
      
      expect(result).toBe(false);
    });

    it('should return false for today', () => {
      const todayDate = moment();
      const result = isFuture(todayDate);
      
      expect(result).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const todayDate = moment('2026-01-09');
      const result = isToday(todayDate);
      
      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = moment('2026-01-10');
      const result = isToday(futureDate);
      
      expect(result).toBe(false);
    });

    it('should return false for past dates', () => {
      const pastDate = moment('2026-01-08');
      const result = isToday(pastDate);
      
      expect(result).toBe(false);
    });
  });

  describe('minutesToHours', () => {
    it('should convert minutes to hours correctly', () => {
      expect(minutesToHours(60)).toBe(1);
      expect(minutesToHours(120)).toBe(2);
      expect(minutesToHours(30)).toBe(0.5);
      expect(minutesToHours(90)).toBe(1.5);
    });

    it('should handle zero minutes', () => {
      expect(minutesToHours(0)).toBe(0);
    });

    it('should handle fractional minutes', () => {
      expect(minutesToHours(45)).toBe(0.75);
    });
  });

  describe('hoursToMinutes', () => {
    it('should convert hours to minutes correctly with number input', () => {
      expect(hoursToMinutes(1)).toBe(60);
      expect(hoursToMinutes(2)).toBe(120);
      expect(hoursToMinutes(0.5)).toBe(30);
      expect(hoursToMinutes(1.5)).toBe(90);
    });

    it('should convert hours to minutes correctly with string input', () => {
      expect(hoursToMinutes('1')).toBe(60);
      expect(hoursToMinutes('2.5')).toBe(150);
      expect(hoursToMinutes('0.75')).toBe(45);
    });

    it('should handle zero hours', () => {
      expect(hoursToMinutes(0)).toBe(0);
      expect(hoursToMinutes('0')).toBe(0);
    });

    it('should floor the result', () => {
      expect(hoursToMinutes(1.99)).toBe(119); // 1.99 * 60 = 119.4, floored to 119
    });
  });

  describe('formatHours', () => {
    it('should format whole hours correctly', () => {
      expect(formatHours(1)).toBe('1');
      expect(formatHours(5)).toBe('5');
    });

    it('should format quarter hours with Unicode fractions', () => {
      expect(formatHours(1.25)).toBe('1¼'); // String.fromCodePoint(188)
    });

    it('should format half hours with Unicode fractions', () => {
      expect(formatHours(2.5)).toBe('2½'); // String.fromCodePoint(189)
    });

    it('should format three-quarter hours with Unicode fractions', () => {
      expect(formatHours(3.75)).toBe('3¾'); // String.fromCodePoint(190)
    });

    it('should return original value for non-standard fractions', () => {
      expect(formatHours(1.33)).toBe(1.33);
      expect(formatHours(2.67)).toBe(2.67);
    });

    it('should handle zero hours', () => {
      expect(formatHours(0)).toBe('0');
    });
  });

  describe('round', () => {
    it('should round to default step of 0.25', () => {
      expect(round(1.1)).toBe(1);
      expect(round(1.2)).toBe(1.25);
      expect(round(1.4)).toBe(1.5);
      expect(round(1.6)).toBe(1.5);
      expect(round(1.8)).toBe(1.75);
      expect(round(1.9)).toBe(2);
    });

    it('should round to custom step options', () => {
      expect(round(1.3, 0.5)).toBe(1.5);
      expect(round(1.7, 0.5)).toBe(1.5);
      expect(round(1.8, 0.5)).toBe(2);
    });

    it('should return original value for invalid step options', () => {
      expect(round(1.5, 0.3)).toBe(1.5); // 1 % 0.3 != 0
      expect(round(2.7, 0.7)).toBe(2.7); // 1 % 0.7 != 0
    });

    it('should cap at maximum of 18', () => {
      expect(round(19.5)).toBe(18);
      expect(round(20.25)).toBe(18);
    });

    it('should handle edge cases', () => {
      expect(round(0)).toBe(0);
      expect(round(0.1)).toBe(0);
      expect(round(17.9)).toBe(18);
    });

    it('should handle exact step boundaries', () => {
      expect(round(1.125)).toBe(1.25); // at 0.125, rounds up to next step
      expect(round(1.375)).toBe(1.5); // at 0.375, rounds up to next step
    });
  });
});