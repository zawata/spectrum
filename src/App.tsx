import React from "react";
import Carousel from "./components/AppCarousel/Carousel";
import { useService } from "./hooks/ServiceProvider";
import { TopicService } from "./services/TopicService";

const ICON_WIDTH = 200;
const HIDE_TIMEOUT = 5000;

const testItems = [
  {
    name: "Steam Link 1",
    path: "https://cdn2.steamgriddb.com/icon_thumb/7f2fc4be557404798e7ac1df49ee30a7.png",
  },
  {
    name: "Steam Link 2",
    path: "https://cdn2.steamgriddb.com/icon_thumb/7f2fc4be557404798e7ac1df49ee30a7.png",
  },
  {
    name: "Steam Link 3",
    path: "https://cdn2.steamgriddb.com/icon_thumb/7f2fc4be557404798e7ac1df49ee30a7.png",
  },
  {
    name: "Steam Link 4",
    path: "https://cdn2.steamgriddb.com/icon_thumb/7f2fc4be557404798e7ac1df49ee30a7.png",
  },
  {
    name: "Retroarch",
    path: "https://cdn.icon-icons.com/icons2/3914/PNG/512/retroarch_logo_icon_248653.png",
  },
  {
    name: "Firefox",
    path: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/231px-Firefox_logo%2C_2019.svg.png",
  },
] as const;

export type AppItemConfig = {
  name: string;
  icon: string;
  command: string;
};

export default function App() {
  const topicService = useService(TopicService);

  // const chromecastIframe = (
  //   <iframe className="w-full h-full" src="https://clients3.google.com/cast/chromecast/home" title="Chromecast" />
  // );

  const [isOverlayHidden, setOverlayHidden] = React.useState(true);
  const timer = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (!isOverlayHidden) {
      timer.current = setTimeout(() => setOverlayHidden(true), HIDE_TIMEOUT);
    } else {
      clearTimeout(timer.current);
    }

    return () => {
      clearInterval(timer.current);
    };
  }, [isOverlayHidden]);

  const appOverlay = (
    <div
      className="absolute w-full h-full"
      onMouseOver={() => setOverlayHidden(false)}
      onFocus={() => setOverlayHidden(false)}
      onKeyDown={() => setOverlayHidden(false)}
    >
      <div
        className="h-full flex flex-col items-center justify-center backdrop-blur-md"
        style={{
          transition: "opacity 1s ease-in-out",
          opacity: isOverlayHidden ? "0" : "1",
        }}
      >
        <Carousel
          itemWidth={ICON_WIDTH}
          items={testItems.map((item) => (
            <div key={item.name} className="w-full h-full flex flex-col items-center justify-center">
              <img src={item.path} alt={item.name} className="w-full h-full" onDragStart={(e) => e.preventDefault()} />
              <span>{item.name}</span>
            </div>
          ))}
          onItemSelect={(_item: number) => {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* <div className="absolute w-full h-full">{chromecastIframe}</div> */}
      {appOverlay}
    </div>
  );
}
