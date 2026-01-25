const { registerRoot, Composition } = require('remotion');
const { HelloWorld } = require('./HelloWorld');
const React = require('react');

registerRoot(() => {
  const fps = 30;
  const slideDurationInSeconds = 4;
  const slideCount = 6;

  return React.createElement(Composition, {
    id: "HelloWorld",
    component: HelloWorld,
    durationInFrames: fps * slideDurationInSeconds * slideCount,
    fps: fps,
    width: 1920,
    height: 1080,
    defaultProps: {
      slides: [
        {
          title: "Preview",
          text: "Loading content...",
          image: null
        }
      ],
    },
  });
});
