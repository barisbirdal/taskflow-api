const { readAll, writeAll, nextId } = require('../utils/fileDb');

/**
 * Verilen koleksiyon için temel CRUD fonksiyonlarını üretir.
 * Görev ve proje modelleri bu fabrikayı kullanır.
 */
function createModel(collection) {
  return {
    findAll() {
      return readAll(collection);
    },

    findById(id) {
      return readAll(collection).find((item) => item.id === id) || null;
    },

    create(data) {
      const items = readAll(collection);
      const now = new Date().toISOString();
      const item = { id: nextId(items), ...data, createdAt: now, updatedAt: now };
      items.push(item);
      writeAll(collection, items);
      return item;
    },

    update(id, changes) {
      const items = readAll(collection);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;

      items[index] = {
        ...items[index],
        ...changes,
        id, // id değiştirilemez
        createdAt: items[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      writeAll(collection, items);
      return items[index];
    },

    remove(id) {
      const items = readAll(collection);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const [removed] = items.splice(index, 1);
      writeAll(collection, items);
      return removed;
    },
  };
}

module.exports = createModel;
