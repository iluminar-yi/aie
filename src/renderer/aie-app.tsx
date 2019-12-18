// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactElement, useState} from 'react'
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Button, Grid} from 'semantic-ui-react'
import {Environment, PageState, UsingState} from './types';
import {Locale} from './types/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {VoiceItem} from './types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LoadVoiceList from './components/load-voice-list';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RecordingStudio from './components/recording-studio';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CreateProject from './components/create-project';

let inited = false;
const localStorage = window.localStorage;

const AieApp = (): ReactElement => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [environment, setEnvironment]: UsingState<Environment> = useState({
        locale: Locale.ZH_CN,
    });
    const [pageState, setPageState]: UsingState<PageState> = useState('/' as PageState);
    const [voiceList, setVoiceList]: UsingState<VoiceItem[]> = useState([] as VoiceItem[]);
    const [projectFolder, setProjectFolder]: UsingState<string> = useState('');
    const [scales, setScales]: UsingState<string[]> = useState([] as string[]);

    if (!inited) {
        const environment = localStorage.getItem('environment');
        if (environment) {
            setEnvironment(JSON.parse(environment));
        }
        const pageState = localStorage.getItem('pageState');
        if (pageState) {
            setPageState(JSON.parse(pageState));
        }
        const voiceList = localStorage.getItem('voiceList');
        if (voiceList) {
            setVoiceList(JSON.parse(voiceList));
        }
        const projectFolder = localStorage.getItem('projectFolder');
        if (projectFolder) {
            setProjectFolder(JSON.parse(projectFolder));
        }
        const scales = localStorage.getItem('scales');
        if (scales) {
            setScales(JSON.parse(scales));
        }

        inited = true;
    }

    const routePageToComponent = (): ReactElement => {
        switch (pageState) {
            case '/create-project':
                return <CreateProject
                    setPageState={setPageState}
                    projectFolder={projectFolder}
                    setProjectFolder={setProjectFolder}
                    scales={scales}
                    setScales={setScales}
                />;
            case '/recording-studio':
                return <RecordingStudio
                    voiceList={voiceList}
                    projectFolder={projectFolder}
                    scales={scales}/>;
            case '/':
                return <LoadVoiceList
                    setPageState={setPageState}
                    setVoiceList={setVoiceList}
                    environment={environment}/>;
            default:
                throw new Error(`Unknown pageState: ${pageState}`);
        }
    };
    const rendered = (
        <Grid>
            <Grid.Row>
                <Grid.Column>
                    {routePageToComponent()}
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Button onClick={(): void => setPageState('/')}>/</Button>
                    <Button onClick={(): void => setPageState('/create-project')}>/create-project</Button>
                    <Button onClick={(): void => setPageState('/recording-studio')}>/recording-studio</Button>
                    <pre>{JSON.stringify({environment, pageState, voiceList, projectFolder, scales, inited}, null, 2)}</pre>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );

    {
        localStorage.setItem('environment', JSON.stringify(environment));
        localStorage.setItem('pageState', JSON.stringify(pageState));
        localStorage.setItem('voiceList', JSON.stringify(voiceList));
        localStorage.setItem('projectFolder', JSON.stringify(projectFolder));
        localStorage.setItem('scales', JSON.stringify(scales));
    }

    return rendered;
};

export default AieApp;
