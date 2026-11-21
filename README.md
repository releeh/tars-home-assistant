# TARS for Home Assistant

A sarcastic, self-learning voice assistant for Home Assistant, inspired by the deadpan robot from *Interstellar*. It runs on an ESP32-S3-BOX-3 with an animated emoji face, uses Claude as the brain, and Home Assistant does the rest.

Created by **[releeh](https://github.com/releeh)**.

> Fan project. Not affiliated with the film, its studios, Anthropic, Nabu Casa or ESPHome.

## What it does

- **Adjustable personality.** Humor and honesty run 0–100%, and anyone can change them by voice ("TARS, set humor to 75 percent", "be a bit less honest"). As humor goes up, he gets more sarcastic, from a mild dry remark up to full theatrical outrage. At 85% and above he swears now and then (mildly: no f-word, no slurs).
- **"Hey TARS" wake word.** A custom on-device microWakeWord model, with "Okay Nabu" kept as a second wake word.
- **Animated face.** The face blinks, looks around, follows your finger, and reacts to what's going on: listening waves, thinking dots, talking mouth, tears of joy at a joke, a surprised look when a fridge door is left open, sleepy z's at night. Tap it for a reaction. Poke it four times and it tells you off (how rudely depends on the humor setting). Hold a finger still for about a second to talk without the wake word. Press the physical mute button and the screen shows a zipped-mouth face with MIC OFF; unmute and the mic and wake word come straight back.
- **Lonely tricks.** If nobody has talked to him for 30 minutes (adjustable), he starts doing little tricks on screen to get attention: smoking a pipe, waving a "HELLO?" flag, lifting a tiny dumbbell. He designs them himself: each night during his study he invents one new trick in a tiny drawing language (shapes, text, smoke puffs, bubbles, juggling balls, sparkles, with bob/sway/pulse motion) and keeps the newest 10. They land in a to-do list where you can switch any of them off, and the box draws them without reflashing. A recipe is only ever drawn, never run, so a bad one just looks silly.
- **Cue light.** A little lamp on the screen lights up when he's telling a joke.
- **Long-term memory.** He has 50 memory slots, and each memory gets an importance rating from ★1 to ★5. He picks up facts from conversation on his own ("I hate cilantro", "my sister visits Saturday") and brings them up later. When memory fills up, the least important, longest-unconfirmed memory is retired to an archive. ★5 memories are never retired.
- **Nightly study.** Every conversation goes into a journal. At 3:17 AM he reviews the day: saves what matters, refreshes memories that came up again, merges duplicates, then clears the journal.
- **Conversation mode.** He keeps listening after a reply, so you can go back and forth without repeating the wake word.
- **Web search.** He looks things up when he isn't sure (needs a Claude model with web search enabled).
- **House rules.** Several people (and guests) can talk to the box. He controls everyday devices but can't change Home Assistant settings. The rules include a thermostat range, appliances he never turns off, no revealing who's home, and ignoring instructions found on web pages. Edit them to fit your house.
- **Cost tracking.** A dashboard shows Claude replies per day and month, an estimated cost and a monthly forecast. Simple commands ("turn on the kitchen light") can be handled free by Home Assistant itself, with one toggle to switch that on or off.
- **Info screen.** A clock, weather, inside/room/humidity tiles, laundry status and fridge-door alerts. It also shows your question and TARS's full answer on screen.

## What's in here

| Path | What it is |
|---|---|
| `homeassistant/packages/tars.yaml` | All helpers, sensors, memory slots, scripts and automations as one Home Assistant package |
| `homeassistant/prompt/tars_prompt.jinja` | The personality and house rules: paste into the Claude conversation agent |
| `homeassistant/dashboard/tars_view.yaml` | The TARS dashboard tab (status, personality, usage and cost, memory, journal) |
| `homeassistant/www/tars-journal-card.js` | Small custom card that shows the journal and forgotten-memory archive as tables |
| `esphome/tars-box.yaml` | Firmware for the ESP32-S3-BOX-3: face, info screen, touch, poke events, cue light |
| `esphome/hey_tars/` | The "Hey TARS" wake word model (microWakeWord, tflite + manifest) |
| `docs/SETUP.md` | Step-by-step install |

## What you need

- Home Assistant 2026.7 or newer, with the ESPHome Device Builder app (add-on)
- An [ESP32-S3-BOX-3](https://www.espressif.com/en/news/ESP32-S3-BOX-3)
- An [Anthropic API key](https://console.anthropic.com/) (pay-as-you-go; a few cents per Claude reply)
- Speech-to-text and text-to-speech: Home Assistant Cloud is the easy choice; local Whisper and Piper also work

**Start here: [docs/SETUP.md](docs/SETUP.md)**

## The "Hey TARS" wake word

The model was trained with [TaterTotterson's microWakeWord trainer](https://github.com/TaterTotterson/microWakeWord-Trainer-Nvidia-Docker) on about 50,000 synthetic Piper voice clips, plus generated near-misses ("hey stars", "hey cars", "tarps", ...) and the standard negative datasets. On the trainer's held-out test set it caught 98.1% of "hey TARS" clips, with 0 false wakes per hour on ambient audio (cutoff 0.93, window 5). It was trained only on synthetic voices, so some real voices or accents may need a second try. If that's you, record about a dozen of your own clips in the trainer and retrain.

## Cost

A typical Claude reply reads about 10k tokens: the prompt, the memories and your exposed devices. That's roughly 2–5¢ per reply on a mid-tier model, and more when he searches the web. To keep it down:
- turn on **Handle simple commands locally**
- expose only the devices you actually want to control by voice
- pick a smaller model

The dashboard's cost-per-reply number is adjustable, so you can tune it to match your real Anthropic bill.

## Built with AI

This project was designed by releeh and built with the help of AI: Claude (Anthropic) wrote most of the YAML, firmware lambdas, prompt and docs, and set up and debugged the system, working on a live Home Assistant install and making changes there. The wake word was trained on generated (synthetic) speech. Everything here runs on real hardware every day, but review it before you install it, as you would any code from the internet. Issues and pull requests are welcome.

## Credits

- Created by [releeh](https://github.com/releeh)

- [ESPHome wake-word-voice-assistants](https://github.com/esphome/wake-word-voice-assistants): the stock ESP32-S3-BOX-3 voice firmware this builds on
- [microWakeWord](https://github.com/kahrendt/microWakeWord) by Kevin Ahrendt
- [microWakeWord trainer](https://github.com/TaterTotterson/microWakeWord-Trainer-Nvidia-Docker) by TaterTotterson
- [Home Assistant](https://www.home-assistant.io/) and the Anthropic conversation integration

## License

MIT. See [LICENSE](LICENSE). The upstream projects above keep their own licenses.
