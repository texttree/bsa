import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { AppContext, ReferenceContext } from '../../context';

import {
  langs,
  subjects,
  owners,
  blackListResources,
  bibleSubjects,
  obsSubjects,
} from '../../config/materials';
import { defaultCard, server } from '../../config/base';
import { getXY } from '../../core/matrix';
import { getUniqueResources } from '../../helper';

import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from './style';

function SearchResources({ anchorEl, onClose, open }) {
  const {
    state: { appConfig, resourcesApp },
    actions: { setAppConfig, setResourcesApp },
  } = useContext(AppContext);

  const {
    state: {
      referenceSelected: { bookId },
    },
  } = useContext(ReferenceContext);

  const { t } = useTranslation();
  const classes = useStyles();

  const [currentLang] = useState(langs[0]);

  const uniqueResources = getUniqueResources(appConfig, resourcesApp);

  const handleAddMaterial = (item) => {
    const pos = getXY(appConfig);
    setAppConfig((prev) =>
      prev.concat({ ...defaultCard, x: pos.x, y: pos.y, i: item.name })
    );
    onClose();
    setTimeout(function () {
      window.scrollTo(0, 10000);
    }, 1000);
  };

  useEffect(() => {
    axios
      .get(
        server +
          '/api/catalog/v5/search?sort=lang,title&owner=' +
          owners.join(',') +
          '&lang=' +
          langs.join(',') +
          '&subject=' +
          subjects.join(',')
      )
      .then((res) => {
        const result = res.data.data
          .map((el) => {
            return {
              id: el.id,
              languageId: el.language,
              name: el.name,
              subject: el.subject,
              title: el.title,
              ref: el.default_branch,
              owner: el.owner.toString().toLowerCase(),
              link: el.full_name + '/' + el.default_branch,
            };
          })
          .filter(
            (el) =>
              !blackListResources.some(
                (value) =>
                  JSON.stringify(value) ===
                  JSON.stringify({ owner: el.owner, name: el.name })
              )
          );
        setResourcesApp(result);
      })
      .catch((err) => console.log(err));
    return () => {};
  }, [currentLang, setResourcesApp]);
  let blockLang = '';
  const currentSubjects = bookId === 'obs' ? obsSubjects : bibleSubjects;
  const menuItems = uniqueResources
    .filter((el) => currentSubjects.includes(el.subject))
    .map((el) => {
      if (blockLang !== el.languageId) {
        blockLang = el.languageId;
        return (
          <div key={el.id}>
            <p className={classes.divider}>{t(el.languageId)}</p>
            <MenuItem onClick={() => handleAddMaterial(el)}>{el.title}</MenuItem>
          </div>
        );
      } else {
        return (
          <MenuItem key={el.id} onClick={() => handleAddMaterial(el)}>
            {el.title}
          </MenuItem>
        );
      }
    });

  return (
    <Menu
      color="transparent"
      anchorEl={anchorEl}
      keepMounted
      open={open}
      onClose={onClose}
    >
      {menuItems}
    </Menu>
  );
}

export default SearchResources;
