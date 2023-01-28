import { PixiComponent } from '@inlet/react-pixi';
import { Group, Layer as PixiLayer } from '@pixi/layers';

export interface LayerProps {
  group: Group;
}

export const Layer = PixiComponent<LayerProps, PixiLayer>('Layer', {
  create: ({ group }) => new PixiLayer(group),
  applyProps: (ins, _, props) => {
    ins.group = props.group;
  }
});
