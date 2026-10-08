# Extras: making it actually HAL

You don't need any of these for the eye to work.

## Linger helper

By default the overlay vanishes the moment the satellite goes idle. [`linger.yaml`](linger.yaml) is a template binary sensor that stays `on` for 4 seconds after HAL finishes, which feels much more natural.

1. Add it to `configuration.yaml`, or to a package, and replace `YOUR_SATELLITE` with your satellite's entity ID.
2. Restart HA, or reload *Template entities* in Developer Tools → YAML.
3. On the overlay card:

```yaml
variables:
  active_entity: binary_sensor.hal_active
triggers_update:
  - binary_sensor.hal_active
```

## Film lines

- [`hal_gags.yaml`](hal_gags.yaml) → save as `config/custom_sentences/en/hal_gags.yaml`
- [`hal_package.yaml`](hal_package.yaml) → save as a package (`config/packages/hal_gags.yaml`), or paste its `intent_script:` block into `configuration.yaml`

Restart HA, then try:

| Say | HAL replies |
|---|---|
| "open the pod bay doors" | "I'm sorry, Dave. I'm afraid I can't do that." |
| "hello HAL" / "HAL, are you there" | "Affirmative, Dave. I read you." |
| "HAL, what's the problem" | "I think you know what the problem is just as well as I do." |
| "HAL, sing me a song" | "Daisy, Daisy…" |

Custom sentences are handled by the **Home Assistant** conversation agent. If your pipeline uses an LLM agent, turn on *Prefer handling commands locally* so these lines still reach HAL.

## Voice

In your Assist pipeline, choose a calm, measured, slightly flat voice and audition a few. HAL's character is mostly in the delivery: unhurried, polite, and never raising his voice. If you use Piper, try a few English voices at their default speed before settling on one.
