# aie

Travis CI: [![Travis Build Status](https://travis-ci.com/iluminar-yi/aie.svg?branch=master)](https://travis-ci.com/iluminar-yi/aie)
AppVeyor CI: [![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/iluminar-yi/aie?branch=master&svg=true)](https://ci.appveyor.com/project/Iluminar/aie/branch/master)

A cross-platform audio recorder designed for recording using recording lists (a.k.a. reclists).
Recording lists are lists of symbols that denote phonemes to be recorded by human voice suppliers.
They are frequently used in the production of voice banks. 

# Usage Notes
## Linux
If you are on a Linux distro, please consider using [`AppImageLauncher`](https://github.com/TheAssassin/AppImageLauncher)
to execute the `.AppImage` file. Alternatively, you can use [`appimaged`](https://github.com/AppImage/appimaged) or 
simply make the file executable and run it (though you will lose some benefits, including seeing the app icon).

# Developer Setup
## Build for Windows
If you have any compiler error when building `fs-xattr` (marked as optional dependency
but is actually required to build for Windows), try using NodeJS 10 instead of 12.

You also need to install Wine. On macOS, you can install via [HomeBrew](https://brew.sh/):
```bash
# xquartz is the dependency of wine-stable
brew cask install xquartz wine-stable
```
