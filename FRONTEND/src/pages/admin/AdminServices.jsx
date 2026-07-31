import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { serviceAPI, categoryAPI } from '../../services/adminApi';

const emptyForm = { name: '', price: '', duration: '', category: '', description: '' };

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        serviceAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setServices(servicesRes.data.services || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name || '',
      price: service.price ?? '',
      duration: service.duration ?? '',
      category: service.category?._id || service.category || '',
      description: service.description || '',
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        duration: Number(form.duration) || 0,
      };
      if (editingId) {
        await serviceAPI.update(editingId, payload);
        toast.success('Service updated');
      } else {
        await serviceAPI.create(payload);
        toast.success('Service created');
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
    if (!window.confirm('Delete this service?')) return;
    try {
      await serviceAPI.delete(id);
      toast.success('Service deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const categoryName = (service) =>
    service.category?.name ||
    categories.find((c) => c._id === service.category)?.name ||
    '—';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="prata-regular text-2xl text-gray-900">Services</h2>
        <p className="text-sm text-gray-500 mt-1">Prices and durations</p>
      </div>

      <form onSubmit={save} className="bg-white border border-stone-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Service name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <select
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="">Category (optional)</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
        <input
          type="number"
          min="0"
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Duration (minutes)"
          value={form.duration}
          onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
        />
        <input
          className="sm:col-span-2 px-3 py-2 border border-stone-200 rounded-lg text-sm"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50">
            {editingId ? 'Update service' : 'Add service'}
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
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      No services yet.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s._id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{categoryName(s)}</td>
                      <td className="px-4 py-3">${s.price ?? '—'}</td>
                      <td className="px-4 py-3">{s.duration ? `${s.duration} min` : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(s)} className="text-xs text-primary hover:underline">
                            Edit
                          </button>
                          <button type="button" onClick={() => remove(s._id)} className="text-xs text-red-600 hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
