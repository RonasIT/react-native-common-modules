import { pick, startCase } from 'lodash';
import { ReactElement, useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AppSafeAreaViewProps extends ViewProps {
  edges?: Array<Edge>;
}

const defaultEdges: Array<Edge> = ['top', 'right', 'bottom', 'left'];

export function AppSafeAreaView({ children, edges = defaultEdges, style = {}, ...props }: AppSafeAreaViewProps): ReactElement {
  const insets = useSafeAreaInsets();

  const containerStyle = useMemo(() => {
    const paddings = pick(StyleSheet.flatten(style), ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']);

    return edges.reduce(
      (acc, edge) => {
        const paddingName = `padding${startCase(edge)}` as keyof typeof paddings;

        return [...acc, { [paddingName]: Number(paddings[paddingName] ?? 0) + insets[edge] }];
      },
      [style]
    );
  }, [style, insets, edges]);

  return <View style={containerStyle} {...props}>{children}</View>;
}
