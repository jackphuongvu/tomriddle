function MultiAudio(src, instances = 5) {
  const output = [];
  const Audio = window.Audio || function Audio() {};

  for (let i = 0; i < instances; i += 1) {
    output.push(new Audio(src));
  }

  let current = 0;

  this.play = function play() {
    const audio = output[(current += 1) % instances];
    audio.currentTime = 0;
    audio.play();
  };
}

export default MultiAudio;
