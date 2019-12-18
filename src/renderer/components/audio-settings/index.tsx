// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactElement, Fragment, useEffect, useState, RefObject} from 'react'
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Button, Checkbox, Form, Grid, Header} from 'semantic-ui-react'
import {ChromeHTMLAudioElement, UsingState} from '../../types';
import {arrayIn} from '../../../common/utilities';

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

const AudioSettings = (): ReactElement => {
    const [audioInputDevices, setAudioInputDevices]: UsingState<MediaDeviceInfo[]> = useState([] as MediaDeviceInfo[]);
    const [audioOutputDevices, setAudioOutputDevices]: UsingState<MediaDeviceInfo[]> = useState([] as MediaDeviceInfo[]);

    const [inputDeviceId, setInputDeviceId] = useState('');
    const [outputDeviceId, setOutputDeviceId] = useState('');
    const [audioInputStream, setAudioInputStream]: UsingState<null | MediaStream> = useState(null as (null | MediaStream));
    const [audioCtx, setAudioCtx] = useState(new AudioContext());
    const [muted, setMuted] = useState(true);

    const audioElementRef: RefObject<ChromeHTMLAudioElement> = React.createRef();

    useEffect((): void => {
        window.navigator.mediaDevices
            .enumerateDevices()
            .then((mediaDevices): void => {
                const newAudioInputDevices = mediaDevices.filter((mediaDevice): boolean => mediaDevice.kind === 'audioinput');
                const audioInputDeviceIds = newAudioInputDevices.map((audioInputDevice): string => audioInputDevice.deviceId);
                const newAudioOutputDevices = mediaDevices.filter((mediaDevice): boolean => mediaDevice.kind === 'audiooutput');
                const audioOutputDeviceIds = newAudioOutputDevices.map((audioOutputDevice): string => audioOutputDevice.deviceId);

                if (!(inputDeviceId && arrayIn(inputDeviceId, audioInputDeviceIds))) {
                    setInputDeviceId(audioInputDeviceIds[0]);
                }
                if (!(outputDeviceId && arrayIn(outputDeviceId, audioOutputDeviceIds))) {
                    setOutputDeviceId(audioOutputDeviceIds[0]);
                }
                if (!checkDeviceInfoListEqual(newAudioInputDevices, audioInputDevices)) {
                    setAudioInputDevices(newAudioInputDevices);
                }
                if (!checkDeviceInfoListEqual(newAudioOutputDevices, audioOutputDevices)) {
                    setAudioOutputDevices(newAudioOutputDevices);
                }
            });
    });

    useEffect((): void => {
        (async (): Promise<void> => {
            if (!inputDeviceId) {
                return;
            }
            const constraint: MediaStreamConstraints = {
                audio: {
                    advanced: [
                        {
                            deviceId: inputDeviceId,
                            sampleRate: 44100,
                            channelCount:1,
                        },
                    ],
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
                    alert(`We need to record audio in order to proceed${attemptCount < 2 ? ', let\'s try again.' : '!'}`);
                }
            }
            throw new Error('Failed to gather audio permission!');
        })();
    }, [inputDeviceId]);

    useEffect((): void => {
        const audioElement = audioElementRef.current;
        if (!audioElement) {
            return;
        }
        audioElement.setSinkId(outputDeviceId);
        // TODO address this warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outputDeviceId]);

    useEffect((): void => {
        if (!audioInputStream) {
            return;
        }
        const audioElement = audioElementRef.current;
        if (!audioElement) {
            return;
        }

        audioCtx.close();
        const newAudioCtx = new AudioContext();
        setAudioCtx(newAudioCtx);
        const source = newAudioCtx.createMediaStreamSource(audioInputStream);
        const delay = newAudioCtx.createDelay(5);
        const destination = newAudioCtx.createMediaStreamDestination();
        source.connect(delay);
        delay.connect(destination);
        audioElement.srcObject = destination.stream;
        // TODO address this warning
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioInputStream]);

    return (
        <Fragment>
            <Grid.Row>
                <Header as={'h4'}>Audio Settings</Header>
            </Grid.Row>
            <Grid.Row columns={3}>
                <Grid.Column>
                    {audioInputDevices.map((audioInputDevice): ReactElement => {
                        return (
                            <Grid.Row key={audioInputDevice.deviceId}>
                                <span>{audioInputDevice.label}</span>
                            </Grid.Row>
                        );
                    })}
                </Grid.Column>
                <Grid.Column>
                    {audioOutputDevices.map((audioOutputDevice): ReactElement => {
                        return (
                            <Grid.Row key={audioOutputDevice.deviceId}>
                                <span>{audioOutputDevice.label}</span>
                            </Grid.Row>
                        );
                    })}
                </Grid.Column>
                <Grid.Column>
                    <Button>Apply</Button>
                    <Button onClick={(): void => setMuted(!muted)}>{muted ? 'Unmute' : 'Mute'}</Button>
                </Grid.Column>
                <audio ref={audioElementRef} autoPlay={true} muted={muted}/>
            </Grid.Row>
        </Fragment>
    );
};

export default AudioSettings;
