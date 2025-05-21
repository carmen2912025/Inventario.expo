import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProductsScreen from '../../app/admin/productos';

describe('ProductsScreen', () => {
  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/categories')) {
        return Promise.resolve({ json: () => Promise.resolve([{ id: 1, nombre: 'Cat1' }]), ok: true });
      }
      return Promise.resolve({ json: () => Promise.resolve([]), ok: true });
    });
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  it('muestra error si el nombre o precio están vacíos', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<ProductsScreen />);
    await act(async () => {
      fireEvent.press(getByText('Agregar Producto'));
    });
    await act(async () => {
      fireEvent.press(getByText(/Guardar/i));
    });
    const lastCall = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    expect(lastCall[1]).toEqual(expect.stringContaining('Nombre'));
    expect(lastCall[1]).toEqual(expect.stringContaining('precio'));
    expect(lastCall[1]).toEqual(expect.stringContaining('categoría'));
    alertMock.mockRestore();
  });

  it('muestra error si el precio no es numérico', async () => {
    const alertMock = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText, getAllByTestId } = render(<ProductsScreen />);
    await act(async () => {
      fireEvent.press(getByText('Agregar Producto'));
    });
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Nombre'), 'Producto Test');
      fireEvent.changeText(getByPlaceholderText('Precio'), 'precio_invalido');
      fireEvent.changeText(getByPlaceholderText('Descripción'), 'desc');
      // Selecciona una categoría válida (id: 1)
      const pickers = getAllByTestId('picker-categoria');
      fireEvent(pickers[0], 'valueChange', '1');
      fireEvent.press(getByText(/Guardar/i));
    });
    const lastCall2 = alertMock.mock.calls[alertMock.mock.calls.length - 1];
    expect(lastCall2[1]).toEqual(expect.stringContaining('precio'));
    alertMock.mockRestore();
  });
});