import { pick, startCase } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Props for {@link AppSafeAreaView}.
 *
 * @property children Elements rendered inside the padded container.
 * @property edges An array indicating which edges of the screen to respect. Possible values are 'top', 'right', 'bottom', 'left'. Defaults to all edges.
 * @property style Custom styles to apply to the view. Note that padding values will be adjusted to respect safe area insets.
 * @property ...rest  All other {@link https://reactnative.dev/docs/view#props | ViewProps} are forwarded.
 */
export interface AppSafeAreaViewProps extends ViewProps {
  edges?: Array<Edge>;
}

const defaultEdges: Array<Edge> = ['top', 'right', 'bottom', 'left'];

/**
 * A component for granular control of safe area edges on each screen.
 * The difference from `SafeAreaView` in [react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context) is that the container adds padding to the elements inside it,
 * rather than to the entire screen, making it more flexible for use.
 *
 * > Requires the `react-native-safe-area-context`.
 *
 * @param props Component props. See {@link AppSafeAreaViewProps} for a detailed list.
 * @returns ReactElement
 */
export function AppSafeAreaView({
  children,
  edges = defaultEdges,
  style = {},
  ...props
}: AppSafeAreaViewProps): ReactElement {
  const insets = useSafeAreaInsets();

  const containerStyle = useMemo(() => {
    const paddings = pick(StyleSheet.flatten(style), ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']);

    return edges.reduce(
      (acc, edge) => {
        const paddingName = `padding${startCase(edge)}` as keyof typeof paddings;

        return [...acc, { [paddingName]: Number(paddings[paddingName] ?? 0) + insets[edge] }];
      },
      [style],
    );
  }, [style, insets, edges]);

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}
