import React, { useState, useEffect, useContext } from 'react';

import { Card, CardContent, useContent, useCardState } from 'translation-helps-rcl';
import { AppContext } from '../../context';
import ListWords from './ListWords';

export default function SupportTWL(props) {
  const {
    state: { switchUniqueWords },
  } = useContext(AppContext);
  const { title, classes, onClose, type, server, fontSize, reference, resource } = props;
  const { bookId, chapter, verse } = reference;
  const [selectedQuote, setQuote] = useState({});
  const [uniqueWordsItems, setUniqueWordsItems] = useState();
  const {
    markdown,
    items,
    tsvs,
    resourceStatus: { loading },
    props: { languageId },
  } = useContent({
    projectId: bookId,
    ref: resource.branch ?? 'master',
    languageId: resource.languageId ?? 'ru',
    resourceId: 'twl',
    owner: resource.owner ?? 'door43-catalog',
    server,
  });
  console.log(tsvs, items);
  useEffect(() => {
    if (items && switchUniqueWords) {
      const uniqueWordsItems = [];
      const checkItems = [];
      items.forEach((item) => {
        if (!checkItems.includes(item.TWLink)) {
          uniqueWordsItems.push(item);
          checkItems.push(item.TWLink);
        }
      });
      setUniqueWordsItems(uniqueWordsItems);
    }
  }, [items, switchUniqueWords]);

  const {
    state: { item, headers, filters, itemIndex, markdownView },
    actions: { setFilters, setItemIndex, setMarkdownView },
  } = useCardState({
    items: switchUniqueWords ? uniqueWordsItems : items,
    setQuote,
    selectedQuote,
    verse,
    chapter,
    projectId: bookId,
  });
  useEffect(() => {
    setItemIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <Card
      closeable
      title={title}
      onClose={() => onClose(type)}
      classes={classes}
      id={type}
      items={switchUniqueWords ? uniqueWordsItems : items}
      headers={headers}
      filters={filters}
      fontSize={fontSize}
      itemIndex={itemIndex}
      setFilters={setFilters}
      setItemIndex={setItemIndex}
      markdownView={markdownView}
      setMarkdownView={setMarkdownView}
      showSaveChangesPrompt={() => {
        return new Promise((resolve, reject) => {
          resolve();
        });
      }}
    >
      <ListWords />
      <CardContent
        item={item}
        viewMode={'markdown'}
        filters={filters}
        fontSize={fontSize}
        markdown={markdown}
        isLoading={Boolean(loading)}
        languageId={languageId}
        markdownView={markdownView}
        selectedQuote={selectedQuote}
        setQuote={setQuote}
      />
    </Card>
  );
}
