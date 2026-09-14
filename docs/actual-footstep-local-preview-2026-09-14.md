# Actual Phasmophobia footstep: local preview

The user requested the actual game sound after reviewing the synthesized encyclopedia player. The local preview now uses the game footstep sample referenced by Ty Bayn / Zero-Network's Unofficial Phasmophobia Cheat Sheet. Each ghost retains its own speed conditions; the sound is shared, and only the interval between steps changes. Playback preserves the sample's original pitch.

- Source: https://zero-network.net/phasmophobia/static/assets/footstep.mp3
- Source project: https://github.com/tybayn/phasmo-cheat-sheet
- Local file: `artifacts/encyclopedia/audio/footstep.mp3` (7,747 bytes).
- Decoded browser duration: 0.936 seconds, stereo, 48,000 Hz in the test AudioContext.
- Private local setting: `VITE_LOCAL_FOOTSTEP_SAMPLE_URL=/artifacts/encyclopedia/audio/footstep.mp3` in ignored `.env.local`.
- Audio rights attribution: Kinetic Games. The source repository also identifies game audio as Kinetic's property rather than part of its software licence.

The recording is available only when Vite runs in development mode and that local setting is present. It is kept under ignored `artifacts`, outside `public`, and is not imported as a build asset. Production builds retain the labelled synthesized player. This deliberately prevents a later GitHub Pages build from unintentionally publishing the recording. No permission to republish the isolated game audio has been established: Kinetic's [Gaming Content Guidelines](https://www.kineticgames.co.uk/gaming-content-guidelines) restrict standalone publication of sound effects outside ordinary gameplay context.

The optional recording is fetched and decoded on the first playback gesture, then its buffer is reused. Failed loads can be retried; errors are reported rather than silently playing a different sound. Stopping or navigating during download cannot start audio afterwards. Disposal aborts an active download and closes the AudioContext.

Browser verification confirmed the recorded label, successful MP3 decoding, non-silent audio, unmodified playback rate (1), correct Aswang intervals, single decode across repeat playback and no page exceptions. Machine-readable evidence is saved to `artifacts/encyclopedia/audio/verification.json`. This checks scheduling and the actual audio buffer, not a human speaker/headphone audition or a controlled comparison with the current installed game build.

The earlier listing-view report describes the original synthesized implementation. This note supersedes that report only for this locally configured development preview. Publishing the encyclopedia source does not publish this recording; production builds continue to use the labelled synthesized footsteps.
