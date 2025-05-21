import { render, fireEvent, act } from '@testing-library/react-native';
import ProvidersScreen from '../../app/admin/providers';

describe('ProvidersScreen', () => {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/providers')) {
        return Promise.resolve({ json: () => Promise.resolve([{ id: 1, nombre: 'Proveedor1', direccion: 'Calle', telefono: '123', correo: 'a@a.com' }]), ok: true });
      }
      return Promise.resolve({ json: () => Promise.resolve([]), ok: true });
    });
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  it('muestra error si el nombre está vacío', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<ProvidersScreen />);
    await act(async () => {
      fireEvent.press(getByText('Agregar proveedor'));
    });
    await act(async () => {
      fireEvent.press(getByText(/Guardar/i));
    });
    const lastCall = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    expect(lastCall[1]).toEqual(expect.stringContaining('nombre'));
    alertMock.mockRestore();
  });

  it('muestra error si el correo es inválido', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<ProvidersScreen />);
    await act(async () => {
      fireEvent.press(getByText('Agregar proveedor'));
    });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Nombre'), 'Proveedor Test');
      fireEvent.changeText(getByPlaceholderText('Dirección'), 'Calle 123');
      fireEvent.changeText(getByPlaceholderText('Teléfono'), '123456');
      fireEvent.changeText(getByPlaceholderText('Correo'), 'correo_invalido');
      fireEvent.press(getByText(/Guardar/i));
    });
    expect(alertMock).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('Correo'));
    alertMock.mockRestore();
  });
});
