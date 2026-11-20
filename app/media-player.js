import { asset } from './ui.js';

const speaker = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 6h3l3-3v10l-3-3H2V6Z" fill="currentColor"/><path d="M10 5c2 2 2 4 0 6m2-8c3 3 3 7 0 10" stroke="currentColor" stroke-linecap="round"/></svg>';

export function mediaSeek(className) {
  return `<input class="${className}" data-media-seek type="range" min="0" max="0" step="0.01" value="0" aria-label="Позиция воспроизведения" disabled>`;
}

export function mediaSound(className) {
  return `<button type="button" data-action="media-mute" aria-label="Выключить звук" aria-pressed="false">${speaker}</button><input class="${className}" data-media-volume type="range" min="0" max="1" step="0.05" value="1" aria-label="Громкость">`;
}

function formatTime(seconds, minuteDigits) {
  const wholeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return `${String(Math.floor(wholeSeconds / 60)).padStart(minuteDigits, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export function audioPanel(file) {
  return `<dialog class="floating-panel audio-panel" aria-labelledby="audio-title">
    <button class="icon-button audio-close" type="button" data-action="panel-close" aria-label="Закрыть плеер" autofocus><img src="${asset('da5ab.svg')}" alt=""></button>
    <div class="audio-heading"><h2 id="audio-title">${file.name}</h2><p>${file.trackTitle}</p></div>
    <audio preload="metadata" src="${asset(file.content)}"></audio>
    <p class="audio-error" data-media-error role="status" hidden>Не удалось воспроизвести аудио.</p>
    <div class="audio-progress">
      <div class="audio-timing" aria-live="off"><span data-media-current>00:00</span><span data-media-duration>00:00</span></div>
      ${mediaSeek('audio-seek')}
    </div>
    <div class="audio-controls">
      <button class="audio-step" type="button" aria-label="Назад" aria-disabled="true" tabindex="-1">|◀◀</button>
      <button class="audio-play" type="button" data-action="media-play" aria-label="Воспроизвести">▶</button>
      <button class="audio-step" type="button" aria-label="Вперёд" aria-disabled="true" tabindex="-1">▶▶|</button>
      <span class="audio-rate" aria-label="Скорость воспроизведения">1x</span>
      <div class="audio-sound">${mediaSound('audio-volume')}</div>
    </div>
  </dialog>`;
}

export function bindMediaTransport(player, { minuteDigits = 1 } = {}) {
  const media = player.querySelector('audio, video');
  const seek = player.querySelector('[data-media-seek]');
  const volume = player.querySelector('[data-media-volume]');
  const play = player.querySelector('[data-action="media-play"]');
  const mute = player.querySelector('[data-action="media-mute"]');
  const current = player.querySelector('[data-media-current]');
  const duration = player.querySelector('[data-media-duration]');
  const error = player.querySelector('[data-media-error]');
  const fullscreen = player.querySelector('[data-action="video-fullscreen"]');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const time = seconds => formatTime(seconds, minuteDigits);

  const sync = () => {
    const canSeek = Number.isFinite(media.duration) && media.duration > 0;
    seek.disabled = !canSeek;
    seek.max = canSeek ? media.duration : 0;
    seek.value = media.currentTime;
    seek.setAttribute('aria-valuetext', `${time(media.currentTime)} из ${time(media.duration)}`);
    seek.style.setProperty('--progress', `${canSeek ? media.currentTime / media.duration * 100 : 0}%`);
    current.textContent = time(media.currentTime);
    duration.textContent = time(media.duration);
    play.textContent = media.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', media.paused ? 'Воспроизвести' : 'Пауза');
    mute.setAttribute('aria-label', media.muted ? 'Включить звук' : 'Выключить звук');
    mute.setAttribute('aria-pressed', media.muted);
    const level = media.muted ? 0 : media.volume;
    volume.value = level;
    volume.style.setProperty('--progress', `${level * 100}%`);
    volume.setAttribute('aria-valuetext', `${Math.round(level * 100)}%`);
  };

  play.addEventListener('click', async () => {
    if (!media.paused) { media.pause(); return; }
    try {
      await media.play();
      error.hidden = true;
    } catch {
      if (!listeners.signal.aborted) error.hidden = false;
    }
  }, options);
  mute.addEventListener('click', () => { media.muted = !media.muted; }, options);
  seek.addEventListener('input', () => {
    if (Number.isFinite(media.duration)) media.currentTime = Number(seek.value);
  }, options);
  volume.addEventListener('input', () => {
    media.volume = Number(volume.value);
    media.muted = media.volume === 0;
  }, options);

  const events = ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange'];
  events.forEach(event => media.addEventListener(event, sync, options));
  media.addEventListener('error', () => { error.hidden = false; }, options);
  if (media.error) error.hidden = false;
  if (fullscreen) {
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (player.requestFullscreen) await player.requestFullscreen();
        else media.webkitEnterFullscreen?.();
      } catch {
        error.textContent = 'Браузер не разрешил полноэкранный режим.';
        error.hidden = false;
      }
    }, options);
    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === player;
      fullscreen.setAttribute('aria-pressed', active);
      fullscreen.setAttribute('aria-label', active ? 'Выйти из полноэкранного режима' : 'Полный экран');
    }, options);
  }
  sync();
  return () => {
    listeners.abort();
    media.pause();
    if (media.tagName === 'AUDIO') {
      media.removeAttribute('src');
      media.load();
    }
    if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {});
  };
}
