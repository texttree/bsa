import React, { useState, useEffect } from 'react';

import {
  ResourcesContextProvider,
  ReferenceSelectedContextProvider,
} from 'scripture-resources-rcl';

import { Workspace } from 'resource-workspace-rcl';
import Chapter from './components/Chapter';
import SupportQuestion from './components/SupportQuestion';
import SupportNotes from './components/SupportNotes';
import BookList from './components/BookList/BookList';

import { AppBar, Button, Toolbar, Dialog, DialogContent } from '@material-ui/core';
import MenuBar from './components/MenuBar/MenuBar';
import { makeStyles } from '@material-ui/core/styles';
import './styles/app.css';

import { bibleList } from './components/config';

const config = { server: 'https://git.door43.org' };

const useStyles = makeStyles(() => ({
  root: {
    padding: '0 !important',
    margin: '0 1px !important',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  dragIndicator: {},
}));

const _absoluteLayout =
  localStorage.getItem('layout') != null
    ? JSON.parse(localStorage.getItem('layout'))
    : [
        { w: 4, h: 5, x: 0, y: 0, i: '1' },
        { w: 4, h: 5, x: 4, y: 0, i: '2' },
        { w: 4, h: 5, x: 8, y: 0, i: '3' },
        { w: 6, h: 3, x: 0, y: 6, i: '4' },
        { w: 6, h: 3, x: 6, y: 6, i: '5' },
      ];

const _resourceLinks = ['bsa/ru/rlob/master', 'bsa/ru/rsob/master', 'bsa/ru/rob/master'];
//const _resourceLinks = ['unfoldingWord/en/ult/master', 'unfoldingWord/en/ust/master', 'bsa/ru/rob/master'];

export default function App() {
  const [resourceLinks, setResourceLinks] = useState(_resourceLinks);
  const [resources, setResources] = useState([]);
  const [showBookSelect, setShowBookSelect] = React.useState(false);

  const [referenceSelected, setReferenceSelected] = useState({
    bookId: 'tit',
    chapter: 1,
  });

  localStorage.setItem('layout', JSON.stringify(_absoluteLayout));
  const [absoluteLayout, setAbsoluteLayout] = useState(_absoluteLayout);

  const layout = {
    absolute: absoluteLayout,
  };

  function onLayoutChange(layout) {
    localStorage.setItem('layout', JSON.stringify(layout));
  }

  const onClose = (index) => {
    setAbsoluteLayout(layout.absolute.filter((el) => el.i !== index));
  };

  const classes = useStyles();

  const onBook = (project) => {
    setShowBookSelect(false);
    setReferenceSelected({
      ...referenceSelected,
      bookId: project ? project.identifier : null,
    });
  };

  // useEffect(() => {
  // });

  useEffect(() => {
    if (referenceSelected?.verse) {
      console.log(
        'Reference: ' + referenceSelected?.chapter + ':' + referenceSelected?.verse
      );
    }
  }, [referenceSelected?.chapter, referenceSelected?.verse]);

  return (
    <ResourcesContextProvider
      reference={referenceSelected}
      resourceLinks={resourceLinks}
      defaultResourceLinks={_resourceLinks}
      onResourceLinks={setResourceLinks}
      resources={resources}
      onResources={setResources}
      config={config}
    >
      <ReferenceSelectedContextProvider
        referenceSelected={referenceSelected}
        onReferenceSelected={setReferenceSelected}
      >
        <MenuBar />
        <AppBar position="relative">
          <Toolbar style={{ margin: '0 auto' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowBookSelect(!showBookSelect)}
            >
              {
                bibleList.filter(
                  (book) => book.identifier === referenceSelected.bookId
                )[0]?.rutitle
              }{' '}
            </Button>
            <Button
              style={{ marginLeft: '10px' }}
              variant="contained"
              color="secondary"
              onClick={() => setShowBookSelect(!showBookSelect)}
            >
              {referenceSelected.chapter} гл.
            </Button>
          </Toolbar>
        </AppBar>
        <Dialog
          fullWidth={true}
          maxWidth={true}
          open={showBookSelect}
          onClose={() => setShowBookSelect(false)}
        >
          <DialogContent>
            <BookList onBook={onBook} />
          </DialogContent>
        </Dialog>
        <Workspace
          gridMargin={[15, 15]}
          classes={classes}
          layout={layout}
          onLayoutChange={onLayoutChange}
        >
          <Chapter
            type="0"
            title="RLOB"
            classes={classes}
            onClose={onClose}
            index={'1'}
            reference={referenceSelected}
            onReference={setReferenceSelected}
          />
          <Chapter
            type="1"
            title="RSOB"
            classes={classes}
            onClose={onClose}
            index={'2'}
            reference={referenceSelected}
            onReference={setReferenceSelected}
          />
          <Chapter
            type="2"
            title="ROB"
            classes={classes}
            onClose={onClose}
            index={'3'}
            reference={referenceSelected}
            onReference={setReferenceSelected}
          />
          <SupportQuestion title="TQ" classes={classes} onClose={onClose} index={'4'} />
          <SupportNotes title="TN TSV" classes={classes} onClose={onClose} index={'5'} />
        </Workspace>
      </ReferenceSelectedContextProvider>
    </ResourcesContextProvider>
  );
}
