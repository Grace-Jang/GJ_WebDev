
let audioContext, analyser, microphone, animationId;
const visualizer = document.getElementById('visualizer');
const startButton = document.getElementById('startButton');
const particles = [];
const maxParticles = 80;

function createParticle(x, y, intensity) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  const size = Math.max(4, Math.min(12, intensity / 10));
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  visualizer.appendChild(particle);
  const speedX = (Math.random() - 0.5) * 1.5;
  const speedY = (Math.random() - 0.5) * 1.5;
  particles.push({ element: particle, x, y, size, speedX, speedY, life: 60 });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;
    p.element.style.left = `${p.x}px`;
    p.element.style.top = `${p.y}px`;
    p.element.style.opacity = p.life / 60;
    if (p.life <= 0) {
      visualizer.removeChild(p.element);
      particles.splice(i, 1);
    }
  }
}

function animateParticles() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
  const x = Math.random() * visualizer.clientWidth;
  const y = Math.random() * visualizer.clientHeight;
  if (avg > 40 && particles.length < maxParticles) {
    for (let i = 0; i < avg / 40; i++) {
      createParticle(x, y, avg);
    }
  }
  updateParticles();
  animationId = requestAnimationFrame(animateParticles);
}

async function startMic() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  microphone.connect(analyser);
  animateParticles();
  startButton.disabled = true;
}

startButton.addEventListener('click', startMic);
