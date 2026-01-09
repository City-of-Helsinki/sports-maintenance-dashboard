import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockStore } from '../../../test/testUtils';
import UnitMassEdit from '../UnitMassEdit';
import { renderWithRoute } from '../../../test/testUtils';
import * as actions from '../../actions/index';
import * as municipalServicesClient from '../../lib/municipalServicesClient';

// Mock the actions module
jest.mock('../../actions/index', () => ({
  ...jest.requireActual('../../actions/index'),
  enqueueObservation: jest.fn(() => ({ type: 'ENQUEUE_OBSERVATION', meta: {} }))
}));

// Mock municipalServicesClient
jest.mock('../../lib/municipalServicesClient', () => ({
  ...jest.requireActual('../../lib/municipalServicesClient'),
  unitObservableProperties: jest.fn()
}));

const mockUnitObservableProperties = municipalServicesClient.unitObservableProperties as jest.MockedFunction<
  typeof municipalServicesClient.unitObservableProperties
>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ groupId: '1', propertyId: 'property1' })
}));

describe('UnitMassEdit', () => {
  const mockUnits = [
    {
      id: 1,
      name: { fi: 'Unit 1', sv: 'Unit 1 SV', en: 'Unit 1 EN' },
      extensions: { maintenance_group: '1', maintenance_organization: 'org1' },
      observations: [
        {
          id: 1,
          unit: 1,
          property: 'property1',
          time: '2023-01-01T00:00:00Z',
          expiration_time: null,
          name: { fi: 'Test observation' },
          quality: 'good',
          value: { fi: 'Good value' },
          primary: true
        }
      ]
    },
    {
      id: 2,
      name: { fi: 'Unit 2', sv: 'Unit 2 SV', en: 'Unit 2 EN' },
      extensions: { maintenance_group: '1', maintenance_organization: 'org1' },
      observations: []
    },
    {
      id: 3,
      name: { fi: 'Unit 3', sv: 'Unit 3 SV', en: 'Unit 3 EN' },
      extensions: { maintenance_group: '2', maintenance_organization: 'org1' },
      observations: []
    }
  ];

  const mockService = [
    {
      id: 1,
      name: { fi: 'Service 1' },
      unit_count: { municipality: {}, organization: {}, total: 0 },
      observable_properties: [
        {
          id: 'property1',
          name: { fi: 'Test Property', sv: 'Test Property SV', en: 'Test Property EN' },
          measurement_unit: null,
          observation_type: 'categorized',
          allowed_values: [
            {
              identifier: 'good',
              quality: 'good',
              name: { fi: 'Good', sv: 'Bra', en: 'Good' },
              description: { fi: 'Good desc' },
              property: 'property1'
            },
            {
              identifier: 'poor',
              quality: 'unusableable',
              name: { fi: 'Poor', sv: 'Dålig', en: 'Poor' },
              description: { fi: 'Poor desc' },
              property: 'property1'
            },
            {
              identifier: 'event',
              quality: 'event',
              name: { fi: 'Event', sv: 'Händelse', en: 'Event' },
              description: { fi: 'Event desc' },
              property: 'property1'
            }
          ]
        }
      ]
    }
  ];

  const mockUnitsRecord = mockUnits.reduce((acc, unit) => {
    acc[unit.id.toString()] = unit;
    return acc;
  }, {} as Record<string, any>);

  const mockServiceRecord = mockService.reduce((acc, service) => {
    acc[service.id.toString()] = service;
    return acc;
  }, {} as Record<string, any>);

  const mockStore = createMockStore({
    data: {
      unit: mockUnitsRecord,
      unitsByDistance: [],
      observable_property: {},
      observation: {},
      service: mockServiceRecord,
      loading: {}
    },
    serviceGroup: 'swimming'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock unitObservableProperties to return the test property
    mockUnitObservableProperties.mockImplementation((unit) => {
      // Return the observable property for units in group '1'
      if (unit?.extensions?.maintenance_group === '1') {
        return [
          {
            id: 'property1',
            name: { fi: 'Test Property', sv: 'Test Property SV', en: 'Test Property EN' },
            measurement_unit: null,
            observation_type: 'categorized',
            allowed_values: [
              {
                identifier: 'good',
                quality: 'good',
                name: { fi: 'Good', sv: 'Bra', en: 'Good' },
                description: { fi: 'Good desc' },
                property: 'property1'
              },
              {
                identifier: 'poor',
                quality: 'unusable',
                name: { fi: 'Poor', sv: 'Dålig', en: 'Poor' },
                description: { fi: 'Poor desc' },
                property: 'property1'
              }
            ]
          }
        ];
      }
      return [];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    expect(screen.getByText('Massapäivitys (Test Property)')).toBeInTheDocument();
    expect(screen.getByText('Valitse päivitettävät paikat')).toBeInTheDocument();
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Päivitä kuntokuvaus')).toBeInTheDocument();
  });

  test('renders error message for missing parameters', () => {
    // Mock useParams to return undefined values
    const mockUseParams = jest.spyOn(require('react-router-dom'), 'useParams');
    mockUseParams.mockReturnValue({ groupId: undefined, propertyId: undefined });

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/invalid/mass-edit/invalid',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    expect(screen.getByText('Virheellinen parametrit')).toBeInTheDocument();
    
    // Restore the mock
    mockUseParams.mockRestore();
  });

  it('shows loading state when units are undefined', () => {
    const loadingStore = createMockStore({
      data: {
        unit: undefined,
        unitsByDistance: [],
        observable_property: {},
        observation: {},
        service: mockServiceRecord,
        loading: {}
      },
      serviceGroup: 'swimming'
    });

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: loadingStore
      }
    );

    expect(screen.getByText('Ladataan...')).toBeInTheDocument();
  });

  it('filters units by maintenance group correctly', () => {
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    expect(screen.getByLabelText('Unit 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit 2')).toBeInTheDocument();
    expect(screen.queryByLabelText('Unit 3')).not.toBeInTheDocument(); // Different group
  });

  it('handles unit selection and deselection', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1') as HTMLInputElement;
    const unit2Checkbox = screen.getByLabelText('Unit 2') as HTMLInputElement;

    expect(unit1Checkbox.checked).toBe(false);
    expect(unit2Checkbox.checked).toBe(false);

    await user.click(unit1Checkbox);
    expect(unit1Checkbox.checked).toBe(true);

    await user.click(unit2Checkbox);
    expect(unit2Checkbox.checked).toBe(true);

    await user.click(unit1Checkbox);
    expect(unit1Checkbox.checked).toBe(false);
  });

  it('enables quality selection when units are selected', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    const qualityRadio = screen.getByLabelText('Good') as HTMLInputElement;

    expect(qualityRadio.disabled).toBe(true);

    await user.click(unit1Checkbox);
    expect(qualityRadio.disabled).toBe(false);
  });

  it('handles quality selection', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good') as HTMLInputElement;
    const poorRadio = screen.getByLabelText('Poor') as HTMLInputElement;

    expect(goodRadio.checked).toBe(false);
    expect(poorRadio.checked).toBe(false);

    await user.click(goodRadio);
    expect(goodRadio.checked).toBe(true);
    expect(poorRadio.checked).toBe(false);

    await user.click(poorRadio);
    expect(goodRadio.checked).toBe(false);
    expect(poorRadio.checked).toBe(true);
  });

  it('resets observation type when quality changes', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    // Wait for confirmation panel to appear
    await screen.findByText('Vahvista valinta');

    const observedRadio = screen.getByLabelText(/Todettu - Good/) as HTMLInputElement;
    await user.click(observedRadio);
    expect(observedRadio.checked).toBe(true);

    // Change quality
    const poorRadio = screen.getByLabelText('Poor');
    await user.click(poorRadio);

    // Observation type should be reset
    const newObservedRadio = await screen.findByLabelText(/Todettu - Poor/) as HTMLInputElement;
    expect(newObservedRadio.checked).toBe(false);
  });

  it('shows confirmation panel when units and quality are selected', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    await screen.findByText('Vahvista valinta');
    expect(screen.getByLabelText(/Todettu - Good/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kunnostettu - Good/)).toBeInTheDocument();
  });

  it('shows only observed option for poor quality', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const poorRadio = screen.getByLabelText('Poor');
    await user.click(poorRadio);

    await screen.findByText('Vahvista valinta');
    expect(screen.getByLabelText(/Todettu - Poor/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Kunnostettu - Poor/)).not.toBeInTheDocument();
  });

  it('handles observation type selection', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    await screen.findByLabelText(/Todettu - Good/);
    expect(screen.getByLabelText(/Kunnostettu - Good/)).toBeInTheDocument();

    const observedRadio = screen.getByLabelText(/Todettu - Good/) as HTMLInputElement;
    const servicedRadio = screen.getByLabelText(/Kunnostettu - Good/) as HTMLInputElement;

    expect(observedRadio.checked).toBe(false);
    expect(servicedRadio.checked).toBe(false);

    await user.click(observedRadio);
    expect(observedRadio.checked).toBe(true);
    expect(servicedRadio.checked).toBe(false);

    await user.click(servicedRadio);
    expect(observedRadio.checked).toBe(false);
    expect(servicedRadio.checked).toBe(true);
  });

  it('handles notice field input', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const noticeTextarea = screen.getByPlaceholderText('Kirjoita tähän suomen kielellä kuvaus valittujen paikkojen tilanteesta.') as HTMLTextAreaElement;
    
    expect(noticeTextarea.disabled).toBe(false);
    expect(noticeTextarea.value).toBe('');

    await user.type(noticeTextarea, 'Test notice');
    expect(noticeTextarea.value).toBe('Test notice');
  });

  it('disables notice field when no units are selected', () => {
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    expect(screen.getByText('Valitse ensin päivitettävät paikat')).toBeInTheDocument();
  });

  it('enables submit button when all required fields are selected', async () => {
    const user = userEvent.setup();
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const submitButton = screen.getByText('Tee päivitys') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);
    expect(submitButton.disabled).toBe(true);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);
    expect(submitButton.disabled).toBe(true);

    const observedRadio = await screen.findByLabelText(/Todettu - Good/);
    await user.click(observedRadio);
    expect(submitButton.disabled).toBe(false);
  });

  it('handles form submission with observation', async () => {
    const user = userEvent.setup();
    const mockEnqueueObservation = jest.spyOn(actions, 'enqueueObservation');

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    const observedRadio = await screen.findByLabelText(/Todettu - Good/);
    await user.click(observedRadio);

    const submitButton = screen.getByText('Tee päivitys');
    await user.click(submitButton);

    expect(mockEnqueueObservation).toHaveBeenCalledWith('property1', 'good', 1, false);
    expect(mockNavigate).toHaveBeenCalledWith('/queue');
  });

  it('handles form submission with serviced observation', async () => {
    const user = userEvent.setup();
    const mockEnqueueObservation = jest.spyOn(actions, 'enqueueObservation');

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    await screen.findByLabelText(/Kunnostettu - Good/);

    const servicedRadio = screen.getByLabelText(/Kunnostettu - Good/);
    await user.click(servicedRadio);

    const submitButton = screen.getByText('Tee päivitys');
    await user.click(submitButton);

    expect(mockEnqueueObservation).toHaveBeenCalledWith('property1', 'good', 1, true);
    expect(mockNavigate).toHaveBeenCalledWith('/queue');
  });

  it('handles form submission with notice', async () => {
    const user = userEvent.setup();
    const mockEnqueueObservation = jest.spyOn(actions, 'enqueueObservation');

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    await user.click(unit1Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    const noticeTextarea = screen.getByPlaceholderText('Kirjoita tähän suomen kielellä kuvaus valittujen paikkojen tilanteesta.');
    await user.type(noticeTextarea, 'Test notice');

    const observedRadio = await screen.findByLabelText(/Todettu - Good/);
    await user.click(observedRadio);

    const submitButton = screen.getByText('Tee päivitys');
    await user.click(submitButton);

    expect(mockEnqueueObservation).toHaveBeenCalledWith('property1', 'good', 1, false);
    expect(mockEnqueueObservation).toHaveBeenCalledWith('notice', 'Test notice', 1);
    expect(mockNavigate).toHaveBeenCalledWith('/queue');
  });

  it('handles form submission with multiple units', async () => {
    const user = userEvent.setup();
    const mockEnqueueObservation = jest.spyOn(actions, 'enqueueObservation');

    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const unit1Checkbox = screen.getByLabelText('Unit 1');
    const unit2Checkbox = screen.getByLabelText('Unit 2');
    await user.click(unit1Checkbox);
    await user.click(unit2Checkbox);

    const goodRadio = screen.getByLabelText('Good');
    await user.click(goodRadio);

    const observedRadio = await screen.findByLabelText(/Todettu - Good/);
    await user.click(observedRadio);

    const submitButton = screen.getByText('Tee päivitys');
    await user.click(submitButton);

    expect(mockEnqueueObservation).toHaveBeenCalledWith('property1', 'good', 1, false);
    expect(mockEnqueueObservation).toHaveBeenCalledWith('property1', 'good', 2, false);
    expect(mockNavigate).toHaveBeenCalledWith('/queue');
  });

  it('renders back links correctly', () => {
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    const backLinks = screen.getAllByText('Takaisin');
    expect(backLinks).toHaveLength(1);
    
    const cancelButton = screen.getByText('Peruuta');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton.closest('a')).toHaveAttribute('href', '/group/1/mass-edit');
  });

  it('renders observations for units', () => {
    renderWithRoute(
      <UnitMassEdit />,
      {
        route: '/group/1/mass-edit/property1',
        path: '/group/:groupId/mass-edit/:propertyId',
        store: mockStore
      }
    );

    // Unit 1 has observations, Unit 2 doesn't
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('Unit 2')).toBeInTheDocument();
  });
});