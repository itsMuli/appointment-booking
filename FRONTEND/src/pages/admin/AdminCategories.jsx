import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { categoryAPI } from '../../services/adminApi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getAll();
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setName('');
    setEditingId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await categoryAPI.update(editingId, { name: name.trim() });
        toast.success('Category updated');
      } else {
        await categoryAPI.create({ name: name.trim() });
        toast.success('Category created');
      }
      reset();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="prata-regular text-2xl text-gray-900">Categories</h2>
        <p className="text-sm text-gray-500 mt-1">Service groupings</p>
      </div>

      <form onSubmit={save} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50">
            {editingId ? 'Update' : 'Add category'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-4 py-2 border border-stone-200 text-sm rounded-lg">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ul className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
          {categories.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-gray-500">No categories yet.</li>
          ) : (
            categories.map((c) => (
              <li key={c._id} className="px-4 py-3 flex items-center justify-between gap-3">
                <span className="font-medium text-gray-900">{c.name}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c._id);
                      setName(c.name);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(c._id)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminCategories;
