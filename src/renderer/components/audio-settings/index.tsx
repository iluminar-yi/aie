import * as log from 'electron-log';
import React, { EffectCallback, Fragment, MutableRefObject, ReactElement, createRef, useEffect, useState } from 'react';
import { Button, Checkbox, Grid, Input, Label } from 'semantic-ui-react';

import { ChromeHTMLAudioElement, Consumer, UsingState } from '../../types';
import { StudioState } from '../recording-studio';
import SizedDiv from '../sized-div';

const checkDeviceInfoListEqual = (l1: MediaDeviceInfo[], l2: MediaDeviceInfo[]): boolean => {
  if (l1 === l2) {
    return true;
  }
  if (l1.length !== l2.length) {
    return false;
  }
  const deviceInfoEqual = (i1: MediaDeviceInfo, i2: MediaDeviceInfo): boolean => {
    return i1.groupId === i2.groupId && i1.deviceId === i2.deviceId && i1.label === i2.label && i1.kind === i2.kind;
  };
  for (const i of l1) {
    let found = false;
    for (const j of l2) {
      if (deviceInfoEqual(i, j)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};

interface AudioSettingsProps {
  recording: StudioState;
  recordedChunks: Blob[];
  onRecorderStopRef: MutableRefObject<() => void>;
  inputDeviceId: string;
  setInputDeviceId: Consumer<string>;
  outputDeviceId: string;
  setOutputDeviceId: Consumer<string>;
  volume: number;
  setVolume: Consumer<number>;
  lastUpdatedTime: Date;
}

const getDummyAudioContext = (): AudioContext => {
  const dummy = new AudioContext();
  dummy.close();
  return dummy;
};

const AudioSettings = ({
  recording,
  recordedChunks,
  onRecorderStopRef,
  inputDeviceId,
  setInputDeviceId,
  outputDeviceId,
  setOutputDeviceId,
  volume,
  setVolume,
  lastUpdatedTime,
}: AudioSettingsProps): ReactElement => {
  const [audioInputDevices, setAudioInputDevices]: UsingState<MediaDeviceInfo[]> = useState([] as MediaDeviceInfo[]);
  const [audioOutputDevices, setAudioOutputDevices]: UsingState<MediaDeviceInfo[]> = useState([] as MediaDeviceInfo[]);
  const [audioInputStream, setAudioInputStream]: UsingState<null | MediaStream> = useState(null as null | MediaStream);
  const [, setAudioCtx] = useState(getDummyAudioContext);
  const [muted, setMuted] = useState(true);
  const [recorder, setRecorder] = useState(null as null | MediaRecorder);
  const [audioElementRef] = useState(() => createRef<ChromeHTMLAudioElement>());

  const refreshAudioDevices: EffectCallback = () => {
    log.debug('Refresh audio devices');
    window.navigator.mediaDevices.enumerateDevices().then((mediaDevices): void => {
      const newAudioInputDevices = mediaDevices.filter((mediaDevice): boolean => mediaDevice.kind === 'audioinput');
      const audioInputDeviceIds = newAudioInputDevices.map((audioInputDevice): string => audioInputDevice.deviceId);
      const newAudioOutputDevices = mediaDevices.filter((mediaDevice): boolean => mediaDevice.kind === 'audiooutput');
      const audioOutputDeviceIds = newAudioOutputDevices.map((audioOutputDevice): string => audioOutputDevice.deviceId);

      if (!(inputDeviceId && audioInputDeviceIds.includes(inputDeviceId))) {
        setInputDeviceId(audioInputDeviceIds[0]);
      }
      if (!(outputDeviceId && audioOutputDeviceIds.includes(outputDeviceId))) {
        setOutputDeviceId(audioOutputDeviceIds[0]);
      }
      if (!checkDeviceInfoListEqual(newAudioInputDevices, audioInputDevices)) {
        setAudioInputDevices(newAudioInputDevices);
      }
      if (!checkDeviceInfoListEqual(newAudioOutputDevices, audioOutputDevices)) {
        setAudioOutputDevices(newAudioOutputDevices);
      }
    });
  };

  useEffect(refreshAudioDevices, [
    audioInputDevices,
    audioOutputDevices,
    inputDeviceId,
    lastUpdatedTime,
    outputDeviceId,
    setInputDeviceId,
    setOutputDeviceId,
  ]);

  useEffect((): void => {
    log.debug('Get audio permission callback');
    (async (): Promise<void> => {
      if (!inputDeviceId) {
        return;
      }
      const constraint: MediaStreamConstraints = {
        audio: {
          deviceId: inputDeviceId,
          sampleRate: 44100,
          channelCount: 1,
        },
      };
      const gatherAudioPermission = async (): Promise<MediaStream> => {
        return await window.navigator.mediaDevices.getUserMedia(constraint);
      };
      for (let attemptCount = 0; attemptCount < 3; attemptCount++) {
        try {
          const audioInputStream = await gatherAudioPermission();
          setAudioInputStream(audioInputStream);
          return;
        } catch (e) {
          alert(`We need to record audio in order to proceed${attemptCount < 2 ? ", let's try again." : '!'}`);
        }
      }
      throw new Error('Failed to gather audio permission!');
    })();
  }, [inputDeviceId]);

  useEffect((): void => {
    log.debug('Update output sink ID');
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      return;
    }
    audioElement.setSinkId(outputDeviceId);
  }, [audioElementRef, outputDeviceId]);

  useEffect(() => {
    log.debug('Update input source');
    if (!audioInputStream) {
      return;
    }
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      return;
    }
    const audioCtx = new AudioContext();
    setAudioCtx(audioCtx);
    const source = audioCtx.createMediaStreamSource(audioInputStream);
    const delay = audioCtx.createDelay(5);
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(delay);
    delay.connect(destination);
    audioElement.srcObject = destination.stream;
    setRecorder(
      new MediaRecorder(audioInputStream, {
        mimeType: 'audio/webm',
      }),
    );
    return (): void => {
      audioCtx.close();
    };
  }, [audioElementRef, audioInputStream]);

  useEffect((): void => {
    log.debug('Collect recording data');
    if (!recorder || !audioInputStream) {
      return;
    }
    // FIXME Currently this will break if the input stream switches during recording
    if (recording === StudioState.RECORDING && recorder.state !== 'recording') {
      recorder.ondataavailable = (e): void => {
        recordedChunks.push(e.data);
      };
      recorder.start();
    } else if (recorder.state !== 'inactive') {
      recorder.onstop = onRecorderStopRef.current;
      recorder.stop();
    }
  }, [audioInputStream, onRecorderStopRef, recordedChunks, recorder, recording]);

  useEffect((): void => {
    log.debug('Set volume');
    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  }, [audioElementRef, volume]);

  return (
    <Fragment>
      <Grid.Row columns={3}>
        <Grid.Column>
          <SizedDiv height={15}>
            {audioInputDevices.map(
              (audioInputDevice): ReactElement => {
                return (
                  <Grid.Row key={audioInputDevice.deviceId}>
                    <div onClick={(): void => setInputDeviceId(audioInputDevice.deviceId)}>
                      <Checkbox
                        checked={audioInputDevice.deviceId === inputDeviceId}
                        disabled={audioInputDevice.deviceId === inputDeviceId}
                      />
                      <span>{audioInputDevice.label}</span>
                    </div>
                  </Grid.Row>
                );
              },
            )}
          </SizedDiv>
        </Grid.Column>
        <Grid.Column>
          <SizedDiv height={15}>
            {audioOutputDevices.map(
              (audioOutputDevice): ReactElement => {
                return (
                  <Grid.Row key={audioOutputDevice.deviceId}>
                    <div onClick={(): void => setOutputDeviceId(audioOutputDevice.deviceId)}>
                      <Checkbox
                        checked={audioOutputDevice.deviceId === outputDeviceId}
                        disabled={audioOutputDevice.deviceId === outputDeviceId}
                      />
                      <span>{audioOutputDevice.label}</span>
                    </div>
                  </Grid.Row>
                );
              },
            )}
          </SizedDiv>
        </Grid.Column>
        <Grid.Column>
          <SizedDiv height={15}>
            <Button>Apply (Do Nothing)</Button>
            <Button onClick={(): void => setMuted(!muted)}>{muted ? 'Unmute' : 'Mute'}</Button>
            <Button onClick={refreshAudioDevices}>Refresh</Button>
            <Input
              name={'volume'}
              type={'range'}
              min={0}
              max={100}
              value={volume}
              onChange={(e): void => setVolume(Number(e.target.value))}
            />
            <Label htmlFor={'volume'}>Volume: {volume}</Label>
          </SizedDiv>
        </Grid.Column>
        <audio ref={audioElementRef} autoPlay={true} muted={muted} />
      </Grid.Row>
    </Fragment>
  );
};

export default AudioSettings;
