# aie

A cross-platform audio recorder that is optimized for voice-list recording.
Voice list is a list of symbols that denote phonemes to be recorded by human voice suppliers.
Usually, voice lists are used in the production of voicebanks.

# Setup
## Build for Windows
If you have any compiler error when building `fs-xattr` (marked as optional dependency
but is actually required to build for Windows), try using NodeJS 10 instead of 12.

You also need to install Wine. On macOS, you can install via HomeBrew:
```bash
brew install wine
```
