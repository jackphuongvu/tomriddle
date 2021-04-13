interface MultiAudio {
  play(): void;
}

interface Audio extends MultiAudio {
  currentTime: number;
}

/**
 * A single audio can only play once; this creates multiple instances
 * and rotates playing them.
 *
 * @param {string} src source of audio file
 * @param {number} instances number of simultaneous instances of this sound
 */
const MultiAudio = (function multiAudio(
  this: MultiAudio,
  src: string,
  instances = 5
) {
  const output: Audio[] = [];

  for (let i = 0; i < instances; i += 1) {
    output.push(new Audio(src));
  }

  let current = 0;

  this.play = function play() {
    const audio = output[(current += 1) % instances];
    audio.currentTime = 0;
    audio.play();
  };
} as any) as { new (src: string, instances: number): MultiAudio };

export default MultiAudio;
