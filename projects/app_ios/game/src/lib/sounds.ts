import { Howl } from 'howler';

// Placeholder URLs. In a real app, these should be local files in /public/sounds/
export const sounds = {
    pop: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'], // Generic Pop
        volume: 0.5
    }),
    merge: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], // Generic Win/Coin
        volume: 0.5
    }),
    bgm: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3'], // Placeholder
        html5: true,
        loop: true,
        volume: 0.2
    })
};

export const playSound = (type: 'pop' | 'merge') => {
    // Basic wrapper
    sounds[type].play();
};
