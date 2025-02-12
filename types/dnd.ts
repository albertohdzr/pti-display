import { DroppableProps } from "react-beautiful-dnd";

export interface CustomDroppableProps extends Omit<DroppableProps, "children"> {
  droppableId: string;
  type?: string;
  mode?: "standard" | "virtual";
  isDropDisabled: boolean;
  isCombineEnabled: boolean;
  ignoreContainerClipping: boolean;
  renderClone?: any;
  getContainerForClone?: () => HTMLElement;
}
