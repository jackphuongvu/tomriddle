// I don't know why these are here
// https://stackoverflow.com/questions/9811429/html5-audio-tag-on-safari-has-a-delay
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

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
