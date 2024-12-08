import React from "react";
import { useService } from "../../hooks/ServiceProvider";
import { SlideshowService } from "../../services/Slideshow/SlideshowService";

const BACKGROUND_CHANGE_INTERVAL = 20 * 1000;

const useAction<T> = () => {
  
}

export function BackgroundSlideshowContainer() {
  const slideshowService = useService(SlideshowService);

  const [currentImage, setCurrentImage] = React.useState();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(slideshowService.getNextTopic());
    }, BACKGROUND_CHANGE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute w-full h-full">
      <img src={currentImage.imageUrl} alt="Background" className="w-full h-full" />
    </div>
  );
}
