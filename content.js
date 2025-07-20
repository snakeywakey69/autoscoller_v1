(function() {
  if (window.__ytShortsAutoscrollInjected) return;
  window.__ytShortsAutoscrollInjected = true;

  const BUTTON_ID = 'yt-shorts-autoscroll-btn';
  let isAutoscrollEnabled = false;
  let currentVideo = null;
  let pollInterval = null;
  let urlCheckInterval = null;
  let lastUrl = window.location.href;

  function clickNext() {
    const nextBtn = document.querySelector('button[aria-label="Next video"]');
    if (nextBtn) {
      console.log("⏭️ Clicking next button");
      nextBtn.click();
    } else {
      console.log("❌ Next button not found");
    }
  }

  function onVideoEnded() {
    console.log("⏭️ Video ended — moving to next Short");
    if (isAutoscrollEnabled) {
      clickNext();
    }
  }

  function checkVideoEnd() {
    if (!currentVideo || !isAutoscrollEnabled) return;
    
    // Check if video is near the end (within 0.5 seconds)
    if (currentVideo.currentTime >= currentVideo.duration - 0.5) {
      console.log("⏭️ Video near end (polling) — moving to next Short");
      clickNext();
    }
  }

  function attachVideoListener() {
    const video = document.querySelector('video');
    if (!video) {
      console.log("❌ No video element found");
      return;
    }
    
    if (currentVideo === video) {
      console.log("ℹ️ Same video element, skipping");
      return;
    }
    
    console.log("✅ Attaching listener to video element");
    currentVideo = video;
    video.addEventListener('ended', onVideoEnded);
    
    // Start polling as fallback
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(checkVideoEnd, 200); // Check every 200ms
    
    // Log video info for debugging
    console.log("📹 Video duration:", video.duration);
    console.log("📹 Video current time:", video.currentTime);
  }

  function detachVideoListener() {
    if (currentVideo) {
      console.log("🔌 Removing video listener");
      currentVideo.removeEventListener('ended', onVideoEnded);
      currentVideo = null;
    }
    
    if (pollInterval) {
      console.log("🔌 Stopping poll interval");
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function createButton() {
    if (document.getElementById(BUTTON_ID)) return;
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.textContent = 'Start Autoscroll';
    btn.className = 'yt-shorts-autoscroll-btn';
    btn.style.zIndex = 10000;
    document.body.appendChild(btn);
    
    btn.addEventListener('click', () => {
      if (isAutoscrollEnabled) {
        console.log("🛑 Stopping autoscroll");
        isAutoscrollEnabled = false;
        btn.textContent = 'Start Autoscroll';
        detachVideoListener();
      } else {
        console.log("▶️ Starting autoscroll");
        isAutoscrollEnabled = true;
        btn.textContent = 'Stop Autoscroll';
        attachVideoListener();
      }
    });
    
    console.log("✅ Button created");
  }

  function checkForShortsPage() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      console.log("🔄 URL changed from", lastUrl, "to", currentUrl);
      lastUrl = currentUrl;
      
      // Reset state
      isAutoscrollEnabled = false;
      detachVideoListener();
      
      // Remove existing button
      const existingBtn = document.getElementById(BUTTON_ID);
      if (existingBtn) {
        existingBtn.remove();
        console.log("🗑️ Removed old button");
      }
      
      // Check if we're on a Shorts page
      if (currentUrl.includes('/shorts/')) {
        console.log("📱 On Shorts page, creating button...");
        setTimeout(createButton, 500);
      }
    }
  }

  // Start URL checking
  urlCheckInterval = setInterval(checkForShortsPage, 1000);

  // Also watch for video elements appearing
  const videoObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'VIDEO' || node.querySelector('video')) {
              console.log("🎥 Video element detected");
              if (window.location.href.includes('/shorts/') && !document.getElementById(BUTTON_ID)) {
                setTimeout(createButton, 500);
              }
            }
          }
        });
      }
    });
  });

  videoObserver.observe(document.body, { childList: true, subtree: true });

  // Initial setup
  if (window.location.href.includes('/shorts/')) {
    setTimeout(createButton, 1000);
  }
})(); 