import React, { FunctionComponent, ReactElement, useState } from 'react';
import { Grid } from 'semantic-ui-react';

import CreateProject from './components/create-project';
import LoadRecordingList from './components/load-recording-list';
import RecordingStudio from './components/recording-studio';
import { loadOnInit, save } from './services/local-storage-persistance-service';
import { PageState, RecordingItem, UsingState } from './types';
import { Locale } from './types/i18n';

const AieApp: FunctionComponent = () => {
  const [environment, setEnvironment] = useState({
    locale: Locale.ZH_CN,
  });
  const [pageState, setPageState]: UsingState<PageState> = useState('start' as PageState);
  const [recordingList, setRecordingList]: UsingState<RecordingItem[]> = useState([] as RecordingItem[]);
  const [projectFolder, setProjectFolder]: UsingState<string> = useState('');
  const [scales, setScales]: UsingState<string[]> = useState([] as string[]);

  {
    loadOnInit({
      environment: setEnvironment,
      pageState: setPageState,
      recordingList: setRecordingList,
      projectFolder: setProjectFolder,
      scales: setScales,
    });
  }

  const routePageToComponent = (): ReactElement => {
    switch (pageState) {
      case 'create-project':
        return (
          <CreateProject
            setPageState={setPageState}
            projectFolder={projectFolder}
            setProjectFolder={setProjectFolder}
            scales={scales}
            setScales={setScales}
          />
        );
      case 'recording-studio':
        return (
          <RecordingStudio
            recordingList={recordingList}
            projectFolder={projectFolder}
            scales={scales}
            setPageState={setPageState}
          />
        );
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore Intended to fall through
      default:
        alert(`Unknown pageState: ${pageState}`);
      // eslint-disable-next-line no-fallthrough
      case 'start':
        return (
          <LoadRecordingList
            setPageState={setPageState}
            setRecordingList={setRecordingList}
            environment={environment}
          />
        );
    }
  };
  const rendered = (
    <div style={{ padding: '2vh' }}>
      <Grid>
        <Grid.Row>
          <Grid.Column>{routePageToComponent()}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <pre>
              {JSON.stringify(
                {
                  environment,
                  pageState,
                  recordingList,
                  projectFolder,
                  scales,
                },
                null,
                2,
              )}
            </pre>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );

  {
    save({ environment, pageState, recordingList, projectFolder, scales });
  }

  return rendered;
};

export default AieApp;
