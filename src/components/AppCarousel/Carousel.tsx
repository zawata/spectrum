import classNames from "classnames";
import { type MotionValue, motion, useMotionValueEvent, useSpring, useTransform } from "motion";
import React from "react";

type CarouselItemProps = {
  actualItem: React.ReactNode;
  itemWidth: number;
  virtualIndex: number;
  virtualScrollLeft: MotionValue<number>;
};

function CarouselItem({ actualItem, itemWidth, virtualIndex, virtualScrollLeft }: CarouselItemProps) {
  const translationOffset = useTransform(virtualScrollLeft, (virtualScrollLeft) => {
    const itemOffset = itemWidth * virtualIndex;
    return itemOffset - virtualScrollLeft;
  });

  const classnames = classNames("absolute top-0 left-0", "flex flex-col items-center justify-center border-2");

  return (
    <motion.div
      id={`item-${virtualIndex}`}
      key={virtualIndex}
      className={classnames}
      style={{
        minWidth: `${itemWidth}px`,
        maxWidth: `${itemWidth}px`,
        x: translationOffset,
      }}
    >
      {actualItem}
      <span>{virtualIndex}</span>
    </motion.div>
  );
}

type Props = {
  className?: string;
  itemWidth: number;
  items: React.ReactNode[];
  onItemSelect: (item: number) => void;
  selectedIndex?: number;
};

export default function Carousel({ className, itemWidth, items, onItemSelect, selectedIndex }: Props) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const getContainerWidth = () => scrollContainerRef.current?.clientWidth ?? 0;
  const calcScrollLeft = (index: number): number => {
    const itemScrollOffset = index * itemWidth;
    const middleOfContainer = getContainerWidth() / 2;
    const middleOfItem = itemWidth / 2;
    return itemScrollOffset + middleOfItem - middleOfContainer;
  };

  const [virtualIndex, setVirtualIndex] = React.useState(selectedIndex ?? 0);
  const updateVirtualIndex = (index: number, jump = false) => {
    if (jump) {
      virtualScrollLeft.jump(calcScrollLeft(index));
    } else {
      virtualScrollLeft.set(calcScrollLeft(index));
    }

    setVirtualIndex(index);
  };

  const virtualScrollLeft = useSpring(calcScrollLeft(virtualIndex), {
    stiffness: 300,
    damping: 30,
  });
  useMotionValueEvent(virtualScrollLeft, "change", () => {});

  const overScanIndexCount = 3;

  const getFirstOverScanIndex = () => {
    return Math.floor(virtualScrollLeft.get() / itemWidth) - overScanIndexCount;
  };
  const getLastOverScanIndex = () => {
    return Math.floor((virtualScrollLeft.get() + getContainerWidth()) / itemWidth) + overScanIndexCount;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        updateVirtualIndex(virtualIndex - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        updateVirtualIndex(virtualIndex + 1);
        break;
      case "Enter":
        event.preventDefault();
        onItemSelect(getRealItemIndex(virtualIndex));
        break;
    }
  };

  const getRealItemIndex = (_virtualIndex: number) => {
    const realIndex = _virtualIndex % items.length;
    return realIndex < 0 ? realIndex + items.length : realIndex;
  };

  const renderItem = (_virtualIndex: number) => (
    <CarouselItem
      actualItem={items[getRealItemIndex(_virtualIndex)]}
      itemWidth={itemWidth}
      virtualIndex={_virtualIndex}
      virtualScrollLeft={virtualScrollLeft}
    />
  );

  type CarouselItemsByVirtualIndex = Record<number, React.ReactNode>;

  function recalculateCarouselItems(force = false) {
    const firstOverScanIndex = getFirstOverScanIndex();
    const lastOverScanIndex = getLastOverScanIndex();
    const newCarouselItems: CarouselItemsByVirtualIndex = {};
    for (let i = firstOverScanIndex; i <= lastOverScanIndex; i++) {
      if (!carouselItems[i] || force) {
        newCarouselItems[i] = renderItem(i);
      } else {
        newCarouselItems[i] = carouselItems[i];
      }
    }

    setCarouselItems(newCarouselItems);
  }

  const [carouselItems, setCarouselItems] = React.useState<Record<number, React.ReactNode>>([]);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.focus();
      updateVirtualIndex(selectedIndex ?? 0, true);
      recalculateCarouselItems();
    }
  }, [scrollContainerRef]);

  React.useEffect(() => {
    recalculateCarouselItems();
  }, [virtualIndex]);

  return (
    <div className={classNames("relative w-full", className)}>
      <div className="overflow-hidden w-full focus:outline-none" ref={scrollContainerRef} onKeyDown={handleKeyDown}>
        <motion.div className="flex cursor-grab active:cursor-grabbing">
          {Object.keys(carouselItems).map((key) => carouselItems[Number(key)])}
        </motion.div>
      </div>
    </div>
  );
}
