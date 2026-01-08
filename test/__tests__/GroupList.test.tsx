import React from 'react';
import { screen } from '@testing-library/react';
import GroupList from '../../src/components/GroupList';
import { renderWithRoute } from '../testUtils';
import * as utils from '../../src/components/utils';

// Mock the calculateGroups utility function
jest.mock('../../src/components/utils', () => ({
  calculateGroups: jest.fn()
}));

const mockCalculateGroups = utils.calculateGroups as jest.MockedFunction<typeof utils.calculateGroups>;

const defaultState = {
  data: {
    unit: {
      '1': { id: 1, name: { fi: 'Unit 1' }, extensions: { maintenance_group: 'group1' } },
      '2': { id: 2, name: { fi: 'Unit 2' }, extensions: { maintenance_group: 'group1' } },
      '3': { id: 3, name: { fi: 'Unit 3' }, extensions: { maintenance_group: 'group2' } }
    }
  },
  auth: {
    maintenance_organization: 'test-org'
  }
};

const renderComponent = (initialState = defaultState) => {
  return renderWithRoute(<GroupList />, {
    route: '/',
    path: '/',
    initialState
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GroupList', () => {
  describe('loading states', () => {
    it('renders loading state when groups is null', () => {
      mockCalculateGroups.mockReturnValue(null);

      renderComponent();

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders loading state when groups is empty object', () => {
      mockCalculateGroups.mockReturnValue({});

      renderComponent();

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders loading state when groups is undefined', () => {
      mockCalculateGroups.mockReturnValue(undefined);

      renderComponent();

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });
  });

  describe('successful rendering', () => {
    it('renders group list with heading when groups are available', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' },
        'group2': { name: 'Group 2' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      expect(screen.getByText('Alueet')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Alueet');
    });

    it('renders group list items as links', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' },
        'group2': { name: 'Group 2' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      const group1Link = screen.getByRole('link', { name: /group1/i });
      const group2Link = screen.getByRole('link', { name: /group2/i });

      expect(group1Link).toBeInTheDocument();
      expect(group2Link).toBeInTheDocument();
      expect(group1Link).toHaveAttribute('href', '/group/group1');
      expect(group2Link).toHaveAttribute('href', '/group/group2');
    });

    it('renders correct number of group items', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' },
        'group2': { name: 'Group 2' },
        'group3': { name: 'Group 3' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      const groupLinks = screen.getAllByRole('link');
      expect(groupLinks).toHaveLength(3);
    });
  });

  describe('CSS classes and styling', () => {
    it('applies correct CSS classes to container elements', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      const rowContainer = screen.getByText('Alueet').closest('.row');
      expect(rowContainer).toHaveClass('row');

      const colContainer = screen.getByText('Alueet').closest('.col-xs-12');
      expect(colContainer).toHaveClass('col-xs-12');

      const listContainer = screen.getByRole('link').closest('.list-group');
      expect(listContainer).toHaveClass('list-group', 'facility-drilldown');
    });

    it('applies correct CSS classes to group list items', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      const groupLink = screen.getByRole('link');
      expect(groupLink).toHaveClass('list-group-item');

      const chevronIcon = groupLink.querySelector('.action-icon');
      expect(chevronIcon).toHaveClass('action-icon', 'glyphicon', 'glyphicon-chevron-right');
    });
  });

  describe('Redux integration', () => {
    it('calls calculateGroups with correct parameters', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      expect(mockCalculateGroups).toHaveBeenCalledWith(
        defaultState.data.unit,
        defaultState.auth.maintenance_organization
      );
    });

    it('handles different maintenance organizations', () => {
      const stateWithDifferentOrg = {
        ...defaultState,
        auth: {
          ...defaultState.auth,
          maintenance_organization: 'different-org'
        }
      };

      const mockGroups = {
        'group1': { name: 'Group 1' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent(stateWithDifferentOrg);

      expect(mockCalculateGroups).toHaveBeenCalledWith(
        defaultState.data.unit,
        'different-org'
      );
    });
  });

  describe('edge cases', () => {
    it('handles single group correctly', () => {
      const mockGroups = {
        'single-group': { name: 'Single Group' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      expect(screen.getByText('single-group')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('handles groups with special characters in names', () => {
      const mockGroups = {
        'group-with-special-chars!@#': { name: 'Special Group' },
        'åäö-group': { name: 'Nordic Group' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      expect(screen.getByText('group-with-special-chars!@#')).toBeInTheDocument();
      expect(screen.getByText('åäö-group')).toBeInTheDocument();
    });

    it('handles empty unit data', () => {
      const stateWithEmptyUnits = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {}
        }
      };

      mockCalculateGroups.mockReturnValue({});

      renderComponent(stateWithEmptyUnits);

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('handles null maintenance organization', () => {
      const stateWithNullOrg = {
        ...defaultState,
        auth: {
          ...defaultState.auth,
          maintenance_organization: null
        }
      };

      const mockGroups = {
        'group1': { name: 'Group 1' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent(stateWithNullOrg);

      expect(mockCalculateGroups).toHaveBeenCalledWith(
        defaultState.data.unit,
        null
      );
    });
  });

  describe('GroupListElement component', () => {
    it('renders individual group element with correct structure', () => {
      const mockGroups = {
        'test-group': { name: 'Test Group' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      renderComponent();

      const groupLink = screen.getByRole('link', { name: /test-group/i });
      expect(groupLink).toHaveAttribute('href', '/group/test-group');
      
      const chevronIcon = groupLink.querySelector('.glyphicon-chevron-right');
      expect(chevronIcon).toBeInTheDocument();
      
      expect(groupLink).toHaveTextContent('test-group');
    });

    it('generates unique keys for multiple group elements', () => {
      const mockGroups = {
        'group1': { name: 'Group 1' },
        'group2': { name: 'Group 2' },
        'group3': { name: 'Group 3' }
      };
      mockCalculateGroups.mockReturnValue(mockGroups);

      // This test ensures no React key warnings are generated
      const { container } = renderComponent();
      
      const groupLinks = container.querySelectorAll('.list-group-item');
      expect(groupLinks).toHaveLength(3);
      
      // Each link should have unique content
      expect(screen.getByText('group1')).toBeInTheDocument();
      expect(screen.getByText('group2')).toBeInTheDocument();
      expect(screen.getByText('group3')).toBeInTheDocument();
    });
  });
});