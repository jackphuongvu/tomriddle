function MultiAudio(src, instances) {
  const output = [];
  const num = instances || 5;
  const Audio = window.Audio || function Audio() {};

  for (let i = 0; i < num; i += 1) {
    output.push(new Audio(src));
  }

  let current = 0;

  this.play = function play() {
    const audio = output[(current += 1) % num];
    audio.currentTime = 0;
    audio.play();
  };
}

export default MultiAudio;
