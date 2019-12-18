// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactElement, Fragment, useEffect, useState} from 'react'
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Grid, Button, Header} from 'semantic-ui-react'
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AudioSettings from '../audio-settings';
import {Consumer, RecordedVoiceItem, UsingState, VoiceItem} from '../../types';

interface RecordingStudioProps {
    voiceList: VoiceItem[];
    projectFolder: string;
    scales: string[];
}

interface VoiceSamplesOnFileSystemState {
    [scale: string]: RecordedVoiceItem[];
}

const ensureFolderExists = async (folderPath: string): Promise<void> => {
    if (!fs.existsSync(folderPath) || !(await fs.promises.lstat(folderPath)).isDirectory()) {
        return fs.promises.mkdir(folderPath);
    }
};

const fileExistsAndIsNotEmpty = async (filePath: string): Promise<boolean> => {
    if (fs.existsSync(filePath)) {
        const fileStats = await fs.promises.lstat(filePath);
        return fileStats.isFile() && fileStats.size > 0;
    }
    return false;
};

interface VoiceItemSelectorProps {
    voiceList: VoiceItem[];
    voiceItemIndex: number;
    setVoiceItemIndex: Consumer<number>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VoiceItemSelector = ({voiceList, voiceItemIndex, setVoiceItemIndex}: VoiceItemSelectorProps): ReactElement => {
    return (
        <Fragment>
            {voiceList.map((voiceItem, i): ReactElement => {
                return (
                    <div key={i} onClick={(): void => setVoiceItemIndex(i)}>
                        {voiceItem.displayText + ((voiceItemIndex === i) ? ': Selected' : '')}
                    </div>
                );
            })}
        </Fragment>
    );
};

interface ScaleSelectorProps {
    scales: string[];
    scaleIndex: number;
    setScaleIndex: Consumer<number>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ScaleSelector = ({scales, scaleIndex, setScaleIndex}: ScaleSelectorProps): ReactElement => {
    return (
        <Grid.Column>
            {scales.map((scale, i): ReactElement => {
                return (
                    <Button key={i} onClick={(): void => setScaleIndex(i)} disabled={i === scaleIndex}>
                        {scale}
                    </Button>
                );
            })}
        </Grid.Column>
    );
};

const RecordingStudio = ({voiceList, projectFolder, scales}: RecordingStudioProps): ReactElement => {
    const [recordingFileState, setRecordingFileState]: UsingState<VoiceSamplesOnFileSystemState> = useState({});
    const [scaleIndex, setScaleIndex] = useState(0);
    const [voiceItemIndex, setVoiceItemIndex] = useState(0);
    const [recording, setRecording] = useState(false);

    useEffect((): void => {
        if (voiceList.length && projectFolder && scales.length) {
            (async (): Promise<void> => {
                await ensureFolderExists(projectFolder);
                await Promise.all(
                    scales.map(async (scale): Promise<void> => {
                        const subFolderPath = path.join(projectFolder, scale);
                        await ensureFolderExists(subFolderPath);

                        recordingFileState[scale] = await Promise.all(
                            voiceList.map(async (voiceItem): Promise<RecordedVoiceItem> => {
                                const voiceItemPath = path.join(subFolderPath, voiceItem.fileSystemName + '.wav');

                                return {
                                    ...voiceItem,
                                    audioData: (await fileExistsAndIsNotEmpty(voiceItemPath)) ? {} : undefined,
                                }
                            }));
                    }));
                setRecordingFileState(recordingFileState);
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    return (
        <Grid columns={16} divided={true}>
            <AudioSettings/>
            <Grid.Row divided={false}>
                <Grid.Column width={5}>
                    <VoiceItemSelector
                        voiceList={voiceList}
                        voiceItemIndex={voiceItemIndex}
                        setVoiceItemIndex={setVoiceItemIndex}
                    />
                </Grid.Column>
                <Grid.Column width={11}>
                    <Grid columns={11}>
                        <Grid.Row divided={true}>
                            <Grid.Column width={9}>
                                <ScaleSelector
                                    scales={scales}
                                    scaleIndex={scaleIndex}
                                    setScaleIndex={setScaleIndex}
                                />
                            </Grid.Column>
                            <Grid.Column width={2}>
                                <Button onClick={(): void => {setRecording(!recording)}} secondary={recording}>
                                    {recording ? 'Recording' : 'Record'}
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            {recording ? <Header as={'h3'}>Recording In Progress...</Header> : (
                                <pre>
                                    {recordingFileState[scales[scaleIndex]] && JSON.stringify(recordingFileState[scales[scaleIndex]][voiceItemIndex], null, 2)}
                                </pre>
                            )}
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

export default RecordingStudio;
