import moment from 'moment';
import { 
  QUALITIES, 
  COLORS, 
  ICONS, 
  statusBarClassName, 
  getQualityObservation, 
  calculateGroups, 
  getCurrentSeason 
} from '../utils';
import { Unit, UnitObservation } from '../../reducers/types';

describe('Utils', () => {
  // Base observation for tests - override specific properties as needed
  const baseObservation: UnitObservation = {
    unit: 1,
    id: 123,
    property: 'test',
    time: '2024-01-15T14:30:00.000Z',
    expiration_time: null,
    name: { fi: 'Test' },
    quality: 'good',
    value: 'test',
    primary: true
  };

  // Base unit for tests - override specific properties as needed
  const baseUnit: Unit = {
    id: 1,
    name: { fi: 'Test Unit' },
    extensions: {
      maintenance_group: 'group1',
      maintenance_organization: 'org1'
    },
    services: [1],
    address_postal_full: null,
    short_description: null,
    call_charge_info: { fi: '' },
    picture_caption: null,
    description: { fi: '' },
    www: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' },
    location: { type: 'Point', coordinates: [0, 0] },
    observations: []
  };

  describe('Constants', () => {
    it('should have correct QUALITIES array', () => {
      expect(QUALITIES).toEqual(['good', 'satisfactory', 'unusable', 'unknown', 'warning']);
    });

    it('should have correct COLORS mapping', () => {
      expect(COLORS).toEqual({
        satisfactory: 'warning',
        unusable: 'danger',
        good: 'success'
      });
    });

    it('should have correct ICONS mapping', () => {
      expect(ICONS).toEqual(expect.objectContaining({
        good: 'icon-smile-o',
        satisfactory: 'icon-meh-o',
        poor: 'icon-frown-o',
        groomed: 'icon-road',
        littered: 'icon-pagelines',
        closed: 'icon-forbidden',
        snowless: 'icon-water',
        event: 'icon-trophy',
        snowmaking: 'icon-spinner',
        frozen: 'icon-frozen',
        plowed: 'icon-plowed',
        freezing_started: 'icon-started',
        unknown: 'icon-question'
      }));
    });
  });

  describe('statusBarClassName', () => {
    it('should return basic class when no observation provided', () => {
      expect(statusBarClassName()).toBe('unit-status');
      expect(statusBarClassName(undefined)).toBe('unit-status');
    });

    it('should return class with quality and color for good observation', () => {
      expect(statusBarClassName(baseObservation)).toBe('unit-status unit-status--good label-success');
    });

    it('should return class with quality and color for satisfactory observation', () => {
      const observation = { ...baseObservation, quality: 'satisfactory' };
      expect(statusBarClassName(observation)).toBe('unit-status unit-status--satisfactory label-warning');
    });

    it('should return class with quality and color for unusable observation', () => {
      const observation = { ...baseObservation, quality: 'unusable' };
      expect(statusBarClassName(observation)).toBe('unit-status unit-status--unusable label-danger');
    });

    it('should handle observation with quality not in COLORS mapping', () => {
      const observation = { ...baseObservation, quality: 'unknown' };
      expect(statusBarClassName(observation)).toBe('unit-status unit-status--unknown label-undefined');
    });
  });

  describe('getQualityObservation', () => {
    it('should return undefined when unit is undefined', () => {
      expect(getQualityObservation()).toBeUndefined();
      expect(getQualityObservation(undefined)).toBeUndefined();
    });

    it('should return first observation with quality that is not null, undefined or unknown', () => {
      const unit = {
        ...baseUnit,
        observations: [
          { ...baseObservation, id: 1, property: 'test1', name: { fi: 'Unknown' }, quality: 'unknown' },
          { ...baseObservation, id: 2, property: 'test2', name: { fi: 'Good' }, quality: 'good' },
          { ...baseObservation, id: 3, property: 'test3', name: { fi: 'Satisfactory' }, quality: 'satisfactory' }
        ]
      };

      const result = getQualityObservation(unit);
      expect(result).toBeDefined();
      expect(result?.quality).toBe('good');
      expect(result?.id).toBe(2);
    });

    it('should return undefined when no observations have valid quality', () => {
      const unit = {
        ...baseUnit,
        observations: [
          { ...baseObservation, id: 1, property: 'test1', name: { fi: 'Unknown' }, quality: 'unknown' }
        ]
      };

      expect(getQualityObservation(unit)).toBeUndefined();
    });

    it('should return undefined when unit has no observations', () => {
      expect(getQualityObservation(baseUnit)).toBeUndefined();
    });
  });

  describe('calculateGroups', () => {
    const createUnit = (id: number, maintenanceGroup: string, maintenanceOrg: string): Unit => ({
      ...baseUnit,
      id,
      name: { fi: `Unit ${id}` },
      extensions: {
        maintenance_group: maintenanceGroup,
        maintenance_organization: maintenanceOrg
      }
    });

    it('should group units by maintenance group for matching organization', () => {
      const units: Unit[] = [
        createUnit(1, 'group1', 'targetOrg'),
        createUnit(2, 'group1', 'targetOrg'),
        createUnit(3, 'group2', 'targetOrg')
      ];

      const result = calculateGroups(units, 'targetOrg');

      expect(result).toEqual({
        group1: [1, 2],
        group2: [3]
      });
    });

    it('should group units from other organizations under "muut kaupungit"', () => {
      const units: Unit[] = [
        createUnit(1, 'group1', 'targetOrg'),
        createUnit(2, 'group1', 'otherOrg'),
        createUnit(3, 'group2', 'anotherOrg')
      ];

      const result = calculateGroups(units, 'targetOrg');

      expect(result).toEqual({
        group1: [1],
        'muut kaupungit': [2, 3]
      });
    });

    it('should handle empty units array', () => {
      const result = calculateGroups([], 'targetOrg');
      expect(result).toEqual({});
    });

    it('should handle all units being from other organizations', () => {
      const units: Unit[] = [
        createUnit(1, 'group1', 'otherOrg'),
        createUnit(2, 'group2', 'anotherOrg')
      ];

      const result = calculateGroups(units, 'targetOrg');

      expect(result).toEqual({
        'muut kaupungit': [1, 2]
      });
    });
  });

  describe('getCurrentSeason', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return current season when date is after October 1st', () => {
      // Set date to December 15, 2024
      jest.setSystemTime(new Date('2024-12-15'));

      const result = getCurrentSeason();
      expect(result).toBe('2024-2025');
    });

    it('should return current season when date is exactly October 1st', () => {
      // Set date to October 1st, 2024
      jest.setSystemTime(new Date('2024-10-01'));

      const result = getCurrentSeason();
      expect(result).toBe('2024-2025');
    });

    it('should return previous season when date is before October 1st', () => {
      // Set date to September 15, 2024
      jest.setSystemTime(new Date('2024-09-15'));

      const result = getCurrentSeason();
      expect(result).toBe('2023-2024');
    });

    it('should return previous season when date is September 30th', () => {
      // Set date to September 30th, 2024
      jest.setSystemTime(new Date('2024-09-30'));

      const result = getCurrentSeason();
      expect(result).toBe('2023-2024');
    });

    it('should handle year transitions correctly', () => {
      // Set date to January 15, 2025 (should be 2024-2025 season)
      jest.setSystemTime(new Date('2025-01-15'));

      const result = getCurrentSeason();
      expect(result).toBe('2024-2025');
    });
  });
});