import React, { useEffect, useState, useContext } from 'react';

import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReferenceContext, AppContext } from '../../context';
import { ContextMenu } from '../ContextMenu';
import { useScrollToVerse } from '../../hooks';

const initialPositionContextMenu = {
  left: null,
  top: null,
};

function OBSContent({ markdown, verse, chapter, fontSize, type, goToBookChapterVerse }) {
  const [positionContextMenu, setPositionContextMenu] = useState(
    initialPositionContextMenu
  );
  const {
    state: { referenceSelected },
    actions: { setReferenceBlock },
  } = useContext(ReferenceContext);

  const {
    state: { switchObsImage },
  } = useContext(AppContext);

  const handleContextOpen = (event) => {
    event.preventDefault();
    setPositionContextMenu({
      left: event.clientX - 2,
      top: event.clientY - 4,
    });
  };

  const { t } = useTranslation();
  const [verses, setVerses] = useState();

  const [verseRef] = useScrollToVerse('center');

  const mdToVerses = (md) => {
    let _markdown = md.replaceAll('\u200B', '').split(/\n\s*\n\s*/);
    const headerMd = _markdown.shift().trim().slice(1);
    let linkMd = _markdown.pop().trim().slice(1, -1);
    if (linkMd === '') {
      linkMd = _markdown.pop().trim().slice(1, -1);
    }
    const versesObject = [];

    for (let n = 0; n < _markdown.length / 2; n++) {
      let urlImage;
      let text;
      if (/\(([^)]*)\)/g.test(_markdown[n * 2])) {
        urlImage = /\(([^)]*)\)/g.exec(_markdown[n * 2])[1];
        text = _markdown[n * 2 + 1];
      } else {
        text = _markdown[n * 2] + '\n' + _markdown[n * 2 + 1];
      }
      versesObject.push({ urlImage, text, key: (n + 1).toString() });
    }

    return { versesObject, headerMd, linkMd };
  };

  useEffect(() => {
    const verseStyle = {
      fontSize: fontSize + '%',
    };
    const headerStyle = {
      fontSize: fontSize * 1.4 + '%',
    };
    if (markdown) {
      const { versesObject, headerMd, linkMd } = mdToVerses(markdown);
      const contentMd = versesObject.map((item) => {
        const { key, urlImage, text } = item;

        return (
          <Box
            ref={(ref) => {
              key.toString() === verse.toString() &&
                verse.toString() !== '1' &&
                verseRef(ref);
            }}
            style={verseStyle}
            className={'verse'}
            bgcolor={key.toString() === verse.toString() ? 'primary.select' : ''}
            key={key}
            onClick={() => {
              goToBookChapterVerse('obs', chapter, key);
            }}
          >
            {urlImage && switchObsImage ? (
              <>
                <img src={urlImage} alt={`OBS verse #${key}`} />
                <br />
              </>
            ) : (
              ''
            )}
            <p>
              <sup style={{ marginRight: '3px' }}>{key.toString()}</sup>
              {text &&
                text.split('\n').map((el, index) => (
                  <span
                    key={index}
                    onContextMenu={(e) => {
                      setReferenceBlock({
                        ...referenceSelected,
                        resource: type,
                        verse: key,
                        text: el,
                      });
                      handleContextOpen(e);
                    }}
                  >
                    {el}
                  </span>
                ))}
            </p>
          </Box>
        );
      });
      const versesOBS = (
        <>
          <h1
            style={headerStyle}
            ref={(ref) => {
              '1' === verse.toString() && verseRef(ref);
            }}
          >
            {headerMd}
          </h1>
          {contentMd}
          <br />
          <i>{linkMd}</i>
          <br />
        </>
      );
      setVerses(versesOBS);
    } else {
      setVerses(<>{t('No_content')}</>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, verse, fontSize, switchObsImage]);

  return (
    <>
      {verses}
      <ContextMenu position={positionContextMenu} setPosition={setPositionContextMenu} />
    </>
  );
}

export default OBSContent;
