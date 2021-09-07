import React from 'react';
import Mindplot from '@wismapping/web2d';

const App = (): React.ReactElement => {
    const mindplot = Mindplot();
    console.log(mindplot);
    return <div>Webcomponent</div>;
};

export default App;
