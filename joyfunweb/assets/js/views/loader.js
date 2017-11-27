import MainView    from './main';
import PagePaintingView from './page/painting';

// Collection of specific view modules
const views = {
  PagePaintingView,
};

export default function loadView(viewName) {
  return views[viewName] || MainView;
}