import React from "react";
import { useService } from "../../hooks/ServiceProvider";
import { SlideshowService } from "../../services/Slideshow/SlideshowService";
import { ISlideshowImage } from "../../services/Slideshow/ISlideshowProvider";

const BACKGROUND_CHANGE_INTERVAL = 20 * 1000;

export function BackgroundSlideshowContainer() {
  const slideshowService = useService(SlideshowService);

  const [currentImage, setCurrentImage] = React.useState<{ provider: string; image: ISlideshowImage }>();
  const [_isLoading, startTransition] = React.useTransition();

  const showNextImage = () => {
    startTransition(async () => {
      const image = await slideshowService.getNextImage();

      setCurrentImage(image);
    });
  };

  

  React.useEffect(() => {
    const interval = setInterval(() => {
      showNextImage();
    }, BACKGROUND_CHANGE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute w-full h-full">
      <img src={currentImage?.image.imageUrl} alt="Background" className="w-full h-full" />
    </div>
  );
}
