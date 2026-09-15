import { isHidden } from '../../state/shareConfig.ts';

import ListInputPanel from './components/ListInputPanel.tsx';
import ListResultPanel from './components/ListResultPanel.tsx';
import QueryPanel from './components/QueryPanel.tsx';

/**
 * The list page: a column of structures in, the same structures out — written
 * every way, and searchable.
 *
 * Converting a list and searching one are the same list and the same reading,
 * so they are the same page: the table a conversion fills is the table a query
 * narrows, and what is left is what every download holds. It runs both ways,
 * it answers a substructure query, and it runs here, so a list of ten thousand
 * never leaves the browser.
 * @returns The lists page.
 */
export default function ListsPage() {
  return (
    <div className="lists">
      <div className="panel-stack">
        {isHidden('load') ? null : <ListInputPanel />}
        <QueryPanel />
      </div>
      <div className="panel-stack">
        <ListResultPanel />
      </div>
    </div>
  );
}
