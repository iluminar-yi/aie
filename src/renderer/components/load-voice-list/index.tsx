// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactElement, useState, MouseEventHandler, ChangeEventHandler} from 'react'
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Button, Form, Grid, Header, Label} from 'semantic-ui-react'
import {Consumer, Environment, PageState, UsingState, VoiceItem} from '../../types';
import {i18n} from '../../services/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import I18nText from '../i18n-text';
import {Locale} from '../../types/i18n';
import lineByLineParser from './line-by-line-parser';
import * as fs from 'fs';

interface LoadVoiceListProps {
    setPageState: Consumer<PageState>;
    setVoiceList: Consumer<VoiceItem[]>;
    environment: Environment;
}

const LoadVoiceList = ({setPageState, setVoiceList, environment}: LoadVoiceListProps): ReactElement => {
    const {locale} = environment;
    const [voiceListFilePath, setVoiceListFilePath]: UsingState<null | string> = useState(null as (null | string));

    const onVoiceListFileSelected: ChangeEventHandler<HTMLInputElement> = (e): void => {
        if (!e.target.files) {
            // TODO: Is this possible?
            return;
        }

        setVoiceListFilePath(e.target.files[0].path);
    };

    const readVoiceListFile: MouseEventHandler<HTMLButtonElement> = (e): void => {
        e.preventDefault();

        if (voiceListFilePath) {
            fs.promises.readFile(voiceListFilePath)
                .then((content): Promise<VoiceItem[]> => lineByLineParser.parse(content.toString()))
                .then((voiceItems): void => {
                    setVoiceList(voiceItems);
                    setPageState('/create-project');
                })
                .catch((e): void => alert(`Failed to read parse voice list, reason: ${e instanceof Error ? e.message : e}`));
        } else {
            alert('No file was chosen!');
        }
    } ;

    return (
        <Grid columns={16}>
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Header as={'h3'}>
                        <I18nText i18nKey={'voice.list.page.header'} locale={locale}/>
                    </Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
                <Form>
                    <Grid.Column>
                        <Label htmlFor="voice-list-file"><I18nText i18nKey={'voice.list.page.help.text'} locale={locale}/></Label>
                    </Grid.Column>
                    <Grid.Column>
                        <input
                            type="file"
                            id="voice-list-file"
                            name="voice-list-file"
                            onChange={onVoiceListFileSelected}
                        />
                    </Grid.Column>
                </Form>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={10}>
                    {voiceListFilePath ? <span>Path: {voiceListFilePath}</span> : <span>No file selected yet!</span>}
                </Grid.Column>
                <Grid.Column width={6}>
                    <Button onClick={readVoiceListFile}>Load Voice List</Button>
                </Grid.Column>
                <Grid.Column width={2}>
                    <Button onClick={(): void => setVoiceList([])}>Clear</Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

i18n.register({
    'voice.list.page.help.text': {
        [Locale.ZH_CN]: '选择录音表文件',
        [Locale.EN_US]: 'Choose the voice list file',
    },
},
{
    'voice.list.page.header': {
        [Locale.ZH_CN]: '读取录音表',
        [Locale.EN_US]: 'Load the Voice List',
    },
},
);

export default LoadVoiceList;
