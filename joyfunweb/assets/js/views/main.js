//reference from https://blog.diacode.com/page-specific-javascript-in-phoenix-framework-pt-1
// Here should be common codes for all pages, for this project, it's nothing 
export default class Main {
  mount() {
    // This will be executed when the document loads...
    console.log('MainView mounted');
  }

  unmount() {
    // This will be executed when the document unloads...
    console.log('MainView unmounted');
  }
}