// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';

ReactDOM.render(<div>
    <span>Hello world from React!</span>
    <p>
        We are using Node.js {process.versions.node},
        Chromium {process.versions.chrome},
        and Electron {process.versions.electron}.
    </p>
    <span id='sass-test'>This should be underlined.</span>
</div>, document.getElementById('app'));
