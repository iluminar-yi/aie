// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactElement, useState} from 'react'
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Button, Grid, Header} from 'semantic-ui-react'
import * as fs from 'fs';
import {Consumer, PageState, UsingState} from '../../types';
import {remote} from 'electron'

interface CreateProjectProps {
    setPageState: Consumer<PageState>;
    projectFolder: string;
    setProjectFolder: Consumer<string>;
    scales: string[];
    setScales: Consumer<string[]>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateProject = ({setPageState,
    projectFolder,
    setProjectFolder, 
    scales, 
    setScales,
}: CreateProjectProps): ReactElement => {
    const [userInputtedScale, setUserInputtedScale]: UsingState<string> = useState('');

    /**
     * Currently, the user has to choose the right directory on the first try.
     * We can break this function into two steps to make it less error-prone.
     */
    const getProjectFolderFromUser = async (): Promise<void> => {
        const {canceled, filePaths} = await remote.dialog.showOpenDialog({
            title: 'Select Project Output Folder',
            message: 'Please select a folder to save voice samples.',
            properties: [
                'openDirectory',
                'showHiddenFiles',
                'createDirectory',
                'promptToCreate',
            ],
        });

        if (canceled || !filePaths.length) {
            return;
        }
        const filepath = filePaths[0];

        if (fs.existsSync(filepath)) {
            const stat = await fs.promises.lstat(filepath);
            if (!stat.isDirectory()) {
                alert(`Selected path exists and is not a directory: ${filepath}!`);
                return;
            }
        } else {
            try {
                await fs.promises.mkdir(filepath);
                alert(`We created a new directory at ${filepath}`);
            } catch (e) {
                alert(`Failed to create new directory at ${filepath}!`);
                return;
            }
        }
        
        setProjectFolder(filepath);
    };

    // Set output folder and scale
    return (
        <Grid columns={16} divided='vertically'>
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Header as={'h3'}>
                        'Create a Project'
                    </Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={4}>
                    <Button onClick={getProjectFolderFromUser}>Select Folder</Button>
                </Grid.Column>
                <Grid.Column width={12}>
                    {projectFolder ? <span>Folder path: {projectFolder}</span> : <span>No folder selected yet!</span>}
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={2}>
                    <span>Add Scales:</span>
                </Grid.Column>
                <Grid.Column width={4}>
                    <input
                        type={'text'}
                        value={userInputtedScale}
                        onChange={(e): void => setUserInputtedScale(e.target.value)}
                    />
                </Grid.Column>
                <Grid.Column width={3}>
                    <Button disabled={!userInputtedScale} onClick={(): void => setScales([...scales, userInputtedScale])}>Add</Button>
                </Grid.Column>
                <Grid.Column width={7}>
                    {scales.length ? <span>Added scales: {scales.join(', ')}</span> : <span>Please add at least one scale</span>}
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={2}>
                    <Button disabled={!(projectFolder && scales.length)} onClick={(): void => {
                        setProjectFolder(projectFolder);
                        setScales(scales);
                        setPageState('/recording-studio');
                    }}>Create!</Button>
                </Grid.Column>
                <Grid.Column width={2}>
                    <Button onClick={(): void => {
                        setProjectFolder('');
                        setScales([]);
                        setUserInputtedScale('');
                    }}>Clear</Button>
                </Grid.Column>
                <Grid.Column width={2}>
                    <Button onClick={(): void => setPageState('/')}>Back</Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

export default CreateProject;
