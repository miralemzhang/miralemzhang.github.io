// 背景音乐自动播放脚本（静音预播 + 多策略解锁 + PJAX 兼容）
(function() {
    function getAudioEl() {
        var audio = document.getElementById('bgm');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'bgm';
            audio.src = '/music/background.mp3';
            audio.loop = true; audio.preload = 'auto';
            audio.setAttribute('hidden', 'hidden');
            document.body.appendChild(audio);
        }
        return audio;
    }
    function tryPlay(audio) {
        if (!audio) return Promise.resolve();
        return audio.play().catch(function(){ return Promise.reject(); });
    }
    function initAudio() {
        var audio = getAudioEl();
        audio.volume = 0;
        audio.muted = true;
        tryPlay(audio);

        var retries = 0;
        var timer = setInterval(function(){
            if (!audio.paused) { clearInterval(timer); return; }
            retries += 1;
            tryPlay(audio);
            if (retries >= 10) clearInterval(timer);
        }, 1000);

        document.addEventListener('visibilitychange', function(){
            if (!document.hidden && audio.paused) tryPlay(audio);
        });

        var unlock = function(){
            audio.muted = false;
            audio.volume = 0.3;
            if (audio.paused) tryPlay(audio);
            window.removeEventListener('click', unlock, true);
            window.removeEventListener('touchstart', unlock, true);
            window.removeEventListener('keydown', unlock, true);
            window.removeEventListener('mousemove', unlock, true);
            window.removeEventListener('scroll', unlock, true);
        };
        window.addEventListener('click', unlock, true);
        window.addEventListener('touchstart', unlock, true);
        window.addEventListener('keydown', unlock, true);
        window.addEventListener('mousemove', unlock, true);
        window.addEventListener('scroll', unlock, true);

        window._bgAudio = audio;
    }

    function init() {
        initAudio();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('pjax:complete', function(){
        initAudio();
    });

    window.addEventListener('load', function(){
        initAudio();
    });
})();
