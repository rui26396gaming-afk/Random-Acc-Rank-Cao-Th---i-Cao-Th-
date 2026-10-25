// Built-in Web Audio API Synthesizer for high-quality ambient background sounds
// No external network audio files required - works 100% reliably offline

let audioCtx: AudioContext | null = null;
let currentSourceNodes: {
  gain: GainNode;
  nodes: (AudioNode | number)[]; // Store nodes or intervals to clean up
} | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type AmbientSoundType = 'rain' | 'waves' | 'campfire' | 'lofi';

export function stopAmbientSound() {
  if (currentSourceNodes) {
    try {
      currentSourceNodes.gain.gain.setValueAtTime(currentSourceNodes.gain.gain.value, audioCtx?.currentTime || 0);
      currentSourceNodes.gain.gain.linearRampToValueAtTime(0.001, (audioCtx?.currentTime || 0) + 0.5);
      setTimeout(() => {
        currentSourceNodes?.nodes.forEach((item) => {
          if (typeof item === 'number') {
            clearInterval(item);
          } else if ('stop' in item && typeof (item as any).stop === 'function') {
            (item as any).stop();
          }
        });
        currentSourceNodes = null;
      }, 500);
    } catch {
      currentSourceNodes = null;
    }
  }
}

export function playAmbientSound(type: AmbientSoundType, volume: number = 0.5) {
  stopAmbientSound();

  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(Math.max(0.05, volume), ctx.currentTime + 1.2);
  masterGain.connect(ctx.destination);

  const activeNodes: (AudioNode | number)[] = [];

  if (type === 'rain') {
    // Generate pink noise through bandpass
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();

    activeNodes.push(whiteNoise, filter);
  } else if (type === 'waves') {
    // Ocean waves with modulated lowpass filter
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    // LFO for wave ebb and flow
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave period
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(350, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(masterGain);

    noise.start();
    lfo.start();

    activeNodes.push(noise, filter, lfo, lfoGain);
  } else if (type === 'campfire') {
    // Warm low hum + crackle pulses
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();

    // Crackle noise generator
    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        try {
          const crackleOsc = ctx.createOscillator();
          const crackleGain = ctx.createGain();
          crackleOsc.type = 'square';
          crackleOsc.frequency.setValueAtTime(200 + Math.random() * 1400, ctx.currentTime);
          crackleGain.gain.setValueAtTime(0.08, ctx.currentTime);
          crackleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          crackleOsc.connect(crackleGain);
          crackleGain.connect(masterGain);
          crackleOsc.start();
          crackleOsc.stop(ctx.currentTime + 0.05);
        } catch {
          // ignore
        }
      }
    }, 120);

    activeNodes.push(osc, oscGain, interval);
  } else if (type === 'lofi') {
    // Soothing major 7th chord drone + gentle tape flutter
    const chordFrequencies = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 (Cmaj7)
    chordFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      activeNodes.push(osc, filter, oscGain);
    });
  }

  currentSourceNodes = {
    gain: masterGain,
    nodes: activeNodes,
  };
}

export function updateAmbientVolume(volume: number) {
  if (currentSourceNodes && audioCtx) {
    currentSourceNodes.gain.gain.setValueAtTime(Math.max(0.02, volume), audioCtx.currentTime);
  }
}
