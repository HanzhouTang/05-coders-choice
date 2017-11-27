// reference from https://blog.diacode.com/page-specific-javascript-in-phoenix-framework-pt-1
// Load module for different page by viewName
import MainView    from './main';
import PagePaintingView from './page/painting';

// Collection of specific view modules
const views = {
  PagePaintingView,
};

export default function loadView(viewName) {
  return views[viewName] || MainView;
}