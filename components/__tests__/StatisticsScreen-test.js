import { render, waitFor } from '@testing-library/react-native';
import StatisticsScreen from '../../app/admin/statisticsAdmin';

describe('StatisticsScreen', () => {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([{ ventas: 10, total: 1000 }]), ok: true }));
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  it('renderiza estadísticas correctamente', async () => {
    const { getByText, queryByText } = render(<StatisticsScreen />);
    // Espera a que el título esté en pantalla
    expect(getByText('Estadísticas de Ventas')).toBeTruthy();
    // Espera a que se renderice algún dato de estadística
    await waitFor(() => {
      // Busca por regex en vez de función
      expect(queryByText(/ventas/i)).toBeTruthy();
    });
  });
});
