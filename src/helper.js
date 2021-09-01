export const getResources = (appConfig, resourcesApp) => {
  const resources = [];
  if (appConfig.length > 0) {
    appConfig.forEach((el) => {
      resourcesApp.forEach((r_el) => {
        if (
          r_el?.subject &&
          [
            'Bible',
            'Aligned Bible',
            'Hebrew Old Testament',
            'Greek New Testament',
          ].includes(r_el.subject) &&
          r_el.name === el.i
        ) {
          resources.push(r_el.link);
        }
      });
    });
  }
  return resources;
};

export const getBookList = (bibleList, t) => {
  const result = [];
  bibleList.forEach((el) => {
    result.push({ key: el.identifier, name: t(el.identifier), label: t(el.identifier) });
  });
  return result;
};

export const getUniqueResources = (appConfig, resourcesApp) => {
  if (appConfig.length === 0) {
    return resourcesApp;
  }
  const opened = appConfig.map((el) => el.i);
  return resourcesApp.filter((el) => !opened.includes(el.name));
};

// +
const getText = (verseObject) => {
  return verseObject.text || verseObject.nextChar || '';
};

// +
const getFootnote = (verseObject) => {
  return '/fn ' + verseObject.content + ' fn/';
};

// +
const getMilestone = (verseObject, showUnsupported) => {
  const { tag, children } = verseObject;

  switch (tag) {
    case 'k':
      return children.map((child) => getObject(child, showUnsupported)).join(' ');
    case 'zaln':
      if (children.length === 1 && children[0].type === 'milestone') {
        return getObject(children[0], showUnsupported);
      } else {
        return getAlignedWords(children);
      }
    default:
      return '';
  }
};

// +
const getAlignedWords = (verseObjects) => {
  return verseObjects
    .map((verseObject) => {
      return getWord(verseObject);
    })
    .join('');
};

// +
const getSection = (verseObject) => {
  return verseObject.content;
};

// +
const getUnsupported = (verseObject) => {
  return (
    '/' +
    verseObject.tag +
    ' ' +
    (verseObject.content || verseObject.text) +
    ' ' +
    verseObject.tag +
    '/'
  );
};

// +
const getWord = (verseObject) => {
  return verseObject.text || verseObject.content;
};

export const getVerseText = (verseObjects, showUnsupported = false) => {
  return verseObjects
    .map((verseObject) => getObject(verseObject, showUnsupported))
    .join('');
};

const getObject = (verseObject, showUnsupported) => {
  const { type } = verseObject;

  switch (type) {
    case 'quote':
    case 'text':
      return getText(verseObject);
    case 'milestone':
      return getMilestone(verseObject, showUnsupported);
    case 'word':
      if (verseObject.strong) {
        return getAlignedWords([verseObject]);
      } else {
        return getWord(verseObject);
      }
    case 'section':
      return getSection(verseObject);
    case 'paragraph':
      return '\n';
    case 'footnote':
      return getFootnote(verseObject);
    default:
      if (showUnsupported) {
        return getUnsupported(verseObject);
      } else {
        return '';
      }
  }
};

export const langArrToObject = (langs) => {
  let result = {};
  langs.forEach((el) => {
    result[el] = { translation: require(`./config/locales/${el}/translation.json`) };
  });
  return result;
};

export const checkLSVal = (el, val, isString = true, ext = false) => {
  let value;
  if (isString) {
    value = localStorage.getItem(el);
  } else {
    try {
      value = JSON.parse(localStorage.getItem(el));
    } catch (error) {
      localStorage.setItem(el, isString ? val : JSON.stringify(val));
      return val;
    }
  }

  if (value === null || (ext && !value[ext])) {
    localStorage.setItem(el, isString ? val : JSON.stringify(val));
    return val;
  } else {
    return value;
  }
};

export const animate = ({ timing, draw, duration = 1000 }) => {
  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timing(timeFraction);

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
};
const easeInOut = (timeFraction) => {
  if (timeFraction < 0.5) {
    return timeFraction * timeFraction * 2;
  } else {
    return 1 - (1 - timeFraction) * (1 - timeFraction) * 2;
  }
};

/*const linear = (timeFraction) => {
  return timeFraction;
};*/

export const animateScrollTo = (currentVerse, position) => {
  if (!currentVerse.clientHeight && !currentVerse.parentNode?.clientHeight) {
    return false;
  }
  const duration = 1000;
  const draw = (tf) => {
    let offset = 0;
    const top = currentVerse.offsetTop - 12;
    switch (position) {
      case 'center':
        offset = currentVerse.clientHeight / 2 - currentVerse.parentNode.clientHeight / 2;
        break;
      case 'top':
      default:
        break;
    }
    currentVerse.parentNode.scrollTop =
      currentVerse.parentNode.scrollTop * (1 - tf) + (top + offset) * tf;
  };
  animate({ timing: easeInOut, draw, duration });
};

export const scrollTo = (currentVerse, position) => {
  let offset = 0;
  const top = currentVerse.offsetTop - 12;
  switch (position) {
    case 'center':
      offset = currentVerse.clientHeight / 2 - currentVerse.parentNode.clientHeight / 2;
      break;
    case 'top':
    default:
      break;
  }
  currentVerse.parentNode.scrollTo({
    top: top + offset,
    left: 0,
    behavior: 'smooth',
  });
};
