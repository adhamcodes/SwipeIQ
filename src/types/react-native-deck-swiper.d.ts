declare module 'react-native-deck-swiper' {
  import type { Component } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export interface SwiperProps<T = unknown> {
    cards: T[];
    renderCard: (card: T, index: number) => React.ReactNode;
    cardIndex?: number;
    backgroundColor?: string;
    stackSize?: number;
    stackSeparation?: number;
    stackScale?: number;
    showSecondCard?: boolean;
    verticalSwipe?: boolean;
    horizontalSwipe?: boolean;
    disableTopSwipe?: boolean;
    disableBottomSwipe?: boolean;
    disableLeftSwipe?: boolean;
    disableRightSwipe?: boolean;
    cardVerticalMargin?: number;
    cardHorizontalMargin?: number;
    marginTop?: number;
    marginBottom?: number;
    containerStyle?: StyleProp<ViewStyle>;
    cardStyle?: StyleProp<ViewStyle>;
    overlayLabels?: Record<string, unknown> | null;
    onSwipedLeft?: (cardIndex: number) => void;
    onSwipedRight?: (cardIndex: number) => void;
    onSwipedAll?: () => void;
    onTapCard?: (cardIndex: number) => void;
    swipeAnimationDuration?: number;
  }

  export default class Swiper<T = unknown> extends Component<SwiperProps<T>> {
    jumpToCardIndex: (index: number) => void;
  }
}
