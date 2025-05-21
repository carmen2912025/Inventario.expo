import { render } from '@testing-library/react-native';
import { MonoText } from '../StyledText';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

it('renders correctly', () => {
  const { toJSON } = render(<MonoText>Snapshot test!</MonoText>);
  expect(toJSON()).toMatchSnapshot();
});
