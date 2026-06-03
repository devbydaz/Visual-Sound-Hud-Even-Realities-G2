import {
  waitForEvenAppBridge,
  TextContainerProperty
} from '@evenrealities/even_hub_sdk';

const HUD_CONTAINER_ID = 1;
const HUD_CONTAINER_NAME = "hud";

document.body.style.margin = "0";
document.body.style.backgroundColor = "#0b0f19"; 
document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif";
document.body.style.color = "#ffffff";
document.body.style.overflow = "hidden";

document.body.innerHTML = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,0,0');
    
    .ps-bg {
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: -1;
      background: linear-gradient(45deg, #0b0f19, #1a2245, #0f172a);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
    }
    
    .ps-glow {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(65, 105, 225, 0.15) 0%, transparent 60%);
      top: -100px; left: -100px;
      border-radius: 50%;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .container {
      display: flex; flex-direction: column; align-items: center; padding: 60px 20px 20px; height: 100vh; box-sizing: border-box;
    }

    .header-title {
      position: absolute;
      top: 24px;
      left: 24px;
      font-size: 14px; 
      font-weight: 700; 
      letter-spacing: 2px; 
      margin: 0;
      color: #64748b; 
      text-transform: lowercase;
    }

    #startButton {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; color: #ffffff;
      padding: 16px 0; width: 100%; max-width: 340px; font-size: 15px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); margin-bottom: 30px; transition: all 0.2s;
    }
    #startButton:active { transform: scale(0.97); background: rgba(255, 255, 255, 0.1); }

    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      width: 100%;
      max-width: 340px;
    }

    .widget-square {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      aspect-ratio: 1 / 1;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
      padding: 16px; box-sizing: border-box;
      transition: all 0.3s ease;
    }

    .widget-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: auto; }
    .widget-value { font-size: 15px; font-weight: 600; text-align: center; margin-top: auto; color: #e2e8f0; }

    .material-symbols-rounded {
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48;
      font-size: 42px; color: #ffffff; transition: color 0.3s ease;
    }

    .visualizer-box { display: flex; align-items: flex-end; justify-content: center; height: 40px; gap: 5px; margin: 10px 0; }
    .bar { width: 5px; height: 6px; background: #475569; border-radius: 4px; transition: height 0.2s; }
    
    .streaming .bar { background: #38bdf8; animation: equalize 1s infinite alternate ease-in-out; box-shadow: 0 0 8px rgba(56, 189, 248, 0.5); }
    .streaming .bar:nth-child(1) { animation-delay: 0.0s; }
    .streaming .bar:nth-child(2) { animation-delay: 0.2s; }
    .streaming .bar:nth-child(3) { animation-delay: 0.4s; }
    .streaming .bar:nth-child(4) { animation-delay: 0.1s; }
    .streaming .bar:nth-child(5) { animation-delay: 0.3s; }

    @keyframes equalize {
      0% { height: 6px; }
      50% { height: 35px; }
      100% { height: 15px; }
    }
  </style>

  <div class="ps-bg"></div>
  <div class="ps-glow"></div>
  <div class="container">
    <h1 class="header-title">sound-hud</h1>

    <button id="startButton">Initialize System</button>

    <div class="grid-container">
      
      <div class="widget-square">
        <div class="widget-label">Uplink</div>
        <div id="visualizer" class="visualizer-box">
          <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
        </div>
        <div id="statusText" class="widget-value" style="color: #64748b;">Standby</div>
      </div>

      <div class="widget-square">
        <div class="widget-label">Detection</div>
        <span id="phoneIcon" class="material-symbols-rounded" style="margin: 10px 0;">headphones</span>
        <div id="phoneMatch" class="widget-value">Quiet</div>
      </div>

    </div>
  </div>
`;

function makeHudContainer(content: string): TextContainerProperty {
  return new TextContainerProperty({
    xPosition: 326,
    yPosition: 0,
    width: 250,
    height: 80,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: HUD_CONTAINER_ID,
    containerName: HUD_CONTAINER_NAME,
    isEventCapture: 1,
    content
  });
}

let startupDone = false;
async function showOnGlasses(bridge: any, content: string): Promise<void> {
  const container = makeHudContainer(content);
  if (!startupDone) {
    await bridge.createStartUpPageContainer({ containerTotalNum: 1, textObject: [container] });
    startupDone = true;
  } else {
    await bridge.rebuildPageContainer({ containerTotalNum: 1, textObject: [container] });
  }
}

function formatForSystem(rawSoundData: string): { hud: string, phone: string, matIcon: string } | null {
  const upperData = rawSoundData.toUpperCase();
  
  if (upperData.includes("SILENCE") || upperData.includes("BACKGROUND") || upperData.includes("INSIDE, SMALL ROOM")) {
    return null; 
  }

  let cleanName = upperData.split("(")[0].trim();
  let phoneName = cleanName.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');

  let icon = "[ * ]"; 
  let matIcon = "graphic_eq"; 
  
  if (cleanName.includes("ALARM") || cleanName.includes("SIREN") || cleanName.includes("SMOKE DETECTOR")) {
    icon = "\\((!))/"; matIcon = "warning";
  } else if (cleanName.includes("GLASS") || cleanName.includes("SHATTER")) {
    icon = ">/|<"; matIcon = "broken_image";
  } else if (cleanName.includes("EXPLOSION") || cleanName.includes("GUNSHOT")) {
    icon = "=*="; matIcon = "local_fire_department";
  } else if (cleanName.includes("KNOCK") || cleanName.includes("DOOR")) {
    icon = "=>||"; matIcon = "door_front";
  } else if (cleanName.includes("PHONE") || cleanName.includes("RING")) {
    icon = "[^O^]"; matIcon = "phone_iphone";
  } else if (cleanName.includes("WATER") || cleanName.includes("POUR") || cleanName.includes("RAIN")) {
    icon = "[≈≈≈]"; matIcon = "water_drop";
  } else if (cleanName.includes("VACUUM")) {
    icon = "[=Oo]"; matIcon = "cleaning_services";
  } else if (cleanName.includes("KEYS") || cleanName.includes("JINGLE")) {
    icon = "8-"; matIcon = "key";
  } else if (cleanName.includes("DOG") || cleanName.includes("BARK") || cleanName.includes("HOWL")) {
    icon = "V^..^V"; matIcon = "pets";
  } else if (cleanName.includes("PATTER")) {
    icon = "oo oo"; matIcon = "pets";
  } else if (cleanName.includes("FOOTSTEPS") || cleanName.includes("WALKING")) {
    icon = "_/ _/"; matIcon = "directions_walk";
  } else if (cleanName.includes("CAT") || cleanName.includes("MEOW")) {
    icon = "=^.^="; matIcon = "pets";
  } else if (cleanName.includes("SPEECH") || cleanName.includes("CONVERSATION")) {
    icon = "~v^v~"; matIcon = "record_voice_over";
  } else if (cleanName.includes("LAUGH") || cleanName.includes("CHUCKLE")) {
    icon = " :D "; matIcon = "sentiment_satisfied";
  } else if (cleanName.includes("BABY CRY") || cleanName.includes("CRYING")) {
    icon = " T_T "; matIcon = "child_care";
  } else if (cleanName.includes("COUGH") || cleanName.includes("SNEEZE")) {
    icon = ">_X"; matIcon = "sick";
  } else if (cleanName.includes("CAR") || cleanName.includes("VEHICLE") || cleanName.includes("TRAFFIC")) {
    icon = "<|O_O|>"; matIcon = "directions_car";
  } else if (cleanName.includes("HORN") || cleanName.includes("HONK")) {
    icon = "<=O=>"; matIcon = "campaign";
  } else if (cleanName.includes("TRAIN") || cleanName.includes("SUBWAY")) {
    icon = "[OOO]"; matIcon = "train";
  } else if (cleanName.includes("AIRCRAFT") || cleanName.includes("HELICOPTER")) {
    icon = ">---<"; matIcon = "flight";
  } else if (cleanName.includes("MUSIC") || cleanName.includes("SONG")) {
    icon = ".|l|l|."; matIcon = "music_note";
  } else if (cleanName.includes("TELEVISION") || cleanName.includes("RADIO")) {
    icon = "[TV]"; matIcon = "tv";
  }

  return { hud: `${icon} ${cleanName}`, phone: phoneName, matIcon: matIcon };
}

async function startApp() {
  const startButton = document.getElementById("startButton") as HTMLButtonElement;
  const statusText = document.getElementById("statusText") as HTMLDivElement;
  const visualizer = document.getElementById("visualizer") as HTMLDivElement;
  
  const phoneIcon = document.getElementById("phoneIcon") as HTMLSpanElement;
  const phoneMatch = document.getElementById("phoneMatch") as HTMLDivElement;

  startButton.style.display = "none";
  statusText.innerText = "Connecting...";

  const ws = new WebSocket("wss://random-words.ngrok-free.app"); 
  
  ws.onopen = async () => {
    statusText.innerText = "Syncing...";
    const bridge = await waitForEvenAppBridge();
    
    await showOnGlasses(bridge, "[ SYS ONLINE ]");
    await bridge.audioControl(true);
    
    statusText.innerText = "Streaming";
    statusText.style.color = "#38bdf8"; 
    visualizer.classList.add("streaming"); 

    bridge.onEvenHubEvent((event: any) => {
      if (event.audioEvent && event.audioEvent.audioPcm) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.audioEvent.audioPcm as any);
        }
      }
    });

    const IDLE_TEXT = "[ - ]";
    let currentHudDisplay = "";
    let clearTimer: any = null;

    ws.onmessage = async (message) => {
      const formattedData = formatForSystem(message.data);
      if (!formattedData) return;

      if (formattedData.hud === currentHudDisplay) {
        clearTimeout(clearTimer);
        clearTimer = setTimeout(async () => {
          currentHudDisplay = "";
          phoneIcon.innerText = "headphones"; 
          phoneIcon.style.color = "#ffffff";
          phoneMatch.innerText = "Quiet";
          await showOnGlasses(bridge, IDLE_TEXT); 
        }, 4000); 
        return; 
      }

      currentHudDisplay = formattedData.hud;
      
      phoneIcon.innerText = formattedData.matIcon;
      phoneMatch.innerText = formattedData.phone;
      
      if (formattedData.matIcon === "warning" || formattedData.matIcon === "local_fire_department") {
        phoneIcon.style.color = "#ef4444"; 
      } else {
        phoneIcon.style.color = "#38bdf8"; 
      }
      
      await showOnGlasses(bridge, formattedData.hud);
      
      clearTimeout(clearTimer);
      clearTimer = setTimeout(async () => {
        currentHudDisplay = "";
        phoneIcon.innerText = "headphones";
        phoneIcon.style.color = "#ffffff";
        phoneMatch.innerText = "Quiet";
        await showOnGlasses(bridge, IDLE_TEXT); 
      }, 4000);
    };
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error:", err);
    visualizer.classList.remove("streaming");
    statusText.style.color = "#ef4444"; 
    statusText.innerText = "Offline";
  };
}

document.getElementById("startButton")?.addEventListener("click", startApp);
