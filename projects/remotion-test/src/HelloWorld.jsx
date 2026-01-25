const React = require('react');
const { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, Series, staticFile } = require('remotion');

const Slide = ({ title, text, image, slideDuration }) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(
		frame,
		[0, 10, slideDuration - 10, slideDuration],
		[0, 1, 1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	const textY = interpolate(
		frame,
		[0, 15],
		[20, 0],
		{ extrapolateRight: 'clamp' }
	);

	return React.createElement(AbsoluteFill, { style: { backgroundColor: '#000' } }, [
		image ? React.createElement('img', {
			src: staticFile(image),
			key: "bg",
			style: {
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				opacity: 0.5,
			}
		}) : React.createElement('div', {
			key: "bg",
			style: {
				width: '100%',
				height: '100%',
				background: 'linear-gradient(45deg, #1a1a1a, #4a4a2a)',
			}
		}),
		React.createElement(AbsoluteFill, {
			key: "content",
			style: {
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '100px',
				opacity,
			}
		}, [
			React.createElement('div', {
				key: "box",
				style: {
					backgroundColor: 'rgba(0, 0, 0, 0.7)',
					borderRadius: '30px',
					padding: '60px',
					border: '1px solid rgba(255, 255, 255, 0.2)',
					color: 'white',
					maxWidth: '1200px',
					transform: `translateY(${textY}px)`,
					boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
				}
			}, [
				React.createElement('h1', { style: { fontSize: '70px', marginBottom: '30px', fontWeight: 'bold' } }, title),
				React.createElement('p', { style: { fontSize: '40px', lineHeight: '1.6', opacity: 0.9 } }, text),
			])
		])
	]);
};

const HelloWorld = ({ slides = [] }) => {
	const { fps } = useVideoConfig();
	const slideDuration = 4 * fps;

	return React.createElement(AbsoluteFill, null, [
		React.createElement(Series, { key: "series" },
			slides.map((slide, i) => React.createElement(Series.Sequence, {
				key: i,
				durationInFrames: slideDuration
			}, React.createElement(Slide, { ...slide, slideDuration, key: `slide-${i}` })))
		)
	]);
};

module.exports = { HelloWorld };
