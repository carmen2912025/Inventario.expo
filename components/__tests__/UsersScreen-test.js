import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import UsersScreen from '../../app/admin/usersAdmin';

describe('UsersScreen', () => {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]), ok: true }));
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  it('muestra error si algún campo está vacío al agregar usuario', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<UsersScreen />);
    await act(async () => {
      fireEvent.press(getByText('Agregar Usuario'));
    });
    expect(alertMock).toHaveBeenCalledWith('Error', 'Todos los campos son obligatorios');
    alertMock.mockRestore();
  });

  it('muestra error si el correo es inválido', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<UsersScreen />);
    // Completa todos los campos obligatorios
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Nombre'), 'Test');
      fireEvent.changeText(getByPlaceholderText('CI'), '123');
      fireEvent.changeText(getByPlaceholderText('Teléfono'), '1234567');
      fireEvent.changeText(getByPlaceholderText('Correo'), 'correo-invalido');
      fireEvent.changeText(getByPlaceholderText('Rol ID'), '1');
    });
    await act(async () => {
      fireEvent.press(getByText('Agregar Usuario'));
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Correo inválido');
    });
    alertMock.mockRestore();
  });

  it('muestra error si el teléfono es inválido', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<UsersScreen />);
    // Completa todos los campos obligatorios
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Nombre'), 'Test');
      fireEvent.changeText(getByPlaceholderText('CI'), '123');
      fireEvent.changeText(getByPlaceholderText('Teléfono'), 'abc');
      fireEvent.changeText(getByPlaceholderText('Correo'), 'test@mail.com');
      fireEvent.changeText(getByPlaceholderText('Rol ID'), '1');
    });
    await act(async () => {
      fireEvent.press(getByText('Agregar Usuario'));
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Teléfono inválido');
    });
    alertMock.mockRestore();
  });
});
