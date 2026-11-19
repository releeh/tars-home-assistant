# Setting up TARS

Allow about an hour. The order matters a little: the package refers to the box and to the Claude agent by name, so set them up with the names given here, or find-and-replace in `tars.yaml` afterwards.

| Thing | Name to use | Gives you |
|---|---|---|
| ESP box (ESPHome friendly name) | `TARS Box` | `assist_satellite.tars_box_assist_satellite`, `sensor.tars_box_tars_said`, ... |
| Claude conversation agent | `TARS` | `conversation.tars` |
| Voice pipelines | `TARS` and `TARS (Claude only)` | used by the local-handling toggle |
| Local to-do lists | `TARS Journal` and `TARS Forgotten Memories` | `todo.tars_journal`, `todo.tars_forgotten_memories` |

---

## 1. Install the Home Assistant package

1. Copy `homeassistant/packages/tars.yaml` to `/config/packages/tars.yaml` (create the folder if needed; Studio Code Server or the File editor app makes this easy).
2. In `/config/configuration.yaml`, make sure packages are enabled:
   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```
3. **Developer tools → YAML → Check configuration**, then restart Home Assistant.
4. Create the two to-do lists: **Settings → Devices & services → Add integration → Local To-do**. Add one called `TARS Journal` and another called `TARS Forgotten Memories`.

The package sets humor to 60% and honesty to 90% on every restart (`initial:`). Once you've settled on levels you like, delete those `initial:` lines so your values stick.

## 2. Add Claude as the brain

1. **Settings → Devices & services → Add integration → Anthropic**, and paste your API key.
2. On the Anthropic integration, **add a conversation agent** (subentry) named `TARS`:
   - Turn **off** "Recommended model settings" so you can set the options below.
   - **Instructions / prompt:** paste the whole of `homeassistant/prompt/tars_prompt.jinja`. Edit the three lines at the top (`owner`, `place`, `city`) and the **SMART HOME** rules at the bottom to fit your house.
   - **Control Home Assistant:** `Assist`.
   - **Model:** a current Sonnet-class model is a good balance of wit and cost. Smaller models are cheaper and less funny.
   - **Web search:** on, if your model supports it (TARS is told he can look things up).
   - **Prompt caching:** on. The long prompt then costs much less on repeat replies.

## 3. Expose what TARS may use

**Settings → Voice assistants → Expose.** Expose the five TARS scripts:

- `TARS remember`
- `TARS forget`
- `TARS review memory`
- `Set TARS personality`
- `TARS end conversation`

Also expose the box's **Cue light** switch (after step 5), plus the lights, media players, thermostat and so on that you want him to control.

Keep this list small. Every exposed entity is sent with every request, so it costs tokens. Don't expose the TARS helpers themselves (memory slots, counters): the prompt already includes them.

## 4. Create the voice pipelines

**Settings → Voice assistants → Add assistant:**

| Setting | `TARS` | `TARS (Claude only)` |
|---|---|---|
| Conversation agent | TARS | TARS |
| Prefer handling commands locally | **on** | **off** |
| Speech-to-text | Home Assistant Cloud (or Whisper) | same |
| Text-to-speech | Home Assistant Cloud, e.g. voice *DavisNeural* | same |

"Prefer handling commands locally" lets Home Assistant answer simple commands free and instantly, with plain replies and no sass. Everything else goes to Claude. The `TARS handle simple commands locally` switch on the dashboard flips the box between these two pipelines.

The poke-reply automation speaks through `tts.home_assistant_cloud` with voice `DavisNeural`. If you use a different TTS, change it in `tars.yaml` (automation *TARS - Face poked reply*).

## 5. Flash the ESP32-S3-BOX-3

1. Open **ESPHome Device Builder** and create a new device (any name), then replace its YAML with `esphome/tars-box.yaml`.
2. Edit the `substitutions:` at the top so they point at your own sensors: outside/inside/room temperature, humidity, weather, a holiday calendar, washer and dryer status, and up to four fridge/freezer door sensors. If you don't have something, leave the placeholder. The tile shows `--` and that alert never fires.
3. Add the secrets it uses. In ESPHome open **Secrets** and add `wifi_ssid`, `wifi_password` and an API key:
   ```yaml
   tars_box_api_key: "<32 random bytes, base64>"   # e.g. openssl rand -base64 32
   ```
4. Copy the `esphome/hey_tars/` folder (both files) to `/config/esphome/hey_tars/` on Home Assistant.
5. Plug the box into the computer running your browser by USB-C, then choose **Install → Plug into this computer** for the first flash. Later updates go over Wi-Fi.
6. Home Assistant discovers the new device. Add it, using the API key from your secrets if asked.
7. On the device page set:
   - **Wake word:** `Hey TARS`
   - **Wake word 2:** `Okay Nabu` (fallback)
   - **Assistant** and **Assistant 2:** `TARS`
   - **Wake word engine location:** `On device`

Say **"Hey TARS, what's your humor setting?"**

## 6. Add the dashboard tab (optional but nice)

1. Copy `homeassistant/www/tars-journal-card.js` to `/config/www/tars-journal-card.js`.
2. **Settings → Dashboards → ⋮ → Resources → Add resource:** URL `/local/tars-journal-card.js`, type *JavaScript module*. Refresh the browser.
3. Open the dashboard you want → **⋮ → Edit dashboard → ⋮ → Raw configuration editor**, and paste the contents of `homeassistant/dashboard/tars_view.yaml` as a new item under `views:`.

## Using him

- **Personality:** "Set humor to 90 percent." "Be a little less honest." "What are your settings?"
- **Teaching:** "Remember that the dog's name is Biscuit." "From now on, when I say movie time, turn off the family room lights." He also picks things up without being asked.
- **Memory:** "What do you remember about me?" "Forget memory number 4." The dashboard lists every memory with its date and importance, and the forgotten-memory archive.
- **Conversation mode:** flip it on in the dashboard to keep talking without the wake word. Say "that's all" or "never mind" to end.
- **The box:**
  - tap the face for a reaction
  - poke it four times to annoy it
  - hold a finger still for about 1 second to talk
  - the **Screen mode** select switches to the clock/weather info screen, and a tap there goes back to the face

## Troubleshooting

- **The box stops responding to its wake words.** Toggle its **Mute** switch off and on. If that doesn't help, restart the box. A turn that ends with no spoken reply (Home Assistant's built-in "never mind" intent) used to cause this. The *TARS - Never mind* automation catches those phrases now. If you find another phrase that does it, add it to that automation's `command:` list.
- **The box is stuck on "listening".** Two listens collided. The keep-listening automation already skips replies that end in a question, which is the usual cause. Toggle Mute to recover.
- **TARS never remembers anything.** Check the five scripts are exposed to Assist (step 3), and that the to-do lists exist with the right names.
- **Nightly study does nothing.** The agent must be `conversation.tars`. Check the trace of *TARS - Nightly study* after 3:17 AM.
- **The cost estimate is off.** Compare with the Anthropic Console usage page and adjust **Avg cost per reply** on the dashboard until they match.
- **"Hey TARS" misses your voice.** Make it a little more sensitive: in `tars-box.yaml`, add `probability_cutoff: 0.90` under the `hey_tars` model (the default is 0.93) and reflash. Or retrain with your own recordings.
- **"Hey TARS" wakes up on its own.** Do the opposite: raise the cutoff to 0.95–0.97.
