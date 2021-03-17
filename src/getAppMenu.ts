import Menu from './Menu';
import * as Storage from './Storage';
import Dialog from './Dialog';
import SavedList from './SavedList';

/** extract menu out of App */
const getAppMenu = (app: import('./App').default) => {
  const menu = new Menu();

  let lastLoadedId: ReturnType<typeof Storage.create>;

  menu.addMenuItem('📃 New', {
    callback: () => {
      lastLoadedId = '';
      menu.closeMenu();
      app.reset();
    },
  });

  menu.addMenuItem('💾 Save', {
    callback: () => {
      // save and prompt edit modal
      const exported = app.typewriter.export();
      const id = lastLoadedId || Storage.create(exported);
      let submit = 'Save Writing';
      let cancel = 'Delete';

      if (exported === '[]') {
        // empty should not be saved
        return;
      }

      if (lastLoadedId) {
        submit = 'Update Writing';
        cancel = 'Discard Changes';
      }

      const [item] = Storage.getDataById(id);

      menu.closeMenu();

      new Dialog('Save', { submit, cancel })
        .addInput('Name', {
          type: 'text',
          name: 'name',
          value: item?.name,
        })
        .onSubmit(({ name }) => {
          if (!name) {
            // TODO: should return validation errors
            return false;
          }

          if (lastLoadedId) {
            // actually update
            Storage.updateWriting(lastLoadedId, exported);
          }

          Storage.update(id, {
            name,
          });

          return true;
        })
        .onCancel(() => {
          // TODO: make sure you can't exit from clicking the backdrop
          if (!lastLoadedId) {
            // newly created should delete the writing
            Storage.deleteById(id);
          }
        })
        .open();
    },
  });

  menu.addMenuItem('👀 View Saved', {
    callback: () => {
      menu.closeMenu();

      const savedList = new SavedList('Saved Writings');
      savedList
        .onClick(({ key }) => {
          const writing = Storage.get(key);

          if (writing) {
            app.typewriter.import(writing);
            // handle save as if it may be update instead
            lastLoadedId = key;
          } else {
            // empty writings got no reason to live
            Storage.deleteById(key);
          }
        })
        .onDelete(({ key }) => {
          Storage.deleteById(key);
          // refresh list
          savedList.refreshList();
        })
        .onEdit(({ name, key }) => {
          new Dialog('Update', { submit: 'Update Writing' })
            .addInput('Name', {
              type: 'text',
              name: 'name',
              value: name,
            })
            .onSubmit(({ name: newName }) => {
              if (!newName) {
                // TODO: should return validation errors
                return false;
              }

              Storage.update(key, {
                name: newName,
              });

              savedList.refreshList();

              return true;
            })
            .open();
        })
        .open();
    },
  });

  menu.addDivider();

  menu.addMenuItem('☎️ Report a Problem', {
    href: 'https://github.com/bozdoz/typewritesomething/issues/new',
  });

  menu.addMenuItem('🥰 Sponsor Me', {
    href: 'https://www.paypal.com/paypalme/bozdoz',
  });

  return menu;
};

export default getAppMenu;
