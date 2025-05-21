import { render, fireEvent, act } from '@testing-library/react-native';
import SalesScreen from '../../app/admin/salesAdmin';

describe('SalesScreen', () => {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/sales')) {
        return Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'Venta1', price: 100 }]), ok: true });
      }
      return Promise.resolve({ json: () => Promise.resolve([]), ok: true });
    });
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  it('muestra error si Cliente ID o Total están vacíos', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<SalesScreen />);
    await act(async () => {});
    await act(async () => {
      fireEvent.press(getByText('Agregar Venta'));
    });
    await act(async () => {
      fireEvent.press(getByText(/Guardar/i));
    });
    const lastCall = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    expect(lastCall[1]).toEqual(expect.stringContaining('Cliente ID'));
    expect(lastCall[1]).toEqual(expect.stringContaining('Total'));
    alertMock.mockRestore();
  });

  it('muestra error si Cliente ID no es numérico', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<SalesScreen />);
    await act(async () => {});
    await act(async () => {
      fireEvent.press(getByText('Agregar Venta'));
    });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Cliente ID'), 'abc');
      fireEvent.changeText(getByPlaceholderText('Total'), '100');
      fireEvent.press(getByText(/Guardar/i));
    });
    expect(alertMock).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('número'));
    alertMock.mockRestore();
  });

  it('muestra error si Total no es numérico', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<SalesScreen />);
    await act(async () => {});
    await act(async () => {
      fireEvent.press(getByText('Agregar Venta'));
    });
    // Completa ambos campos obligatorios, pero Total inválido
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Cliente ID'), '1');
      fireEvent.changeText(getByPlaceholderText('Total'), 'abc');
      fireEvent.press(getByText(/Guardar/i));
    });
    const lastCall3 = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    expect(lastCall3[1]).toEqual(expect.stringContaining('Total'));
    // Asegura que no hay otros errores de campos vacíos
    expect(lastCall3[1]).not.toEqual(expect.stringContaining('Cliente ID es obligatorio'));
    alertMock.mockRestore();
  });
});
